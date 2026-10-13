import { describe, expect, it } from "vitest";
import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { buildDatasetOperationalFacts } from "../../../src/domain/operations";
import { detectDatasetIssues, evidenceIdentifier, issueIdentifier, ISSUE_RULES_V1 } from "../../../src/domain/issues";
import { context } from "./helpers";

describe("deterministic detection and identifiers", () => {
  it("produces deeply equal results for identical and permuted inputs without mutation", () => {
    const facts = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
    const before = structuredClone({ dataset: abcApparelDataset, facts, rules: ISSUE_RULES_V1, context });
    const first = detectDatasetIssues(abcApparelDataset, facts, context);
    expect(detectDatasetIssues(abcApparelDataset, facts, context)).toEqual(first);
    expect(detectDatasetIssues(abcApparelDataset, [...facts].reverse().map((fact) => ({ ...fact, materials: [...fact.materials].reverse() })), context)).toEqual(first);
    expect({ dataset: abcApparelDataset, facts, rules: ISSUE_RULES_V1, context }).toEqual(before);
  });
  it("uses collision-safe length-prefixed organization/source scopes", () => {
    const ids = [issueIdentifier("order_delay_risk", "ORG-A-B", "SO-C"), issueIdentifier("order_delay_risk", "ORG-A", "B-SO-C"),
      issueIdentifier("material_shortage", "ORG-A", "B-SO-C"), issueIdentifier("material_shortage", "ORG:A", "MAT:B:C")];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe(issueIdentifier("order_delay_risk", "ORG-A-B", "SO-C"));
    expect(evidenceIdentifier(ids[0], "material_shortage", "inventory_item", "MAT:A:B")).not.toBe(evidenceIdentifier(ids[1], "material_shortage", "inventory_item", "MAT:A:B"));
  });
  it("does not generate actions, AI analyses, recommendations, or source mutations", () => {
    const result = detectDatasetIssues(abcApparelDataset, buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate), context);
    expect(Object.keys(result).sort()).toEqual(["evidence", "issues", "ruleTraces"]);
    expect(abcApparelDataset.actions).toEqual([]); expect(abcApparelDataset.aiAnalyses).toEqual([]);
    expect(abcApparelDataset.issues).toEqual([]); expect(abcApparelDataset.evidence).toEqual([]);
  });
});
