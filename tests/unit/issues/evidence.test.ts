import { describe, expect, it } from "vitest";
import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { buildDatasetOperationalFacts, buildOrderOperationalFacts } from "../../../src/domain/operations";
import { detectDatasetIssues, detectOrderIssues, detectOrderDelayIssue, IssueDetectionResultSchema } from "../../../src/domain/issues";
import { IssueSchema } from "../../../src/domain/issues/schema";
import { EvidenceSchema } from "../../../src/domain/evidence/schema";
import { context, scenario } from "./helpers";

describe("canonical evidence and full fixture", () => {
  it("generates SO-001's two open critical issues and exact relevant evidence", () => {
    const order = abcApparelDataset.orders[0];
    const facts = buildOrderOperationalFacts(order.id, abcApparelDataset, abcApparelDataset.asOfDate);
    const result = detectOrderIssues(order, facts, context);
    expect(result.issues.map((issue) => [issue.type, issue.severity, issue.status])).toEqual([["order_delay_risk", "critical", "open"], ["material_shortage", "critical", "open"]]);
    const delay = result.issues.find((issue) => issue.type === "order_delay_risk")!;
    expect(result.evidence.filter((item) => item.issueId === delay.id).map((item) => [item.type, item.value, item.unit])).toEqual([
      ["days_to_deadline", 2, "days"], ["production_completion", 30, "percent"], ["material_shortage", 200, "pcs"],
    ]);
    const shortage = result.issues.find((issue) => issue.type === "material_shortage")!;
    expect(result.evidence.find((item) => item.issueId === shortage.id && item.type === "material_shortage")).toMatchObject({ sourceEntityType: "inventory_item", sourceEntityId: "MAT-001" });
  });
  it("includes only predicate-relevant evidence, without unrelated shortages for high/medium rules", () => {
    const critical = scenario(2, 90, 200);
    expect(detectOrderDelayIssue(critical.order, critical.facts, context).evidence.map((item) => item.type)).toEqual(["days_to_deadline", "material_shortage"]);
    const high = scenario(3, 70, 200);
    expect(detectOrderDelayIssue(high.order, high.facts, context).evidence.map((item) => item.type)).toEqual(["days_to_deadline", "production_completion"]);
  });
  it("locks counts derived from the fixture and explicit predicates, not a target score", () => {
    const facts = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    const result = detectDatasetIssues(abcApparelDataset, facts, context);
    // Delay: SO-001/003/007/010/012. Shortage: MAT-001/003/006/007/010.
    // SO-001 delay has three facts; remaining nine issues have two each: 3 + 9*2 = 21.
    expect(result.issues).toHaveLength(10); expect(result.evidence).toHaveLength(21);
    expect(result.issues.filter((issue) => issue.type === "order_delay_risk").map((issue) => issue.orderId)).toEqual(["SO-001", "SO-003", "SO-007", "SO-010", "SO-012"]);
    expect(result.issues.filter((issue) => issue.type === "material_shortage").map((issue) => issue.orderId)).toEqual(["SO-001", "SO-003", "SO-006", "SO-007", "SO-010"]);
  });
  it("validates all canonical schemas, unique IDs, bidirectional references, and actual source entities", () => {
    const result = detectDatasetIssues(abcApparelDataset, buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate), context);
    expect(IssueDetectionResultSchema.safeParse(result).success).toBe(true);
    expect(new Set(result.issues.map((item) => item.id)).size).toBe(result.issues.length);
    expect(new Set(result.evidence.map((item) => item.id)).size).toBe(result.evidence.length);
    for (const issue of result.issues) {
      expect(IssueSchema.safeParse(issue).success).toBe(true);
      expect(abcApparelDataset.orders.some((order) => order.id === issue.orderId)).toBe(true);
      expect(issue.evidenceIds.length).toBeGreaterThan(0);
      for (const id of issue.evidenceIds) expect(result.evidence.some((item) => item.id === id && item.issueId === issue.id)).toBe(true);
    }
    for (const item of result.evidence) {
      expect(EvidenceSchema.safeParse(item).success).toBe(true);
      expect(result.issues.some((issue) => issue.id === item.issueId && issue.evidenceIds.includes(item.id))).toBe(true);
      if (item.sourceEntityType === "order") expect(abcApparelDataset.orders.some((order) => order.id === item.sourceEntityId)).toBe(true);
      else { expect(item.sourceEntityType).toBe("inventory_item"); expect(abcApparelDataset.inventoryItems.some((source) => source.id === item.sourceEntityId)).toBe(true); }
      expect(typeof item.value).toBe("number");
    }
  });
  it("rejects missing, orphaned, cross-owner, or duplicate evidence references", () => {
    const { order, facts } = scenario(2, 30, 200);
    const valid = detectOrderIssues(order, facts, context);
    const missing = structuredClone(valid); missing.issues[0].evidenceIds = [];
    const orphan = structuredClone(valid); orphan.evidence[0].issueId = "ISS-SYNTHETIC-ABSENT";
    const duplicated = structuredClone(valid); duplicated.evidence.push(duplicated.evidence[0]);
    const wrongOwner = structuredClone(valid); wrongOwner.issues[0].evidenceIds = wrongOwner.issues[1].evidenceIds;
    for (const input of [missing, orphan, duplicated, wrongOwner]) expect(IssueDetectionResultSchema.safeParse(input).success).toBe(false);
  });
  it("rejects invented inventory source references and missing dataset fact coverage", () => {
    const facts = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    const altered = structuredClone(facts); altered[0].materials[0].inventoryItemId = "MAT-SYNTHETIC-ABSENT";
    expect(() => detectDatasetIssues(abcApparelDataset, altered, context)).toThrowError(expect.objectContaining({ errorCode: "FACT_SOURCE_MISMATCH" }));
    expect(() => detectDatasetIssues(abcApparelDataset, facts.slice(1), context)).toThrowError(expect.objectContaining({ errorCode: "FACT_SOURCE_MISMATCH" }));
  });
});
