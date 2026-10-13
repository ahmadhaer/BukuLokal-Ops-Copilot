# WU-04 deterministic issue and evidence engine evidence

Work Unit: BL-AIBC-WU-04-ISSUE-DETECTION-EVIDENCE-ENGINE-V0.1. Captured from actual commands on 2026-10-13 (Asia/Jakarta). Runner timestamps are retained verbatim.

Repository: ahmadhaer/BukuLokal-Ops-Copilot. Branch: `wu/04-issue-detection-evidence-engine`. Baseline: `f1ca1627d2145f72d9dab1ec6e02b70781ca4492` — `feat: add deterministic operations facts engine`.

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
wu/03-deterministic-operations-engine
```

Exit code: 0.

### `git status --short`

```text

```

Exit code: 0.

### `git log --oneline --decorate --all -20`

```text
f1ca162 (HEAD -> wu/03-deterministic-operations-engine) feat: add deterministic operations facts engine
69e3a01 (wu/02-import-normalize-validate) feat: add deterministic CSV and XLSX import pipeline
8b4bfe2 (wu/01-synthetic-data-canonical-schema) docs: correct WU-01 evidence trailing whitespace
a480697 feat: establish canonical manufacturing schemas and demo fixture
478466d (wu/00-repository-governance-bootstrap) chore: bootstrap AI Builder Cup foundation and canonical governance
08cb126 (origin/main, work) Initial commit
```

Exit code: 0.

### `git branch --list wu/04-issue-detection-evidence-engine`

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

### `npm test -- tests/unit/issues`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/issues


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  4 passed (4)
      Tests  37 passed (37)
   Start at  05:27:09
   Duration  351ms (import 42%, transform 38%, tests 18%, worker 2%)
```

Exit code: 0.

## Final required validation and actual detection output

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

