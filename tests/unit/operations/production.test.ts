import { describe, expect, it } from "vitest";
import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { calculateProductionFacts, ProductionFactsSchema } from "../../../src/domain/operations";

const order = abcApparelDataset.orders[0];
const job = abcApparelDataset.productionJobs[0];
describe("production facts", () => {
  it("computes completion and remaining quantity from raw quantities", () => {
    expect(calculateProductionFacts(order, [job])).toEqual({
      orderId: order.id, orderedQuantity: 500, totalPlannedQuantity: 500,
      totalCompletedQuantity: 150, remainingQuantity: 350, completionPercentage: 30, quantityUnit: "pcs",
    });
  });
  it.each([[500, 100, 0], [0, 0, 500]])("handles completed quantity %s", (completedQuantity, percentage, remainingQuantity) => {
    const facts = calculateProductionFacts(order, [{ ...job, completedQuantity }]);
    expect(facts.completionPercentage).toBe(percentage);
    expect(facts.remainingQuantity).toBe(remainingQuantity);
  });
  it("rounds one-third to two decimal places", () => {
    expect(calculateProductionFacts({ ...order, orderedQuantity: 3 }, [{ ...job, plannedQuantity: 3, completedQuantity: 1 }]).completionPercentage).toBe(33.33);
  });
  it("rounds an exact half-hundredth upward", () => {
    expect(calculateProductionFacts({ ...order, orderedQuantity: 20_000 }, [{ ...job, plannedQuantity: 20_000, completedQuantity: 1 }]).completionPercentage).toBe(0.01);
  });
  it("uses ordered quantity rather than planned quantity as denominator", () => {
    expect(calculateProductionFacts(order, [{ ...job, plannedQuantity: 300 }])).toMatchObject({ completionPercentage: 30, totalPlannedQuantity: 300 });
  });
  it("aggregates multiple jobs and is independent of job input order", () => {
    const jobs = [{ ...job, id: "PJ-SYNTHETIC-B", plannedQuantity: 300, completedQuantity: 100 },
      { ...job, id: "PJ-SYNTHETIC-A", plannedQuantity: 200, completedQuantity: 50 }];
    const before = structuredClone(jobs);
    expect(calculateProductionFacts(order, jobs)).toEqual(calculateProductionFacts(order, [...jobs].reverse()));
    expect(calculateProductionFacts(order, jobs)).toMatchObject({ totalPlannedQuantity: 500, totalCompletedQuantity: 150, completionPercentage: 30 });
    expect(jobs).toEqual(before);
  });
  it("handles zero jobs and ignores jobs for another order", () => {
    const expected = { totalPlannedQuantity: 0, totalCompletedQuantity: 0, completionPercentage: 0, remainingQuantity: 500 };
    expect(calculateProductionFacts(order, [])).toMatchObject(expected);
    expect(calculateProductionFacts(order, [{ ...job, orderId: "SO-SYNTHETIC-OTHER" }])).toMatchObject(expected);
  });
  it("rejects completed aggregation exceeding the order without clamping", () => {
    expect(() => calculateProductionFacts(order, [
      { ...job, id: "PJ-SYNTHETIC-A", completedQuantity: 400 },
      { ...job, id: "PJ-SYNTHETIC-B", completedQuantity: 200 },
    ])).toThrowError(expect.objectContaining({ errorCode: "COMPLETED_EXCEEDS_ORDERED" }));
  });
  it("rejects matching production unit and organization mismatches", () => {
    expect(() => calculateProductionFacts(order, [{ ...job, quantityUnit: "kg" }])).toThrowError(expect.objectContaining({ errorCode: "PRODUCTION_UNIT_MISMATCH" }));
    expect(() => calculateProductionFacts(order, [{ ...job, organizationId: "ORG-SYNTHETIC-OTHER" }])).toThrowError(expect.objectContaining({ errorCode: "ORGANIZATION_MISMATCH" }));
  });
  it("rejects malformed quantities and duplicate job IDs", () => {
    for (const orderedQuantity of [0, -1, NaN, Infinity]) {
      expect(() => calculateProductionFacts({ ...order, orderedQuantity }, [job])).toThrowError(expect.objectContaining({ errorCode: "INVALID_SOURCE_DATA" }));
    }
    expect(() => calculateProductionFacts(order, [{ ...job, completedQuantity: 501 }])).toThrowError(expect.objectContaining({ errorCode: "INVALID_SOURCE_DATA" }));
    expect(() => calculateProductionFacts(order, [job, job])).toThrowError(expect.objectContaining({ errorCode: "DUPLICATE_ENTITY_ID" }));
  });
  it("rejects finite source values that overflow aggregation", () => {
    expect(() => calculateProductionFacts(order, [
      { ...job, id: "PJ-SYNTHETIC-A", plannedQuantity: Number.MAX_VALUE, completedQuantity: 0 },
      { ...job, id: "PJ-SYNTHETIC-B", plannedQuantity: Number.MAX_VALUE, completedQuantity: 0 },
    ])).toThrowError(expect.objectContaining({ errorCode: "INVALID_FACTS" }));
  });
  it("validates derived numeric bounds", () => {
    const facts = calculateProductionFacts(order, [job]);
    for (const value of [NaN, Infinity, -1, 101]) expect(ProductionFactsSchema.safeParse({ ...facts, completionPercentage: value }).success).toBe(false);
    expect(ProductionFactsSchema.safeParse({ ...facts, remainingQuantity: -1 }).success).toBe(false);
    expect(ProductionFactsSchema.safeParse({ ...facts, totalPlannedQuantity: Infinity }).success).toBe(false);
  });
});
