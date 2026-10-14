# WU-02 import, normalization, and validation evidence

Work Unit: BL-AIBC-WU-02-IMPORT-NORMALIZE-VALIDATE-V0.1. Captured from actual commands on 2026-10-13 (Asia/Jakarta). Runner timestamps are retained verbatim as reported.

Branch: `wu/02-import-normalize-validate`. Baseline: `8b4bfe2c429f3d84e64442e7a7a6ecb3ba9027ec`; both WU-01 checkpoint objects were checked before branch creation.

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
wu/01-synthetic-data-canonical-schema
```

Exit code: 0.

### `git status --short`

```text

```

Exit code: 0.

### `git log --oneline --decorate --all -15`

```text
8b4bfe2 (HEAD -> wu/01-synthetic-data-canonical-schema) docs: correct WU-01 evidence trailing whitespace
a480697 feat: establish canonical manufacturing schemas and demo fixture
478466d (wu/00-repository-governance-bootstrap) chore: bootstrap AI Builder Cup foundation and canonical governance
08cb126 (origin/main, work) Initial commit
```

Exit code: 0.

### `git branch --list wu/02-import-normalize-validate`

```text

```

Exit code: 0.

## Initial targeted validation

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

### `npm test -- tests/unit/imports`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot

 ❯ tests/unit/imports/mapping.test.ts (19 tests | 1 failed) 22ms
   ❯ deterministic mapping (19)
     × does not choose between equally covered sufficient kinds 5ms
 ❯ tests/unit/imports/invalid-rows.test.ts (16 tests | 1 failed) 27ms
   ❯ invalid row separation (16)
     × separates six invalid rows from a valid record with stable field errors 14ms

 Test Files  2 failed | 3 passed (5)
      Tests  2 failed | 67 passed (69)
   Start at  04:21:05
   Duration  702ms (import 41%, transform 36%, tests 22%, worker 1%)


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/unit/imports/invalid-rows.test.ts > invalid row separation > separates six invalid rows from a valid record with stable field errors
AssertionError: expected [ [ 2, 'id', …(1) ], …(6) ] to deeply equal [ [ 2, 'id', …(1) ], …(5) ]

- Expected
+ Received

@@ -8,10 +8,15 @@
      3,
      "orderedQuantity",
      "SCHEMA_VALIDATION_FAILED",
    ],
    [
+     3,
+     "orderedQuantity",
+     "SCHEMA_VALIDATION_FAILED",
+   ],
+   [
      4,
      "orderedQuantity",
      "SCHEMA_VALIDATION_FAILED",
    ],
    [

 ❯ tests/unit/imports/invalid-rows.test.ts:14:100
     12|     expect(result.summary).toEqual({ totalRows: 7, validRows: 1, inval…
     13|     expect(result.validRecords[0]).toMatchObject({ id: "SO-VALID" });
     14|     expect(result.errors.map((error) => [error.rowNumber, error.canoni…
       |                                                                                                    ^
     15|       [2, "id", "MISSING_REQUIRED_VALUE"], [3, "orderedQuantity", "SCH…
     16|       [4, "orderedQuantity", "SCHEMA_VALIDATION_FAILED"], [5, "dueDate…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/unit/imports/mapping.test.ts > deterministic mapping > does not choose between equally covered sufficient kinds
AssertionError: expected 'inventory' to be null

- Expected:
null

+ Received:
"inventory"

 ❯ tests/unit/imports/mapping.test.ts:40:69
     38|     // Add inventory core fields so orders/inventory have equal full c…
     39|     const tied = [...headers, "materialName", "availableQuantity", "re…
     40|     expect(suggestMapping({ ...table, headers: tied }).datasetKind).to…
       |                                                                     ^
     41|   });
     42|   it("flags duplicate targets and avoids automatic kind selection", ()…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯
```

Exit code: 1.

## Final required and targeted validation

### `npm ci`

```text

added 500 packages in 7s
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

### `npm test -- tests/unit/imports/csv.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports/csv.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  04:23:59
   Duration  328ms (import 55%, transform 28%, tests 16%, worker 1%)
```

Exit code: 0.

### `npm test -- tests/unit/imports/xlsx.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports/xlsx.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  04:23:59
   Duration  399ms (import 46%, tests 43%, transform 10%, worker 1%)
