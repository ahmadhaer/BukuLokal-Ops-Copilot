import { afterEach, describe, expect, it, vi } from "vitest";
import { logAiDiagnostic, providerFailureStage } from "../../../src/ai/analysis/diagnostics";
import { GeminiIssueAnalysisProvider } from "../../../src/ai/client/google-genai";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { PROMPT_VERSION } from "../../../src/ai/prompts/issue-analysis-v1";
import { execution, selectedRequest, StubProvider, validOutput } from "./helpers";
import { GenerateContentResponse } from "@google/genai";

const config = { project: "synthetic-project", location: "global", model: execution.model };
afterEach(() => vi.restoreAllMocks());
function capture() {
  const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
  return { spy, logs: () => spy.mock.calls.map(([line]) => JSON.parse(line as string)) };
}
describe("server-only AI diagnostics", () => {
  it("projects only allowed metadata and omits sensitive exception contents", () => {
    const { spy, logs } = capture();
    const secret = "Bearer secret-token PRIVATE KEY customer evidence full prompt full model output";
    logAiDiagnostic("provider_request", "AI_PROVIDER_ERROR", { model: execution.model, promptVersion: PROMPT_VERSION, attempt: 1, ...{ prompt: secret, evidence: secret, output: secret } }, Object.assign(new Error(secret), { status: 429, credentials: secret }));
    expect(logs()[0]).toEqual({ event: "ai_analysis_failure", stage: "provider_request", errorCode: "AI_PROVIDER_ERROR", model: execution.model, promptVersion: PROMPT_VERSION, attempt: 1, sdkErrorName: "Error", providerStatus: 429, providerMessage: "Provider operation failed; raw message omitted" });
    expect(JSON.stringify(spy.mock.calls)).not.toContain(secret);
  });
  it("omits arbitrary error names, string statuses and stacks", () => {
    const { logs } = capture();
    logAiDiagnostic("provider_request", "AI_PROVIDER_ERROR", { model: "unsafe model\nBearer token", promptVersion: PROMPT_VERSION, attempt: 1 }, { name: "private customer", status: "private token", stack: "PRIVATE KEY" });
    expect(logs()[0]).toMatchObject({ model: "omitted", sdkErrorName: "UnknownError" });
    expect(logs()[0]).not.toHaveProperty("providerStatus"); expect(JSON.stringify(logs())).not.toContain("PRIVATE KEY");
  });
  it("retains public provider mapping and one attempt for SDK request failures", async () => {
    const { logs } = capture();
    const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent: async () => { throw Object.assign(new Error("secret SDK response"), { name: "ApiError", status: 400 }); } } });
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    expect(result).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR", humanReadableMessage: "Vertex AI request failed; deterministic data remains available." } });
    expect(logs()[0]).toMatchObject({ stage: "provider_request", sdkErrorName: "ApiError", providerStatus: 400 });
    expect(JSON.stringify(logs())).not.toContain("secret SDK response");
  });
  it("identifies known network transport failures without logging raw SDK messages", async () => {
    const { logs } = capture();
    const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent: async () => { throw new TypeError("fetch failed: secret transport URL and token"); } } });
    expect(await analyzeIssue(selectedRequest(), provider, execution)).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR" } });
    expect(logs()[0]).toMatchObject({ stage: "provider_transport", sdkErrorName: "TypeError" });
    expect(JSON.stringify(logs())).not.toContain("secret transport URL");
  });
  it("distinguishes response extraction failures from request failures", async () => {
    const { logs } = capture();
    const response = new GenerateContentResponse();
    Object.defineProperty(response, "text", { get: () => { throw new Error("private response body"); } });
    const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent: async () => response } });
    expect(await analyzeIssue(selectedRequest(), provider, execution)).toMatchObject({ ok: false, attempts: 1, error: { errorCode: "AI_PROVIDER_ERROR" } });
    expect(logs()[0]).toMatchObject({ stage: "provider_response", errorCode: "AI_PROVIDER_ERROR" });
    expect(JSON.stringify(logs())).not.toContain("private response body");
  });
  it.each(["json_parse", "schema_validation", "grounding_validation", "action_compatibility"] as const)("labels %s without logging raw output and preserves retry", async (stage) => {
    const { logs } = capture();
    const output = validOutput(); output.summary = "SENSITIVE_FULL_MODEL_OUTPUT";
    if (stage === "grounding_validation") output.evidenceRefs = ["unknown-sensitive-evidence"];
    if (stage === "action_compatibility") { output.recommendations[0].actionType = "supplier_followup_draft"; output.recommendations[0].evidenceRefs = [selectedRequest().detection.evidence.find(item => item.issueId === selectedRequest().issueId && item.type === "production_completion")!.id]; }
    const raw = stage === "json_parse" ? "SENSITIVE_FULL_MODEL_OUTPUT" : stage === "schema_validation" ? JSON.stringify({ summary: output.summary }) : JSON.stringify(output);
    const provider = new StubProvider([raw, raw]);
    const result = await analyzeIssue(selectedRequest(), provider, execution);
    const code = stage === "grounding_validation" ? "AI_UNSUPPORTED_EVIDENCE_REF" : stage === "action_compatibility" ? "AI_ACTION_UNSUPPORTED" : "AI_INVALID_RESPONSE";
    expect(result).toMatchObject({ ok: false, attempts: 2, error: { errorCode: "AI_ANALYSIS_UNAVAILABLE", causeCode: code } });
    expect(logs().map(log => [log.stage, log.errorCode, log.attempt, log.responseBytes])).toEqual([[stage, code, 1, new TextEncoder().encode(raw).byteLength], [stage, code, 2, new TextEncoder().encode(raw).byteLength]]);
    expect(JSON.stringify(logs())).not.toContain("SENSITIVE_FULL_MODEL_OUTPUT"); expect(JSON.stringify(logs())).not.toContain("unknown-sensitive-evidence");
  });
  it("unreadable exception metadata cannot interrupt error handling", () => {
    capture();
    const error = Object.defineProperty({}, "name", { get: () => { throw new Error("private getter"); } });
    expect(providerFailureStage(error, "provider_request")).toBe("provider_request");
    expect(() => logAiDiagnostic("provider_request", "AI_PROVIDER_ERROR", { model: execution.model, promptVersion: PROMPT_VERSION, attempt: 1 }, error)).not.toThrow();
  });
  it("a logging sink failure does not prevent a valid retry", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => { throw new Error("sink unavailable"); });
    expect(await analyzeIssue(selectedRequest(), new StubProvider(["invalid", JSON.stringify(validOutput())]), execution)).toMatchObject({ ok: true, attempts: 2 });
  });
});
