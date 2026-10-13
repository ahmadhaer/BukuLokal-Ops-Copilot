# Server-side Firestore persistence

WU-07 adds trusted-server persistence with `@google-cloud/firestore@9.3.1` (npm current stable checked during this work unit). The official high-level SDK brings its own `@google-cloud/firestore-api` transitive dependency; application code never imports that low-level package or a browser Firebase SDK. Existing direct dependencies retain their versions.

## Architecture and authentication

Browser → Next Server Actions / request-time server page → application persistence services → `WorkspaceRepository` → validated repository → Firestore transport → Cloud Firestore. Every repository, transport, and persistence-service module imports `server-only`. Client-safe contracts contain types only. A lazy process singleton initializes with `GOOGLE_CLOUD_PROJECT`; the SDK discovers Application Default Credentials and, in the Cloud Run production target, the service identity. No manual key is required. `FIRESTORE_EMULATOR_HOST`, when already supplied, is honored by the SDK; production has no hardcoded emulator setting.

The server SDK is trusted infrastructure and does not rely on browser Firestore Security Rules. It bypasses those rules. WU-07 does not implement authentication or production user authorization. Server Actions fix the organization to the synthetic demo and actor to `demo-owner`; they accept canonical issue/action/analysis IDs, never arbitrary database paths or browser-supplied operational facts. Production access control remains a later work unit; these unauthenticated demo actions must not be represented as a production multi-tenant authorization system.

## Collections and identifiers

The Organization document lives at `organizations/{organizationId}`. Its subcollections are `data_sources`, `imports`, `orders`, `production_jobs`, `inventory_items`, `issues`, `evidence`, `ai_analyses`, `actions`, and `audit_events`. Canonical IDs are used directly, including deterministic IDs containing colons. Path guards reject slash/backslash/control characters, whitespace, dot segments, reserved names, overlong IDs, and organization/document mismatches before path construction. No auto-ID, global duplicate business collection, or `operational_facts` collection is used.

All writes run the existing canonical Zod schema before reaching the transport. All reads validate shape, document ID, and explicit organization ownership. Linked entities are resolved only inside the scoped workspace: imports/sources, orders/imports, jobs/orders, optional inventory/order links, issues/orders/evidence, evidence/source, analyses/issues/evidence, actions/issues, and audit/entity references. Full workspace reconstruction checks this graph in a consistent read transaction. Shape-valid but corrupt action/analysis provenance is rejected during session reconstruction. Errors have stable persistence codes; UI receives controlled messages rather than provider stacks or credentials.

Canonical dates and timestamps remain strings. Serialization retains explicit null and omits only schema-optional undefined properties after validation. Required values cannot be silently removed. Conservative document and request byte guards prevent oversized writes.

## Demo initialization and reads

`ensureDemoWorkspace` uses the original fixture → WU-03 facts → WU-04 detection, then creates the canonical source, Issue, and Evidence documents in one create-only batch. Seed has fixed dates and IDs. An existing complete workspace is validated and left untouched; an incomplete/corrupt workspace fails without repair or overwrite. Concurrent seed conflicts recheck the completed workspace. AIAnalysis, Action, and AuditEvent history is never reset by seeding or page reload.

`loadWorkspace` returns Organization and all ten scoped collections in deterministic ID order through a consistent read transaction. The demo's as-of date remains its existing fixture context, not a new domain field. Dashboard facts are recomputed from persisted canonical demo source IDs; stored Issues/Evidence supply the issue display. Uploaded supplemental source records remain excluded from demo facts. Issue reconciliation and a full imported-data dashboard belong to WU-08.

## AI and Human Gate atomicity

`analyzePersistedIssue` selects persisted issue/evidence, uses existing bounded WU-05 input/grounding validation, and writes only successful canonical AIAnalysis plus its completion AuditEvent. Provider/configuration/validation failures create no fake record. `persistValidatedAnalysis` can atomically batch a validated analysis, explicit suggested recommendations, and their audits when no prior state read is needed. Evidence references must match validated output and resolve to the same issue.

A user-selected recommendation is reconstructed from the stored validated AIAnalysis, not browser text. The suggestion transaction atomically retains analysis, creates Action, and creates the suggestion audit; repeats are idempotent. Human Gate transactions read the current Action, validate it, reconstruct provenance, call the unchanged pure WU-06 approve/edit/reject function, and atomically update Action plus create AuditEvent. Terminal or concurrent stale transitions return controlled conflicts. Audit sequence derives from the current transaction's audit count, distinguishing repeated same-time events. The SDK performs all reads before flushing queued writes. No external executor exists.

Action documents remain exactly canonical. Original draft, analysis ID, recommendation index, and user-modified metadata are reconstructed from deterministic action IDs, validated recommendation output, and persisted edit audits. This avoids changing canonical schemas. Stored analysis does not invent an original inference-attempt count: that optional UI response detail is absent after reconstruction.

## Import batches and repeat policy

`persistValidatedImport` calls existing WU-02 normalization with a confirmed mapping and persists only canonical valid records, DataSource, and ImportSession together. Invalid rows never enter storage; validation counts remain returned to the caller. This service supports orders, production, and inventory. It is not connected to the upload UI's persistence button or imported dashboard in WU-07; upload remains preview/health review.

Create-only writes reject repeated import IDs or collisions with existing canonical record IDs as `PERSISTENCE_CONFLICT`, preserving the original complete state. No merging or replacement is implicit. Batch policy is at most 500 writes and a conservative 8 MB serialized request; with source+session, an import allows at most 498 valid records. Larger files (including the parser's allowed 5,000 rows) fail before any write with a controlled message to split input. No chunking or recovery policy is introduced, so no new consistency decision is needed.

## UI and availability

The root session always receives production Server Actions. It loads server state after hydration and updates state only after confirmed persistence. Mutations show pending/error feedback; a failed review does not become a local approval. Server pages use Next `connection()` so builds never access the database. With storage configured, demo pages seed/read persisted state and refresh reloads analyses, actions, and audits. With storage unavailable, the deterministic read-only demo remains inspectable and a truthful storage message is shown; no localStorage or memory repository substitutes for Firestore.

The optional no-transport session behavior preserves isolated WU-06 component tests; the production root always supplies a transport. The deterministic memory transport is imported only by tests and has a shared backing state plus atomic commit/serialized transaction semantics. It is neither production storage nor a live Firestore claim.

## Tests and cloud status

Repository contract, seed, AI, imports, Human Gate, isolation/path/security, Server Action, UI reconstruction, and small official-SDK adapter-boundary suites run without network or credentials. Adapter code compiles against the real SDK; boundary doubles verify snapshot reads, batch create/set, and transaction read-before-write behavior without deeply duplicating SDK internals.

No emulator is already configured: `FIRESTORE_EMULATOR_TEST: NOT_RUN_UNAVAILABLE`. No ready GCP identity/project/database is available: `LIVE_FIRESTORE_SMOKE_TEST: NOT_RUN_NO_CONFIG`. Neither was installed/provisioned, and no remote Firestore read/write, live Gemini inference, deployment, or external business action was performed. Full regression and production bundle scans are documented in WU-07 evidence. Live IAM/database access and real service failure/retry behavior remain unverified until an existing authorized environment is supplied.
