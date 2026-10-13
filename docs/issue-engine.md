# Deterministic issue and evidence engine — WU-04

## Purpose and policy boundary

Validated WU-03 operational facts feed explicit deterministic classification rules. The two authorized issue types are `order_delay_risk` and `material_shortage`. These thresholds are hackathon demonstration policies, **not universal manufacturing standards, regulations, or AI-derived best practices**.

Import detector functions and contracts from `src/domain/issues`. Source entities, WU-03 calculations, and import validation remain unchanged. No detection writes back to inputs or reconciles prior issues.

## Central configuration and precedence

`ISSUE_RULES_V1` defines criticalDeadlineDays 2, criticalCompletionThreshold 50, highDeadlineDays 3, mediumDeadlineDays 7, and delayCompletionThreshold 80. It is a frozen flat configuration. Callers can supply an explicit validated configuration for reviewed policy changes; no admin UI or runtime environment configuration exists. Threshold validation preserves ascending deadline bands and completion bounds.

Delay rules, evaluated in this exact order:

| Severity | Predicate |
| --- | --- |
| critical | days <= 2 AND (completion < 50 OR any correlated shortage > 0) |
| high | days <= 3 AND completion < 80, if critical did not match |
| medium | days <= 7 AND completion < 80, if neither prior rule matched |

There is at most one delay issue per order. If no predicate matches, no delay issue is emitted. Completion/deadline/shortage values are consumed from WU-03, not recalculated here.

Past deadlines participate in these same predicates; there is no separate overdue type or blanket escalation. Thus past + 30% is critical, past + 70% without shortage is high, and past + 90% without shortage emits no delay issue under these exact initial policies.

Completed orders with 100% and zero remaining production emit no delay issue. A completed status contradicting percentage, remaining quantity, or total completed quantity raises COMPLETED_ORDER_INCONSISTENT, including a rounded 100% with nonzero remainder. Cancelled orders emit no delay issue. On-hold orders remain eligible for the numeric predicates. Status suppression is scoped to delay risk; positive explicitly order-correlated material shortages remain independently governed by the material rule.

## Material cardinality and severity

Each correlated inventory item with shortageQuantity > 0 creates a separate material_shortage issue. Severity uses days <= 2 critical, <= 3 high, <= 7 medium, otherwise low. Zero shortage creates no issue. Null/absent/other-order correlation is ignored; names never infer an order. No organization-level unscoped issue is introduced, and mixed materials/units are not merged.

## Evidence and source references

The engine reuses canonical IssueSchema and EvidenceSchema. No new evidence types are added. Supported evidence emitted here:

- production_completion: numeric percentage, unit `percent`, sourceEntityType `order`, sourceEntityId = order ID. Aggregate completion cannot truthfully point to an invented single production job.
- days_to_deadline: numeric calendar-day difference, unit `days`, source type `order`.
- material_shortage: numeric computed shortage, original material unit, source type `inventory_item`, sourceEntityId = inventory item ID.

Delay evidence includes deadline plus only the predicates that contributed: completion when its threshold matched, correlated shortage evidence for each positive material when the critical shortage predicate matched. High/medium rules do not attach shortage evidence because shortage is not their predicate. SO-001 includes completion 30, deadline 2, shortage 200 pcs.

Each material issue includes its computed shortage and the deadline supporting its severity. Raw required/available quantities remain in operational facts/source inventory; their optional recommended evidence labels are not in the canonical enum. The required minimum computed shortage is represented without changing schemas.

Every issue references nonempty unique evidence IDs. Every evidence record points back to its owning issue. The result wrapper validates bidirectional ownership, ID uniqueness, and one rule trace per issue. Dataset detection also verifies complete fact/order coverage and material source identity, organization, correlation, unit, name, and raw quantities against canonical inventory. Single-order detection assumes trusted WU-03 material facts; callers needing complete source resolution should use the dataset function. The detector does not authenticate or independently rederive fabricated facts.

## Deterministic identifiers and run context

Issue IDs contain type, organization ID, and order ID (delay) or inventory ID (shortage). Each arbitrary source ID is prefixed by its UTF-16 string length; separators inside IDs cannot create ambiguous boundaries. Evidence IDs similarly include a length-prefixed issue ID, canonical evidence/source type, and length-prefixed source ID. No random ID, timestamp, or content hash is used. IDs remain stable when detectedAt changes; persistence/lifecycle semantics remain future scope.

Callers must supply `IssueDetectionContext = { detectedAt }` with a valid explicit ISO UTC/offset timestamp. There is no implicit runtime clock. New issues have status `open`; prior issues are not auto-resolved. Fact/order/date context mismatches and contradictory completed status raise controlled typed errors. Public error JSON contains only errorCode and humanReadableMessage.

`IssueDetectionResult` contains canonical issues, canonical evidence, and ruleTraces. Stable trace identifiers are ORDER_DELAY_CRITICAL_V1, ORDER_DELAY_HIGH_V1, ORDER_DELAY_MEDIUM_V1, MATERIAL_SHORTAGE_V1. They describe predicate versions; callers must retain the explicit configuration used when auditing customized thresholds. Canonical Issue has no added rule-ID field.

## Fixture walkthrough

For fixed asOfDate 2026-10-12:

| Order | Delay rule | Shortage item |
| --- | --- | --- |
| SO-001 | critical | MAT-001, critical |
| SO-003 | high | MAT-003, high |
| SO-006 | none (8 days) | MAT-006, low |
| SO-007 | medium | MAT-007, medium |
| SO-010 | medium, on_hold | MAT-010, medium |
| SO-012 | medium | none |

Other fixture orders emit none. Total: five delay issues plus five material issues = 10. SO-001 delay has three evidence records; the other nine issues each have two = 21. No count was chosen as a target score.

## Scope and limitations

Pure in-memory rules and result validation only. No Gemini/LLM, recommendation, prose explanation, supplier message, Action/AIAnalysis generation, lifecycle persistence, Firestore/Firebase, UI, API, Google Sheets, Cloud Run, or deployment. Deterministic issue IDs are scoped to organization/source/type rather than separate persisted detection-run entities. WU-05 requires independent authorization.
