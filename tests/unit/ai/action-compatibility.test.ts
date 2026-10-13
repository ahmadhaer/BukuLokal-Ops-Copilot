import { describe, expect, it } from "vitest";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import { validateGroundedAnalysis } from "../../../src/ai/analysis/validate-grounding";
import { validOutput, selectedRequest } from "./helpers";

describe("advisory action compatibility", () => {
  it("allows supplier intent only with cited positive shortage evidence", () => {
    const request = selectedRequest(); const input = buildIssueAnalysisInput(request); const output = validOutput(request);
    output.recommendations[0].actionType = "supplier_followup_draft";
    output.recommendations[0].evidenceRefs = [input.evidence.find((item) => item.type === "material_shortage")!.id];
    expect(validateGroundedAnalysis(output, input).recommendations[0].actionType).toBe("supplier_followup_draft");
  });
  it("rejects supplier recommendation that cites only completion/deadline", () => {
    const input = buildIssueAnalysisInput(selectedRequest()); const output = validOutput();
    output.recommendations[0].actionType = "supplier_followup_draft";
    output.recommendations[0].evidenceRefs = [input.evidence.find((item) => item.type === "production_completion")!.id];
    expect(() => validateGroundedAnalysis(output, input)).toThrowError(expect.objectContaining({ errorCode: "AI_ACTION_UNSUPPORTED" }));
  });
  it("removes supplier intent from allowed input actions when shortage evidence is absent", () => {
    const request = selectedRequest("SO-012"); const input = buildIssueAnalysisInput(request);
    expect(input.allowedActions).not.toContain("supplier_followup_draft");
    const output = validOutput(request); output.recommendations[0].actionType = "supplier_followup_draft";
    expect(() => validateGroundedAnalysis(output, input)).toThrowError(expect.objectContaining({ errorCode: "AI_ACTION_UNSUPPORTED" }));
  });
  it("accepts generic supplier draft data without creating Action entities", () => {
    const input = buildIssueAnalysisInput(selectedRequest()); const output = validOutput();
    output.recommendations[0].actionType = "supplier_followup_draft";
    output.recommendations[0].draft = "Please confirm availability of the additional material.";
    const accepted = validateGroundedAnalysis(output, input);
    expect(accepted.recommendations[0]).not.toHaveProperty("status");
  });
});
