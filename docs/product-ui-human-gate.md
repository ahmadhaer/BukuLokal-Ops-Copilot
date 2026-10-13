# Product UI and Human Gate

WU-06 adds a Next.js App Router product journey using the existing React and Tailwind stack. `/` introduces the product; `/data` offers the fictional demo, CSV/XLSX upload, and an explicitly disabled P1 Google Sheets option. `/demo` shows derived metrics; `/issues` filters open issues; `/issues/[id]` separates canonical evidence from AI advice. `/actions` and `/activity` share root session state. `/import` previews and validates files.

## Authoritative data and server boundary

`buildDemoWorkspace` runs the existing synthetic fixture through WU-03 operational facts and WU-04 detection. It derives order count, unique delay-risk orders, open material shortages, and open critical issues. Issue order is severity, calendar deadline, then stable identifier. The demo uses its explicit canonical as-of date and a fixed detection timestamp. No fact is calculated by Gemini or hardcoded in a component.

Server Actions reconstruct the selected issue and bounded evidence on the server. Only an issue identifier crosses the analysis request boundary. `server-only` guards protect the real WU-05 provider and import services. Configuration presence is not a claim that live inference works: unconfigured, unavailable, invalid, loading, and successful states are separate. Production never substitutes a fake provider. The fake provider is dependency injection in tests only. URL identifiers are decoded once at the route boundary, with malformed encoding handled safely.

## Human review

Pure functions create a canonical suggested Action from a validated AIAnalysis recommendation and retain analysis ID, recommendation index, and original draft alongside it. Allowed transitions are suggested → edited → approved/rejected and suggested → approved/rejected. Edited actions may be edited again; terminal actions cannot be changed. Approval records the explicit actor and timestamp; edit preserves a user-modified marker. Canonical AuditEvents cover analysis completion, suggestion, edit, approval, and rejection. Context includes an explicit sequence to distinguish repeated events at the same timestamp.

The UI supplies boundary timestamps and uses synthetic actor `demo-owner`. The root React provider preserves actions/events during client navigation; refresh resets them. It provides no authentication or durable audit guarantee. “Nothing will be sent automatically.” appears in human review. Approval does not call any supplier, webhook, messaging service, database, or external business system.

## File review

CSV and XLSX pass through existing WU-02 parsing, mapping, and normalization. Files are checked at both boundaries (5 MiB; existing 5,000-row/parser limits). Next Server Actions allow 6 MB for multipart overhead. Preview supports sheet selection, controlled column mappings, explicit unit/update-time defaults, and affirmative confirmation. Ambiguous dataset types require user selection. Validation reparses the original file and does not trust browser preview rows. Data Health shows valid/invalid row counts and row/field problems. These records never enter the demo dashboard or persistence.

## Accessibility and responsive behavior

Native buttons, links, inputs, labels, semantic headings/tables, skip navigation, visible focus states, status/alert announcements, disabled pending controls, and empty/error states support keyboard use. CSS adapts metric/evidence/card/mapping grids at tablet/mobile widths. Desktop, tablet, and mobile screenshots plus overflow/label checks are recorded in WU-06 evidence. This is not a formal WCAG certification.

## Verification and boundaries

Vitest uses a test-only alias for the `server-only` marker. Fake-provider UI integration tests exercise the complete demo → selected issue → analysis → suggestion → approval → activity journey, editing/rejection, loading/failure, filters, and file validation. Existing domain/import/AI code is unchanged. Server Actions are the sole integration transport; no API routes, Firestore, authentication, Sheets, external execution, cloud resources, or WU-07 implementation are introduced.
