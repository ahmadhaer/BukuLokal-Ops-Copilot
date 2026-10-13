import "server-only";
import { AIAnalysisSchema, AuditEventSchema, type AIAnalysis, type DemoDataset } from "../../domain";
import { buildIssueAnalysisInput, type IssueAnalysisRequest } from "../../ai/analysis/input";
import { analyzeIssue } from "../../ai/analysis/analyze-issue";
import { validateGroundedAnalysis } from "../../ai/analysis/validate-grounding";
import type { WorkspaceRepository, Write } from "../../repositories/types";
import type { GateContext } from "../actions/human-gate";
import { createSuggestedAction } from "../actions/human-gate";
import { PersistenceError } from "../../lib/firestore/errors";
import { buildDemoWorkspace } from "../demo/workspace";
import { createVertexProvider } from "../../ai/client/google-genai";
import type { IssueAnalysisProvider } from "../../ai/analysis/provider";
import type { DemoAnalysisResponse } from "../demo/analysis-service";
import { loadWorkspace } from "./workspace";
import { safeId } from "../../lib/firestore/paths";
export function storedRequest(data: DemoDataset, issueId: string): IssueAnalysisRequest {
  safeId(issueId);
  const issue = data.issues.find((item) => item.id === issueId);
  const trace = buildDemoWorkspace().detection.ruleTraces.find((item) => item.issueId === issueId);
  if (!issue || !trace) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Choose an issue from the demo workspace.");
  return { organization: data.organization, issueId, detection: { issues: [issue], evidence: data.evidence.filter((item) => item.issueId === issue.id), ruleTraces: [trace] } };
}
export function validateStoredAnalysis(record: AIAnalysis, data: DemoDataset) {
  const parsed = AIAnalysisSchema.safeParse(record);
  if (!parsed.success) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "The analysis is not valid for storage.");
  const input = buildIssueAnalysisInput(storedRequest(data, parsed.data.issueId));
  try {
    const analysis = validateGroundedAnalysis(parsed.data.output, input);
    if (JSON.stringify(analysis.evidenceRefs) !== JSON.stringify(parsed.data.evidenceRefs)) throw new Error("refs");
    return { record: parsed.data, analysis, input };
  } catch { throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Only evidence-grounded validated analysis may be stored."); }
}
export function analysisOperationAuditId(organizationId: string, record: Pick<AIAnalysis, "issueId" | "model" | "promptVersion">, operationId: string) {
  const part = (value: string) => `${value.length}:${value}`;
  return safeId(`AUD-AI-OP:${[organizationId, record.issueId, record.model, record.promptVersion, operationId].map(part).join(":")}`);
}
export async function persistValidatedAnalysis(repository: WorkspaceRepository, organizationId: string, record: AIAnalysis, context: GateContext, suggestionIndexes: number[] = [], operationId?: string) {
  if (context.organizationId !== organizationId) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Analysis context does not match its organization.");
  const data = await loadWorkspace(repository, organizationId); const valid = validateStoredAnalysis(record, data);
  const event = AuditEventSchema.parse({ id: operationId ? analysisOperationAuditId(organizationId, valid.record, operationId) : `AUD-AI:${valid.record.id}:${context.sequence}`, organizationId, actor: context.actor, event: "ai_analysis_completed", entityType: "ai_analysis", entityId: valid.record.id, timestamp: context.occurredAt });
  const writes: Write[] = [{ collection: "ai_analyses", value: valid.record, mode: "create" }, { collection: "audit_events", value: event, mode: "create" }];
  for (const [offset, index] of suggestionIndexes.entries()) { const created = createSuggestedAction(valid.record, valid.input, index, { ...context, sequence: context.sequence + offset + 1 }); writes.push({ collection: "actions", value: created.entry.action, mode: "create" }, { collection: "audit_events", value: created.event, mode: "create" }); }
  await repository.batch(organizationId, writes);
}
export async function analyzePersistedIssue(repository: WorkspaceRepository, org: string, issueId: string, createdAt: string,
  runtime: () => { provider: IssueAnalysisProvider; config: { model: string } } = createVertexProvider): Promise<DemoAnalysisResponse> {
  const data = await loadWorkspace(repository, org); const request = storedRequest(data, issueId); const input = buildIssueAnalysisInput(request);
  let configured; try { configured = runtime(); } catch { return { status: "unconfigured", message: "AI analysis is not configured in this environment. The operational issue and evidence remain available." }; }
  const result = await analyzeIssue(request, configured.provider, { model: configured.config.model, createdAt });
  if (!result.ok) return { status: "unavailable", message: "AI analysis is temporarily unavailable. The operational issue and evidence remain available." };
  await persistValidatedAnalysis(repository, org, result.record, { organizationId: org, actor: "demo-owner", occurredAt: createdAt, sequence: data.auditEvents.length });
  return { status: "success", result, input };
}
