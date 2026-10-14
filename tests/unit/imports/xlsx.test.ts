import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { parseXlsx } from "../../../src/connectors/excel/parse-xlsx";
import { MAX_IMPORT_FILE_BYTES } from "../../../src/features/imports/constants";
import { fixture } from "./helpers";

async function fromBook(book: ExcelJS.Workbook) {
  return parseXlsx({ name: "synthetic.xlsx", bytes: new Uint8Array(await book.xlsx.writeBuffer()) });
}
describe("XLSX parser", () => {
  it("reads multiple sheets, ignores empty sheets/trailing rows, and preserves source numbers", async () => {
    const tables = await parseXlsx({ name: "manufacturing.xlsx", bytes: fixture("manufacturing.xlsx") });
    expect(tables.map((table) => table.sheetName)).toEqual(["Orders", "Production", "Inventory"]);
    expect(tables.every((table) => table.rows.length === 1)).toBe(true);
    expect(tables[0].rows[0].rowNumber).toBe(4);
    expect(tables[0].rows[0].values.Jumlah).toBe(500);
    expect(tables[0].rows[0].values.Deadline).toEqual(new Date("2026-10-14T00:00:00Z"));
  });
  it("rejects duplicate normalized headers", async () => {
    const book = new ExcelJS.Workbook(); book.addWorksheet("Synthetic").addRow(["Order Qty", "order_qty"]);
    await expect(fromBook(book)).rejects.toMatchObject({ errorCode: "DUPLICATE_HEADER" });
  });
  it("rejects missing header names rather than losing cells", async () => {
    const book = new ExcelJS.Workbook(); const sheet = book.addWorksheet("Synthetic");
    sheet.getCell("A1").value = "id"; sheet.getCell("C1").value = "name";
    sheet.addRow(["SO-1", "hidden value", "Synthetic"]);
    await expect(fromBook(book)).rejects.toMatchObject({ errorCode: "PARSE_ERROR" });
  });
  it("reads cached formula results without evaluating formula content or following links", async () => {
    const book = new ExcelJS.Workbook(); const sheet = book.addWorksheet("Synthetic");
    sheet.addRow(["id", "quantity", "label"]);
    sheet.addRow(["SO-1", { formula: "ARBITRARY_EXTERNAL_FUNCTION()", result: 500 }, { text: "Synthetic", hyperlink: "https://example.invalid/synthetic" }]);
    const [table] = await fromBook(book);
    expect(table.rows[0].values).toEqual({ id: "SO-1", quantity: 500, label: "Synthetic" });
  });
  it("rejects formulas lacking cached results", async () => {
    const book = new ExcelJS.Workbook(); const sheet = book.addWorksheet("Synthetic");
    sheet.addRow(["id", "qty"]); sheet.addRow(["SO-1", { formula: "1+1" }]);
    await expect(fromBook(book)).rejects.toMatchObject({ errorCode: "PARSE_ERROR" });
  });
  it("rejects corrupt/empty workbooks", async () => {
    await expect(parseXlsx({ name: "bad.xlsx", bytes: new Uint8Array([1, 2, 3]) })).rejects.toMatchObject({ errorCode: "PARSE_ERROR" });
    const book = new ExcelJS.Workbook(); book.addWorksheet("Empty");
    await expect(fromBook(book)).rejects.toMatchObject({ errorCode: "PARSE_ERROR" });
  });
  it("enforces file extension and byte limits before workbook parsing", async () => {
    await expect(parseXlsx({ name: "old.xls", bytes: new Uint8Array() })).rejects.toMatchObject({ errorCode: "UNSUPPORTED_FILE_TYPE" });
    await expect(parseXlsx({ name: "large.xlsx", bytes: new Uint8Array(MAX_IMPORT_FILE_BYTES + 1) })).rejects.toMatchObject({ errorCode: "FILE_TOO_LARGE" });
  });
  it("enforces the total row limit across sheets", async () => {
    const book = new ExcelJS.Workbook();
    for (const name of ["Synthetic A", "Synthetic B"]) {
      const sheet = book.addWorksheet(name); sheet.addRow(["id"]);
      for (let i = 0; i < 2_501; i++) sheet.addRow([`SYNTHETIC-${name}-${i}`]);
    }
    await expect(fromBook(book)).rejects.toMatchObject({ errorCode: "TOO_MANY_ROWS" });
  });
});
