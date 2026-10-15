# BukuLokal Ops Copilot

**AI Builder Cup 2026 — Manufacturing / Intelligent Operations**

BukuLokal Ops Copilot is a fresh standalone hackathon prototype for small-manufacturer operational decision support. It turns order, inventory, procurement, and production data into deterministic issue detection, evidence-grounded AI guidance, and human-approved internal actions.

> Core operating model: **Data → Detect Problem → AI Explains → AI Recommends → Human Approves → Action**

This repository is intentionally scoped as an operations copilot rather than a full ERP or a generic chatbot.

## Current development status

The MVP is implemented and deployed to Google Cloud Run. The deterministic operations path, CSV/XLSX import workflow, Firestore persistence, Human Gate, activity/audit reconstruction, Vertex AI integration, and safe server-side AI diagnostics are implemented.

The original live Vertex `400 INVALID_ARGUMENT` blocker has been isolated and mitigated. The exact production response schema was accepted only after provider-facing array cardinality constraints (`minItems` / `maxItems`) were omitted; the authoritative Zod constraints remain enforced locally. Provider latency has also shown intermittent `504 DEADLINE_EXCEEDED`, so the current code uses one bounded SDK retry for transient HTTP failures while preserving a 30-second timeout per attempt.

The live application has successfully produced and persisted an AI recommendation. WU-10E persisted-AI-state UX clarification has passed local verification. Remaining work before closing WU-10 is **deployment of that UX clarification and final live golden-path verification**.

### Work-unit status

| Work unit / capability | Status |
| --- | --- |
| WU-00–WU-08 core MVP | ✅ PASS |
| WU-09 Google Sheets integration | ⏸ Deferred to P1 |
| WU-10A Vertex schema compatibility | ✅ PASS |
| WU-10B safe AI diagnostics | ✅ PASS |
| WU-10C array-constraint compatibility fix | ✅ PASS |
| WU-10D bounded transient retry | ✅ PASS |
| WU-10E persisted-AI-state UX clarification | ✅ PASS locally / awaiting live deployment verification |
| Final live golden-path closure | 🟡 Pending live verification |
| WU-11 final QA / submission readiness | ⏳ Pending |

### Current verified code baseline

Latest locally verified implementation commit, rebased onto remote documentation baseline `2f094e54cd5b510e6cfe5e49236797cf26fe80a9`:

```text
74c167c83c054790befd7e31c289ecd3f1421fe1
fix: clarify persisted AI analysis state
```

Latest local verification reported for that code baseline:

- **434 tests passed across 48 files**
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `git diff --check` — PASS

The active development branch is:

```text
wu/10-google-cloud-live-deployment
```

## Live application

Cloud Run service:

```text
https://bukulokal-ops-copilot-761334564667.asia-southeast2.run.app
```

The service is public for hackathon demonstration purposes. It uses a dedicated Cloud Run runtime service account and Application Default Credentials; no service-account JSON key is stored in this repository.

## Capability snapshot

| Capability | Status |
| --- | --- |
| Responsive Next.js application | ✅ Implemented |
| CSV / XLSX preview, mapping, validation, reviewed save | ✅ Implemented |
| Deterministic operational calculations | ✅ Implemented |
| Issue detection and canonical evidence | ✅ Implemented |
| SO-001 deterministic golden-path facts | ✅ Implemented |
| Firestore persistence | ✅ Live verified |
| Human approval / edit / reject gate | ✅ Implemented |
| Activity / audit history | ✅ Implemented |
| Refresh durability | ✅ Persistence-backed |
| Cloud Run deployment | ✅ Live |
| Direct Vertex Gemini structured-output smoke test | ✅ Live verified |
| Safe server-side AI diagnostics | ✅ Deployed |
| In-application Gemini analysis | ✅ Has succeeded live; final repeatable golden-path closure still pending |
| Bounded retry for transient Vertex failures | ✅ Implemented |
| Google Sheets integration | ⏸ Deferred to P1 |
| External autonomous execution | ❌ Intentionally not implemented |
| Authentication | ❌ Not part of the current hackathon MVP |

## Product behavior

The MVP is designed around a strict separation between deterministic business truth and advisory AI.

### Deterministic layer

The application calculates operational facts and issue severity in code. The LLM is not allowed to calculate or override authoritative business truth.

For the canonical `SO-001` scenario, the application derives:

