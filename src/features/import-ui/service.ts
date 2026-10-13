import "server-only";
import { z } from "zod";
import { parseImportFile, createImportPreview, confirmMapping, normalizeTable } from "../imports";
import type { DatasetKind, ImportFile } from "../imports/types";
import { abcApparelDataset } from "../../domain/demo/abc-apparel";

const SelectionSchema = z.strictObject({ sheetIndex: z.number().int().nonnegative(), datasetKind: z.enum(["orders", "production", "inventory"]),
  confirmed: z.literal(true), assignments: z.array(z.strictObject({ sourceHeader: z.string(), canonicalField: z.string() })), defaults: z.record(z.string(), z.string()) });
export type ImportPreviewResponse = { ok: true; previews: ReturnType<typeof createImportPreview>[] } | { ok: false; message: string };
export type ImportHealthResponse = { ok: true; result: ReturnType<typeof normalizeTable>; datasetKind: DatasetKind } | { ok: false; message: string };
function message(error: unknown): string {
  if (error && typeof error === "object" && "errorCode" in error) {
    const code = error.errorCode;
    if (code === "UNSUPPORTED_FILE_TYPE") return "Choose a CSV or Excel (.xlsx) file.";
    if (code === "FILE_TOO_LARGE") return "This file exceeds the 5 MB limit.";
    if (code === "DUPLICATE_HEADER") return "Some columns have the same name. Rename them before uploading.";
    if (code === "TOO_MANY_ROWS") return "This file exceeds the 5,000-row limit.";
    if (code === "MAPPING_INCOMPLETE" || code === "MAPPING_CONFLICT") return "Review every required field, remove conflicting mappings, and supply explicit defaults where needed.";
  }
  return "The file could not be processed. Check its format and column mapping.";
}
export async function previewImport(file: ImportFile): Promise<ImportPreviewResponse> {
  try { return { ok: true, previews: (await parseImportFile(file)).map((table) => createImportPreview(table)) }; }
  catch (error) { return { ok: false, message: message(error) }; }
}
export async function validateImport(file: ImportFile, selection: unknown): Promise<ImportHealthResponse> {
  try {
    const selected = SelectionSchema.parse(selection);
    const tables = await parseImportFile(file); // Reparse original bytes, not browser-supplied facts.
    const table = tables[selected.sheetIndex]; if (!table) return { ok: false, message: "Choose a sheet from this file." };
    const key = encodeURIComponent(file.name);
    const context = { organizationId: abcApparelDataset.organization.id, dataSourceId: `DS-UPLOAD:${key}`, importSessionId: `IMPORT-UPLOAD:${key}` };
    const mapping = confirmMapping(table, { confirmed: selected.confirmed, datasetKind: selected.datasetKind, assignments: selected.assignments, defaults: selected.defaults, context });
    return { ok: true, datasetKind: selected.datasetKind, result: normalizeTable(table, mapping) };
  } catch (error) { return { ok: false, message: message(error) }; }
}
