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
