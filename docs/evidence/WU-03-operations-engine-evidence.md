# WU-03 deterministic operations engine evidence

Work Unit: BL-AIBC-WU-03-DETERMINISTIC-OPERATIONS-ENGINE-V0.1. Captured from actual commands on 2026-10-13 (Asia/Jakarta). Runner timestamps are preserved as reported.

Repository: ahmadhaer/BukuLokal-Ops-Copilot. Branch: `wu/03-deterministic-operations-engine`. Baseline: `69e3a01e6150b8850260c85ff507f9ab00e71180` — `feat: add deterministic CSV and XLSX import pipeline`.

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
wu/02-import-normalize-validate
```

Exit code: 0.

### `git status --short`

```text

```

Exit code: 0.

### `git log --oneline --decorate --all -20`

```text
69e3a01 (HEAD -> wu/02-import-normalize-validate) feat: add deterministic CSV and XLSX import pipeline
8b4bfe2 (wu/01-synthetic-data-canonical-schema) docs: correct WU-01 evidence trailing whitespace
a480697 feat: establish canonical manufacturing schemas and demo fixture
478466d (wu/00-repository-governance-bootstrap) chore: bootstrap AI Builder Cup foundation and canonical governance
08cb126 (origin/main, work) Initial commit
```

Exit code: 0.

### `git branch --list wu/03-deterministic-operations-engine`

```text

```

Exit code: 0.

## Initial engine validation

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

### `npm test -- tests/unit/operations`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/operations


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  4 passed (4)
      Tests  51 passed (51)
   Start at  04:51:42
   Duration  358ms (import 43%, transform 38%, tests 16%, worker 3%)
```

Exit code: 0.

## Final required validation and actual computed facts

### `npm ci`

```text

added 500 packages in 6s
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated fstream@1.0.12: This package is no longer supported.
npm warn deprecated uuid@8.3.2: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
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
```

Exit code: 0.

### `npm test -- tests/unit/operations/production.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/operations/production.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  04:53:40
   Duration  208ms (transform 57%, import 33%, tests 8%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/operations/materials.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/operations/materials.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  04:53:40
   Duration  161ms (import 49%, transform 37%, tests 12%, worker 3%)
```

Exit code: 0.

### `npm test -- tests/unit/operations/deadline.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/operations/deadline.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  04:53:41
   Duration  159ms (import 51%, transform 37%, tests 9%, worker 3%)
```

Exit code: 0.

### `npm test -- tests/unit/operations/dataset-facts.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/operations/dataset-facts.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  04:53:41
   Duration  178ms (import 40%, transform 31%, tests 27%, worker 2%)
```

Exit code: 0.

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  12 passed (12)
      Tests  186 passed (186)
   Start at  04:53:42
   Duration  943ms (import 51%, tests 25%, transform 22%, worker 2%)
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 20ms

  Creating an optimized production build ...
✓ Compiled successfully in 197ms
  Running TypeScript ...
  Finished TypeScript in 1146ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 253ms
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

### `node /tmp/wu03-compute.cjs`

```text
{
  "orderId": "SO-001",
  "organizationId": "ORG-001",
  "asOfDate": "2026-10-12",
  "production": {
    "orderId": "SO-001",
    "orderedQuantity": 500,
    "totalPlannedQuantity": 500,
    "totalCompletedQuantity": 150,
    "remainingQuantity": 350,
    "completionPercentage": 30,
    "quantityUnit": "pcs"
  },
  "materials": [
    {
      "inventoryItemId": "MAT-001",
      "relatedOrderId": "SO-001",
      "materialName": "Fabric A",
      "availableQuantity": 300,
      "requiredQuantity": 500,
      "shortageQuantity": 200,
      "unit": "pcs",
      "hasShortage": true
    }
  ],
  "deadline": {
    "orderId": "SO-001",
    "asOfDate": "2026-10-12",
    "dueDate": "2026-10-14",
    "daysToDeadline": 2
  }
}
Full fixture order count: 12
```

Exit code: 0.

## Computation runner provenance

The temporary runner transpiled the installed project TypeScript to CommonJS using the existing TypeScript dependency and directly invoked the actual engine against the unchanged canonical fixture. Its source is retained here for reproducibility; it did not substitute expected results or modify repository code.

```javascript
const fs = require('node:fs');
const { createRequire } = require('node:module');
const projectRequire = createRequire('/workspace/BukuLokal-Ops-Copilot/package.json');
const ts = projectRequire('typescript');
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  module._compile(output, filename);
};
const { abcApparelDataset } = projectRequire('./src/domain/demo/abc-apparel.ts');
const { buildOrderOperationalFacts, buildDatasetOperationalFacts } = projectRequire('./src/domain/operations/index.ts');
console.log(JSON.stringify(buildOrderOperationalFacts('SO-001', abcApparelDataset, abcApparelDataset.asOfDate), null, 2));
console.log('Full fixture order count:', buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate).length);
```

## Formulas and contracts

Production sums matching job planned/completed quantities, uses ordered quantity as the completion denominator, and computes remaining = ordered - completed. Numeric percentage = Math.round((completed / ordered) * 10000) / 100; positive ties round up. More completed than ordered raises COMPLETED_EXCEEDS_ORDERED, without clamping. Unit/organization mismatches, duplicate IDs, source-schema violations, and nonfinite aggregation produce typed errors. Zero jobs is a valid zero-completion state.

Material shortage = max(required - available, 0), one item at a time; hasShortage is exactly shortage > 0. Only explicit relatedOrderId matches attach to an order. Unscoped records are excluded and mixed units never sum. The single-order and dataset builders return derived views validated by strict Zod schemas, not canonical Issue/Evidence/persistence entities.

Deadline = due civil-day index minus explicit as-of civil-day index. No runtime business date is supplied. Integer Gregorian component arithmetic avoids Date/locale APIs. Arrays are copied and sorted by string IDs; source input is not mutated.

## Timezone methodology

Deadline tests temporarily selected UTC, Asia/Jakarta, America/New_York, and Pacific/Kiritimati, then restored the previous TZ setting. Both the SO-001 dates and a US DST-spanning date pair produced the same two-day difference in every selection. An implementation-level check verifies no Date constructor, Date.parse/UTC/now, Intl, locale or timezone-offset API exists in deadline.ts. Gregorian tests include leap day, non-leap century 1900, leap century 2000, year boundary, and years 0000/0099.

## Results and regression counts

Production: 13 passed; materials: 10 passed; deadlines: 19 passed; order/dataset: 9 passed. WU-03 targeted total: 51. Full suite: 186 passed across 12 files, including all 135 prior tests. Raw direct computation above reports SO-001 percentage 30, remaining 350 pcs, Fabric A shortage 200 pcs, deadline 2 calendar days, and full fixture count 12. A changed-input test produces different computed facts, supporting the absence of ID-specific hard-coded results.

## Secret/privacy and scope checks

Method: enumerate non-ignored tracked and untracked project files; inspect private-key markers, Google/AWS/GitHub credential shapes, service-account indicators, and literal credential assignments without printing values. Review newly introduced tests for synthetic identities and email patterns. Compare prior tracked files against baseline. Inspect operations source for executable scope leakage and hard-coded scenario IDs.

```text
PASS: 89 tracked/untracked non-ignored project files scanned; no credential-pattern matches. New tests use the canonical synthetic ABC Apparel fixture and explicit synthetic IDs/material names; no email or real customer/supplier/private data introduced. Every prior tracked file except CHANGELOG.md is byte-identical to baseline, including source schemas, import validation, original fixtures, package/lockfile, PRD/ADRs, homepage and LICENSE. Operations source contains no hard-coded SO-001, clock/random/network, severity/issue/evidence generation, AI, or persistence code.
```

No new dependencies or ADRs. No issue detection, severity, ranking, Evidence/Issue entity generation, AI recommendations, database/UI/API, Google Sheets, Cloud Run, or deployment. No push, PR, merge, tag, release, remote modification, or cloud provisioning. WU-04 has not started. npm ci warnings from already installed dependencies are preserved above.

## Pre-commit files and diff snapshot

Captured before appending this snapshot; the evidence file subsequently gains lines. Staged summaries include new source and test files.

### `git branch --show-current`

```text
wu/03-deterministic-operations-engine
```

Exit code: 0.

### `git status --short`

```text
M  CHANGELOG.md
AM docs/evidence/WU-03-operations-engine-evidence.md
AM docs/operations-engine.md
A  src/domain/operations/dataset-facts.ts
A  src/domain/operations/deadline.ts
A  src/domain/operations/errors.ts
A  src/domain/operations/index.ts
A  src/domain/operations/materials.ts
A  src/domain/operations/order-facts.ts
AM src/domain/operations/production.ts
A  src/domain/operations/types.ts
A  src/domain/operations/validation.ts
A  tests/unit/operations/dataset-facts.test.ts
A  tests/unit/operations/deadline.test.ts
A  tests/unit/operations/materials.test.ts
A  tests/unit/operations/production.test.ts
```

Exit code: 0.

### `git diff --stat`

```text
 docs/evidence/WU-03-operations-engine-evidence.md | 2 +-
 docs/operations-engine.md                         | 2 +-
 src/domain/operations/production.ts               | 2 +-
 3 files changed, 3 insertions(+), 3 deletions(-)
