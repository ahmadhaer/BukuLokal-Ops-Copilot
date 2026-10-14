import "server-only";
import { z } from "zod";
import { createSuggestedAction, editAction, approveAction, rejectAction, HumanGateError, type ActionEntry, type GateContext } from "../actions/human-gate";
import type { WorkspaceRepository } from "../../repositories/types";
import type { Action, DemoDataset } from "../../domain";
import { PersistenceError } from "../../lib/firestore/errors";
import { safeId } from "../../lib/firestore/paths";
import { loadWorkspace, requireRecord } from "./workspace";
import { validateStoredAnalysis } from "./analysis";
import type { SessionState } from "./contracts";
export function restoreAction(action: Action, data: DemoDataset): ActionEntry {
  for (const record of data.aiAnalyses.filter((item) => item.issueId === action.issueId)) {
    const valid = validateStoredAnalysis(record, data);
    for (const index of valid.analysis.recommendations.keys()) {
      const candidate = createSuggestedAction(record, valid.input, index, { actor: "demo-owner", organizationId: data.organization.id, occurredAt: action.createdAt, sequence: 0 }).entry;
      if (candidate.action.id === action.id) return { ...candidate, action, userModified: data.auditEvents.some((event) => event.entityType === "action" && event.entityId === action.id && event.event === "action_edited") };
    }
  }
  throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Action analysis provenance is missing.");
}
export function restoreSession(data: DemoDataset): SessionState {
  const analyses: SessionState["analyses"] = {};
  for (const record of [...data.aiAnalyses].sort((a,b) => a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : 1)) {
    const valid = validateStoredAnalysis(record, data);
    analyses[record.issueId] = { status: "success", input: valid.input, result: { ok: true, record, analysis: valid.analysis } };
  }
  return { actions: data.actions.map((action) => restoreAction(action, data)), events: [...data.auditEvents].sort((a,b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : a.id < b.id ? -1 : 1), analyses };
}
export async function suggestPersistedAction(repository: WorkspaceRepository, org: string, analysisId: string, index: number, context: GateContext) {
  safeId(analysisId); if (context.organizationId !== org) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Review context does not match its organization.");
  const data = await loadWorkspace(repository, org);
  const record = data.aiAnalyses.find((item) => item.id === analysisId);
  if (!record) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Analysis is not available in this workspace.");
  const valid = validateStoredAnalysis(record, data); const created = createSuggestedAction(record, valid.input, index, context);
  return repository.transaction(org, async (tx) => {
    const existing = await tx.get("actions", created.entry.action.id);
    await requireRecord(tx, "ai_analyses", record.id);
    if (existing) return existing;
    tx.write({ collection: "ai_analyses", value: record });
    tx.write({ collection: "actions", value: created.entry.action, mode: "create" });
    const events = await tx.list("audit_events");
    const event = createSuggestedAction(record, valid.input, index, { ...context, sequence: events.length }).event;
    tx.write({ collection: "audit_events", value: event, mode: "create" });
    return created.entry.action;
  });
}
export async function transitionPersistedAction(repository: WorkspaceRepository, org: string, actionId: string, intent: unknown, draft: unknown, context: GateContext) {
  safeId(actionId); const parsed = z.enum(["approve", "edit", "reject"]).safeParse(intent);
  if (!parsed.success || (intent === "edit" && (typeof draft !== "string" || draft.length > 64_000)) || context.organizationId !== org) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "A valid review request is required.");
  // Provenance is immutable; the Action itself is always read again inside the transaction.
  const data = await loadWorkspace(repository, org);
  return repository.transaction(org, async (tx) => {
    const action = await requireRecord(tx, "actions", actionId); const entry = restoreAction(action, data);
    const events = await tx.list("audit_events"); const transitionContext = { ...context, sequence: events.length };
    try {
      const result = parsed.data === "edit" ? editAction(entry, draft as string, transitionContext) : parsed.data === "approve" ? approveAction(entry, transitionContext) : rejectAction(entry, transitionContext);
      tx.write({ collection: "actions", value: result.entry.action });
      tx.write({ collection: "audit_events", value: result.event, mode: "create" });
      return result.entry.action;
    } catch (error) { if (error instanceof HumanGateError) throw new PersistenceError("PERSISTENCE_CONFLICT", "This action has already been reviewed or the edit is invalid. Reload the latest state."); throw error; }
  });
}
