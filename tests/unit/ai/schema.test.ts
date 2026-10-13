import { describe, expect, it } from "vitest";
import { GeminiIssueAnalysisSchema, ISSUE_ANALYSIS_JSON_SCHEMA } from "../../../src/ai/schemas/issue-analysis";
import { validOutput } from "./helpers";

describe("strict advisory schema", () => {
  it("accepts structured advisory output and missing-data disclosure", () => expect(GeminiIssueAnalysisSchema.safeParse(validOutput()).success).toBe(true));
  it("rejects missing summary and empty prose", () => {
    const output: Record<string, unknown> = validOutput(); delete output.summary;
    expect(GeminiIssueAnalysisSchema.safeParse(output).success).toBe(false);
    expect(GeminiIssueAnalysisSchema.safeParse({ ...validOutput(), summary: " " }).success).toBe(false);
  });
  it("rejects unknown action types and zero recommendation evidence", () => {
    const output = validOutput(); output.recommendations[0].actionType = "send_message";
    expect(GeminiIssueAnalysisSchema.safeParse(output).success).toBe(false);
    output.recommendations[0].actionType = "production_priority_note"; output.recommendations[0].evidenceRefs = [];
    expect(GeminiIssueAnalysisSchema.safeParse(output).success).toBe(false);
  });
  it.each(["severity", "type", "completionPercentage", "actionsExecuted"])("rejects forbidden extra %s", (field) => expect(GeminiIssueAnalysisSchema.safeParse({ ...validOutput(), [field]: "invented" }).success).toBe(false));
  it("rejects malformed missingData and nested extra fields", () => {
    expect(GeminiIssueAnalysisSchema.safeParse({ ...validOutput(), missingData: ["unknown"] }).success).toBe(false);
    const output = validOutput(); output.recommendations = [{ ...output.recommendations[0], severity: "low" } as typeof output.recommendations[number]];
    expect(GeminiIssueAnalysisSchema.safeParse(output).success).toBe(false);
  });
  it("exports a strict JSON schema with enum action types and no unsupported length keywords", () => {
    const schema = ISSUE_ANALYSIS_JSON_SCHEMA as { additionalProperties: boolean; properties: Record<string, unknown> };
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toHaveProperty("severity");
    const text = JSON.stringify(schema);
    expect(text).toContain("supplier_followup_draft"); expect(text).not.toContain("maxLength"); expect(text).not.toContain("minLength");
  });
});
