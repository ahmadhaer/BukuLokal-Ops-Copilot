import "server-only";
export type PersistenceCode = "PERSISTENCE_NOT_CONFIGURED" | "PERSISTENCE_READ_FAILED" | "PERSISTENCE_WRITE_FAILED" | "PERSISTENCE_INVALID_DOCUMENT" | "PERSISTENCE_NOT_FOUND" | "PERSISTENCE_CONFLICT";
export class PersistenceError extends Error {
  constructor(public readonly code: PersistenceCode, message: string) { super(message); this.name = "PersistenceError"; }
}
export function providerError(error: unknown, operation: "read" | "write"): PersistenceError {
  if (error instanceof PersistenceError) return error;
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  return new PersistenceError(code === 6 || code === 10 ? "PERSISTENCE_CONFLICT" : operation === "read" ? "PERSISTENCE_READ_FAILED" : "PERSISTENCE_WRITE_FAILED", "Workspace storage is temporarily unavailable. Please try again.");
}
