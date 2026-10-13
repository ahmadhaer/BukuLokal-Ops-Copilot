# Application-integrated golden path

WU-08 joins the approved ingestion, facts, issue/evidence, advisory AI, Human Gate, and persistence layers. It introduces no new domain formula, schema, severity threshold, mapping rule, grounding policy, or action status. Passing this gate means **HACKATHON_MVP_APPLICATION_INTEGRATED**, not cloud-verified, deployed, or submission-ready.

## Composition and orchestration

`src/application/production.ts` is the sole production composition root. It wires the existing WU-07 Firestore demo repository factory, the real Vertex provider when configured, a server boundary clock, and `buildApplication`. Routes and Server Actions obtain the same lazy application instance. No production environment switch can select the memory transport or fake provider. Tests explicitly construct `buildApplication` with the existing memory repository and a recording network provider in `tests/integration/application/helpers.ts`.

Use cases cover opening the demo, dashboard, issue detail, selected analysis, suggestion compatibility, action review, Activity, session reload, preview/health, and explicit import save. React renders safe DTOs and submits identifiers/drafts/file mappings; it does not construct authoritative operational facts or mutate persisted statuses. The existing no-transport WU-06 session is used only by its isolated component tests; the production root always has the server transport.

`health()` reports only configuration statuses and readiness booleans. Persistence configuration requires `GOOGLE_CLOUD_PROJECT`; AI configuration additionally requires `GOOGLE_CLOUD_LOCATION` and `GEMINI_MODEL`. This is presence assessment, not a claim of credentials, IAM, database existence, or successful live requests. Missing/unreachable storage yields a controlled persistent-workspace error. The production demo does not substitute fixture-based React state or a memory database. Data-source selection and import preview/health remain available without a database; saving is explicitly unavailable.

## Persisted demo and integrity

Try Demo opens `/demo`, whose use case invokes the approved idempotent seed and reloads canonical persisted state. Metrics are derived (12 orders, 5 at-risk, 5 material shortages, 2 critical issues for the canonical baseline). Order detail loads persisted Order, Issue, and Evidence plus WU-03 facts. SO-001 shows critical severity, 30% complete, 350 pcs remaining production, 200 pcs shortage, and 2 days remaining. The remaining-production view uses the approved fact object; no new Evidence record or formula is invented.

A read-only consistency check runs approved WU-03/WU-04 engines over canonical demo source IDs and compares stored issue/evidence identity, severity, references, and primitive fact values. Inconsistency, missing source data, invalid deep-link identifiers, missing issues, seed failure, or load failure returns a safe error. The check never replaces or repairs persisted history. Supplemental imported records remain excluded until an approved reconciliation policy exists.

## Explicit AI and atomic suggestions

Analyze receives only issue ID and an operation UUID. It loads the scoped persisted issue and its linked evidence, builds bounded WU-05 input, calls the real configured provider, and retains strict output/grounding/action compatibility validation. On success, the existing WU-07 `persistValidatedAnalysis` service receives all validated recommendation indexes and atomically creates AIAnalysis, suggested Action(s), and associated AuditEvents. No action starts approved. Provider/configuration/validation failure writes no success record, action, or audit; retry remains available and verified evidence remains usable.

The UI keeps one UUID for analysis attempts on the current issue page, disables pending submission, and reuses that identity even after a fast successful response. Revisiting/reloading the issue begins a new explicit operation. A bounded, temporary in-flight promise map coalesces matching requests within a process; it stores no authoritative application state. An operation completion AuditEvent has a deterministic ID binding organization, issue, server model, prompt version, and UUID. Its create-only write shares the existing atomic batch. Concurrent application instances with distinct server timestamps race safely: one complete batch wins, and a loser reloads that operation's canonical record. Replay after reconstruction returns the original operation, not a later analysis. Across processes, duplicate provider calls are possible, but duplicate committed results are prevented. Failures have no completion event, so the same identity can retry.

The added optional operation-ID argument to WU-07 persistence is backward compatible: existing callers retain the original event-ID policy. WU-05 record IDs, output contracts, and explicit createdAt behavior remain unchanged. Legacy server callers that omit UUID intentionally receive a new server UUID; the integrated UI always supplies one.

## Human review and refresh

Suggested actions are loaded from canonical persisted records. Approve/Edit/Reject call the existing WU-07 current-state transaction and unchanged WU-06 pure transition functions. Action plus its AuditEvent commit atomically. Terminal/stale requests cannot overwrite state. Approved actor is explicitly synthetic `demo-owner`; edited drafts retain provenance after later approval or rejection. UI state updates only after a confirmed server result. Reload reconstructs original drafts, analyses, decisions, and audits without invoking AI again.

Activity loads actual stored events and displays deterministic newest-first chronological order. It distinguishes analysis generation, suggestion, edit, approval, and rejection. No event claims supplier contact, email delivery, or external order changes. “Nothing will be sent automatically.” remains visible. No authentication, external executor, or autonomous decision is added.

## Reviewed import save

The file flow is Upload → Preview/sheet selection → Mapping/default confirmation → WU-02 Normalize/Validate → Data Health → **Save Valid Data**. Parsing/health alone performs no write. Health returns a non-secret review fingerprint binding original bytes, file name, sheet, kind, and confirmed mapping/defaults. Save receives the original file/mapping plus that identifier, verifies the binding, reparses/revalidates server-side, supplies server-owned organization/content-based source/session IDs, and calls the existing WU-07 import persistence service. Browser-submitted alleged valid records are never accepted.

The fingerprint is an integrity binding, not authentication or proof that a person read the page. Only valid rows are persisted; counts in the save result come from the successful canonical batch. Create-only repeat/collision behavior and the 500-write atomic limit are unchanged. Save does not reset, regenerate, delete, or reconcile issue/action histories. Its UI states that operational issue refresh for imported data is a later integration step; the demo dashboard remains tied to canonical demo sources.

## Verification and scope

Automated tests are cloud-independent and exercise real application/domain/AI/persistence services with doubles only at network boundaries. The broad UI suite follows Landing through persisted seed, SO-001, validated analysis, automatically persisted suggestion, approval, Activity, and application reconstruction; it also checks fast-click replay and explicit import save. Other integration suites cover runtime modes, faults, edit/reject/stale transitions, corruption, unsafe paths/forged facts, and import binding/history protection.

Existing Chromium checks the actual Next production build's landing/navigation/missing-storage and import-health states. A separate loopback-only Vite harness (already installed via Vitest) hosts the same application services/UI with explicit test network doubles for the full browser flow. It is under `tests/browser`, has no production route or runtime flag, and supplies only a static test shim for Next Link's environment expectations. These are distinct evidence sources; the harness is not a live cloud test.

No verified existing Firestore/Vertex configuration is available: `LIVE_GOLDEN_PATH_SMOKE_TEST: NOT_RUN_MISSING_CLOUD_CONFIG`. No provisioning, IAM change, deployment, push, new authentication, Sheets integration, or external business action occurred. WU-09 and WU-10 were not started.
