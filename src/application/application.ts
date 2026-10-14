import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { abcApparelDataset } from "../domain";
import type { WorkspaceRepository } from "../repositories/types";
import type { IssueAnalysisProvider } from "../ai/analysis/provider";
import { analyzeIssue } from "../ai/analysis/analyze-issue";
import { buildIssueAnalysisInput } from "../ai/analysis/input";
import { logAiDiagnostic } from "../ai/analysis/diagnostics";
import { PROMPT_VERSION } from "../ai/prompts/issue-analysis-v1";
import { ensureDemoWorkspace, loadWorkspace, workspaceView } from "../features/persistence/workspace";
import { restoreSession, suggestPersistedAction, transitionPersistedAction } from "../features/persistence/human-gate";
import { storedRequest, persistValidatedAnalysis, analysisOperationAuditId, validateStoredAnalysis } from "../features/persistence/analysis";
import { persistValidatedImport } from "../features/persistence/imports";
import { previewImport, validateImport, prepareConfirmedImport, SelectionSchema, type ImportHealthResponse } from "../features/import-ui/service";
import { normalizeTable } from "../features/imports";
import type { ImportFile } from "../features/imports/types";
import type { DemoAnalysisResponse } from "../features/demo/analysis-service";
import { safeId } from "../lib/firestore/paths";
import { PersistenceError } from "../lib/firestore/errors";
import type { ApplicationFailure, ApplicationResult, RuntimeCapabilities, WorkspaceSnapshot, IssueSnapshot, ImportSaveResponse } from "./contracts";
import { applicationHealth } from "./capabilities";
import { checkedDemo } from "./consistency";
export type ApplicationDependencies = {
  repository(): Promise<WorkspaceRepository>;
  ai(): { provider: IssueAnalysisProvider; model: string } | null;
  capabilities(): RuntimeCapabilities;
  now(): string;
};
const org = abcApparelDataset.organization.id;
export function applicationFailure(error: unknown): ApplicationFailure {
  if (error instanceof PersistenceError) return { ok: false, code: error.code, message: error.message };
  return { ok: false, code: "APPLICATION_UNAVAILABLE", message: "The operation could not be completed. Please try again." };
}
export function importReviewKey(file: ImportFile, selection: unknown): string {
  const selected = SelectionSchema.parse(selection);
  const canonical = { ...selected, assignments: [...selected.assignments].sort((a,b) => a.sourceHeader < b.sourceHeader ? -1 : a.sourceHeader > b.sourceHeader ? 1 : 0), defaults: Object.fromEntries(Object.entries(selected.defaults).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0)) };
  return createHash("sha256").update(file.name).update(file.bytes).update(JSON.stringify(canonical)).digest("hex");
}
export function buildApplication(deps: ApplicationDependencies) {
  const inFlight = new Map<string, Promise<DemoAnalysisResponse>>();
  async function load() { const repository = await deps.repository(); const data = await loadWorkspace(repository, org); const checked = checkedDemo(data); return { repository, data, checked }; }
  function snapshot(data: Awaited<ReturnType<typeof loadWorkspace>>): WorkspaceSnapshot { return { workspace: workspaceView(data), state: restoreSession(data), capabilities: deps.capabilities() }; }
  async function result<T>(work: () => Promise<T>): Promise<ApplicationResult<T>> { try { return { ok: true, value: await work() }; } catch (error) { return applicationFailure(error); } }
  async function openDemoWorkspace() { return result(async () => { const repository = await deps.repository(); await ensureDemoWorkspace(repository); const data = await loadWorkspace(repository, org); checkedDemo(data); return snapshot(data); }); }
  async function getDashboard() { return result(async () => snapshot((await load()).data)); }
  async function getIssueDetail(issueId: string): Promise<ApplicationResult<IssueSnapshot>> {
    return result(async () => {
      safeId(issueId); const { data, checked } = await load(); const issue = data.issues.find((item) => item.id === issueId);
      if (!issue) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Issue not found. Choose an issue from the demo workspace.");
      const order = data.orders.find((item) => item.id === issue.orderId); const facts = checked.facts.find((item) => item.orderId === issue.orderId);
      if (!order || !facts) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "The issue context is unavailable.");
      return { ...snapshot(data), order, facts };
    });
  }
  async function analyze(issueId: string, operationId: string): Promise<DemoAnalysisResponse> {
    try { safeId(issueId); z.uuid().parse(operationId); } catch { return { status: "invalid", message: "Choose a valid issue and analysis operation." }; }
    const key = `${issueId}:${operationId}`;
    const pending = inFlight.get(key); if (pending) return pending;
    if (inFlight.size >= 100) return { status: "unavailable", message: "Analysis is busy. Please try again shortly." };
    const operation = (async (): Promise<DemoAnalysisResponse> => {
      try {
        const { repository, data } = await load(); const request = storedRequest(data, issueId); const input = buildIssueAnalysisInput(request); const runtime = deps.ai();
        if (!runtime) return { status: "unconfigured", message: "AI analysis is not configured. Verified operational evidence remains available." };
        const identity = { issueId, model: runtime.model, promptVersion: PROMPT_VERSION };
        const auditId = analysisOperationAuditId(org, identity, operationId);
        async function replay() {
          const event = await repository.read(org).get("audit_events", auditId);
          if (!event) return null;
          const current = await loadWorkspace(repository, org); checkedDemo(current);
          const record = current.aiAnalyses.find((item) => item.id === event.entityId && item.issueId === issueId && item.model === runtime!.model && item.promptVersion === PROMPT_VERSION);
          if (!record || event.entityType !== "ai_analysis" || event.event !== "ai_analysis_completed") throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "The saved analysis operation is inconsistent.");
          const valid = validateStoredAnalysis(record, current);
          return { status: "success" as const, input: valid.input, result: { ok: true as const, record, analysis: valid.analysis } };
        }
        const previous = await replay(); if (previous) return previous;
        const createdAt = deps.now(); const analysis = await analyzeIssue(request, runtime.provider, { model: runtime.model, createdAt });
        if (!analysis.ok) return { status: "unavailable", message: "AI analysis could not be validated or the provider is unavailable. Evidence remains visible; retry is available." };
        try { await persistValidatedAnalysis(repository, org, analysis.record, { organizationId: org, actor: "demo-owner", occurredAt: createdAt, sequence: data.auditEvents.length }, analysis.analysis.recommendations.map((_, index) => index), operationId); }
        catch (error) {
          logAiDiagnostic("persistence", error instanceof PersistenceError ? error.code : "PERSISTENCE_WRITE_FAILED", { model: runtime.model, promptVersion: PROMPT_VERSION, attempt: analysis.attempts }, error);
          if (error instanceof PersistenceError && error.code === "PERSISTENCE_CONFLICT") { const winner = await replay(); if (winner) return winner; }
          throw error;
        }
        return { status: "success", result: analysis, input };
      } catch (error) { return { status: "unavailable", message: applicationFailure(error).message }; }
    })();
    inFlight.set(key, operation);
    try { return await operation; } finally { inFlight.delete(key); }
  }
  async function reviewAction(actionId: string, intent: unknown, draft?: unknown) {
    return result(async () => { safeId(actionId); const { repository } = await load(); await transitionPersistedAction(repository, org, actionId, intent, draft, { actor: "demo-owner", organizationId: org, occurredAt: deps.now(), sequence: 0 }); return snapshot((await load()).data).state; });
  }
  async function createSuggestedAction(analysisId: string, index: number) {
    return result(async () => { safeId(analysisId); const { repository } = await load(); await suggestPersistedAction(repository, org, analysisId, index, { actor: "demo-owner", organizationId: org, occurredAt: deps.now(), sequence: 0 }); return snapshot((await load()).data).state; });
  }
  async function getActivity() { return result(async () => snapshot((await load()).data).state.events); }
  async function getSession() { return result(async () => snapshot((await load()).data).state); }
  async function checkImport(file: ImportFile, selection: unknown): Promise<ImportHealthResponse> {
    const health = await validateImport(file, selection);
    if (!health.ok) return health;
    return { ...health, reviewKey: importReviewKey(file, selection) };
  }
  async function saveValidData(file: ImportFile, selection: unknown, reviewKey: unknown): Promise<ImportSaveResponse> {
    try {
      const key = importReviewKey(file, selection);
      if (typeof reviewKey !== "string" || key !== reviewKey) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Review Data Health again before saving this file and mapping.");
      const prepared = await prepareConfirmedImport(file, selection, { organizationId: org, dataSourceId: `DS-UPLOAD:${key}`, importSessionId: `IMPORT-UPLOAD:${key}` });
      if (normalizeTable(prepared.table, prepared.mapping).summary.validRows === 0) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "There are no valid records to save.");
      const { repository } = await load(); const occurredAt = deps.now();
      const saved = await persistValidatedImport(repository, prepared.table, prepared.mapping, { id: prepared.mapping.context.dataSourceId, organizationId: org, type: file.name.toLowerCase().endsWith(".xlsx") ? "xlsx" : "csv", name: file.name, readOnly: true, createdAt: occurredAt }, occurredAt);
      return { ok: true, savedRecords: saved.summary.validRows, invalidRows: saved.summary.invalidRows, message: "Data saved successfully. Operational issue refresh for imported data will be completed in a later integration step." };
    } catch (error) { return applicationFailure(error); }
  }
  return { health: () => applicationHealth(deps.capabilities()), openDemoWorkspace, getDashboard, getIssueDetail, analyzeIssue: analyze, createSuggestedAction, reviewAction, getActivity, getSession, previewImport, checkImport, saveValidData };
}
export type Application = ReturnType<typeof buildApplication>;
