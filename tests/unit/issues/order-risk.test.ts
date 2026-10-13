import { describe, expect, it } from "vitest";
import { detectOrderDelayIssue, ISSUE_RULES_V1 } from "../../../src/domain/issues";
import { context, scenario } from "./helpers";

describe("deterministic order-delay policy", () => {
  it.each([
    [2, 30, 0, "critical"], [2, 90, 200, "critical"], [3, 70, 0, "high"], [7, 70, 0, "medium"],
    [8, 70, 0, null], [3, 90, 0, null], [-1, 30, 0, "critical"],
    [2, 50, 0, "high"], [2, 80, 0, null], [3, 80, 0, null], [7, 80, 0, null],
    [-1, 70, 0, "high"], [-1, 90, 0, null],
  ])("days %s completion %s shortage %s yields %s", (days, completion, shortage, severity) => {
    const { order, facts } = scenario(days, completion, shortage);
    const result = detectOrderDelayIssue(order, facts, context);
    expect(result.issues).toHaveLength(severity === null ? 0 : 1);
    if (severity) expect(result.issues[0]).toMatchObject({ type: "order_delay_risk", severity, status: "open", detectedAt: context.detectedAt });
  });
  it("applies critical before high before medium, with one rule trace", () => {
    const { order, facts } = scenario(1, 10, 200);
    const result = detectOrderDelayIssue(order, facts, context);
    expect(result.issues).toHaveLength(1);
    expect(result.ruleTraces[0].ruleId).toBe("ORDER_DELAY_CRITICAL_V1");
  });
  it("suppresses completed 100% and cancelled delay issues", () => {
    for (const [status, percentage] of [["completed", 100], ["cancelled", 10]] as const) {
      const { order, facts } = scenario(1, percentage, 200, status);
      expect(detectOrderDelayIssue(order, facts, context).issues).toEqual([]);
    }
  });
  it("reports contradictory completed facts without changing source", () => {
    const { order, facts } = scenario(1, 99, 0, "completed"); const before = structuredClone(order);
    expect(() => detectOrderDelayIssue(order, facts, context)).toThrowError(expect.objectContaining({ errorCode: "COMPLETED_ORDER_INCONSISTENT" }));
    facts.production.completionPercentage = 100;
    expect(() => detectOrderDelayIssue(order, facts, context)).toThrowError(expect.objectContaining({ errorCode: "COMPLETED_ORDER_INCONSISTENT" }));
    expect(order).toEqual(before);
  });
  it("allows on-hold numeric matches", () => {
    const { order, facts } = scenario(2, 30, 0, "on_hold");
    expect(detectOrderDelayIssue(order, facts, context).issues[0].severity).toBe("critical");
  });
  it("uses validated configurable thresholds without mutating the default", () => {
    const { order, facts } = scenario(4, 40);
    const configured = { ...ISSUE_RULES_V1, criticalDeadlineDays: 4, highDeadlineDays: 5 };
    expect(detectOrderDelayIssue(order, facts, context, configured).issues[0].severity).toBe("critical");
    expect(detectOrderDelayIssue(order, facts, context).issues[0].severity).toBe("medium");
    expect(ISSUE_RULES_V1.criticalDeadlineDays).toBe(2);
    expect(() => detectOrderDelayIssue(order, facts, context, { ...ISSUE_RULES_V1, highDeadlineDays: 1 })).toThrowError(expect.objectContaining({ errorCode: "INVALID_RULES" }));
  });
  it("requires explicit detection timestamps and matching fact context", () => {
    const { order, facts } = scenario(2, 30);
    expect(() => detectOrderDelayIssue(order, facts, { detectedAt: "yesterday" })).toThrowError(expect.objectContaining({ errorCode: "INVALID_CONTEXT" }));
    // @ts-expect-error Detection context is mandatory.
    expect(() => detectOrderDelayIssue(order, facts)).toThrowError(expect.objectContaining({ errorCode: "INVALID_CONTEXT" }));
    expect(() => detectOrderDelayIssue(order, { ...facts, orderId: "SO-SYNTHETIC-OTHER" }, context)).toThrowError(expect.objectContaining({ errorCode: "FACT_SOURCE_MISMATCH" }));
  });
});
