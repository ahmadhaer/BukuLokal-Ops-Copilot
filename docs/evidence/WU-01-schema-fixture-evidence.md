# WU-01 schema and fixture evidence

Work Unit: BL-AIBC-WU-01-SYNTHETIC-DATA-CANONICAL-SCHEMA-V0.1. Captured from commands executed during this Work Unit on 2026-10-12 (Asia/Jakarta).

Branch: `wu/01-synthetic-data-canonical-schema`. Baseline: `478466d1dc66c81271b3325356f612a09e85caf8` — `chore: bootstrap AI Builder Cup foundation and canonical governance`.

## Pre-mutation verification

### `pwd`

```text
/workspace/BukuLokal-Ops-Copilot
```

Exit code: 0.

### `git rev-parse --show-toplevel`

```text
/workspace/BukuLokal-Ops-Copilot
```

Exit code: 0.

### `git remote -v`

```text
origin	https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git (fetch)
origin	https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git (push)
```

Exit code: 0.

### `git branch --show-current`

```text
wu/00-repository-governance-bootstrap
```

Exit code: 0.

### `git status --short`

```text

```

Exit code: 0.

### `git log --oneline --decorate --all -10`

```text
478466d (HEAD -> wu/00-repository-governance-bootstrap) chore: bootstrap AI Builder Cup foundation and canonical governance
08cb126 (origin/main, work) Initial commit
```

Exit code: 0.

### `git branch --list wu/01-synthetic-data-canonical-schema`

```text

```

Exit code: 0.

## Initial install and validation attempt

### `npm ci`

```text

added 401 packages in 7s
npm warn deprecated eslint@9.39.5: This version is no longer supported. Please see https://eslint.org/version-support for other options.
```

Exit code: 0.

### `npm run lint`

```text

> bukulokal-ops-copilot@0.1.0 lint
> eslint .
```

Exit code: 0.

### `npm run typecheck`

```text

> bukulokal-ops-copilot@0.1.0 typecheck
> tsc --noEmit

tests/unit/domain/schemas.test.ts(91,76): error TS2737: BigInt literals are not available when targeting lower than ES2020.
```

Exit code: 2.

## Final validation after supported correction

### `npm run lint`

```text

> bukulokal-ops-copilot@0.1.0 lint
> eslint .
```

Exit code: 0.

### `npm run typecheck`

```text

> bukulokal-ops-copilot@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  3 passed (3)
      Tests  65 passed (65)
   Start at  16:53:42
   Duration  299ms (transform 48%, import 28%, tests 23%, worker 2%)
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 15ms

  Creating an optimized production build ...
✓ Compiled successfully in 196ms
  Running TypeScript ...
  Finished TypeScript in 1016ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 255ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found


○  (Static)  prerendered as static content
```

Exit code: 0.

### `git diff --check`

```text

```

Exit code: 0.

## Diagnosis and correction

The initial typecheck rejected a BigInt literal in an invalid-JSON test because the existing target is ES2017. Replaced the literal with `BigInt(1)`; did not change the compiler target or dependencies. Final lint, typecheck, tests, build, and diff check all exited 0. The npm ci ESLint support warning is retained verbatim above.

## Schema inventory

Canonical strict Zod 4 objects: Organization, DataSource, ImportSession, Order, ProductionJob, InventoryItem, Issue, Evidence, AIAnalysis, Action, AuditEvent, DemoDataset. All export inferred TypeScript types. Shared schemas/types: EntityId, OrganizationId, DateOnly, Timestamp, Quantity, QuantityUnit, CurrencyCode, SourceType, EntityType. Dates use calendar-valid YYYY-MM-DD; timestamps require explicit Z/offset. Quantities reject nonfinite values and coercion. Production enforces only completed <= planned integrity. CurrencyCode validates uppercase three-letter syntax; no currency registry is implemented. AIAnalysis.output is a JSON-compatible record, not a Gemini response validator. Aggregate shape validation does not implement a relationship engine.

## Fixture inventory

One fictional ORG-001 (ABC Apparel Manufacturing), one synthetic_demo source, one validated import session, 12 orders, 12 corresponding production jobs, 12 inventory records. asOfDate: 2026-10-12; timezone: Asia/Jakarta; timestamps: 2026-10-12T08:00:00+07:00. All IDs and quantities are static. Issues, evidence, aiAnalyses, actions, and auditEvents are empty.

SO-001: Classic T-Shirt; ordered 500 pcs; due 2026-10-14; in_production. Production: planned 500 pcs, completed 150 pcs. Related material Fabric A: required 500 pcs, available 300 pcs. No derived completion, shortage, deadline distance, or severity is stored. Remaining records include zero/partial/near/full production, near/future dates, sufficient/insufficient/equal/zero inventory.

## Test coverage

52 schema tests cover all entity contracts, invalid quantities/dates/timestamps/status, production bounds, nullable inventory correlation, strict unknown-key rejection, generic JSON compatibility, and shared values. 11 fixture tests cover parsing, exact inventory/SO-001 contract, unique IDs, organization/order/source/import references, raw diversity, empty downstream collections, anti-leakage, and fictional identities/timezone. Existing homepage tests: 2. Final suite: 65 passed across 3 files. Synthetic schema test objects for future contracts are unit-test inputs only, not demo issues/actions.

