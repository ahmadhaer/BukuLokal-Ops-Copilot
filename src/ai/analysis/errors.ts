export type AiErrorCode = "AI_CONFIG_MISSING" | "AI_INPUT_INVALID" | "AI_PROVIDER_ERROR" | "AI_INVALID_RESPONSE"
  | "AI_UNSUPPORTED_EVIDENCE_REF" | "AI_ACTION_UNSUPPORTED" | "AI_ANALYSIS_UNAVAILABLE";
export class AiAnalysisError extends Error {
  constructor(public readonly errorCode: AiErrorCode, public readonly humanReadableMessage: string) {
    super(humanReadableMessage); this.name = "AiAnalysisError";
  }
  toJSON() { return { errorCode: this.errorCode, humanReadableMessage: this.humanReadableMessage }; }
}
