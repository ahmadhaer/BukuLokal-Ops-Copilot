# WU-05 Gemini intelligence evidence

Work Unit: BL-AIBC-WU-05-GEMINI-INTELLIGENCE-LAYER-V0.1. Captured from actual commands on 2026-10-13 (Asia/Jakarta). Runner timestamps remain verbatim.

Repository: ahmadhaer/BukuLokal-Ops-Copilot. Branch: `wu/05-gemini-intelligence-layer`. Baseline: `53bc8f05a86fb8afd3511f15f1918ab7c3db643f` — `feat: add deterministic issue detection and evidence engine`.

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
wu/04-issue-detection-evidence-engine
```

Exit code: 0.

### `git status --short`

```text

```

Exit code: 0.

### `git log --oneline --decorate --all -25`

```text
53bc8f0 (HEAD -> wu/04-issue-detection-evidence-engine) feat: add deterministic issue detection and evidence engine
f1ca162 (wu/03-deterministic-operations-engine) feat: add deterministic operations facts engine
69e3a01 (wu/02-import-normalize-validate) feat: add deterministic CSV and XLSX import pipeline
8b4bfe2 (wu/01-synthetic-data-canonical-schema) docs: correct WU-01 evidence trailing whitespace
a480697 feat: establish canonical manufacturing schemas and demo fixture
478466d (wu/00-repository-governance-bootstrap) chore: bootstrap AI Builder Cup foundation and canonical governance
08cb126 (origin/main, work) Initial commit
```

Exit code: 0.

### `git branch --list wu/05-gemini-intelligence-layer`

```text

```

Exit code: 0.

## Initial targeted validation

### `npm run lint`

```text

> bukulokal-ops-copilot@0.1.0 lint
> eslint .


/workspace/BukuLokal-Ops-Copilot/tests/unit/ai/provider.test.ts
  15:42  warning  '_params' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

Exit code: 0.

### `npm run typecheck`

```text

> bukulokal-ops-copilot@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

### `npm test -- tests/unit/ai`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  6 passed (6)
      Tests  34 passed (34)
   Start at  05:50:23
   Duration  528ms (transform 36%, import 34%, tests 28%, worker 1%)
```

Exit code: 0.

## Final required and targeted validation

### `npm ci`

```text

added 535 packages in 6s
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated fstream@1.0.12: This package is no longer supported.
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
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

### `npm test -- tests/unit/ai/schema.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/schema.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  05:53:46
   Duration  265ms (transform 50%, import 26%, tests 23%, worker 1%)
