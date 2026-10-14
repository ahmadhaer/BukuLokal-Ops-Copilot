import { describe, expect, it } from "vitest";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { AiAnalysisError } from "../../../src/ai/analysis/errors";
import { StubProvider, selectedRequest, validOutput, execution } from "./helpers";

describe("bounded retry and graceful failure", () => {
  it("retries invalid JSON once and accepts a valid second response", async () => {
    const provider = new StubProvider(["not JSON", JSON.stringify(validOutput())]);
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    expect(result).toMatchObject({ ok: true, attempts: 2 }); expect(provider.requests).toHaveLength(2);
    expect(provider.requests[1].retry).toBe(true); expect(provider.requests[1].systemInstruction).toContain("prior response could not be accepted");
  });
  it("stops after two invalid responses with a controlled unavailable result", async () => {
    const provider = new StubProvider(["not JSON", "{}", JSON.stringify(validOutput())]);
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    expect(result).toMatchObject({ ok: false, attempts: 2, error: { errorCode: "AI_ANALYSIS_UNAVAILABLE" } });
    expect(provider.requests).toHaveLength(2);
  });
  it("retries failed grounding/action compatibility once", async () => {
    const invalid = validOutput(); invalid.evidenceRefs = ["EV-SYNTHETIC-ABSENT"];
    const provider = new StubProvider([JSON.stringify(invalid), JSON.stringify(validOutput())]);
    expect(await analyzeIssue(selectedRequest(), provider, execution)).toMatchObject({ ok: true, attempts: 2 });
  });
  it("retries an unsupported supplier recommendation without silently removing it", async () => {
    const request = selectedRequest("SO-012"); const invalid = validOutput(request);
    invalid.recommendations[0].actionType = "supplier_followup_draft";
    const provider = new StubProvider([JSON.stringify(invalid), JSON.stringify(validOutput(request))]);
    expect(await analyzeIssue(request, provider, execution)).toMatchObject({ ok: true, attempts: 2 });
  });
  it("sanitizes provider network errors without retrying or losing deterministic data", async () => {
    const request = selectedRequest(); const before = structuredClone(request);
    const provider = new StubProvider([new Error("private transport details")]);
    const result = await analyzeIssue(request, provider, execution);
    expect(result).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR" } });
    expect(JSON.stringify(result)).not.toContain("private transport"); expect(request).toEqual(before);
  });
  it("rejects input/config errors before calling the provider", async () => {
    const provider = new StubProvider([]);
    expect(await analyzeIssue({ ...selectedRequest(), issueId: "ISS-SYNTHETIC-MISSING" }, provider, execution)).toMatchObject({ ok: false, attempts: 0, error: { errorCode: "AI_INPUT_INVALID" } });
    expect(await analyzeIssue(selectedRequest(), provider, { ...execution, model: "" })).toMatchObject({ ok: false, attempts: 0, error: { errorCode: "AI_CONFIG_MISSING" } });
    expect(provider.requests).toEqual([]);
  });
  it("treats forbidden tool responses as invalid output with one retry", async () => {
    const provider = new StubProvider([new AiAnalysisError("AI_INVALID_RESPONSE", "Tool output rejected."), JSON.stringify(validOutput())]);
    expect(await analyzeIssue(selectedRequest(), provider, execution)).toMatchObject({ ok: true, attempts: 2 });
  });
});
