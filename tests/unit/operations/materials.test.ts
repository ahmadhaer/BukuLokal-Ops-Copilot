import { describe, expect, it } from "vitest";
import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { calculateMaterialFacts, buildOrderOperationalFacts, MaterialFactsSchema } from "../../../src/domain/operations";

const item = abcApparelDataset.inventoryItems[0];
describe("individual material facts", () => {
  it.each([[500, 300, 200], [500, 700, 0], [500, 500, 0], [0, 0, 0], [5, 0, 5]])("derives required %s available %s", (requiredQuantity, availableQuantity, shortageQuantity) => {
    const facts = calculateMaterialFacts({ ...item, requiredQuantity, availableQuantity });
    expect(facts.shortageQuantity).toBe(shortageQuantity);
    expect(facts.hasShortage).toBe(shortageQuantity > 0);
    expect(facts.unit).toBe("pcs");
  });
  it("computes Fabric A shortage from SO-001 raw inventory", () => {
    expect(calculateMaterialFacts(item)).toMatchObject({ inventoryItemId: "MAT-001", relatedOrderId: "SO-001", materialName: "Fabric A", shortageQuantity: 200, unit: "pcs" });
  });
  it("keeps null/absent correlation unscoped and does not guess by name", () => {
    for (const relatedOrderId of [null, undefined]) {
      const unscoped = { ...item, id: "MAT-SYNTHETIC-UNSCOPED", relatedOrderId };
      expect(calculateMaterialFacts(unscoped).relatedOrderId).toBeNull();
      const dataset = { ...abcApparelDataset, inventoryItems: [unscoped] };
      expect(buildOrderOperationalFacts("SO-001", dataset, dataset.asOfDate).materials).toEqual([]);
    }
  });
  it("keeps mixed materials and units individual without summing them", () => {
    const dataset = { ...abcApparelDataset, inventoryItems: [item,
      { ...item, id: "MAT-SYNTHETIC-CHEMICAL", materialName: "Synthetic Chemical", unit: "kg", requiredQuantity: 8, availableQuantity: 3 },
    ] };
    const facts = buildOrderOperationalFacts("SO-001", dataset, dataset.asOfDate);
    expect(facts.materials.map((material) => [material.shortageQuantity, material.unit])).toEqual([[200, "pcs"], [5, "kg"]]);
    expect(facts).not.toHaveProperty("totalMaterialShortage");
    expect(facts.production.quantityUnit).toBe("pcs");
  });
  it("rejects organization mismatch and duplicate matching inventory", () => {
    expect(() => buildOrderOperationalFacts("SO-001", { ...abcApparelDataset, inventoryItems: [{ ...item, organizationId: "ORG-SYNTHETIC-OTHER" }] }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "ORGANIZATION_MISMATCH" }));
    expect(() => buildOrderOperationalFacts("SO-001", { ...abcApparelDataset, inventoryItems: [item, item] }, "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "DUPLICATE_ENTITY_ID" }));
  });
  it("rejects invalid source and derived material quantities", () => {
    expect(() => calculateMaterialFacts({ ...item, availableQuantity: -1 })).toThrowError(expect.objectContaining({ errorCode: "INVALID_SOURCE_DATA" }));
    const facts = calculateMaterialFacts(item);
    for (const shortageQuantity of [-1, NaN, Infinity]) expect(MaterialFactsSchema.safeParse({ ...facts, shortageQuantity }).success).toBe(false);
  });
});
