# Changelog

## Unreleased — WU-00

- Established a fresh Next.js App Router foundation with React, strict TypeScript, Tailwind CSS, and Zod.
- Added a minimal homepage stating the foundation-only status.
- Added governance documents, complete canonical owner-approved PRD, and an environment template.
- Configured lint, explicit typecheck, rendering smoke tests, development server, and production build scripts.
- Preserved the original LICENSE and Git history.

## WU-00A — Documentation and evidence finalization

- Imported the complete BL-AIBC-PRD-001 v0.1 with the required canonical header; normalized trailing whitespace only.
- Updated README PRD status and captured bootstrap validation evidence in `docs/evidence/WU-00-bootstrap-evidence.md`.

## WU-01 — Canonical schemas and synthetic data

- Added canonical Zod 4 schemas and inferred TypeScript types for eleven entities, shared values, and DemoDataset.
- Added a fixed-date, fictional ABC Apparel fixture with 12 orders, 12 production jobs, and 12 inventory records; future issues, evidence, AI analyses, actions, and audit events remain empty.
- Added schema validation, fixture integrity, and anti-leakage tests.
- Recorded ADR-013 for optional order-scoped inventory correlation and captured WU-01 validation evidence.

## WU-02 — Deterministic CSV/XLSX ingestion

- Added Papa Parse, ExcelJS, and Papa Parse TypeScript declarations; existing dependency versions are unchanged.
- Added file safety checks, raw table parsers preserving source rows/headers, deterministic mapping suggestions, explicit confirmed mapping contracts, and pure import preview.
- Added order/production/inventory normalization ending in the existing canonical Zod schemas, with explicit defaults and structured row errors.
- Added fresh synthetic CSV/XLSX fixtures, import tests, and import-contract/evidence documentation. No business calculations, AI, database, API, or UI behavior was added.

## WU-03 — Deterministic operational facts

- Added pure production aggregation, individual material shortage, calendar deadline, order-view, and full-dataset derivation functions.
- Added derived Zod contracts, typed integrity errors, explicit as-of dates, and two-decimal percentage rounding with ordered quantity as denominator.
- Added computation, integrity, timezone-safety, full-fixture, and regression validation evidence/tests; canonical source schemas and import contracts remain unchanged.
- Documented formulas and boundaries. No severity, issue/evidence generation, recommendations, AI, persistence, API, or UI was added.

## WU-04 — Deterministic issues and evidence

- Added centralized configurable hackathon issue policies with critical/high/medium delay precedence and per-inventory shortage severity.
- Added deterministic identifiers, explicit detectedAt context, canonical Issue/Evidence generation, rule-trace metadata, and bidirectional reference validation.
- Added completed-status consistency errors, source/fact checks, rule/evidence/determinism tests, and full-fixture detection evidence.
- Documented the policy boundaries; no AI, recommendations, actions, persistence, UI, or API was added, and existing schemas/facts remain unchanged.

## WU-05 — Evidence-grounded Gemini advisory layer

- Added the current Google Gen AI SDK and a server-side Vertex AI/ADC adapter with explicit environment configuration and structured JSON output.
- Added bounded selected-issue input, strict advisory schema, versioned guardrails, evidence/action compatibility validation, and one validation retry with safe failures.
- Added in-memory canonical AIAnalysis provenance using explicit createdAt, fake-provider/SDK contract tests, SO-001 advisory tests, and source immutability checks.
- Added integration/evidence documentation and environment placeholders. No live inference, actions, persistence, UI, API, or cloud provisioning was performed.

## WU-06 — Product UI and Human Gate

- Added landing, data-source, derived dashboard, filtered issues, evidence detail, actions, activity, and CSV/XLSX preview/mapping/data-health screens.
- Added server-only Gemini/import Server Actions with honest unavailable states and authoritative server reconstruction; no runtime fake AI.
- Added pure canonical suggested/edit/approve/reject actions, AI provenance, and audit events in a refresh-resetting demo session; no external execution.
- Added responsive, labeled controls, route decoding regression coverage, fake-provider golden-flow/import/UI tests, and production/browser/secret-scan evidence.

## WU-07 — Trusted server Firestore persistence

