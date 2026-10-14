import { GoogleGenAI } from "@google/genai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiIssueAnalysisProvider } from "../../../src/ai/client/google-genai";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { execution, selectedRequest, validOutput } from "./helpers";

// Exercise the installed Vertex SDK with an injected fetch: no network or real credentials.
function harness(statuses: number[]) {
  const fetch = vi.fn(async () => {
    const status = statuses[Math.min(fetch.mock.calls.length - 1, statuses.length - 1)];
    return new Response(JSON.stringify(status === 200
      ? { candidates: [{ content: { role: "model", parts: [{ text: JSON.stringify(validOutput()) }] } }] }
      : { error: { code: status, message: "SENSITIVE_RAW_PROVIDER_MESSAGE", status: "SYNTHETIC_ERROR" } }),
    { status, headers: { "content-type": "application/json" } });
  });
  const sdk = new GoogleGenAI({ vertexai: true, apiKey: "synthetic-test-key", httpOptions: { fetch } });
  const provider = new GeminiIssueAnalysisProvider({ project: "synthetic-project", location: "global", model: execution.model }, sdk);
  return { fetch, provider };
}
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe("bounded installed Vertex SDK retry (offline)", () => {
  it("returns a successful first attempt without retry", async () => {
    const { fetch, provider } = harness([200]);
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    expect(result).toMatchObject({ ok: true, attempts: 1, analysis: validOutput() });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([408, 429, 500, 503, 504])("retries HTTP %i once after at least one second and returns normal output", async (status) => {
    vi.useFakeTimers();
    const { fetch, provider } = harness([status, 200]);
    const pending = analyzeIssue(selectedRequest(), provider, execution);
    await vi.advanceTimersByTimeAsync(0); expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(999); expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toMatchObject({ ok: true, attempts: 1, analysis: validOutput() });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it.each([400, 401, 403, 404, 502])("does not retry HTTP %i outside the explicit policy", async (status) => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { fetch, provider } = harness([status, 200]);
    expect(await analyzeIssue(selectedRequest(), provider, execution)).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR" } });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(log.mock.calls)).not.toContain("SENSITIVE_RAW_PROVIDER_MESSAGE");
  });
  it("exhausts two total HTTP attempts and preserves safe diagnostics/public mapping", async () => {
    vi.useFakeTimers();
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { fetch, provider } = harness([504, 504, 200]);
    const pending = analyzeIssue(selectedRequest(), provider, execution);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR", humanReadableMessage: "Vertex AI request failed; deterministic data remains available." } });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({ event: "ai_analysis_failure", stage: "provider_request", providerStatus: 504, sdkErrorName: "ApiError", errorCode: "AI_PROVIDER_ERROR" });
    const serialized = JSON.stringify(log.mock.calls);
    for (const forbidden of ["SENSITIVE_RAW_PROVIDER_MESSAGE", "synthetic-test-key", validOutput().summary, selectedRequest().issueId]) expect(serialized).not.toContain(forbidden);
  });
});
