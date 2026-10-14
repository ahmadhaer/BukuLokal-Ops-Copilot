# Deterministic operations engine — WU-03

## Purpose and boundary

Pure functions transform canonical source records into numeric operational facts. Import from `src/domain/operations`. No request context, React, persistence, networking, randomness, runtime clock, or implicit business date is used. Source entities and import rules remain unchanged. These outputs are derived views, not new persisted ERP entities.

- `calculateProductionFacts(order, jobs)` selects jobs with matching orderId.
- `calculateMaterialFacts(item)` calculates one material fact.
- `calculateDeadlineFacts(orderId, dueDate, asOfDate)` requires both explicit business dates.
- `buildOrderOperationalFacts(orderId, dataset, asOfDate)` assembles a single order view.
- `buildDatasetOperationalFacts(dataset, asOfDate)` assembles all orders in ascending ID string order.

## Production formulas and integrity

For matching jobs:

```text
totalPlannedQuantity = sum(plannedQuantity)
totalCompletedQuantity = sum(completedQuantity)
remainingQuantity = orderedQuantity - totalCompletedQuantity
completionPercentage = totalCompletedQuantity / orderedQuantity * 100
```

The customer order quantity is always the denominator, even when planned production differs. Zero matching jobs produce planned/completed/percentage zero and remaining equal to ordered quantity. Planned production may differ from ordered quantity; completed production must not exceed ordered quantity. The engine returns COMPLETED_EXCEEDS_ORDERED instead of clamping or emitting negative remaining production.

Matching jobs must have unique IDs, the same organization as the order, and exactly the same unit. There is no unit conversion. Jobs and output arrays are sorted on copies using `<`/`>` string comparison, not locale sorting. Inputs are not mutated.

Percentage precision is numeric, at most two decimal places: `Math.round((completed / ordered) * 10_000) / 100`. This rounds to the nearest hundredth, with positive ties upward. Example: 1/3 becomes 33.33; 150/500 becomes 30; full completion becomes 100. It never returns a formatted percent string. Division precedes scaling to avoid overflowing an otherwise valid large quantity. Quantities use JavaScript finite numbers; no arbitrary-precision decimal arithmetic or tolerance/clamping policy is introduced. Nonfinite aggregated facts raise a controlled error.

## Material facts and correlation

```text
shortageQuantity = max(requiredQuantity - availableQuantity, 0)
hasShortage = shortageQuantity > 0
```

Facts retain inventoryItemId, relatedOrderId (null when absent), materialName, raw quantities, and unit. Order views include only exact `relatedOrderId === order.id` matches with the order organization. Null/absent correlation is never guessed from names. Material facts remain separate; 200 pcs and 5 kg never become a combined 205. No totalMaterialShortage field exists.

## Deadline arithmetic

Business dates are calendar-valid canonical YYYY-MM-DD values. `asOfDate` is mandatory; absence or malformed values produce INVALID_AS_OF_DATE. Due-date failures produce INVALID_DUE_DATE.

The engine splits year/month/day into integers and computes proleptic Gregorian civil-day indexes using March-based 400-year eras:

```text
adjustedYear = year - (month <= 2 ? 1 : 0)
era = floor(adjustedYear / 400)
yearOfEra = adjustedYear - era * 400
marchMonth = month + (month > 2 ? -3 : 9)
dayOfYear = floor((153 * marchMonth + 2) / 5) + day - 1
dayOfEra = yearOfEra * 365 + floor(yearOfEra / 4) - floor(yearOfEra / 100) + dayOfYear
calendarDayIndex = era * 146097 + dayOfEra
daysToDeadline = dueDateIndex - asOfDateIndex
```

No Date constructor, Date.parse/UTC/now, locale parser, timezone offset, or elapsed-hour division is used. Negative day differences are returned as facts. Tests cover month/year boundaries, leap years, century rules, years below 100, and identical outputs under UTC, Asia/Jakarta, America/New_York, and Pacific/Kiritimati, including a DST boundary.

## Contracts and controlled errors

Derived structures have strict Zod schemas and inferred TypeScript types: ProductionFacts, MaterialFacts, DeadlineFacts, OrderOperationalFacts. Numeric bounds reject NaN, Infinity, negative shortage/remaining quantities, and percentages outside 0..100. Source validation reuses the canonical WU-01 schemas.

`OperationsEngineError` exposes `errorCode` and `humanReadableMessage`; its JSON representation excludes stack traces. Codes: ORDER_NOT_FOUND, ORGANIZATION_MISMATCH, PRODUCTION_UNIT_MISMATCH, COMPLETED_EXCEEDS_ORDERED, INVALID_AS_OF_DATE, INVALID_DUE_DATE, INVALID_SOURCE_DATA, INVALID_FACTS, DUPLICATE_ENTITY_ID.

The dataset helper checks organization ownership, unique order IDs, and existence of referenced orders for production and scoped inventory. The single-order builder only derives matching records; unrelated or unscoped records are not attached. This is in-memory factual integrity checking, not a database relationship framework.

## Computed example

With the unchanged ABC Apparel fixture and explicit `2026-10-12`, SO-001 derives completionPercentage 30, remainingQuantity 350 pcs, Fabric A shortageQuantity 200 pcs, and daysToDeadline 2. These values are computed from raw quantities/dates, never keyed into engine logic by SO-001. Changing raw inputs changes outputs.

## Out of scope

No risk thresholds, severity assignment, ranking, issue detection, Issue/Evidence entity creation, recommendation, Gemini, Firestore, UI, API, Google Sheets, or deployment. These facts are inputs to later gated Work Units. WU-04 is not started.
