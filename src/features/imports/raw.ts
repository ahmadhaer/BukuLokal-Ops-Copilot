import { MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS } from "./constants";
import { ImportError } from "./errors";
import type { ImportFile, RawRow, RawTable } from "./types";

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}
export function checkFile(file: ImportFile, extension: "csv" | "xlsx") {
  if (!file.name.toLowerCase().endsWith(`.${extension}`)) throw new ImportError("UNSUPPORTED_FILE_TYPE", `Only .${extension} files are supported by this parser.`);
  if (file.bytes.byteLength > MAX_IMPORT_FILE_BYTES) throw new ImportError("FILE_TOO_LARGE", "File exceeds the 5 MiB limit.");
}
export function checkRowLimit(count: number) {
  if (count > MAX_IMPORT_ROWS) throw new ImportError("TOO_MANY_ROWS", "Import source exceeds the 5,000 data-row limit.");
}
export function checkHeaders(headers: string[]) {
  if (!headers.length || headers.some((header) => !normalizeHeader(header))) throw new ImportError("PARSE_ERROR", "Every source column must have a nonempty header.");
  if (new Set(headers.map(normalizeHeader)).size !== headers.length) throw new ImportError("DUPLICATE_HEADER", "Duplicate normalized headers must be renamed before import.");
}
export function isBlank(value: unknown): boolean {
  return value == null || (typeof value === "string" && value.trim() === "");
}
export function tableFromRows(sourceName: string, entries: Array<{ rowNumber: number; cells: unknown[] }>, sheetName?: string): RawTable | null {
  const meaningful = entries.filter((row) => row.cells.some((value) => !isBlank(value)));
  if (!meaningful.length) return null;
  const headerCells = Array.from(meaningful[0].cells);
  while (headerCells.length && isBlank(headerCells.at(-1))) headerCells.pop();
  if (headerCells.some((cell) => typeof cell !== "string")) throw new ImportError("PARSE_ERROR", "Column headers must be text.");
  const headers = headerCells as string[];
  checkHeaders(headers);
  const rows: RawRow[] = meaningful.slice(1).map(({ rowNumber, cells }) => {
    if (cells.slice(headers.length).some((value) => !isBlank(value))) throw new ImportError("PARSE_ERROR", "A data row contains values outside the header columns.");
    return { rowNumber, values: Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])) };
  });
  checkRowLimit(rows.length);
  return { sourceName, ...(sheetName === undefined ? {} : { sheetName }), headers, rows };
}
