import { describe, expect, it } from "vitest";
import { GeminiIssueAnalysisSchema, ISSUE_ANALYSIS_JSON_SCHEMA } from "../../../src/ai/schemas/issue-analysis";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import { validateGroundedAnalysis } from "../../../src/ai/analysis/validate-grounding";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { execution, selectedRequest, StubProvider, validOutput } from "./helpers";

// GenerateContentConfig.responseJsonSchema contract in @google/genai 2.29.0.
const supported = new Set(["$id", "$defs", "$ref", "$anchor", "type", "format", "title", "description", "enum", "items", "prefixItems", "minItems", "maxItems", "minimum", "maximum", "anyOf", "oneOf", "properties", "additionalProperties", "required", "propertyOrdering"]);
function unsupportedKeywords(schema: unknown): string[] {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) return schema.flatMap(unsupportedKeywords);
  return Object.entries(schema).flatMap(([key, value]) => [
    ...(supported.has(key) ? [] : [key]),
    ...(key === "properties" || key === "$defs"
      ? Object.values(value as Record<string, unknown>).flatMap(unsupportedKeywords)
      : ["items", "prefixItems", "anyOf", "oneOf", "additionalProperties"].includes(key) ? unsupportedKeywords(value) : []),
  ]);
}

describe("Vertex schema compatibility preserves local safeguards", () => {
  it("uses only supported responseJsonSchema keywords at every schema node", () => {
    expect(unsupportedKeywords(ISSUE_ANALYSIS_JSON_SCHEMA)).toEqual([]);
  });
  it.each(["bad id", "bad\tid", "bad\nid"])("rejects whitespace ID %j locally at both reference locations", (id) => {
    const output = validOutput();
    expect(GeminiIssueAnalysisSchema.safeParse({ ...output, evidenceRefs: [id] }).success).toBe(false);
    output.recommendations[0].evidenceRefs = [id];
    expect(GeminiIssueAnalysisSchema.safeParse(output).success).toBe(false);
  });
  it.each(["top-level", "recommendation"])("rejects unknown and duplicate %s evidence refs", (location) => {
    const input = buildIssueAnalysisInput(selectedRequest());
    for (const refs of [["unknown-evidence"], [input.evidence[0].id, input.evidence[0].id]]) {
      const output = validOutput();
      if (location === "top-level") output.evidenceRefs = refs;
      else output.recommendations[0].evidenceRefs = refs;
      expect(() => validateGroundedAnalysis(output, input)).toThrowError(expect.objectContaining({ errorCode: "AI_UNSUPPORTED_EVIDENCE_REF" }));
    }
  });
  it("rejects unsupported action types through grounding validation", () => {
    const output = validOutput(); output.recommendations[0].actionType = "send_message";
    expect(() => validateGroundedAnalysis(output, buildIssueAnalysisInput(selectedRequest()))).toThrowError(expect.objectContaining({ errorCode: "AI_INVALID_RESPONSE" }));
  });
  it("requires supplier followup to cite positive material-shortage evidence", () => {
    const input = buildIssueAnalysisInput(selectedRequest());
    const output = validOutput(); output.recommendations[0].actionType = "supplier_followup_draft";
    output.recommendations[0].evidenceRefs = [input.evidence.find((item) => item.type === "production_completion")!.id];
    expect(input.allowedActions).toContain("supplier_followup_draft");
    expect(() => validateGroundedAnalysis(output, input)).toThrowError(expect.objectContaining({ errorCode: "AI_ACTION_UNSUPPORTED" }));
    const shortage = input.evidence.find((item) => item.type === "material_shortage")!;
    shortage.value = 0; output.recommendations[0].evidenceRefs = [shortage.id];
    expect(() => validateGroundedAnalysis(output, input)).toThrowError(expect.objectContaining({ errorCode: "AI_ACTION_UNSUPPORTED" }));
  });
  it("preserves the single validation retry and sends compatible schemas on both attempts", async () => {
    const provider = new StubProvider(["invalid JSON", JSON.stringify(validOutput())]);
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    expect(result.ok).toBe(true); expect(result.attempts).toBe(2);
    expect(provider.requests.map((request) => request.retry)).toEqual([false, true]);
    for (const request of provider.requests) expect(unsupportedKeywords(request.responseJsonSchema)).toEqual([]);
  });
});
