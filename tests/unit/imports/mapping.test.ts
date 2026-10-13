import { describe, expect, it } from "vitest";
import { confirmMapping, suggestMapping } from "../../../src/features/imports/mapping";
import { normalizeTable } from "../../../src/features/imports/normalize";
import { createImportPreview } from "../../../src/features/imports/preview";
import type { RawTable } from "../../../src/features/imports/types";
import { context, csv, fixture } from "./helpers";
import { parseCsv } from "../../../src/connectors/csv/parse-csv";

const table: RawTable = { sourceName: "synthetic.csv", headers: ["id", "customerName", "productName", "orderedQuantity", "quantityUnit", "dueDate", "status"], rows: [] };
const input = () => ({ confirmed: true, datasetKind: "orders", context, defaults: {}, assignments: table.headers.map((field) => ({ sourceHeader: field, canonicalField: field })) });
describe("deterministic mapping", () => {
  it("recognizes exact canonical headers but still requires confirmation", () => {
    const suggestion = suggestMapping(table);
    expect(suggestion.datasetKind).toBe("orders");
    expect(suggestion.requiresConfirmation).toBe(true);
    expect(suggestion.suggestions.every((item) => item.reason === "exact")).toBe(true);
  });
  it.each([
    ["Order Number", "id"], ["nama pelanggan", "customerName"], ["Nama Barang", "productName"],
    ["Jumlah Pesanan", "orderedQuantity"], ["Tanggal Jatuh Tempo", "dueDate"],
    [" ORDER-QTY ", "orderedQuantity"], ["order_qty", "orderedQuantity"],
  ])("maps explicit synonym %s to %s", (header, field) => {
    const suggestion = suggestMapping({ ...table, headers: [header] }, "orders");
    expect(suggestion.suggestions[0]).toMatchObject({ sourceHeader: header, canonicalField: field, reason: "synonym" });
  });
  it("leaves unrelated columns unmapped", () => {
    const suggestion = suggestMapping({ ...table, headers: [...table.headers, "synthetic unknown"] }, "orders");
    expect(suggestion.unmappedHeaders).toEqual(["synthetic unknown"]);
  });
  it("returns null for insufficient/ambiguous coverage", () => {
    const raw = parseCsv({ name: "ambiguous.csv", bytes: fixture("ambiguous.csv") });
    expect(suggestMapping(raw).datasetKind).toBeNull();
    expect(createImportPreview(raw).mappingWarnings[0].errorCode).toBe("AMBIGUOUS_DATASET_KIND");
  });
  it("does not choose between equally covered sufficient kinds", () => {
    // Both orders and inventory cover exactly six fields with sufficient core signatures.
    const tied = ["id", "customerName", "productName", "orderedQuantity", "dueDate", "status",
      "materialName", "availableQuantity", "requiredQuantity", "relatedOrderId", "updatedAt"];
    expect(suggestMapping({ ...table, headers: tied }).datasetKind).toBeNull();
  });
  it("flags duplicate targets and avoids automatic kind selection", () => {
    const raw = { ...table, headers: [...table.headers, "Jumlah"] };
    expect(suggestMapping(raw).datasetKind).toBeNull();
    expect(suggestMapping(raw, "orders").ambiguousMappings).toContain("orderedQuantity");
  });
  it("rejects a suggestion at both type and runtime boundaries", () => {
    const raw = csv("id,customerName,productName,orderedQuantity,quantityUnit,dueDate,status\nSO-1,Synthetic Customer,Synthetic Product,1,pcs,2026-10-14,planned");
    const suggestion = suggestMapping(raw);
    // @ts-expect-error Mapping suggestions are not branded confirmed contracts.
    expect(() => normalizeTable(raw, suggestion)).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
  });
  it.each([false, undefined])("rejects absent confirmation %s", (confirmed) => {
    expect(() => confirmMapping(table, { ...input(), confirmed })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
  });
  it("rejects duplicate source or target assignments", () => {
    for (const assignment of [
      { sourceHeader: "customerName", canonicalField: "id" },
      { sourceHeader: "id", canonicalField: "customerName" },
    ]) expect(() => confirmMapping(table, { ...input(), assignments: [...input().assignments, assignment] })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_CONFLICT" }));
  });
  it("rejects unknown targets and nonexistent source headers", () => {
    expect(() => confirmMapping(table, { ...input(), assignments: [{ sourceHeader: "id", canonicalField: "risk" }] })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_CONFLICT" }));
    expect(() => confirmMapping(table, { ...input(), assignments: [{ sourceHeader: "absent", canonicalField: "id" }] })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
  });
  it("requires every required field and disallows fabricated defaults", () => {
    expect(() => confirmMapping(table, { ...input(), assignments: [] })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
    expect(() => confirmMapping(table, { ...input(), defaults: { status: "planned" } })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
    expect(() => confirmMapping(table, { ...input(), defaults: { quantityUnit: "pcs" } })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_CONFLICT" }));
    const noUnit = { ...table, headers: table.headers.filter((header) => header !== "quantityUnit") };
    expect(() => confirmMapping(noUnit, { ...input(), assignments: input().assignments.filter((item) => item.canonicalField !== "quantityUnit"), defaults: { quantityUnit: undefined } })).toThrowError(expect.objectContaining({ errorCode: "MAPPING_INCOMPLETE" }));
  });
  it("produces a non-mutating preview with missing-unit warning", () => {
    const raw = parseCsv({ name: "orders.csv", bytes: fixture("orders.csv") });
    const before = structuredClone(raw);
    const preview = createImportPreview(raw);
    expect(preview).toMatchObject({ sourceName: "orders.csv", rowCount: 1, suggestedDatasetKind: "orders" });
    expect(preview.mapping.missingRequiredFields).toContain("quantityUnit");
    expect(raw).toEqual(before);
  });
});
