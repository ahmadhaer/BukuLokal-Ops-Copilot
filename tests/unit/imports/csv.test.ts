import { describe, expect, it } from "vitest";
import { parseCsv } from "../../../src/connectors/csv/parse-csv";
import { MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS } from "../../../src/features/imports/constants";
import { parseImportFile } from "../../../src/features/imports/parse-file";
import { ImportError } from "../../../src/features/imports/errors";
import { csv, fixture } from "./helpers";

function fails(fn: () => unknown, code: string) {
  try { fn(); throw new Error("Expected import failure"); }
  catch (error) { expect(error).toBeInstanceOf(ImportError); expect(error).toMatchObject({ errorCode: code }); }
}
describe("CSV parser", () => {
  it("dispatches only supported file formats without changing raw content", async () => {
    const [table] = await parseImportFile({ name: "orders.CSV", bytes: fixture("orders.csv") });
    expect(table.sourceName).toBe("orders.CSV");
    expect(await parseImportFile({ name: "manufacturing.xlsx", bytes: fixture("manufacturing.xlsx") })).toHaveLength(3);
    await expect(parseImportFile({ name: "file.xls", bytes: new Uint8Array() })).rejects.toMatchObject({ errorCode: "UNSUPPORTED_FILE_TYPE" });
  });
  it("preserves required scenario headers, text quantities, and row numbers", () => {
    const table = parseCsv({ name: "orders.csv", bytes: fixture("orders.csv") });
    expect(table.headers).toEqual(["No PO", "Customer", "Nama Barang", "Jumlah", "Deadline", "Status"]);
    expect(table.rows[0].rowNumber).toBe(2);
    expect(table.rows[0].values.Jumlah).toBe("500");
  });
  it.each(["\n", "\r\n"])("handles UTF-8, quoted commas, empty cells, and %j", (newline) => {
    const table = csv(`ID,Name,Empty${newline}SO-1,"Synthetic, Café",${newline}`);
    expect(table.rows).toEqual([{ rowNumber: 2, values: { ID: "SO-1", Name: "Synthetic, Café", Empty: "" } }]);
  });
  it("retains physical starting line numbers after a quoted multiline cell", () => {
    const table = csv('ID,Name\nSO-1,"Synthetic\nCustomer"\nSO-2,Synthetic Customer B\n');
    expect(table.rows.map((row) => row.rowNumber)).toEqual([2, 4]);
  });
  it("skips blank lines while retaining original header spelling", () => {
    const table = csv('\n No PO ,Name\n\nSO-1,Synthetic Customer\n\n');
    expect(table.headers[0]).toBe(" No PO ");
    expect(table.rows[0].rowNumber).toBe(4);
  });
  it("rejects duplicate normalized headers", () => {
    fails(() => parseCsv({ name: "duplicate.csv", bytes: fixture("duplicate-headers.csv") }), "DUPLICATE_HEADER");
  });
  it.each(['ID,Name\nSO-1,"unterminated', 'ID,Name\nSO-1,"bad"quote']) ("rejects malformed quoting %#", (text) => {
    fails(() => csv(text), "PARSE_ERROR");
  });
  it("rejects extra columns instead of dropping data", () => fails(() => csv("ID\nSO-1,extra"), "PARSE_ERROR"));
  it("rejects empty/invalid UTF-8 files and empty header columns", () => {
    fails(() => csv(""), "PARSE_ERROR");
    fails(() => csv("ID,,Name\nSO-1,x,Synthetic"), "PARSE_ERROR");
    fails(() => parseCsv({ name: "bad.csv", bytes: new Uint8Array([0xff]) }), "PARSE_ERROR");
  });
  it.each(["file.xls", "file.ods", "file.pdf", "file.numbers"])("rejects %s", (name) => fails(() => csv("id\nSYNTHETIC-1", name), "UNSUPPORTED_FILE_TYPE"));
  it("enforces file-byte limit without truncation", () => {
    fails(() => parseCsv({ name: "large.csv", bytes: new Uint8Array(MAX_IMPORT_FILE_BYTES + 1) }), "FILE_TOO_LARGE");
    const bytes = new TextEncoder().encode("id\nSO-1");
    const boundary = new Uint8Array(MAX_IMPORT_FILE_BYTES); boundary.fill(32); boundary.set(bytes);
    expect(parseCsv({ name: "boundary.csv", bytes: boundary }).rows).toHaveLength(1);
  });
  it("accepts exactly 5,000 rows and rejects 5,001", () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS }, (_, i) => `SYNTHETIC-${i}`);
    expect(csv("id\n" + rows.join("\n")).rows).toHaveLength(MAX_IMPORT_ROWS);
    fails(() => csv("id\n" + [...rows, "SYNTHETIC-EXTRA"].join("\n")), "TOO_MANY_ROWS");
  });
  it("keeps reserved-looking headers as plain own properties", () => {
    const table = csv("__proto__,constructor\nsynthetic,value");
    expect(Object.hasOwn(table.rows[0].values, "__proto__")).toBe(true);
    expect(table.rows[0].values.__proto__).toBe("synthetic");
  });
});