## Secret/privacy scan

Method: enumerate tracked plus untracked non-ignored project files; inspect private-key, Google/AWS/GitHub token, service-account, and credential-assignment patterns without printing matched values. Parse fixture literals and inspect identity/name strings for email/phone patterns; check synthetic customer labels and static-date/no-randomness constraints.

```text
PASS: 50 project files scanned for credential patterns; no matches. Fixture identities have no email/phone patterns, all customers explicitly synthetic, fixed dates and no runtime clock/randomness. PRD, LICENSE, package declarations/lockfile, README and ARCHITECTURE unchanged; original ADRs preserved.
```

Pattern scans support review; no claim is made about unobserved external data.

## Scope confirmation

Only canonical contracts, static synthetic source data, schema/fixture tests, CHANGELOG, ADR-013, and this evidence file were added/changed. Removed the empty src/domain/.gitkeep because the directory now contains source. No parser, normalization, upload route, calculations, issue/evidence generation, Gemini runtime/output contract, database, dashboard, or deployment. WU-02 has not started. No dependency upgrade, source reuse, push, PR, merge, tag, release, remote modification, or cloud provisioning occurred.

## Pre-commit files and diff review

The staged summary includes every new source/test file. It was captured before appending this section, so this evidence file subsequently gains lines.

### `git branch --show-current`

```text
wu/01-synthetic-data-canonical-schema
```

Exit code: 0.

### `git status --short`

```text
M  CHANGELOG.md
M  DECISIONS.md
A  docs/evidence/WU-01-schema-fixture-evidence.md
D  src/domain/.gitkeep
A  src/domain/actions/schema.ts
A  src/domain/ai-analysis/schema.ts
A  src/domain/audit/schema.ts
A  src/domain/common/schema.ts
A  src/domain/data-sources/schema.ts
A  src/domain/demo/abc-apparel.ts
A  src/domain/demo/schema.ts
A  src/domain/evidence/schema.ts
A  src/domain/imports/schema.ts
A  src/domain/index.ts
A  src/domain/inventory/schema.ts
A  src/domain/issues/schema.ts
A  src/domain/orders/schema.ts
A  src/domain/organizations/schema.ts
A  src/domain/production/schema.ts
A  tests/unit/domain/fixture.test.ts
A  tests/unit/domain/schemas.test.ts
```

Exit code: 0.

### `git diff --stat`

```text

```

Exit code: 0.

### `git diff --cached --stat`

```text
 CHANGELOG.md                                   |   7 +
 DECISIONS.md                                   |   6 +
 docs/evidence/WU-01-schema-fixture-evidence.md | 209 +++++++++++++
 src/domain/.gitkeep                            |   0
 src/domain/actions/schema.ts                   |  15 +
 src/domain/ai-analysis/schema.ts               |  14 +
 src/domain/audit/schema.ts                     |  14 +
 src/domain/common/schema.ts                    |  25 ++
 src/domain/data-sources/schema.ts              |  13 +
 src/domain/demo/abc-apparel.ts                 | 405 +++++++++++++++++++++++++
 src/domain/demo/schema.ts                      |  31 ++
 src/domain/evidence/schema.ts                  |  14 +
 src/domain/imports/schema.ts                   |  13 +
 src/domain/index.ts                            |  14 +
 src/domain/inventory/schema.ts                 |  15 +
 src/domain/issues/schema.ts                    |  15 +
 src/domain/orders/schema.ts                    |  16 +
 src/domain/organizations/schema.ts             |  15 +
 src/domain/production/schema.ts                |  17 ++
 tests/unit/domain/fixture.test.ts              | 123 ++++++++
 tests/unit/domain/schemas.test.ts              | 123 ++++++++
 21 files changed, 1104 insertions(+)
```

Exit code: 0.

### `git diff --cached --name-status`

```text
M	CHANGELOG.md
M	DECISIONS.md
A	docs/evidence/WU-01-schema-fixture-evidence.md
D	src/domain/.gitkeep
A	src/domain/actions/schema.ts
A	src/domain/ai-analysis/schema.ts
A	src/domain/audit/schema.ts
A	src/domain/common/schema.ts
A	src/domain/data-sources/schema.ts
A	src/domain/demo/abc-apparel.ts
A	src/domain/demo/schema.ts
A	src/domain/evidence/schema.ts
A	src/domain/imports/schema.ts
A	src/domain/index.ts
A	src/domain/inventory/schema.ts
A	src/domain/issues/schema.ts
A	src/domain/orders/schema.ts
A	src/domain/organizations/schema.ts
A	src/domain/production/schema.ts
A	tests/unit/domain/fixture.test.ts
A	tests/unit/domain/schemas.test.ts
```

Exit code: 0.

### `git diff --check`

```text

```

Exit code: 0.

### `git diff --cached --check`

```text

```

Exit code: 0.

## Final evidence whitespace correction

After appending the pre-commit snapshot, the staged check reported `docs/evidence/WU-01-schema-fixture-evidence.md:331: new blank line at EOF.` The shell sequence still created the main commit. Removed the excess final blank line and preserved the main commit rather than rewriting history. This follow-up documentation correction is checked across the complete WU-01 diff against the baseline before committing.
