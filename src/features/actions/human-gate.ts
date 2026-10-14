import { z } from "zod";
import { ActionSchema, type Action } from "../../domain/actions/schema";
import { AuditEventSchema, type AuditEvent } from "../../domain/audit/schema";
import { AIAnalysisSchema, type AIAnalysis } from "../../domain/ai-analysis/schema";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema } from "../../domain/common/schema";
import { validateGroundedAnalysis } from "../../ai/analysis/validate-grounding";
import type { IssueAnalysisInput } from "../../ai/analysis/input";

const GateContextSchema = z.strictObject({ actor: EntityIdSchema, organizationId: OrganizationIdSchema, occurredAt: TimestampSchema, sequence: z.number().int().nonnegative() });
export type GateContext = z.infer<typeof GateContextSchema>;
export type ActionEntry = { action: Action; analysisId: string; recommendationIndex: number; originalDraft: string; userModified: boolean };
export class HumanGateError extends Error { constructor(message: string) { super(message); this.name = "HumanGateError"; } }
const part = (value: string) => `${value.length}:${value}`;
function audit(action: Action, event: string, contextInput: GateContext): AuditEvent {
  const context = GateContextSchema.parse(contextInput);
  return AuditEventSchema.parse({ id: `AUD:${part(action.id)}:${event}:${part(context.actor)}:${part(context.occurredAt)}:${context.sequence}`,
    organizationId: context.organizationId, actor: context.actor, event, entityType: "action", entityId: action.id, timestamp: context.occurredAt });
}
export function createSuggestedAction(recordInput: AIAnalysis, input: IssueAnalysisInput, recommendationIndex: number, context: GateContext): { entry: ActionEntry; event: AuditEvent } {
  GateContextSchema.parse(context);
  const record = AIAnalysisSchema.parse(recordInput);
  if (record.issueId !== input.issue.issueId) throw new HumanGateError("Analysis must belong to the selected issue.");
  const analysis = validateGroundedAnalysis(record.output, input);
  if (!Number.isInteger(recommendationIndex) || recommendationIndex < 0 || !analysis.recommendations[recommendationIndex]) throw new HumanGateError("Choose a validated recommendation.");
  const recommendation = analysis.recommendations[recommendationIndex];
  const draft = recommendation.draft ?? recommendation.rationale;
  const action = ActionSchema.parse({ id: `ACT:${part(record.id)}:${recommendation.actionType}:${recommendationIndex}`, issueId: record.issueId,
    type: recommendation.actionType, status: "suggested", draft, approvedBy: null, approvedAt: null, createdAt: context.occurredAt });
  return { entry: { action, analysisId: record.id, recommendationIndex, originalDraft: draft, userModified: false }, event: audit(action, "action_suggested", context) };
}
function transition(entry: ActionEntry, context: GateContext, status: Action["status"], draft = entry.action.draft) {
  const current = ActionSchema.parse(entry.action); GateContextSchema.parse(context);
  if (!["suggested", "edited"].includes(current.status)) throw new HumanGateError("This reviewed action can no longer be changed.");
  if (!draft.trim()) throw new HumanGateError("Draft text cannot be empty.");
  const action = ActionSchema.parse({ ...current, status, draft,
    approvedBy: status === "approved" ? context.actor : null, approvedAt: status === "approved" ? context.occurredAt : null });
  return { entry: { ...entry, action, userModified: entry.userModified || status === "edited" }, event: audit(action, `action_${status}`, context) };
}
export const approveAction = (entry: ActionEntry, context: GateContext) => transition(entry, context, "approved");
export const editAction = (entry: ActionEntry, draft: string, context: GateContext) => transition(entry, context, "edited", draft);
export const rejectAction = (entry: ActionEntry, context: GateContext) => transition(entry, context, "rejected");