- Added official Firestore server SDK 9.3.1, lazy ADC client, organization-scoped validated repositories, canonical JSON serialization, and stable persistence errors.
- Added atomic deterministic demo seeding, consistent workspace reload, validated AI/suggestion batches, transactional Human Gate/audits, and create-only normalized import persistence with explicit batch limits.
- Connected the demo UI to server persistence and reload; unavailable storage reports a truthful read-only state. No browser Firebase SDK or memory fallback was introduced in production.
- Added repository/atomicity/concurrency/isolation/import/AI/UI reconstruction/SDK-boundary tests and persistence/security evidence. No cloud provisioning or live database/inference was performed.

## WU-08 — Persistent end-to-end application integration

- Added a single trusted-server production composition root, safe capability assessment, and application use cases joining the approved domain/AI/persistence layers.
- Integrated persisted demo/detail facts, explicit grounded AI with atomic suggested actions/audits, deterministic operation replay, persistent review/Activity, and refresh reconstruction.
- Added explicit reviewed Save Valid Data with server revalidation and factual counts; no imported issue reconciliation or history deletion was introduced.
- Added broad UI/application integration, fault/security/replay tests, isolated full-browser test composition, production configuration/import checks, measured demo timing, and demo runbook/evidence.
- Milestone: HACKATHON_MVP_APPLICATION_INTEGRATED. No live cloud verification, deployment, authentication, Sheets connector, or external execution.

## WU-09 — Google Sheets integration

- Deferred to P1 for the hackathon MVP.
- No Google Sheets production connector was added to the current submission path.

## WU-10 — Google Cloud live deployment and verification

- Deployed the MVP to Google Cloud Run using a dedicated runtime service account and Application Default Credentials; no service-account JSON key is committed.
- Provisioned and live-verified Firestore in Native mode and verified create/read/delete behavior with synthetic smoke data.
- Live-verified direct Vertex Gemini structured-output inference with `gemini-3.5-flash`.
- Added safe server-side AI diagnostics that classify failures without logging prompts, full evidence payloads, full model output, credentials, or raw sensitive provider messages.

### WU-10A — Vertex schema compatibility

- Removed provider-facing JSON-schema keywords that were incompatible with the active Vertex path while preserving authoritative local Zod validation.
- Added regression coverage and evidence documentation.

### WU-10B — AI failure diagnostics

- Added structured diagnostic stages for provider, parsing, schema, grounding, action compatibility, record, input, and persistence failures.
- Confirmed the live remaining failure at that stage was a provider-request HTTP error rather than Firestore, grounding, Zod, Human Gate, or persistence.

### WU-10C — array-constraint compatibility

- Controlled production-schema probes showed the exact schema returned `400 INVALID_ARGUMENT` until `minItems` / `maxItems` were omitted from the provider-facing schema.
- Kept the authoritative local array limits unchanged in Zod.
- Added evidence and regression tests for the compatibility sanitizer.

### WU-10D — bounded transient Vertex retry

- Added one bounded SDK retry for transient HTTP statuses `408`, `429`, `500`, `503`, and `504`.
- Kept a 30-second timeout per HTTP attempt, with two total attempts, 1-second initial delay, 2-second maximum delay, exponential factor 2, and no jitter.
- Explicitly excluded permanent/non-transient statuses such as 400, 401, 403, and 404 from the retry policy.
- Added offline installed-SDK retry tests using fake fetch and fake timers.
- Verification baseline: 430 tests across 47 files, lint/typecheck/build/diff-check PASS.
- Code baseline commit: `b99a29a239622f5caf199d6aa2b82a34cb4f2139`.

### WU-10E — persisted AI state UX clarification

- Planned but not yet implemented.
- Current persisted AI analysis is intentionally restored from Firestore, but the UI can show an existing recommendation while still labeling the button `Analyze with AI`, which is ambiguous for a reviewer.
- Planned UX: distinguish first-time analysis from restored prior analysis, use `Analyze Again with AI` when a prior result exists, and explain when a suggested action has already been created.
- No AI, persistence, deterministic, grounding, Human Gate, IAM, or cloud contract changes are planned for this work unit.
- The first Codex attempt correctly stopped with `PREREQUISITE_REQUIRED` because its workspace was on branch `work` at a different HEAD rather than the canonical `wu/10-google-cloud-live-deployment` baseline. Repository-context recovery is required before implementation.

## Current milestone status

- WU-00 through WU-08: PASS.
- WU-09: deferred to P1.
- WU-10A through WU-10D: PASS.
- Live AI has successfully produced and persisted a recommendation at least once.
- WU-10 final closure is still pending WU-10E UX clarification and a clean end-to-end live golden-path verification including Human Gate, Activity, and refresh durability.
- WU-11 final QA / submission readiness has not started.
