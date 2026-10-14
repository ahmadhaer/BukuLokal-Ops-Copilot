import { describe, expect, it } from "vitest";
import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { buildDatasetOperationalFacts, buildOrderOperationalFacts, OrderOperationalFactsSchema, OperationsEngineError } from "../../../src/domain/operations";

describe("order and full dataset operational facts", () => {
  it("derives SO-001's required numeric facts rather than embedding them in source", () => {
    const result = buildOrderOperationalFacts("SO-001", abcApparelDataset, abcApparelDataset.asOfDate);
    expect(result.production.completionPercentage).toBe(30);
    expect(result.production.remainingQuantity).toBe(350);
    expect(result.materials.find((item) => item.materialName === "Fabric A")?.shortageQuantity).toBe(200);
    expect(result.deadline.daysToDeadline).toBe(2);
    expect(OrderOperationalFactsSchema.safeParse(result).success).toBe(true);
  });
  it("processes all 12 orders with deterministic ID order and finite derived values", () => {
    const results = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    expect(results).toHaveLength(12);
    expect(results.map((result) => result.orderId)).toEqual(abcApparelDataset.orders.map((order) => order.id));
    for (const result of results) expect(OrderOperationalFactsSchema.safeParse(result).success).toBe(true);
  });
  it("is repeatable, handles permuted records, and does not mutate fixture input", () => {
    const original = structuredClone(abcApparelDataset);
    const first = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    expect(buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate)).toEqual(first);
    const reversed = { ...abcApparelDataset, orders: [...abcApparelDataset.orders].reverse(), productionJobs: [...abcApparelDataset.productionJobs].reverse(), inventoryItems: [...abcApparelDataset.inventoryItems].reverse() };
    expect(buildDatasetOperationalFacts(reversed, reversed.asOfDate)).toEqual(first);
    expect(abcApparelDataset).toEqual(original);
  });
  it("does not attach unscoped inventory and supports zero production jobs", () => {
    const dataset = { ...abcApparelDataset, productionJobs: [], inventoryItems: [{ ...abcApparelDataset.inventoryItems[0], relatedOrderId: null }] };
    const results = buildDatasetOperationalFacts(dataset, dataset.asOfDate);
    expect(results.every((result) => result.materials.length === 0 && result.production.completionPercentage === 0)).toBe(true);
  });
  it("rejects unknown order, duplicate order IDs, and dataset organization mismatch", () => {
    expect(() => buildOrderOperationalFacts("SO-SYNTHETIC-MISSING", abcApparelDataset, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "ORDER_NOT_FOUND" }));
    expect(() => buildDatasetOperationalFacts({ ...abcApparelDataset, orders: [...abcApparelDataset.orders, abcApparelDataset.orders[0]] }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "DUPLICATE_ENTITY_ID" }));
    expect(() => buildDatasetOperationalFacts({ ...abcApparelDataset, organization: { ...abcApparelDataset.organization, id: "ORG-SYNTHETIC-OTHER" } }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "ORGANIZATION_MISMATCH" }));
  });
  it("rejects orphan production and inventory correlations", () => {
    expect(() => buildDatasetOperationalFacts({ ...abcApparelDataset, productionJobs: [{ ...abcApparelDataset.productionJobs[0], orderId: "SO-SYNTHETIC-MISSING" }] }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "ORDER_NOT_FOUND" }));
    expect(() => buildDatasetOperationalFacts({ ...abcApparelDataset, inventoryItems: [{ ...abcApparelDataset.inventoryItems[0], relatedOrderId: "SO-SYNTHETIC-MISSING" }] }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "ORDER_NOT_FOUND" }));
  });
  it("changes computed facts when supplied raw quantities and dates change", () => {
    const order = { ...abcApparelDataset.orders[0], id: "SO-SYNTHETIC-CHANGED", orderedQuantity: 40, dueDate: "2026-10-16" };
    const dataset = { ...abcApparelDataset, orders: [order], productionJobs: [{ ...abcApparelDataset.productionJobs[0], orderId: order.id, plannedQuantity: 40, completedQuantity: 10 }], inventoryItems: [{ ...abcApparelDataset.inventoryItems[0], relatedOrderId: order.id, availableQuantity: 7, requiredQuantity: 10 }] };
    const result = buildOrderOperationalFacts(order.id, dataset, "2026-10-12");
    expect(result.production).toMatchObject({ completionPercentage: 25, remainingQuantity: 30 });
    expect(result.materials[0].shortageQuantity).toBe(3);
    expect(result.deadline.daysToDeadline).toBe(4);
  });
  it("returns facts only without output entities, severity, or recommendation fields", () => {
    const results = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    const forbidden = new Set(["issues", "evidence", "severity", "risk", "riskScore", "priority", "recommendation", "actions"]);
    function inspect(value: unknown) {
      if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) { expect(forbidden.has(key), key).toBe(false); inspect(child); }
    }
    inspect(results);
    expect(abcApparelDataset.issues).toEqual([]); expect(abcApparelDataset.evidence).toEqual([]);
  });
  it("serializes controlled errors without a stack trace in the public contract", () => {
    const error = new OperationsEngineError("ORDER_NOT_FOUND", "Synthetic order is absent.");
    expect(JSON.parse(JSON.stringify(error))).toEqual({ errorCode: "ORDER_NOT_FOUND", humanReadableMessage: "Synthetic order is absent." });
  });
});
