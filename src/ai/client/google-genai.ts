import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse, type HttpRetryOptions } from "@google/genai";
import { z } from "zod";
import type { IssueAnalysisProvider, IssueAnalysisGenerationRequest } from "../analysis/provider";
import { IssueAnalysisInputSchema, MAX_ANALYSIS_INPUT_BYTES } from "../analysis/input";
import { AiAnalysisError } from "../analysis/errors";

import { logAiDiagnostic, providerFailureStage, type DiagnosticStage } from "../analysis/diagnostics";

// SDK attempts include the original request; delay units are seconds.
function vertexRetryOptions(): HttpRetryOptions {
  return { attempts: 2, initialDelay: 1, maxDelay: 2, expBase: 2, jitter: 0, httpStatusCodes: [408, 429, 500, 503, 504] };
}

const ConfigSchema = z.strictObject({ project: z.string().trim().min(1), location: z.string().trim().min(1), model: z.string().trim().min(1).regex(/^\S+$/) });
export type VertexConfig = z.infer<typeof ConfigSchema>;
export function readVertexConfig(env: Record<string, string | undefined> = process.env): VertexConfig {
  const parsed = ConfigSchema.safeParse({ project: env.GOOGLE_CLOUD_PROJECT, location: env.GOOGLE_CLOUD_LOCATION, model: env.GEMINI_MODEL });
  if (!parsed.success) throw new AiAnalysisError("AI_CONFIG_MISSING", "Set GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and GEMINI_MODEL for Vertex AI.");
  return parsed.data;
}
export type VertexClient = { models: { generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse> } };
export class GeminiIssueAnalysisProvider implements IssueAnalysisProvider {
  constructor(private readonly config: VertexConfig, private readonly client: VertexClient) {}
  async generate(request: IssueAnalysisGenerationRequest): Promise<string> {
    if (request.model !== this.config.model) throw new AiAnalysisError("AI_CONFIG_MISSING", "Analysis model must match the configured Vertex model.");
    const input = IssueAnalysisInputSchema.safeParse(request.input);
    if (!input.success || new TextEncoder().encode(JSON.stringify(input.data)).byteLength > MAX_ANALYSIS_INPUT_BYTES) throw new AiAnalysisError("AI_INPUT_INVALID", "Vertex request must contain only bounded selected issue evidence.");
    let stage: DiagnosticStage = "provider_request";
    try {
      const response = await this.client.models.generateContent({ model: request.model,
        contents: [{ role: "user", parts: [{ text: JSON.stringify(input.data) }] }],
        config: { systemInstruction: request.systemInstruction, responseMimeType: "application/json",
          responseJsonSchema: request.responseJsonSchema, temperature: 0, candidateCount: 1,
          maxOutputTokens: 4_096, httpOptions: { retryOptions: vertexRetryOptions(), timeout: 30_000 } },
      });
      stage = "provider_response";
      if (response.functionCalls?.length) throw new AiAnalysisError("AI_INVALID_RESPONSE", "Tool calls are not permitted in advisory analysis.");
      return response.text ?? "";
    } catch (error) {
      logAiDiagnostic(providerFailureStage(error, stage), error instanceof AiAnalysisError ? error.errorCode : "AI_PROVIDER_ERROR", { model: request.model, promptVersion: request.promptVersion, attempt: request.retry ? 2 : 1 }, error);
      if (error instanceof AiAnalysisError) throw error;
      throw new AiAnalysisError("AI_PROVIDER_ERROR", "Vertex AI request failed; deterministic data remains available.");
    }
  }
}
export function createVertexProvider(env: Record<string, string | undefined> = process.env,
  clientFactory: (config: VertexConfig) => VertexClient = (config) => new GoogleGenAI({
    vertexai: true, project: config.project, location: config.location, apiVersion: "v1",
    httpOptions: { timeout: 30_000, retryOptions: vertexRetryOptions() },
  })): { provider: GeminiIssueAnalysisProvider; config: VertexConfig } {
  if (typeof window !== "undefined") throw new AiAnalysisError("AI_CONFIG_MISSING", "Vertex provider must run on the server using ADC.");
  const config = readVertexConfig(env);
  return { provider: new GeminiIssueAnalysisProvider(config, clientFactory(config)), config };
}
