# WU-08 End-to-end golden path evidence

## Baseline and scope

Repository `ahmadhaer/BukuLokal-Ops-Copilot`, origin `https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git`, workspace `/workspace/BukuLokal-Ops-Copilot`. Initial tree was clean at WU-07 checkpoint `6b1c399c6a73c2179200ae6a909d99858cfd2b0e`, message `feat: add server-side Firestore persistence`. Branch `wu/08-end-to-end-golden-path` was created directly from that checkpoint; no reset was used. [Initial verification](WU-08/workspace-baseline.json).

No dependency/package-lock changes. Existing Vite (via Vitest), Chromium, Python websockets, React Testing Library, and installed official SDKs were reused. Canonical domain/schema/fixture, WU-02 normalization, operations/detection, AI/grounding, WU-06 pure Human Gate, repositories/Firestore adapter, and prior test sources remain unchanged.

## Integration architecture and mapping

| Requirement | Implementation / evidence |
| --- | --- |
| Single production composition | `src/application/production.ts`, server-only; existing Firestore factory + real Vertex + server clock |
| Explicit test composition | `tests/integration/application/helpers.ts`; network-boundary memory transport and recording fake provider, never production-selected |
| Safe capabilities / health | `capabilities.ts`; configured/unavailable statuses and readiness booleans only; no credentials/project/path values |
| Persisted Try Demo / dashboard | open-demo use case invokes WU-07 idempotent seed/reload; WU-03 metrics derived from stored canonical sources |
| Integrity / safe deep links | `consistency.ts`; WU-03/WU-04 read-only comparison, no overwrite/repair/fabricated substitute; guarded IDs and not-found errors |
| SO-001 detail | persisted Order/Issue/Evidence plus approved facts: critical, 30%, 350 pcs remaining, 200 pcs shortage, 2 days |
| Explicit AI / validators | selected issue + operation UUID only; stored bounded evidence; unchanged WU-05 structured/grounding/action compatibility validation |
| Atomic AI/suggestions/audits | existing WU-07 batch service, all validated recommendation indexes; failed/unconfigured AI produces no success state |
| Replay / double submit | pending UI + stable page UUID + bounded in-flight promises + deterministic completion audit create; replay after reconstruction and cross-instance race tests |
| Persistent Human Gate / Activity | existing WU-07 current-state transactions and WU-06 pure transitions; terminal conflicts, edit provenance, chronological internal events |
| Refresh durability | broad UI test unmounts/rebuilds application/repository; Chromium reload retains approved action; no new AI call needed |
| Explicit import save | Data Health → Save Valid Data; source/mapping review hash, original bytes reparsed, WU-07 service persists valid rows only |
| Import history boundary | create-only collisions/batch limits preserved; no issue/evidence regeneration/deletion or fake imported dashboard insights |
| Missing runtime configuration | actual production build shows unavailable workspace and disabled save; no silent memory/fake/fixture fallback |

The only extensions to existing integration services are a backward-compatible optional operation identity for the WU-07 completion audit and extraction of the existing confirmed-file preparation for reuse. No canonical schema, formula, mapping, grounding, or Human Gate status contract changed. [Architecture](../end-to-end-golden-path.md) and [demo runbook](../demo-runbook.md) record decisions and operating preconditions.

## Automated golden path and targeted results

The broad UI test executes actual services across Landing → Try Demo → persisted seed/reload → derived dashboard → selected SO-001 delay issue → verified facts → explicit AI → validated output → persisted suggested Action → explicit human Approve → persisted Activity → reconstructed application → approved Action still present. It asserts canonical Action/AuditEvent schemas, synthetic approval actor, zero provider calls before explicit analysis, and no inference on reload. Another UI test confirms fast repeated Analyze clicks reuse the operation; a third covers preview/mapping/health/explicit save and accurate valid/invalid counts.

All required commands and separate targeted suites passed. [Raw outputs and exit codes](WU-08/validation.json).

| Suite | Passed |
| --- | ---: |
| Composition / capabilities | 3 |
| Demo / detail / corruption / seed/read failure | 7 |
| AI / atomicity / replay / concurrency | 8 |
| Human Gate integration | 6 |
| Import integration | 5 |
| Security boundary | 3 |
| Broad golden UI / replay / import | 3 |
| WU-08 total | 35 |
| Full regression | 389 in 44 files |

