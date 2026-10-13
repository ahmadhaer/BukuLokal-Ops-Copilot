import { DateOnlySchema, EntityIdSchema, type DateOnly, type EntityId } from "../common/schema";
import { OperationsEngineError } from "./errors";
import { DeadlineFactsSchema, type DeadlineFacts } from "./types";
import { validateFacts, validateSource } from "./validation";

export function validateAsOfDate(asOfDate: unknown): DateOnly {
  const parsed = DateOnlySchema.safeParse(asOfDate);
  if (!parsed.success) throw new OperationsEngineError("INVALID_AS_OF_DATE", "An explicit valid YYYY-MM-DD as-of date is required.");
  return parsed.data;
}
// Proleptic Gregorian civil-day index. Uses integer calendar components only.
// March-based eras handle leap days, including canonical years 0000..0099.
function calendarDayIndex(date: DateOnly): number {
  const [year, month, day] = date.split("-").map(Number);
  const adjustedYear = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const marchMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * marchMonth + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146_097 + dayOfEra;
}
export function calculateDeadlineFacts(orderId: EntityId, dueDate: DateOnly, asOfDate: DateOnly): DeadlineFacts {
  const explicitDate = validateAsOfDate(asOfDate);
  if (!DateOnlySchema.safeParse(dueDate).success) throw new OperationsEngineError("INVALID_DUE_DATE", "Deadline must be a valid YYYY-MM-DD date.");
  validateSource(EntityIdSchema, orderId);
  return validateFacts(DeadlineFactsSchema, { orderId, asOfDate: explicitDate, dueDate,
    daysToDeadline: calendarDayIndex(dueDate) - calendarDayIndex(explicitDate) });
}
