# BukuLokal Ops Copilot

AI Builder Cup 2026 — a fresh standalone prototype for operational decision support.

## Problem and prototype objective

The approved target addresses operational evidence and decision support: imported operational data should support deterministic calculations, issue evidence, and advisory AI recommendations subject to human approval. The complete owner-approved BL-AIBC-PRD-001 v0.1 is stored in [PRD.md](PRD.md); this summary does not substitute for it.

## Current implementation status

**Foundation / bootstrap only.**
**Product functionality not yet implemented.**

The homepage identifies the project and states this scope. No dashboard, manufacturing data, business engine, AI, integration, authentication, persistence, or deployment exists.

## Architecture

Next.js App Router with `src/`, React, strict TypeScript, Tailwind CSS, and Zod. The locked target includes CSV/XLSX import, a deterministic operations engine, issue evidence, Gemini via Google Gen AI SDK, human approval, Firestore, and Google Cloud Run (P0). Firebase Authentication is planned; Google Sheets read-only integration is P1. See [ARCHITECTURE.md](ARCHITECTURE.md) for target versus implemented status.

## Local development

Use Node.js 24 LTS (validated with 24.19.0) and npm. From the repository root:

```bash
npm ci
npm run dev
```

The development server defaults to port 3000. No external service or credential is required for WU-00. In the managed cloud environment, use a writable npm cache if the default home cache is unavailable: `export npm_config_cache=/workspace/.npm-cache`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint checks |
| `npm run typecheck` | Explicit `tsc --noEmit` |
| `npm test` | Run rendering smoke tests once |

Run lint, typecheck, tests, and build before WU-00 review. Commit the npm lockfile and use `npm ci` for reproducible installs.

## Environment-variable policy

`.env.example` is a documentation template with empty future-variable placeholders. The foundation consumes none of them. Never commit credentials or real `.env` files; `.env*` is ignored except `.env.example`. Future services must introduce their requirements within the relevant gated Work Unit.

## Freshness and scope boundaries

This is newly authored foundation code; do not copy prior BukuLokal, Urban & Corp Business OS, ACE, proprietary UI/assets, test fixtures, environment files, or implementation schemas. Retain Git provenance and the existing LICENSE. WU-00 ends at the foundation; later Work Units require independent gates and the canonical PRD. Do not implement WU-01 during bootstrap.

## Governance

- [FRESHNESS.md](FRESHNESS.md): observed provenance and freshness boundary
- [DECISIONS.md](DECISIONS.md): approved ADR-001 through ADR-012
- [PRD.md](PRD.md): complete canonical owner-approved build baseline
- [ARCHITECTURE.md](ARCHITECTURE.md): locked target and current implementation
- [CHANGELOG.md](CHANGELOG.md): factual changes
- [LICENSE](LICENSE): original repository license