```

Exit code: 0.

### `git diff --cached --stat`

```text
 CHANGELOG.md                                      |   7 +
 docs/evidence/WU-03-operations-engine-evidence.md | 366 ++++++++++++++++++++++
 docs/operations-engine.md                         |  72 +++++
 src/domain/operations/dataset-facts.ts            |  24 ++
 src/domain/operations/deadline.ts                 |  29 ++
 src/domain/operations/errors.ts                   |  12 +
 src/domain/operations/index.ts                    |   7 +
 src/domain/operations/materials.ts                |  13 +
 src/domain/operations/order-facts.ts              |  29 ++
 src/domain/operations/production.ts               |  32 ++
 src/domain/operations/types.ts                    |  36 +++
 src/domain/operations/validation.ts               |  13 +
 tests/unit/operations/dataset-facts.test.ts       |  63 ++++
 tests/unit/operations/deadline.test.ts            |  38 +++
 tests/unit/operations/materials.test.ts           |  42 +++
 tests/unit/operations/production.test.ts          |  70 +++++
 16 files changed, 853 insertions(+)
```

Exit code: 0.

### `git diff --cached --name-status`

```text
M	CHANGELOG.md
A	docs/evidence/WU-03-operations-engine-evidence.md
A	docs/operations-engine.md
A	src/domain/operations/dataset-facts.ts
A	src/domain/operations/deadline.ts
A	src/domain/operations/errors.ts
A	src/domain/operations/index.ts
A	src/domain/operations/materials.ts
A	src/domain/operations/order-facts.ts
A	src/domain/operations/production.ts
A	src/domain/operations/types.ts
A	src/domain/operations/validation.ts
A	tests/unit/operations/dataset-facts.test.ts
A	tests/unit/operations/deadline.test.ts
A	tests/unit/operations/materials.test.ts
A	tests/unit/operations/production.test.ts
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

Final credential-pattern recheck including evidence: PASS, 90 project files.
