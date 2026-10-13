export type OperationsErrorCode =
  | "ORDER_NOT_FOUND" | "ORGANIZATION_MISMATCH" | "PRODUCTION_UNIT_MISMATCH"
  | "COMPLETED_EXCEEDS_ORDERED" | "INVALID_AS_OF_DATE" | "INVALID_DUE_DATE"
  | "INVALID_SOURCE_DATA" | "INVALID_FACTS" | "DUPLICATE_ENTITY_ID";

export class OperationsEngineError extends Error {
  constructor(public readonly errorCode: OperationsErrorCode, public readonly humanReadableMessage: string) {
    super(humanReadableMessage);
    this.name = "OperationsEngineError";
  }
  toJSON() { return { errorCode: this.errorCode, humanReadableMessage: this.humanReadableMessage }; }
}
