"use server";
import { abcApparelDataset } from "../domain";
import { analyzePersistedIssue } from "../features/persistence/analysis";
import { demoRepository, persistedSession, persistenceFailure } from "../features/persistence/runtime";
import { transitionPersistedAction, suggestPersistedAction } from "../features/persistence/human-gate";
import { safeId } from "../lib/firestore/paths";
import type { DemoAnalysisResponse } from "../features/demo/analysis-service";
import { previewImport, validateImport } from "../features/import-ui/service";
import { MAX_IMPORT_FILE_BYTES } from "../features/imports/constants";

export async function analyzeDemoAction(issueId: string) {
  try { safeId(issueId); const repository = await demoRepository(); return await analyzePersistedIssue(repository, abcApparelDataset.organization.id, issueId, new Date().toISOString()); }
  catch (error) { return { status: "unavailable", message: persistenceFailure(error).message } satisfies DemoAnalysisResponse; }
}
async function uploadedFile(data: FormData) {
  const file = data.get("file");
  if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_BYTES) throw new Error("Choose a CSV or Excel file within the 5 MB limit.");
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}
export async function previewImportAction(data: FormData) {
  try { return await previewImport(await uploadedFile(data)); } catch { return { ok: false as const, message: "Choose a CSV or Excel file within the 5 MB limit." }; }
}
export async function validateImportAction(data: FormData, selection: unknown) {
  try { return await validateImport(await uploadedFile(data), selection); } catch { return { ok: false as const, message: "Choose a CSV or Excel file within the 5 MB limit." }; }
}

export async function loadDemoSessionAction() { return persistedSession(); }
export async function suggestDemoAction(analysisId: string, index: number) {
  try {
    safeId(analysisId); if (!Number.isInteger(index) || index < 0 || index > 2) throw new Error("invalid selection");
    const repository = await demoRepository(); const organizationId = abcApparelDataset.organization.id;
    await suggestPersistedAction(repository, organizationId, analysisId, index, { actor: "demo-owner", organizationId, occurredAt: new Date().toISOString(), sequence: 0 });
    return persistedSession();
  } catch (error) { return persistenceFailure(error); }
}
export async function reviewDemoAction(actionId: string, intent: "approve" | "edit" | "reject", draft?: string) {
  try {
    safeId(actionId); const repository = await demoRepository(); const organizationId = abcApparelDataset.organization.id;
    await transitionPersistedAction(repository, organizationId, actionId, intent, draft, { actor: "demo-owner", organizationId, occurredAt: new Date().toISOString(), sequence: 0 });
    return persistedSession();
  } catch (error) { return persistenceFailure(error); }
}
