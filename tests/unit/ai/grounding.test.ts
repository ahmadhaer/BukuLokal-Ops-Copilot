import { describe, expect, it } from "vitest";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import { validateGroundedAnalysis } from "../../../src/ai/analysis/validate-grounding";
import { validOutput, selectedRequest } from "./helpers";

describe("input integrity and evidence grounding", () => {
  it("sends only the selected issue evidence and small organization context", () => {
    const request = selectedRequest(); const input = buildIssueAnalysisInput(request);
    expect(Object.keys(input).sort()).toEqual(["allowedActions", "evidence", "issue", "organizationContext"]);
    expect(input.evidence).toHaveLength(3);
    expect(input.organizationContext).toEqual({ industry: "light_manufacturing", timezone: "Asia/Jakarta" });
    expect(input.evidence.every((item) => request.detection.issues.find((issue) => issue.id === request.issueId)!.evidenceIds.includes(item.id))).toBe(true);
    expect(input).not.toHaveProperty("orders"); expect(input).not.toHaveProperty("workbook");
  });
  it("rejects absent issue and wrong organization", () => {
    expect(() => buildIssueAnalysisInput({ ...selectedRequest(), issueId: "ISS-SYNTHETIC-MISSING" })).toThrowError();
    expect(() => buildIssueAnalysisInput({ ...selectedRequest(), organization: { ...selectedRequest().organization, id: "ORG-SYNTHETIC-OTHER" } })).toThrowError();
  });
  it("rejects missing/duplicate/cross-owner evidence before model invocation", () => {
    for (const corruption of ["missing", "duplicate", "owner"]) {
      const request = structuredClone(selectedRequest());
      if (corruption === "missing") request.detection.evidence.shift();
      if (corruption === "duplicate") request.detection.evidence.push(request.detection.evidence[0]);
      if (corruption === "owner") request.detection.evidence[0].issueId = request.detection.issues[1].id;
      expect(() => buildIssueAnalysisInput(request)).toThrowError(expect.objectContaining({ errorCode: "AI_INPUT_INVALID" }));
    }
  });
  it("accepts grounded output, without altering deterministic severity", () => {
    const request = selectedRequest(); const input = buildIssueAnalysisInput(request);
    expect(validateGroundedAnalysis(validOutput(request), input).evidenceRefs).toEqual(input.evidence.map((item) => item.id));
    expect(input.issue.severity).toBe("critical");
  });
  it.each(["top-level", "recommendation"])("rejects unknown %s evidence refs", (location) => {
    const output = validOutput();
    if (location === "top-level") output.evidenceRefs = ["EV-SYNTHETIC-UNKNOWN"];
    else output.recommendations[0].evidenceRefs = ["EV-SYNTHETIC-UNKNOWN"];
    expect(() => validateGroundedAnalysis(output, buildIssueAnalysisInput(selectedRequest()))).toThrowError(expect.objectContaining({ errorCode: "AI_UNSUPPORTED_EVIDENCE_REF" }));
  });
  it("rejects duplicate refs rather than concealing them", () => {
    const output = validOutput(); output.evidenceRefs.push(output.evidenceRefs[0]);
    expect(() => validateGroundedAnalysis(output, buildIssueAnalysisInput(selectedRequest()))).toThrowError();
  });
});
