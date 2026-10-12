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