- Order quantity: **500 pcs**
- Completed production: **150 pcs**
- Completion: **30%**
- Remaining production: **350 pcs**
- Required material: **500 pcs**
- Available material: **300 pcs**
- Material shortage: **200 pcs**
- Deadline: **2 days remaining**

### AI advisory layer

Gemini receives only bounded issue context and approved evidence. AI output is constrained to structured advisory content and is validated again locally before anything can be persisted.

The AI must not:

- invent operational facts;
- override issue type or severity;
- cite unknown evidence;
- claim an external action already happened;
- automatically contact suppliers or customers;
- bypass human approval.

### Human Gate

Suggested actions remain internal drafts until a human explicitly approves, edits, or rejects them. Approval does **not** trigger an external email, order update, supplier contact, or autonomous execution.

## Live AI reliability work completed

### WU-10A — schema compatibility

The provider-facing schema sanitizer was tightened after Vertex rejected unsupported / incompatible JSON-schema keywords. This removed the earlier `pattern` compatibility issue while preserving authoritative local validation.

### WU-10B — safe diagnostics

Server-side diagnostics were added to classify failures across provider request/transport/response, parsing, schema validation, grounding, action compatibility, record validation, input validation, and persistence. Logs intentionally exclude prompts, full evidence payloads, model output, credentials, and raw sensitive provider messages.

### WU-10C — array cardinality compatibility

Controlled live probes showed:

```text
exact production schema                       → 400 INVALID_ARGUMENT
without additionalProperties                  → 400 INVALID_ARGUMENT
without minItems / maxItems                    → PASS
without both groups                            → PASS
```

Therefore `minItems` and `maxItems` are omitted only from the provider-facing JSON schema. The authoritative Zod schema still enforces the original array bounds locally.

### WU-10D — bounded transient retry

Controlled tests showed that simply raising the timeout was not a deterministic fix: 30-second requests could succeed while a 60-second request could still fail with `504 DEADLINE_EXCEEDED`.

The current retry policy is therefore deliberately bounded:

```text
timeout per HTTP attempt: 30,000 ms
maximum attempts:         2 total
initial delay:            1 second
maximum delay:            2 seconds
backoff factor:           2
jitter:                   0
retryable HTTP status:    408, 429, 500, 503, 504
```

Permanent / non-transient statuses such as 400, 401, 403, and 404 are not retried.

## Persisted AI state UX clarification (WU-10E)

**PASS locally / awaiting live deployment verification.** Persisted AI analysis is intentionally restored from durable storage when an issue page is reopened. Opening the page does not automatically invoke AI.

- Never-analyzed issue: **Analyze with AI**, without a restored-analysis notice.
- Restored successful result: **Previous AI analysis**, with **This analysis was previously generated and restored from persistent storage.**
- Existing successful analysis: **Analyze Again with AI**.
- Successful analysis requested in the current page interaction: the normal recommendation and **Analyze Again with AI**, without restored-from-storage wording for that immediate result.
- Existing recommendation action: disabled **Suggested action already created**; duplicate suggested-action creation remains prevented. Recommendations without an action remain actionable.

The distinction uses local component state only. No AI, Firestore schema, persistence, deterministic, grounding, or Human Gate contracts changed. Durable AI/action history is retained; no automatic reset or deletion was added.

## Golden-path demo

The intended demonstration flow is:

1. Open the landing page and choose **Try Demo**.
2. Load the persisted canonical demo workspace.
3. Review the dashboard baseline:
   - 12 Orders
   - 5 At Risk
   - 5 Material Shortages
   - 2 Critical Issues
4. Open **SO-001 may miss its deadline**.
5. Verify deterministic facts before AI:
   - Critical
   - 30% complete
   - 350 pcs remaining
   - 200 pcs material shortage
   - 2 days remaining
6. Select **Analyze with AI** (or **Analyze Again with AI** when a prior analysis is restored).
7. Review the grounded recommendation.
8. Create a suggested internal action if needed; an existing action is identified as **Suggested action already created**.
9. Approve, edit, or reject it through the Human Gate.
10. Open **Activity** and verify the audit trail.
11. Refresh and verify that persisted analysis, action state, and audit history survive reload.

Final WU-10 closure requires a clean demonstration of this path on the live deployment with the locally verified WU-10E UX clarification.

## Architecture

