export type ImportErrorCode =
  | "FILE_TOO_LARGE" | "TOO_MANY_ROWS" | "UNSUPPORTED_FILE_TYPE" | "PARSE_ERROR"
  | "DUPLICATE_HEADER" | "AMBIGUOUS_DATASET_KIND" | "MAPPING_INCOMPLETE" | "MAPPING_CONFLICT"
  | "MISSING_REQUIRED_VALUE" | "INVALID_NUMBER" | "INVALID_DATE" | "INVALID_STATUS"
  | "SCHEMA_VALIDATION_FAILED";

// File/mapping failures abort processing; row errors are returned separately.
export class ImportError extends Error {
  constructor(public readonly errorCode: ImportErrorCode, public readonly humanReadableMessage: string) {
    super(humanReadableMessage);
    this.name = "ImportError";
  }
  toJSON() { return { errorCode: this.errorCode, humanReadableMessage: this.humanReadableMessage }; }
}
