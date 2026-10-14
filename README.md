# BukuLokal Ops Copilot

**AI Builder Cup 2026 — Manufacturing / Intelligent Operations**

BukuLokal Ops Copilot is a fresh standalone hackathon prototype for small-manufacturer operational decision support. It turns order, inventory, procurement, and production data into deterministic issue detection, evidence-grounded AI guidance, and human-approved internal actions.

> Core operating model: **Data → Detect Problem → AI Explains → AI Recommends → Human Approves → Action**

This repository is intentionally scoped as an operations copilot rather than a full ERP or a generic chatbot.

## Current MVP status

The application MVP is implemented and deployed to Google Cloud Run. The deterministic operational path, persistence, import workflow, Human Gate, and diagnostic instrumentation are working. The remaining active blocker is the live in-application Gemini request path: the application currently receives a Vertex AI `400 ApiError` at the provider-request stage. Direct Vertex Gemini smoke tests succeed, so the current investigation is focused on the exact production request payload rather than model availability, Firestore, networking, or IAM.

| Capability | Status |
| --- | --- |
| Responsive Next.js application | ✅ Implemented |
| CSV / XLSX import preview, mapping, validation, and reviewed save | ✅ Implemented |
| Deterministic operational calculations | ✅ Implemented |
| Issue detection and canonical evidence | ✅ Implemented |
| SO-001 deterministic golden-path facts | ✅ Implemented |
| Firestore persistence | ✅ Live verified |
| Human approval / edit / reject gate | ✅ Implemented |
| Activity / audit history and refresh durability | ✅ Implemented locally and persistence-backed |
| Cloud Run deployment | ✅ Live |
| Direct Vertex Gemini structured-output smoke test | ✅ Live verified |
| Safe server-side AI diagnostics | ✅ Deployed |
| In-application Gemini analysis | ⚠️ Active diagnosis — Vertex provider request returns HTTP 400 |
| Google Sheets integration | ⏸ Deferred to P1 |
| External autonomous execution | ❌ Intentionally not implemented |
| Authentication | ❌ Not part of the current hackathon MVP |

### Verification baseline

Latest local verification on the active deployment branch:

- **410 tests passed across 46 files**
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- Cloud Run revision with AI diagnostics deployed
- Firestore live create/read/delete smoke test — PASS
- Direct Vertex Gemini `gemini-3.5-flash` smoke test — PASS

The current working branch is:

```text
wu/10-google-cloud-live-deployment
```

## Live application

Cloud Run service:

```text
https://bukulokal-ops-copilot-761334564667.asia-southeast2.run.app
```

The service is public for hackathon demonstration purposes. It uses a dedicated Cloud Run runtime service account and Application Default Credentials; no service-account JSON key is stored in this repository.

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
6. Select **Analyze with AI**.
7. Review the grounded recommendation.
8. Approve, edit, or reject the suggested internal action.
9. Open **Activity** and verify the audit trail.
10. Refresh the application and confirm persistence survives reload.

At the time of this README update, step 6 is the active live-cloud blocker and is being diagnosed with safe server-side instrumentation.

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

## AI diagnostics

The current deployment includes safe server-side diagnostics for the live AI path. Diagnostics can distinguish failures across:

- provider request;
- provider transport;
- provider response;
- JSON parsing;
- Zod schema validation;
- grounding validation;
- action compatibility;
- record validation;
- input validation;
- persistence.

Diagnostics intentionally exclude raw prompts, full evidence payloads, full model output, credentials, access tokens, and service-account secrets.

The current observed live failure is:

```text
stage: provider_request
errorCode: AI_PROVIDER_ERROR
providerStatus: 400
sdkErrorName: ApiError
model: gemini-3.5-flash
promptVersion: issue-analysis-v1
```

This means the current blocker occurs before response parsing, grounding validation, action compatibility, or persistence.

## Repository governance

This project was created as a fresh standalone hackathon implementation. It does not submit prior BukuLokal / Urban & Corp Business OS production code or proprietary historical assets as the hackathon solution.

Development follows evidence-based work units and explicit gates. A passing local test suite is not treated as proof of live-cloud behavior; live Firestore, Vertex AI, and Cloud Run behavior are verified separately.

Key documents:

- [PRD.md](PRD.md) — canonical product baseline
- [ARCHITECTURE.md](ARCHITECTURE.md) — architecture and implementation boundaries
- [DECISIONS.md](DECISIONS.md) — architecture decision records
- [CHANGELOG.md](CHANGELOG.md) — project changes
- [FRESHNESS.md](FRESHNESS.md) — fresh-project provenance boundary
- [docs/demo-runbook.md](docs/demo-runbook.md) — deterministic demo procedure
- [docs/end-to-end-golden-path.md](docs/end-to-end-golden-path.md) — integrated golden-path design
- [docs/evidence/WU-10A-vertex-schema-compatibility.md](docs/evidence/WU-10A-vertex-schema-compatibility.md) — Vertex structured-schema investigation evidence

## Current next step

The next engineering step is to isolate the exact production Vertex request field or schema combination responsible for the HTTP 400 response, then re-run the complete live golden path:

```text
Data
→ deterministic issue
→ grounded Gemini analysis
→ suggested action
→ human approval
→ Activity audit
→ refresh durability
```

Only after that live path succeeds should the deployment milestone be considered fully complete.

## License

See [LICENSE](LICENSE).
