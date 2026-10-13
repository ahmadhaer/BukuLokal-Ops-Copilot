import { GeminiIssueAnalysisSchema, type GeminiIssueAnalysis } from "../schemas/issue-analysis";
import type { IssueAnalysisInput } from "./input";
import { AiAnalysisError } from "./errors";

export function validateGroundedAnalysis(value: unknown, input: IssueAnalysisInput): GeminiIssueAnalysis {
  const parsed = GeminiIssueAnalysisSchema.safeParse(value);
  if (!parsed.success) throw new AiAnalysisError("AI_INVALID_RESPONSE", "Advisory output does not satisfy the strict response schema.");
  const output = parsed.data;
  const evidence = new Map(input.evidence.map((item) => [item.id, item]));
  for (const refs of [output.evidenceRefs, ...output.recommendations.map((item) => item.evidenceRefs)]) {
    if (new Set(refs).size !== refs.length || refs.some((id) => !evidence.has(id))) throw new AiAnalysisError("AI_UNSUPPORTED_EVIDENCE_REF", "Advisory output cites unknown or duplicate evidence references.");
  }
  for (const recommendation of output.recommendations) {
    if (!input.allowedActions.includes(recommendation.actionType)) throw new AiAnalysisError("AI_ACTION_UNSUPPORTED", "Recommendation is not allowed for the selected issue evidence.");
    if (recommendation.actionType === "supplier_followup_draft" && !recommendation.evidenceRefs.some((id) => {
      const item = evidence.get(id);
      return item?.type === "material_shortage" && typeof item.value === "number" && item.value > 0;
    })) throw new AiAnalysisError("AI_ACTION_UNSUPPORTED", "Supplier follow-up must cite positive material-shortage evidence.");
  }
  return output;
}