### `npm test -- tests/unit/issues/order-risk.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/issues/order-risk.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  05:29:43
   Duration  225ms (transform 57%, import 30%, tests 12%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/issues/material-shortage.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/issues/material-shortage.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  05:29:44
   Duration  168ms (import 49%, transform 33%, tests 15%, worker 3%)
```

Exit code: 0.

### `npm test -- tests/unit/issues/evidence.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/issues/evidence.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  05:29:44
   Duration  193ms (import 40%, transform 34%, tests 24%, worker 2%)
```

Exit code: 0.

### `npm test -- tests/unit/issues/determinism.test.ts`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run tests/unit/issues/determinism.test.ts


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  05:29:45
   Duration  187ms (import 38%, transform 32%, tests 25%, worker 5%)
```

Exit code: 0.

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  16 passed (16)
      Tests  223 passed (223)
   Start at  05:29:45
   Duration  1.39s (import 52%, tests 24%, transform 22%, worker 2%)

    Isolate  16 workers spawned · ~92ms startup each (spawn + environment, per file)
             at least ~397ms faster with isolate: false — reuses workers across files instead of one per file
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 14ms

  Creating an optimized production build ...
✓ Compiled successfully in 191ms
  Running TypeScript ...
  Finished TypeScript in 1158ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 287ms
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

### `node /tmp/wu04-compute.cjs`

```text
Rule configuration: {"criticalDeadlineDays":2,"criticalCompletionThreshold":50,"highDeadlineDays":3,"mediumDeadlineDays":7,"delayCompletionThreshold":80}
Issue count: 10 Evidence count: 21
Fixture issues: [{"orderId":"SO-001","type":"order_delay_risk","severity":"critical"},{"orderId":"SO-001","type":"material_shortage","severity":"critical"},{"orderId":"SO-003","type":"order_delay_risk","severity":"high"},{"orderId":"SO-003","type":"material_shortage","severity":"high"},{"orderId":"SO-006","type":"material_shortage","severity":"low"},{"orderId":"SO-007","type":"order_delay_risk","severity":"medium"},{"orderId":"SO-007","type":"material_shortage","severity":"medium"},{"orderId":"SO-010","type":"order_delay_risk","severity":"medium"},{"orderId":"SO-010","type":"material_shortage","severity":"medium"},{"orderId":"SO-012","type":"order_delay_risk","severity":"medium"}]
SO-001 result: {
  "issues": [
    {
      "id": "ISS:order_delay_risk:7:ORG-001:6:SO-001",
      "organizationId": "ORG-001",
      "orderId": "SO-001",
      "type": "order_delay_risk",
      "severity": "critical",
      "status": "open",
      "evidenceIds": [
        "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:days_to_deadline:order:6:SO-001",
        "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:production_completion:order:6:SO-001",
        "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:material_shortage:inventory_item:7:MAT-001"
      ],
      "detectedAt": "2026-10-12T12:00:00Z"
    },
    {
      "id": "ISS:material_shortage:7:ORG-001:7:MAT-001",
      "organizationId": "ORG-001",
      "orderId": "SO-001",
      "type": "material_shortage",
      "severity": "critical",
      "status": "open",
      "evidenceIds": [
        "EV:41:ISS:material_shortage:7:ORG-001:7:MAT-001:material_shortage:inventory_item:7:MAT-001",
        "EV:41:ISS:material_shortage:7:ORG-001:7:MAT-001:days_to_deadline:order:6:SO-001"
      ],
      "detectedAt": "2026-10-12T12:00:00Z"
    }
  ],
  "evidence": [
    {
      "id": "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:days_to_deadline:order:6:SO-001",
      "issueId": "ISS:order_delay_risk:7:ORG-001:6:SO-001",
      "type": "days_to_deadline",
      "value": 2,
      "unit": "days",
      "sourceEntityType": "order",
      "sourceEntityId": "SO-001"
    },
    {
      "id": "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:production_completion:order:6:SO-001",
      "issueId": "ISS:order_delay_risk:7:ORG-001:6:SO-001",
      "type": "production_completion",
      "value": 30,
      "unit": "percent",
      "sourceEntityType": "order",
      "sourceEntityId": "SO-001"
    },
    {
      "id": "EV:39:ISS:order_delay_risk:7:ORG-001:6:SO-001:material_shortage:inventory_item:7:MAT-001",
      "issueId": "ISS:order_delay_risk:7:ORG-001:6:SO-001",
      "type": "material_shortage",
      "value": 200,
      "unit": "pcs",
      "sourceEntityType": "inventory_item",
      "sourceEntityId": "MAT-001"
    },
    {
      "id": "EV:41:ISS:material_shortage:7:ORG-001:7:MAT-001:material_shortage:inventory_item:7:MAT-001",
      "issueId": "ISS:material_shortage:7:ORG-001:7:MAT-001",
      "type": "material_shortage",
      "value": 200,
      "unit": "pcs",
      "sourceEntityType": "inventory_item",
      "sourceEntityId": "MAT-001"
    },
    {
      "id": "EV:41:ISS:material_shortage:7:ORG-001:7:MAT-001:days_to_deadline:order:6:SO-001",
      "issueId": "ISS:material_shortage:7:ORG-001:7:MAT-001",
      "type": "days_to_deadline",
      "value": 2,
      "unit": "days",
      "sourceEntityType": "order",
      "sourceEntityId": "SO-001"
    }
  ],
  "ruleTraces": [
    {
      "issueId": "ISS:order_delay_risk:7:ORG-001:6:SO-001",
      "ruleId": "ORDER_DELAY_CRITICAL_V1"
    },
    {
      "issueId": "ISS:material_shortage:7:ORG-001:7:MAT-001",
      "ruleId": "MATERIAL_SHORTAGE_V1"
    }
  ]
}
```

Exit code: 0.

## Computation runner

The temporary runner transpiled actual project TypeScript using the existing installed compiler, derived WU-03 facts from the unchanged fixture, and passed them to the actual detector. Its source is retained for reproducibility; counts/results were not substituted.

```javascript
const fs = require('node:fs');
const { createRequire } = require('node:module');
const projectRequire = createRequire('/workspace/BukuLokal-Ops-Copilot/package.json');
const ts = projectRequire('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText, filename);
const { abcApparelDataset } = projectRequire('./src/domain/demo/abc-apparel.ts');
const { buildDatasetOperationalFacts } = projectRequire('./src/domain/operations/index.ts');
const { detectDatasetIssues, ISSUE_RULES_V1 } = projectRequire('./src/domain/issues/index.ts');
const facts = buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate);
const result = detectDatasetIssues(abcApparelDataset, facts, { detectedAt: '2026-10-12T12:00:00Z' });
console.log('Rule configuration:', JSON.stringify(ISSUE_RULES_V1));
console.log('Issue count:', result.issues.length, 'Evidence count:', result.evidence.length);
console.log('Fixture issues:', JSON.stringify(result.issues.map(({ orderId, type, severity }) => ({ orderId, type, severity }))));
const issues = result.issues.filter((issue) => issue.orderId === 'SO-001');
console.log('SO-001 result:', JSON.stringify({ issues, evidence: result.evidence.filter((item) => issues.some((issue) => issue.id === item.issueId)), ruleTraces: result.ruleTraces.filter((trace) => issues.some((issue) => issue.id === trace.issueId)) }, null, 2));
```

## Policy and count derivation

Central configuration: critical deadline 2, completion <50; high deadline 3, completion <80; medium deadline 7, completion <80. Critical includes any explicitly correlated positive material shortage as an OR predicate. Precedence returns at most one delay issue. Material shortage is per inventory item, with critical/high/medium/low deadline bands 2/3/7/beyond. These are hackathon policies, not universal standards.

Delay orders: SO-001 critical, SO-003 high, SO-007 medium, SO-010 medium, SO-012 medium. Shortage items: MAT-001 critical, MAT-003 high, MAT-006 low, MAT-007 medium, MAT-010 medium. Thus 5 delay + 5 shortage = 10 issues. SO-001 delay requires three evidence facts; the other nine issues require two each, so 3 + 9*2 = 21 evidence records. Exact computed JSON appears above.

## Canonical contracts, references, and consistency

Canonical IssueSchema/EvidenceSchema are reused without edits. Evidence types emitted: production_completion, days_to_deadline, material_shortage. Material issues include the required computed shortage plus deadline evidence supporting severity; optional raw-quantity evidence labels are not added to the canonical enum. Source vocabulary is order and inventory_item. Aggregate completion references the actual order rather than an invented production job.

All issue/evidence IDs are stable length-prefixed identifiers scoped by organization/source/type. One rule trace per issue is carried in result metadata, leaving canonical schemas unchanged. The wrapper validates unique IDs, nonempty evidence, bidirectional ownership, and trace resolution. Dataset detection checks source existence, organization/correlation, and matching raw inventory fields. Single-order detection expects trusted WU-03 material facts.

Completed 100% orders suppress delay issues; contradicted completed status raises a controlled error, including rounded 100% with nonzero remaining. Cancelled status suppresses delay only, as specified; the independent per-item shortage rule is not silently changed. On-hold orders remain eligible. Past dates follow the exact numeric predicates; no separate overdue escalation was invented. Unscoped material facts are ignored, without inferred order links.

## Test and determinism results

Order-risk: 19 passed. Material-shortage: 9 passed. Evidence/full fixture: 6 passed. Determinism: 3 passed. WU-04 targeted: 37 passed. Full suite: 223 passed across 16 files, including all 186 prior tests. Tests exercise threshold boundaries, precedence, status contradiction, source references, schema reuse, malformed evidence ownership, explicit context, configurable rules, stable collision-safe IDs, repeated/permuted input equality, and no mutations or generated AI/actions.

## Scope and privacy scan

Method: enumerate tracked/untracked non-ignored project files; inspect private-key markers, Google/AWS/GitHub credential shapes, service-account markers, and credential assignments without printing matched values. Review synthetic test provenance and email patterns. Compare all previous files to baseline and scan detector source for excluded executable behavior.

```text
PASS: 102 tracked/untracked non-ignored project files scanned; no credential-pattern matches. New tests use unchanged synthetic ABC Apparel inputs and explicit synthetic IDs/materials; no new real customer/supplier/private data. Every previous tracked file except CHANGELOG.md remains byte-identical to baseline, including canonical Issue/Evidence, WU-03 facts, imports, package/lockfile, PRD/ADRs, original fixtures, homepage and LICENSE. Detector source has no hard-coded SO-001, runtime clock/randomness, network, AI, action/recommendation, or persistence code.
```

No new dependencies or ADRs. No third issue type, unscoped organization-level issue, lifecycle persistence, AI explanation/recommendation, Action/AIAnalysis generation, DB/UI/API, Google Sheets, Cloud Run, or deployment. No push, PR, merge, tag, release, remote modification, or cloud provisioning. WU-05 has not started. Existing npm dependency warnings are retained above.

## Pre-commit file and diff snapshot

Captured before appending this section; evidence file line counts subsequently grow. Staged summaries include new source/tests.

### `git branch --show-current`

```text
wu/04-issue-detection-evidence-engine
```

Exit code: 0.

### `git status --short`

```text
M  CHANGELOG.md
A  docs/evidence/WU-04-issue-evidence-engine-evidence.md
A  docs/issue-engine.md
A  src/domain/issues/detection.ts
A  src/domain/issues/evidence.ts
A  src/domain/issues/identifiers.ts
A  src/domain/issues/index.ts
A  src/domain/issues/result.ts
A  src/domain/issues/rules.ts
A  tests/unit/issues/determinism.test.ts
A  tests/unit/issues/evidence.test.ts
A  tests/unit/issues/helpers.ts
A  tests/unit/issues/material-shortage.test.ts
A  tests/unit/issues/order-risk.test.ts
```

Exit code: 0.

### `git diff --stat`

```text

```

Exit code: 0.

### `git diff --cached --stat`

```text
 CHANGELOG.md                                       |   7 +
 .../WU-04-issue-evidence-engine-evidence.md        | 433 +++++++++++++++++++++
 docs/issue-engine.md                               |  70 ++++
 src/domain/issues/detection.ts                     |  97 +++++
 src/domain/issues/evidence.ts                      |  18 +
 src/domain/issues/identifiers.ts                   |  11 +
 src/domain/issues/index.ts                         |   5 +
 src/domain/issues/result.ts                        |  40 ++
 src/domain/issues/rules.ts                         |  22 ++
 tests/unit/issues/determinism.test.ts              |  29 ++
 tests/unit/issues/evidence.test.ts                 |  71 ++++
 tests/unit/issues/helpers.ts                       |  17 +
 tests/unit/issues/material-shortage.test.ts        |  35 ++
 tests/unit/issues/order-risk.test.ts               |  55 +++
 14 files changed, 910 insertions(+)
```

Exit code: 0.

### `git diff --cached --name-status`

```text
M	CHANGELOG.md
A	docs/evidence/WU-04-issue-evidence-engine-evidence.md
A	docs/issue-engine.md
A	src/domain/issues/detection.ts
A	src/domain/issues/evidence.ts
A	src/domain/issues/identifiers.ts
A	src/domain/issues/index.ts
A	src/domain/issues/result.ts
A	src/domain/issues/rules.ts
A	tests/unit/issues/determinism.test.ts
A	tests/unit/issues/evidence.test.ts
A	tests/unit/issues/helpers.ts
A	tests/unit/issues/material-shortage.test.ts
A	tests/unit/issues/order-risk.test.ts
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

Final credential-pattern recheck including evidence: PASS, 103 project files.
