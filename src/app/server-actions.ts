"use server";
import { analyzeDemoIssue } from "../features/demo/analysis-service";
import { previewImport, validateImport } from "../features/import-ui/service";
import { MAX_IMPORT_FILE_BYTES } from "../features/imports/constants";

export async function analyzeDemoAction(issueId: string) {
  return analyzeDemoIssue(issueId, new Date().toISOString()); // Explicit boundary clock, never inside pure logic.
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