All previous 354 tests pass unchanged. Lint, typecheck, production build, and diff checks passed; build/test require no cloud credentials. Tests model runtime combinations A (configured persistence and AI via explicit doubles), B (persistence with unavailable AI), and C (unavailable persistence). Seed/load/provider/invalid-response failures are controlled without partial/fabricated state. Concurrent applications with different server timestamps commit only one result for the same operation identity. Approved/rejected stale requests never overwrite terminal state. Invalid import rows and browser-supplied authoritative facts/organization fields cannot reach trusted writes.

## Browser evidence and timing

Existing Chromium ran two clearly separated compositions:

1. **Actual Next production build**, loopback port 3003: Landing → Try Demo → truthful missing-storage state. No substitute dashboard is presented. Production upload → mapping confirmation → Data Health executes real Server Actions; the synthetic invalid-orders file reports 1 valid / 6 invalid rows and Save Valid Data is disabled because storage is unconfigured.
2. **Explicit test-only loopback composition**, port 4173: actual application services/UI with memory and fake network boundaries. Browser opens derived dashboard and SO-001 evidence, explicitly analyzes, sees a canonical suggested action, approves, views actual Activity, reconstructs the page, reloads, and retains approval. This harness is under `tests/browser`, has no production route/runtime flag, and is not a live Firestore/Vertex test.

[Browser results](WU-08/browser-checks.json), [production import results](WU-08/production-import-checks.json). Screenshots generated and inspected: [AI/suggestion](WU-08/golden-ai-suggestion.png), [Activity](WU-08/golden-persistent-activity.png), [refresh approval](WU-08/golden-refresh-approved.png), [production unavailable](WU-08/production-persistence-unavailable.png), [production import](WU-08/production-import-unavailable.png). Golden screenshots have no horizontal overflow at desktop width.

Measured from Landing to first meaningful validated recommendation:

- Broad automated UI test: **295.819 ms**, [timing artifact](WU-08/test-demo-timing.json).
- Chromium test composition: **0.320131 seconds**, recorded with a monotonic timer in browser-check output.

Both meet the ≤2-minute target under the explicit test provider and local transport. These include local navigation/application/test-network overhead; real Vertex latency was not measured. Browser checks assert no prior recommendation before clicking Analyze, and refresh checks wait for a new document rather than inspecting stale DOM. Harness compatibility/hydration synchronization was fixed in the test driver; no production fallback was added.

## Security and scope

[Security/scope results](WU-08/security-scope-checks.json) record source key/token/service-account scanning; 14 client JavaScript chunks scanned for Firestore/Gen AI/auth/config/credential/test-harness markers; all 18 server implementation modules guarded; no production memory imports; no protected-source diff; no existing lock version changes. No matching secret, credential, SDK server implementation, or test-double marker appeared in client output. No real customer data was introduced; browser/upload evidence uses existing synthetic fixtures.

Review inspected tracked changes plus new application/test/docs files. No new completion/shortage/deadline formula, issue policy, AI grounding policy, status semantics, auth, Sheets, deployment, external messaging/executor, destructive reset, or issue reconciliation was added.

## Live-cloud and milestone status

Environment inspection found no ready Google Cloud identity or configured Firestore/Vertex project/model/location. No remote Firestore request or live Gemini inference was made.

`LIVE_GOLDEN_PATH_SMOKE_TEST: NOT_RUN_MISSING_CLOUD_CONFIG`

Network work consisted of authorized npm dependency reads and loopback browser/server tests. No push, PR, merge, tag, release, cloud provisioning, IAM mutation, deployment, or external business execution occurred. No emulator/toolchain was installed.

Passing WU-08 establishes **HACKATHON_MVP_APPLICATION_INTEGRATED**. It does not establish cloud verification, deployment, or submission readiness. Live IAM/database/provider behavior remains unverified, actor `demo-owner` remains unauthenticated, and imported issue reconciliation remains a later explicit policy. Across-process replay may incur duplicate provider requests, but atomic completion identity prevents duplicate persisted results. No history-reset mechanism exists or is needed.

Local commit authorized: `feat: integrate persistent end-to-end golden path`. No additional decision is required. Next recommendation only: `BL-AIBC-WU-09-GOOGLE-SHEETS-CONNECTOR`; WU-09/WU-10 were not started.
