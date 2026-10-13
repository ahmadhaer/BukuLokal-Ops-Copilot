import { z } from "zod";
import { AIAnalysisSchema, type AIAnalysis } from "../../domain/ai-analysis/schema";
import { TimestampSchema } from "../../domain/common/schema";
import { ISSUE_ANALYSIS_JSON_SCHEMA, type GeminiIssueAnalysis } from "../schemas/issue-analysis";
import { PROMPT_VERSION, RETRY_INSTRUCTION, SYSTEM_INSTRUCTION } from "../prompts/issue-analysis-v1";
import { buildIssueAnalysisInput, type IssueAnalysisRequest } from "./input";
import type { IssueAnalysisProvider } from "./provider";
import { validateGroundedAnalysis } from "./validate-grounding";
import { AiAnalysisError, type AiErrorCode } from "./errors";

const ExecutionContextSchema = z.strictObject({ model: z.string().trim().min(1).regex(/^\S+$/), createdAt: TimestampSchema });
export type AnalysisExecutionContext = z.infer<typeof ExecutionContextSchema>;
export type AnalysisResult = { ok: true; analysis: GeminiIssueAnalysis; record: AIAnalysis; attempts: number }
  | { ok: false; error: { errorCode: AiErrorCode; humanReadableMessage: string; causeCode?: AiErrorCode }; attempts: number };
function failure(error: AiAnalysisError, attempts: number, causeCode?: AiErrorCode): AnalysisResult {
  return { ok: false, error: { ...error.toJSON(), ...(causeCode ? { causeCode } : {}) }, attempts };
}
const idPart = (value: string) => `${value.length}:${value}`;
export async function analyzeIssue(request: IssueAnalysisRequest, provider: IssueAnalysisProvider, execution: AnalysisExecutionContext): Promise<AnalysisResult> {
  let input; let context;
  try {
    input = buildIssueAnalysisInput(request);
    const parsed = ExecutionContextSchema.safeParse(execution);
    if (!parsed.success) throw new AiAnalysisError("AI_CONFIG_MISSING", "Configured model and explicit valid createdAt are required.");
    context = parsed.data;
  } catch (error) {
    return failure(error instanceof AiAnalysisError ? error : new AiAnalysisError("AI_INPUT_INVALID", "Analysis input could not be validated."), 0);
  }
  let lastCode: AiErrorCode = "AI_INVALID_RESPONSE";
  for (let attempt = 1; attempt <= 2; attempt++) {
    let raw: string;
    try {
      raw = await provider.generate({ model: context.model, input: structuredClone(input), promptVersion: PROMPT_VERSION,
        systemInstruction: attempt === 1 ? SYSTEM_INSTRUCTION : `${SYSTEM_INSTRUCTION}\n${RETRY_INSTRUCTION}`,
        responseJsonSchema: structuredClone(ISSUE_ANALYSIS_JSON_SCHEMA), retry: attempt === 2 });
    } catch (error) {
      if (error instanceof AiAnalysisError && error.errorCode === "AI_INVALID_RESPONSE") { lastCode = error.errorCode; continue; }
      return failure(error instanceof AiAnalysisError ? error : new AiAnalysisError("AI_PROVIDER_ERROR", "AI provider is unavailable; deterministic issue and evidence remain available."), attempt);
    }
    try {
      if (typeof raw !== "string" || raw.length > 64 * 1024) throw new AiAnalysisError("AI_INVALID_RESPONSE", "AI response is empty or exceeds the supported output limit.");
      let value: unknown;
      try { value = JSON.parse(raw); } catch { throw new AiAnalysisError("AI_INVALID_RESPONSE", "AI response is not valid structured JSON."); }
      const analysis = validateGroundedAnalysis(value, input);
      const id = `AI:${idPart(input.issue.issueId)}:${idPart(context.model)}:${idPart(PROMPT_VERSION)}:${idPart(context.createdAt)}`;
      const record = AIAnalysisSchema.parse({ id, issueId: input.issue.issueId, model: context.model, promptVersion: PROMPT_VERSION,
        output: analysis, evidenceRefs: analysis.evidenceRefs, createdAt: context.createdAt });
      return { ok: true, analysis, record, attempts: attempt };
    } catch (error) { lastCode = error instanceof AiAnalysisError ? error.errorCode : "AI_INVALID_RESPONSE"; }
  }
  return failure(new AiAnalysisError("AI_ANALYSIS_UNAVAILABLE", "AI analysis unavailable after one validation retry; deterministic issue and evidence remain available."), 2, lastCode);
}
