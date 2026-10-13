# Deterministic demo runbook

## Preconditions

Use the pinned Node 24 dependencies and `npm ci`. Run lint/typecheck/tests/build before the demo. The persistent runtime needs an existing Firestore database, suitable ADC/Cloud Run identity permissions, and `GOOGLE_CLOUD_PROJECT`. Gemini additionally needs `GOOGLE_CLOUD_LOCATION` and `GEMINI_MODEL`, with existing Vertex authorization. Keep credentials on the trusted server. Configuration presence does not prove cloud access. Provisioning/IAM/deployment belong to later gates.

An already running Firestore emulator may supply `FIRESTORE_EMULATOR_HOST`; production has no implicit localhost emulator. Automated tests need none of these settings. Current gate evidence has no live-cloud verification.

## Golden demonstration

1. Open Landing and select **Try Demo**. The server invokes idempotent canonical seeding and reload; repeat visits preserve history. Missing storage shows Workspace unavailable, rather than fake persisted success.
2. Dashboard baseline: **12 Orders / 5 At Risk / 5 Material Shortages / 2 Critical Issues**. These values are derived from persisted canonical demo sources.
3. Select the **SO-001 may miss its deadline** issue. The first critical card can be a material issue; choose the delay issue by title. Expect **Critical / 30% complete / 350 pcs remaining / 200 pcs shortage / 2 days remaining** before AI.
4. Select **Analyze with AI** explicitly. If AI configuration/provider/validation fails, evidence remains usable and no fake recommendation is saved. When configured and successful, analysis, suggested actions, and audits are stored together.
5. Review the suggested draft and select **Approve**, or **Edit** then approve/reject. Approval is internal only: **Nothing will be sent automatically.** `demo-owner` is synthetic and unauthenticated.
6. Open **Activity**. Expect actual internal analysis/suggestion/review events. Refresh `/actions` or `/activity`; the draft, terminal decision, explicit actor/time, edit marker, and audit should remain. No AI request is needed for reload.

Analyze clicks on the same issue page reuse an operation identity, including retry after failure. To start a new judging demonstration with a fresh suggestion, revisit/reload the issue page and explicitly analyze again. This creates another legitimate analysis operation; it does not erase approved history. Repeated Try Demo never resets anything.

## Import demonstration

Open Use My Data → Upload CSV/Excel. Preview the file, choose an XLSX sheet if needed, review dataset kind/columns, supply explicit defaults only where no column is mapped, and confirm mapping. Inspect Data Health before selecting **Save Valid Data**. Saving persists only valid records and reports the invalid rows excluded. Missing storage disables Save while preview/health remains available. Existing IDs and repeat import identifiers conflict safely; no overwrite is implicit.

Use at most 498 valid records per save (source + session + records ≤500 writes). Larger inputs fail before writes; split the file instead of relying on partial chunks. Imported data is saved, but operational issue refresh/reconciliation is a future step. Do not claim the demo dashboard includes imported insights.

## Repeated demos and recovery

No reset command or delete endpoint is provided. Seed is deterministic and create-only; historical decisions stay intact. A stale terminal action should be reloaded, not forced into another status. Corrupt/missing source/evidence produces a controlled error without automatic repair. Restore only through an independently authorized process; do not delete synthetic action/audit history to hide failures.

## Local evidence reproduction without cloud

`npm test -- tests/integration/application` runs explicitly injected network doubles through the approved application layers. The full UI test writes measured navigation timing to `/tmp/wu08-test-timing.json`.

For the optional browser evidence, use the existing Chromium CDP listener on port 9222, start a fresh **test-only** `node tests/browser/server.mjs` (loopback 4173), and start the Next production build on loopback 3003 with `npm run start -- --hostname 127.0.0.1 --port 3003`. Run `python3 docs/evidence/WU-08/browser-check.py` and `python3 docs/evidence/WU-08/production-import-check.py`. The test harness has isolated synthetic memory state; restarting that process affects no Firestore data. Production never selects it. Existing Python websockets/Chromium tooling is optional; do not install a new heavyweight E2E framework.

Timing evidence includes local test provider/transport overhead, not real Vertex latency. The target is ≤2 minutes from Landing to the first meaningful recommendation; record measured timing and cloud latency separately. This milestone is **HACKATHON_MVP_APPLICATION_INTEGRATED** only.
