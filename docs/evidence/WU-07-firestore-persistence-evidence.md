# WU-07 Firestore persistence evidence

## Workspace and dependency

Canonical repository: `ahmadhaer/BukuLokal-Ops-Copilot`; origin `https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git`; workspace `/workspace/BukuLokal-Ops-Copilot`. Initial tree was clean at WU-06 checkpoint `9258640cc3a1b1e9f0c515b5925d25754e1df756`, message `feat: add product UI and human approval gate`. Branch `wu/07-firestore-persistence` was created directly from that checkpoint, without reset. [Initial commands](WU-07/workspace-baseline.json).

`npm view @google-cloud/firestore version` returned `9.3.1`; installed exact official high-level server SDK version is `9.3.1`. Its low-level Firestore API dependency is transitive only. No existing lockfile package version changed and no unrelated direct dependency was updated. [Architecture and operating contract](../firestore-persistence.md).

## Implementation and requirement mapping

| Requirement | Implementation / evidence |
| --- | --- |
| Trusted server SDK, ADC, singleton | `src/lib/firestore/client.ts`; configured project with SDK-discovered ADC/Cloud Run identity, server-only, lazy singleton |
| Organization-scoped canonical paths | `paths.ts`, repository types; canonical Organization root plus all ten approved subcollections; no auto-ID or operational facts collection |
| Write/read schema validation | `serialization.ts`, `workspace-repository.ts`; canonical Zod, document ID, ownership, optional undefined/null, graph checks |
| Typed controlled errors | `errors.ts`, runtime and Server Actions; no raw provider stack exposed |
| Test abstraction | narrow WorkspaceRepository/RawStore contracts; deterministic atomic memory transport imported only by tests |
| Idempotent atomic seed | original fixture → WU-03 → WU-04; create-only single batch; repeat/concurrent calls preserve IDs/history; incomplete state rejected |
| Workspace reload | consistent read transaction over all canonical collections; deterministic ID ordering; facts recomputed from persisted demo source records |
| Validated AI | stored bounded issue/evidence through WU-05 validators; successful record/audit batch; optional suggestion batch; invalid/provider failures write nothing |
| Human Gate persistence | current Action read inside transaction; unchanged WU-06 pure logic; Action and AuditEvent committed together |
| Stale concurrency | concurrent approve/reject yields one terminal update and one audit; invalid terminal retry rejected |
| Provenance after reload | action ID + validated stored recommendation + edit AuditEvents reconstruct original draft and user-modified marker; canonical schema unchanged |
| Imports | existing WU-02 confirmed mapping/normalization; only valid orders/production/inventory; source/session/records atomic and create-only |
| Batch limits | 500 writes maximum, 8 MB conservative serialized request, 900 KB document guard; >498-record imports fail before writing, no chunking |
| UI refresh | production root always supplies server transport; three UI tests remount/reconstruct repository and retain review/audit; no production memory/localStorage fallback |
| Unconfigured behavior | production Chromium shows storage error and read-only evidence; no local approval; builds use request-time connection boundary |
| Isolation/path safety | unsafe path IDs rejected before access; same order ID isolated across organizations; all six requested relational link types tested |
| Scope | no authentication, Sheets, deployment, provisioning, external actions, new Gemini capability or issue policy; WU-08 not started |

## Targeted and full validation

Every required command passed. [Raw command outputs and exit codes](WU-07/validation.json) retain `npm ci`, lint, typecheck, each targeted suite separately, full tests, production build, and diff check.

| Targeted suite | Passed |
| --- | ---: |
| Repository contract | 7 |
| Demo seed | 5 |
| Human Gate persistence | 8 |
| AI persistence | 7 |
| Import persistence | 7 |
| Isolation / path / security | 19 |
| Official SDK adapter boundary | 4 |
| Trusted Server Actions | 3 |
| UI reconstruction | 3 |
| WU-07 total | 63 |
| Full regression | 354 in 37 files |

The previous 291 tests pass unchanged. Existing domain/schema/fixture, operations/detection, AI/grounding, import normalization, pure WU-06 Human Gate, and prior test sources have no checkpoint diff. The only legacy AI UI DTO change makes the nonpersisted inference-attempt count optional when reconstructing canonical stored records; no attempt count is invented.

Human Gate tests prove suggested persistence, approve/edit/reject plus corresponding audit after reconstruction, edit then approval provenance, terminal rejection, exactly one winner under concurrency, and rollback of both records on a failed commit. Memory transactions model atomic semantics; SDK-boundary tests verify use of official batch/transaction APIs and reads before writes. They are not remote database tests.

Import tests persist a confirmed synthetic orders file and its ImportSession, exclude six invalid rows, retain organization/source identifiers, reject repeat collisions without changes, reject foreign ownership, reject 501-write input without partial writes, and persist production/inventory while leaving demo dashboard metrics unchanged.

## Production browser and bundle evidence

An existing Chromium instance inspected the production build on loopback port 3001. [Browser checks](WU-07/browser-checks.json) record HTTP 200 for seven fixed routes, actual client navigation into the SO-001 delay detail, canonical 30% / 200 pcs / 2 days evidence, disabled AI without storage, explicit “Workspace storage is not configured” and “changes are not saved” messages, and the same truthful error after refresh. [Screenshot](WU-07/unconfigured-storage-desktop.png) was generated and visually inspected. This proves unavailable-state wiring, not configured Firestore persistence.

[Security and scope checks](WU-07/security-scope-checks.json) record source scanning for key/token/service-account patterns, 14 client JavaScript chunks scanned for Firestore/server SDK/auth/config/credential markers, all 14 implementation modules carrying `server-only`, absence of production memory imports, unchanged protected source paths, and unchanged existing lock versions. No secret or server implementation/config marker was found in client chunks. Evidence includes synthetic fixture data only.

## Cloud and network status

The managed environment reported no ready Google Cloud identity, runtime project, or secrets. Non-secret presence checks confirmed no project or emulator host configuration.

- `FIRESTORE_EMULATOR_TEST: NOT_RUN_UNAVAILABLE`
- `LIVE_FIRESTORE_SMOKE_TEST: NOT_RUN_NO_CONFIG`
- Remote database calls: none.
- Live Gemini inference: none.
- Network activity: npm package reads plus loopback production/browser tests.
- Remote mutations: no push, PR, merge, tag, release, remote change, provisioning, deployment, or external business action.

No emulator/toolchain was installed and no Firestore database or Google Cloud resource was provisioned. The installed official SDK compiled; IAM, live database permissions, and backend transaction retry behavior remain unverified.

## Decisions and limitations

Use create-only seed/import writes rather than overwrite history. Reject oversized imports before committing rather than introduce chunk recovery semantics. Persist exactly canonical Action and reconstruct UI provenance from analysis/audit records. Use a consistent workspace read transaction and transactional current-state Human Gate, with stable audit sequence from transaction-visible history. Keep the demo as-of date and AI rule-trace context tied to the existing fixture; a generalized workspace lifecycle is later scope.

The actor is synthetic and unauthenticated; the trusted server SDK bypasses browser security rules. No production authorization claim is made. Full-collection reads and audit-count sequencing suit the small demo, not an optimized large tenant. Imported persistence is an application service and is not yet wired into upload/dashboard golden-path integration. Firestore must be configured and reachable to provide durable runtime state; no silent substitute is used. No canonical schema/status/policy change or additional decision is required.

Only a local commit is authorized: `feat: add server-side Firestore persistence`. The next recommendation is `BL-AIBC-WU-08-END-TO-END-GOLDEN-PATH`; it has not been started.
