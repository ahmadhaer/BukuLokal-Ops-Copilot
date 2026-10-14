import { describe, expect, it } from "vitest";
import { parseCsv } from "../../../src/connectors/csv/parse-csv";
import { normalizeTable } from "../../../src/features/imports/normalize";
import { MAX_IMPORT_ROWS } from "../../../src/features/imports/constants";
import { confirmed, csv, fixture, timestamp } from "./helpers";

const orderHeaders = "id,customerName,productName,orderedQuantity,quantityUnit,dueDate,status";
describe("invalid row separation", () => {
  it("separates six invalid rows from a valid record with stable field errors", () => {
    const table = parseCsv({ name: "invalid.csv", bytes: fixture("invalid-orders.csv") });
    const result = normalizeTable(table, confirmed(table, "orders"));
    expect(result.summary).toEqual({ totalRows: 7, validRows: 1, invalidRows: 6 });
    expect(result.validRecords[0]).toMatchObject({ id: "SO-VALID" });
    expect(result.errors.map((error) => [error.rowNumber, error.canonicalField, error.errorCode])).toEqual([
      [2, "id", "MISSING_REQUIRED_VALUE"], [3, "orderedQuantity", "SCHEMA_VALIDATION_FAILED"],
      [4, "orderedQuantity", "SCHEMA_VALIDATION_FAILED"], [5, "dueDate", "INVALID_DATE"],
      [6, "status", "INVALID_STATUS"], [7, "orderedQuantity", "INVALID_NUMBER"],
    ]);
    for (const error of result.errors) { expect(error.sourceField).toBeDefined(); expect(error.humanReadableMessage.length).toBeGreaterThan(0); }
  });
  it.each(["five hundred", "500 pcs", "NaN", "Infinity", "1,000", "1e309"])("rejects unsafe numeric text %s", (quantity) => {
    const table = csv(`${orderHeaders}\nSO-1,Synthetic Customer,Synthetic Product,"${quantity}",pcs,2026-10-14,planned`);
    expect(normalizeTable(table, confirmed(table, "orders")).errors[0].errorCode).toBe("INVALID_NUMBER");
  });
  it.each([NaN, Infinity, -Infinity])("rejects nonfinite raw numeric cell %#", (quantity) => {
    const table = csv(`${orderHeaders}\nSO-1,Synthetic Customer,Synthetic Product,1,pcs,2026-10-14,planned`);
    table.rows[0].values.orderedQuantity = quantity;
    expect(normalizeTable(table, confirmed(table, "orders")).summary.invalidRows).toBe(1);
  });
  it("rejects completed production exceeding planned with source row context", () => {
    const table = csv("Job ID,Order No,Planned Qty,Completed Qty\nPJ-1,SO-1,100,101");
    expect(normalizeTable(table, confirmed(table, "production", { quantityUnit: "pcs", updatedAt: timestamp })).errors[0]).toMatchObject({ rowNumber: 2, sourceField: "Completed Qty", canonicalField: "completedQuantity", errorCode: "SCHEMA_VALIDATION_FAILED" });
  });
  it("rejects negative available inventory", () => {
    const table = csv("Material ID,Material,Available,Required\nMAT-1,Synthetic Fabric,-1,1");
    expect(normalizeTable(table, confirmed(table, "inventory", { unit: "pcs", updatedAt: timestamp })).summary.invalidRows).toBe(1);
  });
  it("reports a missing mapped cell as a row error without applying defaults", () => {
    const table = csv(`${orderHeaders}\nSO-1,Synthetic Customer,Synthetic Product,1,pcs,2026-10-14,planned`);
    delete table.rows[0].values.productName;
    expect(normalizeTable(table, confirmed(table, "orders")).errors[0]).toMatchObject({ canonicalField: "productName", sourceField: "productName", errorCode: "MISSING_REQUIRED_VALUE" });
  });
  it("reports blank mapped timestamp instead of substituting the runtime clock", () => {
    const table = csv("id,orderId,plannedQuantity,completedQuantity,quantityUnit,updatedAt\nPJ-1,SO-1,1,0,pcs,");
    expect(normalizeTable(table, confirmed(table, "production")).errors[0]).toMatchObject({ canonicalField: "updatedAt", errorCode: "MISSING_REQUIRED_VALUE" });
  });
  it("rejects duplicate canonical IDs after trimming", () => {
    const table = csv(`${orderHeaders}\nSO-1,Synthetic Customer A,Synthetic Product,1,pcs,2026-10-14,planned\n SO-1 ,Synthetic Customer B,Synthetic Product,1,pcs,2026-10-14,planned`);
    const result = normalizeTable(table, confirmed(table, "orders"));
    expect(result.summary).toEqual({ totalRows: 2, validRows: 1, invalidRows: 1 });
    expect(result.errors[0]).toMatchObject({ rowNumber: 3, canonicalField: "id", errorCode: "SCHEMA_VALIDATION_FAILED" });
  });
  it("guards directly supplied raw tables against row-limit bypass", () => {
    const table = csv(`${orderHeaders}\nSO-1,Synthetic Customer,Synthetic Product,1,pcs,2026-10-14,planned`);
    table.rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => table.rows[0]);
    expect(() => normalizeTable(table, confirmed(table, "orders"))).toThrowError(expect.objectContaining({ errorCode: "TOO_MANY_ROWS" }));
  });
});
