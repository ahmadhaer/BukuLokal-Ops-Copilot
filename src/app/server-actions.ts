"use server";
import { randomUUID } from "node:crypto";
import { getProductionApplication } from "../application/production";
import type { PersistenceResponse } from "../features/persistence/contracts";
import { MAX_IMPORT_FILE_BYTES } from "../features/imports/constants";
export async function analyzeDemoAction(issueId: string, operationId?: string) {
  return getProductionApplication().analyzeIssue(issueId, operationId ?? randomUUID());
}
async function uploadedFile(data: FormData) {
  const file = data.get("file");
  if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_BYTES) throw new Error("invalid upload");
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}
export async function previewImportAction(data: FormData) {
  try { return await getProductionApplication().previewImport(await uploadedFile(data)); } catch { return { ok: false as const, message: "Choose a CSV or Excel file within the 5 MB limit." }; }
}
export async function validateImportAction(data: FormData, selection: unknown) {
  try { return await getProductionApplication().checkImport(await uploadedFile(data), selection); } catch { return { ok: false as const, message: "Choose a CSV or Excel file within the 5 MB limit." }; }
}
export async function saveValidDataAction(data: FormData, selection: unknown, reviewKey: unknown) {
  try { return await getProductionApplication().saveValidData(await uploadedFile(data), selection, reviewKey); } catch { return { ok: false as const, code: "IMPORT_INVALID", message: "Choose a CSV or Excel file within the 5 MB limit." }; }
}
export async function loadDemoSessionAction(): Promise<PersistenceResponse> {
  const result = await getProductionApplication().getSession(); return result.ok ? { ok: true, state: result.value } : result;
}
export async function suggestDemoAction(analysisId: string, index: number): Promise<PersistenceResponse> {
  const result = await getProductionApplication().createSuggestedAction(analysisId, index); return result.ok ? { ok: true, state: result.value } : result;
}
export async function reviewDemoAction(actionId: string, intent: "approve" | "edit" | "reject", draft?: string): Promise<PersistenceResponse> {
  const result = await getProductionApplication().reviewAction(actionId, intent, draft); return result.ok ? { ok: true, state: result.value } : result;
}
