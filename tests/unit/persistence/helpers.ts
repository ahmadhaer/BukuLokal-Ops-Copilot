import { createMemoryState, createMemoryStore } from "../../../src/repositories/memory/store";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { ensureDemoWorkspace, loadWorkspace } from "../../../src/features/persistence/workspace";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { execution, selectedRequest, StubProvider, validOutput } from "../ai/helpers";
import { persistValidatedAnalysis } from "../../../src/features/persistence/analysis";
export const org = "ORG-001";
export const context = { organizationId: org, actor: "demo-owner", occurredAt: "2026-10-12T12:03:00Z", sequence: 0 };
export async function fixture(withSuggestion = false) {
  const state = createMemoryState(); const store = createMemoryStore(state); const repository = createWorkspaceRepository(store);
  await ensureDemoWorkspace(repository);
  const request = selectedRequest(); const result = await analyzeIssue(request, new StubProvider([JSON.stringify(validOutput(request))]), execution);
  if (!result.ok) throw new Error("Invalid test analysis");
  if (withSuggestion) await persistValidatedAnalysis(repository, org, result.record, context, [0]);
  return { state, store, repository, result, data: await loadWorkspace(repository, org) };
}
