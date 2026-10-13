import { z } from "zod";
import { OperationsEngineError } from "./errors";

export function validateSource<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new OperationsEngineError("INVALID_SOURCE_DATA", "Operational input does not satisfy its canonical schema.");
  return parsed.data;
}
export function validateFacts<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new OperationsEngineError("INVALID_FACTS", "Computed facts exceed finite numeric or derived-contract bounds.");
  return parsed.data;
}
