import { describe, expect, it } from "vitest";
import { parseCsv } from "../../../src/connectors/csv/parse-csv";
import { parseXlsx } from "../../../src/connectors/excel/parse-xlsx";
import { InventoryItemSchema, OrderSchema, ProductionJobSchema } from "../../../src/domain";
import { normalizeTable } from "../../../src/features/imports/normalize";
import { confirmed, context, csv, fixture, timestamp } from "./helpers";

describe("canonical normalization", () => {
  it("normalizes the required Indonesian order scenario only with an explicit unit", () => {
    const table = parseCsv({ name: "orders.csv", bytes: fixture("orders.csv") });
    const result = normalizeTable(table, confirmed(table, "orders", { quantityUnit: "pcs" }));
    expect(result.summary).toEqual({ totalRows: 1, validRows: 1, invalidRows: 0 });
    expect(OrderSchema.parse(result.validRecords[0])).toEqual({
      id: "SO-IMPORT-001", customerName: "Synthetic Customer A", productName: "Classic T-Shirt",
      orderedQuantity: 500, quantityUnit: "pcs", dueDate: "2026-10-14", status: "in_production",
      organizationId: context.organizationId, sourceId: context.importSessionId,
    });
  });
  it("normalizes production with explicit unit/timestamp defaults", () => {
    const table = parseCsv({ name: "production.csv", bytes: fixture("production.csv") });
    const result = normalizeTable(table, confirmed(table, "production", { quantityUnit: "pcs", updatedAt: timestamp }));
    expect(ProductionJobSchema.parse(result.validRecords[0])).toMatchObject({
      id: "PJ-IMPORT-001", orderId: "SO-IMPORT-001", plannedQuantity: 500,
      completedQuantity: 150, organizationId: context.organizationId, quantityUnit: "pcs", updatedAt: timestamp,
    });
    expect(result.errors).toEqual([]);
  });
  it("normalizes inventory and preserves optional order correlation", () => {
    const table = parseCsv({ name: "inventory.csv", bytes: fixture("inventory.csv") });
    const result = normalizeTable(table, confirmed(table, "inventory", { unit: "pcs", updatedAt: timestamp }));
    expect(InventoryItemSchema.parse(result.validRecords[0])).toMatchObject({
      id: "MAT-IMPORT-001", materialName: "Fabric A", availableQuantity: 300, requiredQuantity: 500,
      relatedOrderId: "SO-IMPORT-001", organizationId: context.organizationId,
    });
  });
  it("uses null for absent optional inventory correlation", () => {
    const table = csv("id,materialName,availableQuantity,requiredQuantity,unit,updatedAt\nMAT-1,Synthetic Fabric,1,2,kg,2026-10-12T00:00:00Z");
    const result = normalizeTable(table, confirmed(table, "inventory"));
    expect(result.validRecords[0]).toMatchObject({ relatedOrderId: null });
  });
  it.each(["500", "500.0", " 500 "])("accepts safe numeric text %j", (quantity) => {
    const table = csv(`id,customerName,productName,orderedQuantity,quantityUnit,dueDate,status\nSO-1, Synthetic Customer ,Synthetic  Product,${quantity},pcs,2026-10-14,production`);
    const result = normalizeTable(table, confirmed(table, "orders"));
    expect(result.validRecords[0]).toMatchObject({ orderedQuantity: 500, customerName: "Synthetic Customer", productName: "Synthetic  Product", status: "in_production" });
  });
  it("normalizes spreadsheet numeric/date cells independently of runtime timezone", async () => {
    const tables = await parseXlsx({ name: "manufacturing.xlsx", bytes: fixture("manufacturing.xlsx") });
    const order = normalizeTable(tables[0], confirmed(tables[0], "orders", { quantityUnit: "pcs" }));
    expect(order.validRecords[0]).toMatchObject({ dueDate: "2026-10-14", orderedQuantity: 500 });
    const production = normalizeTable(tables[1], confirmed(tables[1], "production", { quantityUnit: "pcs", updatedAt: timestamp }));
    const inventory = normalizeTable(tables[2], confirmed(tables[2], "inventory", { unit: "pcs", updatedAt: timestamp }));
    expect([order, production, inventory].every((result) => result.summary.validRows === 1)).toBe(true);
  });
  it("is repeatable without mutating raw input and ignores unrelated columns", () => {
    const table = csv("id,customerName,productName,orderedQuantity,quantityUnit,dueDate,status,riskScore\nSO-1,Synthetic Customer,Synthetic Product,1,pcs,2026-10-14,planned,999");
    const before = structuredClone(table); const mapping = confirmed(table, "orders");
    expect(normalizeTable(table, mapping)).toEqual(normalizeTable(table, mapping));
    expect(table).toEqual(before);
    expect(normalizeTable(table, mapping).validRecords[0]).not.toHaveProperty("riskScore");
  });
});
