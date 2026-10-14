import Papa from "papaparse";
import { ImportError } from "../../features/imports/errors";
import { checkFile, tableFromRows } from "../../features/imports/raw";
import type { ImportFile, RawTable } from "../../features/imports/types";

export function parseCsv(file: ImportFile): RawTable {
  checkFile(file, "csv");
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(file.bytes); }
  catch { throw new ImportError("PARSE_ERROR", "CSV must contain valid UTF-8 text."); }
  const entries: Array<{ rowNumber: number; cells: string[] }> = [];
  let cursor = 0;
  let line = 1;
  let failed = false;
  Papa.parse<string[]>(text, {
    delimiter: ",", header: false, dynamicTyping: false, skipEmptyLines: false,
    step(result) {
      if (result.errors.length) failed = true;
      entries.push({ rowNumber: line, cells: result.data });
      line += (text.slice(cursor, result.meta.cursor).match(/\r\n|\r|\n/g) ?? []).length;
      cursor = result.meta.cursor;
    },
  });
  if (failed) throw new ImportError("PARSE_ERROR", "CSV has malformed quoting or fields.");
  const table = tableFromRows(file.name, entries);
  if (!table) throw new ImportError("PARSE_ERROR", "CSV contains no header row.");
  return table;
}
