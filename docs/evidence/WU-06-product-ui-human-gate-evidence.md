# WU-06 Product UI and Human Gate evidence

## Identity and authorization

Repository: `ahmadhaer/BukuLokal-Ops-Copilot`, origin `https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git`, workspace `/workspace/BukuLokal-Ops-Copilot`. Clean WU-05 baseline: `c3e8887964f1610bafe712b95997b589ba04fc06`. Work branch: `wu/06-product-ui-human-gate`. Initial checks are preserved in [workspace-baseline.json](WU-06/workspace-baseline.json). User authorizes this work unit and a local commit only; no push or remote mutation.

## Screens and derived evidence

Implemented `/`, `/data`, `/demo`, `/issues`, `/issues/[id]`, `/actions`, `/activity`, `/import`. Production HTTP checks returned 200 for all seven fixed routes; Chromium followed the actual SO-001 delay issue link and rendered the detail. [Browser checks](WU-06/browser-checks.json) record body text, document widths, label checks, and HTTP status.

The existing fixture → operational facts → detection pipeline produces 12 orders, 5 unique at-risk orders, 5 open material shortages, and 2 open critical issues. The SO-001 delay detail renders canonical evidence: 30% production completion, 200 pcs shortage, 2 days remaining. Evidence and AI advice occupy separate panels. Existing severity/deadline/stable-ID ordering places the SO-001 material issue first; tests explicitly select the delay issue rather than relying on card position.

Screenshots: [desktop dashboard](WU-06/dashboard-desktop.png), [mobile dashboard](WU-06/dashboard-mobile.png), [tablet import](WU-06/import-tablet.png), [SO-001 evidence and unavailable AI](WU-06/issues-desktop.png), [production import health](WU-06/import-health-desktop.png). These were generated with the existing Chromium and inspected. Widths 1280, 768, and 390 had no horizontal overflow; form controls had labels. Keyboard-focused roles, confirmation controls, disabled states, skip navigation, and readable headings are covered by markup/UI tests. No automated WCAG certification is claimed.

## AI and human review

No verified live Gemini configuration is available. Production displays “AI analysis is not configured in this environment” while retaining evidence. No live inference was attempted and no runtime fake exists. Successful, unavailable, invalid, and loading behavior is tested through injected fake providers using the real analysis service and grounding validators.

Two golden tests cover landing → dashboard → SO-001 delay → analysis → validated suggestion → approve → Activity, and edited-draft rejection. Eight pure gate tests cover provenance, explicit actor/timestamp, suggestions, edit/approve/reject, unsupported recommendations, terminal guards, and audit-ID uniqueness. Audit records are canonical; modified draft metadata remains separate from AI output. Approval is internal only, with “Nothing will be sent automatically.” No external executor exists.

## Import

Five UI tests cover CSV preview/mapping/default confirmation, XLSX sheet selection, invalid rows, ambiguous dataset-kind selection, and unsupported files. Services reparse source bytes and use existing canonical mapping/normalization. Chromium also uploaded the existing synthetic `orders.csv` to the production Server Action, selected the explicit `pcs` unit default, confirmed mapping, and rendered Data Health; [rendered text](WU-06/production-import.txt) records the result. Imported records are preview-only and never update the dashboard.

## Validation

[Raw command output](WU-06/validation.json) records successful `npm ci`, lint, typecheck, targeted UI/gate/import/golden suites, complete regression suite, production build, and diff check. After the browser exposed encoded Next.js route params, the boundary was corrected and two regression tests were added; final lint, typecheck, service/route tests, all tests, build, and diff check passed again.

| Suite | Passed |
| --- | ---: |
| Product UI | 8 |
| Human Gate | 8 |
| Import UI | 5 |
| Golden flow | 2 |
| Server services | 6 |
| Route boundary | 2 |
| Full suite | 291 in 28 files |

Existing 260 tests remain passing, including the two homepage contracts deliberately updated from the authorized bootstrap screen to the product landing/CTAs. Domain, import, operations, issue, and AI regression contracts were not weakened. Source paths `src/domain`, `src/ai`, `src/features/imports`, `docs/adr`, and `LICENSE` have no baseline diff.

## Secret and scope review

[Secret/scope results](WU-06/secret-scope-check.json) record a source scan for private-key blocks, API-key/token patterns, and service-account documents; no matches. Client JavaScript scan found no server-only project/location/model variable names, credential path markers, ADC document markers, service-account details, SDK/auth-library strings, or private-key fields. Browser evidence contains synthetic data only.

Added dependencies: runtime `server-only@0.0.1`; dev `@testing-library/react@16.3.3`, `@testing-library/user-event@14.6.8`, `jsdom@30.1.2`. Existing direct versions are unchanged. npm reported existing ecosystem deprecations; no dependency upgrade outside scope was performed.

Review covered tracked diff and all new source files. No Firestore, Firebase persistence, Sheets integration, OAuth, authentication, external messaging, webhook, automatic supplier contact, API routes, GCP provisioning, deployment, push, PR, merge, tag, or release was added. Downloading authorized npm dependencies and loopback browser/server tests occurred; no network inference or external business mutation occurred.

## Recorded decisions and limits

Server Actions provide the integration boundary; the upload limit is 5 MiB with 6 MB transport allowance. A root React session stores canonical actions/audit events with synthetic actor `demo-owner`. Refresh resets state, and this is not an authenticated/durable approval system. Defaults and ambiguous mapping require explicit confirmation. Production AI remains optional/configuration-dependent. Human review functions receive explicit timestamps and event sequence. WU-07 was not started. Next recommendation: `BL-AIBC-WU-07-FIRESTORE-PERSISTENCE`.