```text
Browser / Responsive Web UI
        │
        ▼
Next.js App Router + Server Actions
        │
        ├── Import pipeline
        │     CSV / XLSX
        │     → preview
        │     → mapping
        │     → normalize / validate
        │     → reviewed save
        │
        ├── Deterministic operations engine
        │     → facts
        │     → issues
        │     → severity
        │     → evidence
        │
        ├── AI advisory boundary
        │     → bounded evidence input
        │     → Gemini on Vertex AI
        │     → structured response
        │     → Zod validation
        │     → grounding validation
        │     → allowed-action validation
        │
        ├── Human Gate
        │     → suggested
        │     → edit / approve / reject
        │
        └── Firestore persistence
              → workspace
              → analyses
              → actions
              → audit events
```

## Technology stack

- **Next.js 16.4** / React 19
- **TypeScript 6**
- **Tailwind CSS 4**
- **Zod 4**
- **Google Gen AI SDK (`@google/genai`)**
- **Google Cloud Firestore**
- **Google Cloud Run**
- **Papa Parse** for CSV
- **ExcelJS** for XLSX
- **Vitest** for automated verification

## Local development

### Requirements

- Node.js **24.x**
- npm

Install dependencies:

```bash
npm ci
```

Start development:

```bash
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Available scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create the production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run the Vitest test suite |

## Cloud configuration

Server-side Vertex AI requires:

```text
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
GEMINI_MODEL=
```

Firestore uses `GOOGLE_CLOUD_PROJECT` plus Application Default Credentials / the Cloud Run runtime identity.

See `.env.example` for the documented environment contract.

Never commit:

- service-account JSON keys;
- access tokens;
- real `.env` files;
- cloud credentials;
- customer secrets.

## Persistence and safety model

The production composition uses Firestore-backed persistence. The application does not silently fall back to an in-memory fake database in production.

Key safeguards include:

- organization-scoped document paths;
- validated canonical identifiers;
- explicit reference validation;
- atomic writes where required;
- no implicit overwrite during imports;
- safe duplicate/conflict behavior;
- persisted analysis, suggestions, decisions, and audit history;
- no automatic deletion of decision history to hide failures.

## Repository governance

This project was created as a fresh standalone hackathon implementation. It does not submit prior BukuLokal / Urban & Corp Business OS production code or proprietary historical assets as the hackathon solution.

Development follows evidence-based work units and explicit gates. A passing local test suite is not treated as proof of live-cloud behavior; Firestore, Vertex AI, and Cloud Run behavior are verified separately.

Key documents:

- [PRD.md](PRD.md) — canonical product baseline
- [ARCHITECTURE.md](ARCHITECTURE.md) — architecture and implementation boundaries
- [DECISIONS.md](DECISIONS.md) — architecture decision records
- [CHANGELOG.md](CHANGELOG.md) — project changes
- [FRESHNESS.md](FRESHNESS.md) — fresh-project provenance boundary
- [docs/demo-runbook.md](docs/demo-runbook.md) — deterministic demo procedure
- [docs/end-to-end-golden-path.md](docs/end-to-end-golden-path.md) — integrated golden-path design
- [docs/evidence/WU-10A-vertex-schema-compatibility.md](docs/evidence/WU-10A-vertex-schema-compatibility.md) — Vertex schema evidence
- [docs/evidence/WU-10C-vertex-array-constraint-compatibility.md](docs/evidence/WU-10C-vertex-array-constraint-compatibility.md) — array-constraint compatibility evidence
- [docs/evidence/WU-10D-bounded-vertex-retry.md](docs/evidence/WU-10D-bounded-vertex-retry.md) — bounded retry evidence
- [docs/evidence/WU-10E-persisted-ai-state-ux.md](docs/evidence/WU-10E-persisted-ai-state-ux.md) — persisted-analysis UX and local verification evidence

## Current next step

1. Publish and deploy the locally verified WU-10E revision through the authorized deployment workflow.
2. Verify the restored/current-page analysis distinction and duplicate-action explanation live.
3. Run the complete live golden path, including Human Gate, Activity, and refresh durability.
4. Close WU-10 only after the live evidence passes.
5. Proceed to WU-11 final QA, demo readiness, README finalization, and the AI Builder Cup submission package; WU-11 remains pending.

## License

See [LICENSE](LICENSE).
