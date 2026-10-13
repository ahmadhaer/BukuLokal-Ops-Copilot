import ExcelJS from "exceljs";
import { ImportError } from "../../features/imports/errors";
import { checkFile, checkRowLimit, tableFromRows } from "../../features/imports/raw";
import type { ImportFile, RawTable } from "../../features/imports/types";

function cellValue(value: ExcelJS.CellValue): unknown {
  if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value instanceof Date) return value;
  if ("formula" in value || "sharedFormula" in value) {
    // Read cached results only. Never calculate formulas or fetch external links.
    if (value.result === undefined) throw new ImportError("PARSE_ERROR", "Formula cells require a cached result; formulas are never evaluated.");
    return cellValue(value.result);
  }
  if ("richText" in value) return value.richText.map((part) => part.text).join("");
  if ("hyperlink" in value) return value.text;
  throw new ImportError("PARSE_ERROR", "Spreadsheet contains an unsupported or error cell value.");
}
export async function parseXlsx(file: ImportFile): Promise<RawTable[]> {
  checkFile(file, "xlsx");
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.load(file.bytes.slice().buffer); }
  catch { throw new ImportError("PARSE_ERROR", "File is not a readable XLSX workbook."); }
  const tables: RawTable[] = [];
  let totalRows = 0;
  workbook.eachSheet((sheet) => {
    const entries: Array<{ rowNumber: number; cells: unknown[] }> = [];
    sheet.eachRow((row, rowNumber) => {
      const cells: unknown[] = [];
      row.eachCell({ includeEmpty: true }, (cell, column) => { cells[column - 1] = cellValue(cell.value); });
      entries.push({ rowNumber, cells });
    });
    const table = tableFromRows(file.name, entries, sheet.name);
    if (table) { totalRows += table.rows.length; checkRowLimit(totalRows); tables.push(table); }
  });
  if (!tables.length) throw new ImportError("PARSE_ERROR", "Workbook contains no nonempty tables.");
  return tables;
}