```

Exit code: 0.

### `npm test -- tests/unit/ai/grounding.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/grounding.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  05:53:46
   Duration  219ms (import 36%, tests 33%, transform 29%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/ai/action-compatibility.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/action-compatibility.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  05:53:47
   Duration  196ms (import 38%, transform 31%, tests 29%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/ai/retry.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/retry.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  05:53:47
   Duration  216ms (tests 35%, import 32%, transform 32%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/ai/provider.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/provider.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  05:53:48
   Duration  232ms (import 46%, transform 29%, tests 23%, worker 1%)
```

Exit code: 0.

### `npm test -- tests/unit/ai/so001.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/ai/so001.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  05:53:48
   Duration  185ms (import 38%, transform 32%, tests 28%, worker 2%)
```

Exit code: 0.

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  22 passed (22)
      Tests  260 passed (260)
   Start at  05:53:49
   Duration  1.84s (import 50%, tests 28%, transform 19%, worker 2%)

    Isolate  22 workers spawned · ~85ms startup each (spawn + environment, per file)
             at least ~538ms faster with isolate: false — reuses workers across files instead of one per file
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 14ms

  Creating an optimized production build ...
✓ Compiled successfully in 194ms
  Running TypeScript ...
  Finished TypeScript in 1184ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 271ms
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

## SDK compatibility evidence

Stable registry query and installed package report @google/genai 2.29.0. Installed node declarations expose GenerateContentConfig.responseMimeType and responseJsonSchema, and GoogleGenAIOptions.vertexai/project/location/apiVersion. The real Vertex adapter uses models.generateContent and JSON Schema generation; it never configures tools or legacy responseSchema. SDK HttpRetryOptions documents attempts 0/1 as no retries (default would be 5); adapter/constructor both specify attempts 1. Generation temperature 0, candidateCount 1, maxOutputTokens 4096, timeout 30000 ms.

```text
Installed @google/genai version: 2.29.0
Existing lock entry version changes: []
```

Inspected current installed sources (not an unverified external sample): `node_modules/@google/genai/dist/genai.d.ts` GenerateContentConfig, GoogleGenAIOptions, HttpRetryOptions; Node converter code in dist/node/index.cjs. responseFormat is declared for a different configuration surface, not this generateContent config. JSON Schema string-length/$schema keywords are omitted for the supported Vertex subset; local Zod enforces the stronger constraints. An initial package-version require failed because package.json is not exported; version was read from installed package metadata instead. No dependency verification was disabled.

## Provider and application boundary

Server factory reads project/location/model env variables and constructs Vertex AI with ADC, without apiKey or credential contents. Provider requests are typed to the actual SDK GenerateContentParameters/Response. Tests construct the real SDK offline and use a fake transport to inspect bounded contents, model, system instruction, structured schema, retry parameters, and absence of tools. No model call happens in that construction.

The application selects one issue from validated WU-04 output, verifies organization/refs/owner/uniqueness, then sends only industry/timezone, selected issue id/type/severity, selected evidence, and allowed actions. Input is limited to 64 evidence entries/32 KiB; the adapter rejects extra raw fields and duplicate evidence at its boundary. No raw workbook, unrelated orders, or full organization records are sent. Provider inputs and JSON schema are cloned.

## Schema, grounding, action, retry and SO-001 results

Output is strict Zod advisory data with no writable severity/type/numeric-truth fields. Top-level and recommendation refs must be known, nonempty, unique. Supplier intent requires a cited positive material_shortage record, and is absent from the whitelist when shortage is absent. Unknown actions/refs are rejected, not silently removed. Prose hallucinations cannot be perfectly proven absent; the system instruction and no-tool boundary are documented defense-in-depth.

At most two generation attempts: first invalid response receives one reinforced retry; second invalid response becomes AI_ANALYSIS_UNAVAILABLE. Transport failures return controlled AI_PROVIDER_ERROR with no raw SDK stack/details. Tests cover schema failures, grounding/action retry, forbidden returned function calls, and deterministic data retained on failure. Initial lint found an unused mock argument warning; the mock now asserts its supplied model and final lint is clean.

SO-001 fake-provider tests use real WU-04 critical/order_delay_risk plus computed evidence 2 days, 30 percent, 200 pcs. Accepted advice includes valid refs and supplierLeadTime/production-capacity missing-data disclosures. Canonical AIAnalysis records validate with configured synthetic-test-model, promptVersion issue-analysis-v1, explicit createdAt, stable length-prefixed provenance IDs. No Action records are generated. Immutability tests retain Issue/Evidence even when a provider mutates its private input copy. These are contract tests, not live Gemini output.

Counts: schema 9; grounding 7; action compatibility 4; retry/failure 7; provider 7; SO-001/provenance/immutability 3 = 37 targeted tests. Full suite: 260 passed in 22 files, including all 223 prior tests.

## Live credentials/network observation

Variable names/presence only were inspected; values were not printed. GOOGLE_APPLICATION_CREDENTIALS and its target file exist, and OIC_MANIFEST_PATH exists, but manifest v1 has no connections and current platform status reports no outbound GCP identities/runtime bindings. GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GEMINI_MODEL are unset. Default developer ADC file is absent. Injected file presence is not proof of usable Vertex authentication. No token, credential-file contents, or process environment dump was inspected.

LIVE_GEMINI_SMOKE_TEST: NOT_RUN_NO_CREDENTIALS — no verified ready Vertex identity; project/location/model also unset.
NETWORK_INFERENCE_CONFIRMATION: NONE.

Optional live inference is not a WU-05 acceptance prerequisite. No credentials were requested, IAM configured, resources provisioned, or Vertex/Gemini model invoked. Configured model availability, permissions, model-specific generation behavior, and live structured output remain unverified.

## Secret and scope inspection

```text
PASS: 119 tracked/untracked non-ignored project files inspected for Google/AWS/GitHub credentials, private-key/service-account markers, and credential assignments; no matches. .env.example has empty placeholders only; no real .env created. New tests use synthetic fixtures/fake model/provider data. All prior canonical/deterministic/source files and ADR/PRD/LICENSE/UI are unchanged. No hidden clock/randomness, Action generation, direct fetch, persistence, UI/API, or provisioning code in src/ai.
```

Only SDK dependency/package-lock, .env.example, CHANGELOG, new AI modules/tests, and integration/evidence docs changed; removed src/ai/.gitkeep because the directory now contains source. No PRD/ADR rewrite, deterministic engine change, tools/search/code execution, automatic action, Firestore/DB, React UI, API, Cloud Run, or deployment. No push, PR, merge, tag, release, remote modification, or provisioning. WU-06 has not started. Existing deprecation warnings plus node-domexception are preserved in npm ci output.

## Pre-commit file and diff snapshot

Captured before this section was appended; evidence line counts subsequently grow. Staged summaries include all new AI and test files.

### `git branch --show-current`

```text
wu/05-gemini-intelligence-layer
```

Exit code: 0.

### `git status --short`

```text
M  .env.example
M  CHANGELOG.md
A  docs/evidence/WU-05-gemini-intelligence-evidence.md
A  docs/gemini-integration.md
M  package-lock.json
M  package.json
D  src/ai/.gitkeep
A  src/ai/analysis/analyze-issue.ts
A  src/ai/analysis/errors.ts
A  src/ai/analysis/input.ts
A  src/ai/analysis/provider.ts
A  src/ai/analysis/validate-grounding.ts
A  src/ai/client/google-genai.ts
A  src/ai/index.ts
A  src/ai/prompts/issue-analysis-v1.ts
A  src/ai/schemas/issue-analysis.ts
A  tests/unit/ai/action-compatibility.test.ts
A  tests/unit/ai/grounding.test.ts
A  tests/unit/ai/helpers.ts
A  tests/unit/ai/provider.test.ts
A  tests/unit/ai/retry.test.ts
A  tests/unit/ai/schema.test.ts
A  tests/unit/ai/so001.test.ts
```

Exit code: 0.

### `git diff --stat`

```text

```

Exit code: 0.

### `git diff --cached --stat`

```text
 .env.example                                       |   8 +-
 CHANGELOG.md                                       |   7 +
 .../evidence/WU-05-gemini-intelligence-evidence.md | 373 ++++++++++++++++++++
 docs/gemini-integration.md                         |  63 ++++
 package-lock.json                                  | 391 ++++++++++++++++++++-
 package.json                                       |   1 +
 src/ai/.gitkeep                                    |   0
 src/ai/analysis/analyze-issue.ts                   |  52 +++
 src/ai/analysis/errors.ts                          |   8 +
 src/ai/analysis/input.ts                           |  42 +++
 src/ai/analysis/provider.ts                        |   9 +
 src/ai/analysis/validate-grounding.ts              |  21 ++
 src/ai/client/google-genai.ts                      |  44 +++
 src/ai/index.ts                                    |   7 +
 src/ai/prompts/issue-analysis-v1.ts                |  13 +
 src/ai/schemas/issue-analysis.ts                   |  26 ++
 tests/unit/ai/action-compatibility.test.ts         |  32 ++
 tests/unit/ai/grounding.test.ts                    |  43 +++
 tests/unit/ai/helpers.ts                           |  31 ++
 tests/unit/ai/provider.test.ts                     |  57 +++
 tests/unit/ai/retry.test.ts                        |  47 +++
 tests/unit/ai/schema.test.ts                       |  31 ++
 tests/unit/ai/so001.test.ts                        |  38 ++
 23 files changed, 1337 insertions(+), 7 deletions(-)
```

Exit code: 0.

### `git diff --cached --name-status`

```text
M	.env.example
M	CHANGELOG.md
A	docs/evidence/WU-05-gemini-intelligence-evidence.md
A	docs/gemini-integration.md
M	package-lock.json
M	package.json
D	src/ai/.gitkeep
A	src/ai/analysis/analyze-issue.ts
A	src/ai/analysis/errors.ts
A	src/ai/analysis/input.ts
A	src/ai/analysis/provider.ts
A	src/ai/analysis/validate-grounding.ts
A	src/ai/client/google-genai.ts
A	src/ai/index.ts
A	src/ai/prompts/issue-analysis-v1.ts
A	src/ai/schemas/issue-analysis.ts
A	tests/unit/ai/action-compatibility.test.ts
A	tests/unit/ai/grounding.test.ts
A	tests/unit/ai/helpers.ts
A	tests/unit/ai/provider.test.ts
A	tests/unit/ai/retry.test.ts
A	tests/unit/ai/schema.test.ts
A	tests/unit/ai/so001.test.ts
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

Final credential-pattern recheck including evidence: PASS, 120 project files.