```

Exit code: 0.

### `npm test -- tests/unit/imports/mapping.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports/mapping.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  04:24:00
   Duration  213ms (transform 55%, import 35%, tests 8%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/imports/normalization.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports/normalization.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  04:24:00
   Duration  288ms (import 66%, transform 19%, tests 14%, worker 1%)
```

Exit code: 0.

### `npm test -- tests/unit/imports/invalid-rows.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/imports/invalid-rows.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  04:24:01
   Duration  170ms (import 50%, transform 34%, tests 14%, worker 2%)
```

Exit code: 0.

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  8 passed (8)
      Tests  135 passed (135)
   Start at  04:24:01
   Duration  732ms (import 54%, tests 26%, transform 18%, worker 2%)
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 17ms

  Creating an optimized production build ...
✓ Compiled successfully in 203ms
  Running TypeScript ...
  Finished TypeScript in 1149ms ...
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

## Dependency changes

Added exact runtime dependencies Papa Parse 5.7.0 and ExcelJS 4.4.0, plus dev dependency @types/papaparse 5.5.2. npm ci installed 500 packages. Compared every pre-existing direct declaration and every pre-existing lock entry: no version changed and no old lock path was removed. ExcelJS brings its own transitive packages (including fast-csv); no second CSV parser was selected or used by application code. Transitive deprecation warnings and the existing ESLint warning are retained in npm ci output above.

## Failures diagnosed and corrected

Initial adapter typechecking exposed ExcelJS's ArrayBuffer-style Buffer declaration versus current Node Buffer types. Passing a copied Uint8Array ArrayBuffer restores the typed boundary without disabling checking. Initial tests found duplicate canonical constraint messages for one negative-quantity field and a supposed tied-coverage test that had unequal usable coverage. The normalizer now returns the first canonical error per field; the ambiguity test uses two genuinely sufficient kinds with exactly six matches each. Assertions still require null for tied coverage and invalid-row exclusion. Final validation runs after these corrections pass.

## Architecture and contract checks

RAW FILE -> safe parse -> RawTable -> deterministic suggestions -> explicit confirmation -> normalization -> actual WU-01 Zod schemas -> valid records and structured row errors. Suggestions always require confirmation; a TypeScript negative test and runtime test reject direct suggestion use. Confirmation checks context/defaults, source existence, unique assignments/targets, required coverage, and canonical target vocabulary. Unit and timestamp defaults must be explicit and cannot replace mapped blank cells. No runtime IDs, randomness, or timestamps are generated.

CSV preserves UTF-8 text, original headers, quoted comma/multiline content, blank values, and physical source row numbers. XLSX preserves sheet names, numeric/date cell types, and spreadsheet row numbers; empty sheets/rows are ignored. Duplicate normalized headers reject. Formula cached results and hyperlink display text are read without evaluation or URL fetching; formulas without cached results reject. Dates use UTC spreadsheet components, independent of host timezone.

The 5 MiB file limit and 5,000 row limit are named constants, tested at CSV boundaries, enforced before file parsing and on raw tables, and aggregated across XLSX sheets. No truncation occurs. ExcelJS loads ZIP/workbook contents before row inspection; there is no decompressed-size/memory budget in this prototype. No API endpoint exposes this parser.

Orders, production, and inventory normalize into unchanged OrderSchema, ProductionJobSchema, and InventoryItemSchema. Errors identify rowNumber, source/canonical field, stable code, and readable message. Valid siblings remain available. Subsequent duplicate IDs become row errors. Cross-table relationship/database enforcement remains outside this unit. Required SO-IMPORT-001 scenario normalizes with an explicit pcs default and supplied organization/import context. Tests also normalize all three XLSX fixture sheets.

## Test counts

CSV/parser dispatcher: 18; XLSX: 8; mapping/confirmation/preview: 19; normalization: 9; invalid rows: 16. Targeted total: 70 tests. Full suite: 135 tests, 8 files, all passed. Earlier failed run: 2 failed, 67 passed; preserved above and superseded by the final runs.

## Privacy and secret inspection

Enumerated tracked plus untracked non-ignored files; checked private-key markers, Google/AWS/GitHub credential shapes, service-account markers, and credential assignments without printing matching values. Parsed synthetic CSV cells and workbook XML text for email/phone patterns and synthetic customer labels. Compared canonical schemas, PRD, ADRs, LICENSE, and homepage against baseline.

```text
PASS: 74 non-ignored project files inspected for credential patterns; none found. CSV cells and XLSX XML text inspected: no emails or phone patterns; customer identities explicitly synthetic. WU-01 schemas, PRD, existing ADRs, LICENSE and homepage unchanged. Existing direct dependency versions unchanged.
```

Package deprecation output includes public maintainer metadata; it is not fixture/customer data. Pattern scans support review without certifying unobserved external files.

## Scope review

Source searches found no executable shortage/completion-percentage/deadline-distance/risk/issue detection, Gemini, Firestore, or fetch code in the import modules. No UI, API, database, Google Sheets, Cloud Run, or deployment was added. Existing canonical schemas and ADRs remain unchanged. Removed three empty-directory .gitkeep markers because connectors/features/fixtures now contain files. Fresh synthetic fixtures were authored in this Work Unit; workbook generation is reproducible with `node tests/fixtures/imports/build-workbook.mjs`. No real business files were used. No new ADR or product decision was needed. No push, PR, merge, tag, release, remote modification, or cloud provisioning occurred. WU-03 is not started.

## Pre-commit files and diff snapshot

Captured before appending this section; this evidence file gains lines afterward. `git diff --stat` excludes staged changes, so the staged summary is included separately.

### `git branch --show-current`

```text
wu/02-import-normalize-validate
```

Exit code: 0.

### `git status --short`

```text
M  CHANGELOG.md
A  docs/evidence/WU-02-import-normalize-validate-evidence.md
A  docs/import-contract.md
M  package-lock.json
M  package.json
D  src/connectors/.gitkeep
A  src/connectors/csv/parse-csv.ts
A  src/connectors/excel/parse-xlsx.ts
D  src/features/.gitkeep
A  src/features/imports/constants.ts
A  src/features/imports/errors.ts
A  src/features/imports/index.ts
A  src/features/imports/mapping.ts
A  src/features/imports/normalize.ts
A  src/features/imports/parse-file.ts
A  src/features/imports/preview.ts
A  src/features/imports/raw.ts
A  src/features/imports/types.ts
D  tests/fixtures/.gitkeep
A  tests/fixtures/imports/ambiguous.csv
A  tests/fixtures/imports/build-workbook.mjs
A  tests/fixtures/imports/duplicate-headers.csv
A  tests/fixtures/imports/invalid-orders.csv
A  tests/fixtures/imports/inventory.csv
A  tests/fixtures/imports/manufacturing.xlsx
A  tests/fixtures/imports/orders.csv
A  tests/fixtures/imports/production.csv
A  tests/unit/imports/csv.test.ts
A  tests/unit/imports/helpers.ts
A  tests/unit/imports/invalid-rows.test.ts
A  tests/unit/imports/mapping.test.ts
A  tests/unit/imports/normalization.test.ts
A  tests/unit/imports/xlsx.test.ts
```

Exit code: 0.

### `git diff --stat`

```text

```

Exit code: 0.

### `git diff --cached --stat`

```text
 CHANGELOG.md                                       |    7 +
 .../WU-02-import-normalize-validate-evidence.md    |  394 +++++++
 docs/import-contract.md                            |   49 +
 package-lock.json                                  | 1134 ++++++++++++++++++--
 package.json                                       |    3 +
 src/connectors/.gitkeep                            |    0
 src/connectors/csv/parse-csv.ts                    |   28 +
 src/connectors/excel/parse-xlsx.ts                 |   36 +
 src/features/.gitkeep                              |    0
 src/features/imports/constants.ts                  |   18 +
 src/features/imports/errors.ts                     |   14 +
 src/features/imports/index.ts                      |    7 +
 src/features/imports/mapping.ts                    |   91 ++
 src/features/imports/normalize.ts                  |   77 ++
 src/features/imports/parse-file.ts                 |   11 +
 src/features/imports/preview.ts                    |   16 +
 src/features/imports/raw.ts                        |   36 +
 src/features/imports/types.ts                      |   36 +
 tests/fixtures/.gitkeep                            |    0
 tests/fixtures/imports/ambiguous.csv               |    2 +
 tests/fixtures/imports/build-workbook.mjs          |   19 +
 tests/fixtures/imports/duplicate-headers.csv       |    2 +
 tests/fixtures/imports/invalid-orders.csv          |    8 +
 tests/fixtures/imports/inventory.csv               |    2 +
 tests/fixtures/imports/manufacturing.xlsx          |  Bin 0 -> 8607 bytes
 tests/fixtures/imports/orders.csv                  |    2 +
 tests/fixtures/imports/production.csv              |    2 +
 tests/unit/imports/csv.test.ts                     |   67 ++
 tests/unit/imports/helpers.ts                      |   16 +
 tests/unit/imports/invalid-rows.test.ts            |   58 +
 tests/unit/imports/mapping.test.ts                 |   80 ++
 tests/unit/imports/normalization.test.ts           |   61 ++
 tests/unit/imports/xlsx.test.ts                    |   58 +
 33 files changed, 2229 insertions(+), 105 deletions(-)
```

Exit code: 0.

### `git diff --cached --name-status`

```text
M	CHANGELOG.md
A	docs/evidence/WU-02-import-normalize-validate-evidence.md
A	docs/import-contract.md
M	package-lock.json
M	package.json
D	src/connectors/.gitkeep
A	src/connectors/csv/parse-csv.ts
A	src/connectors/excel/parse-xlsx.ts
D	src/features/.gitkeep
A	src/features/imports/constants.ts
A	src/features/imports/errors.ts
A	src/features/imports/index.ts
A	src/features/imports/mapping.ts
A	src/features/imports/normalize.ts
A	src/features/imports/parse-file.ts
A	src/features/imports/preview.ts
A	src/features/imports/raw.ts
A	src/features/imports/types.ts
D	tests/fixtures/.gitkeep
A	tests/fixtures/imports/ambiguous.csv
A	tests/fixtures/imports/build-workbook.mjs
A	tests/fixtures/imports/duplicate-headers.csv
A	tests/fixtures/imports/invalid-orders.csv
A	tests/fixtures/imports/inventory.csv
A	tests/fixtures/imports/manufacturing.xlsx
A	tests/fixtures/imports/orders.csv
A	tests/fixtures/imports/production.csv
A	tests/unit/imports/csv.test.ts
A	tests/unit/imports/helpers.ts
A	tests/unit/imports/invalid-rows.test.ts
A	tests/unit/imports/mapping.test.ts
A	tests/unit/imports/normalization.test.ts
A	tests/unit/imports/xlsx.test.ts
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

Final credential-pattern recheck including evidence: PASS, 75 project files.
