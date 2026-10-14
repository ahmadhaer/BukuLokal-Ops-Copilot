import { describe, expect, it } from "vitest";
import { AIAnalysisSchema } from "../../../src/domain/ai-analysis/schema";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { StubProvider, selectedRequest, validOutput, execution } from "./helpers";

describe("SO-001 advisory contract and AIAnalysis provenance", () => {
  it("accepts grounded advice and canonical metadata, retaining deterministic facts", async () => {
    const request = selectedRequest(); const provider = new StubProvider([JSON.stringify(validOutput(request))]);
    const result = await analyzeIssue(request, provider, execution);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted synthetic analysis");
    expect(AIAnalysisSchema.safeParse(result.record).success).toBe(true);
    expect(result.record).toMatchObject({ issueId: request.issueId, model: execution.model, promptVersion: "issue-analysis-v1", createdAt: execution.createdAt });
    expect(result.analysis.missingData[0].field).toBe("supplierLeadTime"); expect(result.analysis.cannotDetermine).toHaveLength(1);
    expect(provider.requests[0].input.evidence.map((item) => [item.type, item.value, item.unit])).toEqual([
      ["days_to_deadline", 2, "days"], ["production_completion", 30, "percent"], ["material_shortage", 200, "pcs"],
    ]);
    expect(provider.requests[0].input.issue).toMatchObject({ type: "order_delay_risk", severity: "critical" });
    expect(result.record.output).not.toHaveProperty("severity");
  });
  it("creates stable provenance IDs for the same context and different IDs for new explicit time", async () => {
    const request = selectedRequest(); const response = JSON.stringify(validOutput(request));
    const first = await analyzeIssue(request, new StubProvider([response]), execution);
    const repeated = await analyzeIssue(request, new StubProvider([response]), execution);
    expect(repeated).toEqual(first);
    const next = await analyzeIssue(request, new StubProvider([response]), { ...execution, createdAt: "2026-10-12T12:02:00Z" });
    if (first.ok && next.ok) expect(first.record.id).not.toBe(next.record.id); else throw new Error("Expected accepted fixture");
  });
  it("does not mutate Issue/Evidence even when a provider mutates its private copy", async () => {
    const request = selectedRequest(); const before = structuredClone(request);
    const result = await analyzeIssue(request, { async generate(generation) {
      generation.input.issue.severity = "low"; generation.input.evidence[0].value = 999;
      return JSON.stringify(validOutput(request));
    } }, execution);
    expect(result.ok).toBe(true); expect(request).toEqual(before);
    expect(request.detection).not.toHaveProperty("actions");
  });
});
