import { describe, expect, it } from "vitest";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import { ActionSchema } from "../../../src/domain/actions/schema";
import { AuditEventSchema } from "../../../src/domain/audit/schema";
import { createSuggestedAction, approveAction, editAction, rejectAction } from "../../../src/features/actions/human-gate";
import { selectedRequest, validOutput, StubProvider, execution } from "../ai/helpers";

const context = { actor: "demo-owner", organizationId: "ORG-001", occurredAt: "2026-10-12T12:03:00Z", sequence: 0 };
async function suggested() {
  const request = selectedRequest(); const analysis = await analyzeIssue(request, new StubProvider([JSON.stringify(validOutput(request))]), execution);
  if (!analysis.ok) throw new Error("Expected accepted test advice");
  return { created: createSuggestedAction(analysis.record, buildIssueAnalysisInput(request), 0, context), analysis, request };
}
describe("canonical Human Gate and audit events", () => {
  it("creates only a validated suggested action, preserving recommendation/provenance", async () => {
    const { created, analysis } = await suggested(); const before = structuredClone(analysis);
    expect(ActionSchema.safeParse(created.entry.action).success).toBe(true);
    expect(created.entry.action).toMatchObject({ status: "suggested", approvedBy: null, approvedAt: null });
    expect(created.entry.analysisId).toBe(analysis.record.id); expect(created.entry.recommendationIndex).toBe(0);
    expect(AuditEventSchema.safeParse(created.event).success).toBe(true); expect(created.event.event).toBe("action_suggested");
    expect(analysis).toEqual(before);
  });
  it("approves with explicit actor/time and no execution metadata", async () => {
    const { created } = await suggested(); const before = structuredClone(created.entry);
    const result = approveAction(created.entry, { ...context, sequence: 1 });
    expect(result.entry.action).toMatchObject({ status: "approved", approvedBy: context.actor, approvedAt: context.occurredAt });
    expect(result.event.event).toBe("action_approved"); expect(result.entry.action).not.toHaveProperty("executedAt"); expect(created.entry).toEqual(before);
  });
  it("edits then approves, retaining visible user modification", async () => {
    const { created } = await suggested(); const edited = editAction(created.entry, "Synthetic owner-modified draft", { ...context, sequence: 1 });
    expect(edited.entry.action).toMatchObject({ status: "edited", draft: "Synthetic owner-modified draft", approvedBy: null });
    const approved = approveAction(edited.entry, { ...context, sequence: 2 });
    expect(approved.entry.action.draft).toBe("Synthetic owner-modified draft"); expect(approved.entry.userModified).toBe(true);
    expect(edited.event.id).not.toBe(approved.event.id);
  });
  it.each(["suggested", "edited"])("rejects from %s with an internal audit only", async (state) => {
    const { created } = await suggested(); const entry = state === "edited" ? editAction(created.entry, "Synthetic edited note", { ...context, sequence: 1 }).entry : created.entry;
    const rejected = rejectAction(entry, { ...context, sequence: 2 });
    expect(rejected.entry.action).toMatchObject({ status: "rejected", approvedBy: null, approvedAt: null }); expect(rejected.event.event).toBe("action_rejected");
  });
  it("rejects invalid terminal transitions and empty drafts", async () => {
    const { created } = await suggested(); const approved = approveAction(created.entry, context).entry;
    expect(() => approveAction(approved, context)).toThrow(); expect(() => rejectAction(approved, context)).toThrow(); expect(() => editAction(approved, "Synthetic", context)).toThrow();
    expect(() => editAction(created.entry, " ", context)).toThrow();
  });
  it("rejects unsupported or ungrounded recommendation records", async () => {
    const { analysis, request } = await suggested(); const record = structuredClone(analysis.record);
    record.output = { ...record.output, recommendations: [{ actionType: "send_message", title: "Synthetic", rationale: "Synthetic", evidenceRefs: [] }] };
    expect(() => createSuggestedAction(record, buildIssueAnalysisInput(request), 0, context)).toThrow();
    expect(() => createSuggestedAction(analysis.record, buildIssueAnalysisInput(request), 99, context)).toThrow();
  });
  it("uses stable action IDs and sequence-safe audit IDs", async () => {
    const { created, analysis, request } = await suggested();
    expect(createSuggestedAction(analysis.record, buildIssueAnalysisInput(request), 0, context).entry.action.id).toBe(created.entry.action.id);
    expect(editAction(created.entry, "Synthetic edit", { ...context, sequence: 1 }).event.id).not.toBe(editAction(created.entry, "Synthetic edit", { ...context, sequence: 2 }).event.id);
  });
});
