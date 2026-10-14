import { GenerateContentResponse, type GenerateContentParameters } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { createVertexProvider, readVertexConfig, GeminiIssueAnalysisProvider, type VertexClient } from "../../../src/ai/client/google-genai";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import { ISSUE_ANALYSIS_JSON_SCHEMA } from "../../../src/ai/schemas/issue-analysis";
import { PROMPT_VERSION, SYSTEM_INSTRUCTION } from "../../../src/ai/prompts/issue-analysis-v1";
import { selectedRequest, execution, validOutput } from "./helpers";

const config = { project: "synthetic-project", location: "global", model: execution.model };
const generation = () => ({ model: execution.model, input: buildIssueAnalysisInput(selectedRequest()), promptVersion: PROMPT_VERSION,
  systemInstruction: SYSTEM_INSTRUCTION, responseJsonSchema: ISSUE_ANALYSIS_JSON_SCHEMA, retry: false });
function response() { const result = new GenerateContentResponse(); result.candidates = [{ content: { role: "model", parts: [{ text: JSON.stringify(validOutput()) }] } }]; return result; }
describe("real Vertex adapter request contract (no network)", () => {
  it("requests bounded structured JSON with explicit model, instruction, and no tools", async () => {
    const generateContent = vi.fn(async (params: GenerateContentParameters) => { expect(params.model).toBe(execution.model); return response(); });
    const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent } });
    expect(JSON.parse(await provider.generate(generation()))).toHaveProperty("summary");
    const call = generateContent.mock.calls[0][0];
    expect(call.model).toBe(execution.model);
    expect(call.config).toMatchObject({ systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseJsonSchema: ISSUE_ANALYSIS_JSON_SCHEMA, temperature: 0, candidateCount: 1, maxOutputTokens: 4_096, httpOptions: { retryOptions: { attempts: 2, initialDelay: 1, maxDelay: 2, expBase: 2, jitter: 0, httpStatusCodes: [408, 429, 500, 503, 504] }, timeout: 30_000 } });
    expect(call.config).not.toHaveProperty("thinkingConfig"); expect(call.config).not.toHaveProperty("tools"); expect(call.config).not.toHaveProperty("toolConfig");
    expect(JSON.stringify(call.contents)).not.toContain("workbook"); expect(JSON.stringify(call.contents)).not.toContain("customerName");
    expect(JSON.stringify(call.contents)).toContain(selectedRequest().issueId);
  });
  it("rejects missing configuration and model mismatch before requests", async () => {
    expect(() => readVertexConfig({})).toThrowError(expect.objectContaining({ errorCode: "AI_CONFIG_MISSING" }));
    const client: VertexClient = { models: { generateContent: vi.fn(async () => response()) } };
    const provider = new GeminiIssueAnalysisProvider(config, client);
    await expect(provider.generate({ ...generation(), model: "unconfigured-model" })).rejects.toMatchObject({ errorCode: "AI_CONFIG_MISSING" });
    expect(client.models.generateContent).not.toHaveBeenCalled();
  });
  it("constructs the factory with runtime project/location/model selection", () => {
    const factory = vi.fn(() => ({ models: { generateContent: vi.fn(async () => response()) } }));
    const result = createVertexProvider({ GOOGLE_CLOUD_PROJECT: config.project, GOOGLE_CLOUD_LOCATION: config.location, GEMINI_MODEL: config.model }, factory);
    expect(factory).toHaveBeenCalledWith(config); expect(result.config).toEqual(config);
  });
  it("constructs the real installed SDK offline with explicit Vertex options", () => {
    expect(() => createVertexProvider({ GOOGLE_CLOUD_PROJECT: config.project, GOOGLE_CLOUD_LOCATION: config.location, GEMINI_MODEL: config.model })).not.toThrow();
  });
  it("rejects duplicated evidence at the SDK boundary without calling the model", async () => {
    const generateContent = vi.fn(async () => response()); const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent } });
    const request = generation(); request.input.evidence.push(request.input.evidence[0]);
    await expect(provider.generate(request)).rejects.toMatchObject({ errorCode: "AI_INPUT_INVALID" }); expect(generateContent).not.toHaveBeenCalled();
  });
  it("sanitizes SDK exceptions and rejects tool/function responses", async () => {
    const failing = new GeminiIssueAnalysisProvider(config, { models: { generateContent: async () => { throw new Error("private SDK error"); } } });
    await expect(failing.generate(generation())).rejects.toMatchObject({ errorCode: "AI_PROVIDER_ERROR" });
    const result = new GenerateContentResponse(); result.candidates = [{ content: { parts: [{ functionCall: { name: "send_message", args: {} } }] } }];
    const tools = new GeminiIssueAnalysisProvider(config, { models: { generateContent: async () => result } });
    await expect(tools.generate(generation())).rejects.toMatchObject({ errorCode: "AI_INVALID_RESPONSE" });
  });
  it("rejects extra raw-data input at the SDK boundary", async () => {
    const generateContent = vi.fn(async () => response()); const provider = new GeminiIssueAnalysisProvider(config, { models: { generateContent } });
    const request = generation(); Object.assign(request.input, { workbook: "synthetic raw content" });
    await expect(provider.generate(request)).rejects.toMatchObject({ errorCode: "AI_INPUT_INVALID" }); expect(generateContent).not.toHaveBeenCalled();
  });
});
