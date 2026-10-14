import "server-only";

export type DiagnosticStage = "provider_call" | "provider_transport" | "provider_request" | "provider_response" | "json_parse" | "schema_validation" | "grounding_validation" | "action_compatibility" | "record_validation" | "input_validation" | "persistence";
export type DiagnosticContext = { model: string; promptVersion: string; attempt: number; responseBytes?: number };
const errorNames = new Set(["Error", "TypeError", "SyntaxError", "ApiError", "GoogleError", "FetchError", "AbortError", "TimeoutError", "AiAnalysisError", "PersistenceError"]);
// Never forward free-form exception messages: they can contain prompts, output or secrets.
export function providerFailureStage(error: unknown, stage: DiagnosticStage): DiagnosticStage {
  if (stage !== "provider_request" || !error || typeof error !== "object") return stage;
  try {
    const value = error as { name?: unknown; message?: unknown; code?: unknown; cause?: { code?: unknown } };
    // Known transport signals only; an unclassified SDK exception stays provider_request.
    const transportCodes = ["ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET"];
    if (["FetchError", "AbortError", "TimeoutError"].includes(String(value.name))
      || transportCodes.includes(String(value.code)) || transportCodes.includes(String(value.cause?.code))
      || (value.name === "TypeError" && typeof value.message === "string" && /^(fetch failed|failed to fetch)/i.test(value.message))) return "provider_transport";
    return stage;
  } catch { return stage; }
}
export function providerErrorMetadata(error: unknown) {
  const value = error && typeof error === "object" ? error as { name?: unknown; status?: unknown; code?: unknown } : {};
  const status = typeof value.status === "number" ? value.status : typeof value.code === "number" ? value.code : undefined;
  return { sdkErrorName: typeof value.name === "string" && errorNames.has(value.name) ? value.name : "UnknownError",
    ...(status !== undefined && Number.isInteger(status) && status >= 100 && status <= 599 ? { providerStatus: status } : {}),
    providerMessage: "Provider operation failed; raw message omitted" };
}
export function logAiDiagnostic(stage: DiagnosticStage, errorCode: string, context: DiagnosticContext, error?: unknown) {
  // Explicit field projection prevents accidental payload/exception serialization.
  const safeToken = (value: string) => /^[A-Za-z0-9._/-]{1,128}$/.test(value) ? value : "omitted";
  try {
    console.warn(JSON.stringify({ event: "ai_analysis_failure", stage, errorCode: safeToken(errorCode),
      model: safeToken(context.model), promptVersion: safeToken(context.promptVersion), attempt: context.attempt,
      ...(context.responseBytes !== undefined ? { responseBytes: context.responseBytes } : {}),
      ...(error !== undefined ? providerErrorMetadata(error) : {}) }));
  } catch { /* Diagnostic sink failure must not change analysis or retry behavior. */ }
}
