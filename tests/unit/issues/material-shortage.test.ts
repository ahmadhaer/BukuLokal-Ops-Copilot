import { describe, expect, it } from "vitest";
import { detectMaterialShortageIssues } from "../../../src/domain/issues";
import { context, scenario } from "./helpers";

describe("per-item material-shortage policy", () => {
  it.each([[2, "critical"], [3, "high"], [7, "medium"], [8, "low"], [-1, "critical"]])("days %s produce %s for a positive shortage", (days, severity) => {
    const { order, facts } = scenario(days as number, 30, 200);
    const result = detectMaterialShortageIssues(order, facts, context);
    expect(result.issues).toHaveLength(1); expect(result.issues[0].severity).toBe(severity);
  });
  it("does not emit an issue for zero shortage", () => {
    const { order, facts } = scenario(1, 30, 0);
    expect(detectMaterialShortageIssues(order, facts, context).issues).toEqual([]);
  });
  it("creates separate issues and evidence for mixed materials/units", () => {
    const { order, facts } = scenario(2, 30, 200);
    facts.materials.push({ ...facts.materials[0], inventoryItemId: "MAT-SYNTHETIC-CHEMICAL", materialName: "Synthetic Chemical", unit: "kg", shortageQuantity: 5 });
    const result = detectMaterialShortageIssues(order, facts, context);
    expect(result.issues).toHaveLength(2);
    expect(result.evidence.filter((item) => item.type === "material_shortage").map((item) => [item.value, item.unit])).toEqual([[200, "pcs"], [5, "kg"]]);
  });
  it("ignores unscoped and other-order material facts", () => {
    const { order, facts } = scenario(2, 30, 200);
    facts.materials[0].relatedOrderId = null;
    facts.materials.push({ ...facts.materials[0], inventoryItemId: "MAT-SYNTHETIC-OTHER", relatedOrderId: "SO-SYNTHETIC-OTHER" });
    expect(detectMaterialShortageIssues(order, facts, context).issues).toEqual([]);
  });
  it("keeps identifiers stable across detection timestamps", () => {
    const { order, facts } = scenario(2, 30, 200);
    const first = detectMaterialShortageIssues(order, facts, context);
    const next = detectMaterialShortageIssues(order, facts, { detectedAt: "2026-10-13T12:00:00Z" });
    expect(first.issues[0].id).toBe(next.issues[0].id);
    expect(first.evidence.map((item) => item.id)).toEqual(next.evidence.map((item) => item.id));
  });
});
