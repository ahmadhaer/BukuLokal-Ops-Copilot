# WU-00 bootstrap evidence

Captured during BL-AIBC-WU-00A-CANONICAL-PRD-EVIDENCE-FINALIZATION on 2026-10-12. Outputs below are from this run, not reconstructed WU-00 logs. Baseline commit is the original Initial commit. The pre-commit snapshots intentionally show the uncommitted WU-00 foundation.

## Pre-mutation repository verification

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
 M README.md
?? .env.example
?? .gitignore
?? AGENTS.md
?? ARCHITECTURE.md
?? CHANGELOG.md
?? DECISIONS.md
?? FRESHNESS.md
?? PRD.md
?? docs/
?? eslint.config.mjs
?? next-env.d.ts
?? next.config.ts
?? package-lock.json
?? package.json
?? postcss.config.mjs
?? public/
?? src/
?? tests/
?? tsconfig.json
?? vitest.config.mts
```

Exit code: 0.

### `git log --oneline --decorate --all`

```text
08cb126 (HEAD -> wu/00-repository-governance-bootstrap, origin/main, work) Initial commit
```

Exit code: 0.

## Validation

### `node --version`

```text
v24.19.0
```

Exit code: 0.

### `npm --version`

```text
11.9.0
```

Exit code: 0.

### `npm ci`

```text

added 401 packages in 8s
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

### `npm test`

```text

> bukulokal-ops-copilot@0.1.0 test
> vitest run


 RUN  v5.0.4 /workspace/BukuLokal-Ops-Copilot


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  16:31:11
   Duration  134ms (transform 52%, import 33%, tests 10%, worker 4%)
```

Exit code: 0.

### `npm run build`

```text

> bukulokal-ops-copilot@0.1.0 build
> next build

▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 17ms

  Creating an optimized production build ...
✓ Compiled successfully in 197ms
  Running TypeScript ...
  Finished TypeScript in 755ms ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 240ms
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

## Pre-commit Git and environment-file checks

### `git rev-parse HEAD`

```text
08cb126c74dd3578f00f5eee5d8c35fb75cfa208
```

Exit code: 0.

### `git status --short`

```text
 M README.md
?? .env.example
?? .gitignore
?? AGENTS.md
?? ARCHITECTURE.md
?? CHANGELOG.md
?? DECISIONS.md
?? FRESHNESS.md
?? PRD.md
?? docs/
?? eslint.config.mjs
?? next-env.d.ts
?? next.config.ts
?? package-lock.json
?? package.json
?? postcss.config.mjs
?? public/
?? src/
?? tests/
?? tsconfig.json
?? vitest.config.mts
```

Exit code: 0.

### `git diff --stat`

```text
 README.md | 59 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 57 insertions(+), 2 deletions(-)
```

Exit code: 0.

### `git diff --check`

```text

```

Exit code: 0.

### `git ls-files --others --exclude-standard`

```text
.env.example
.gitignore
AGENTS.md
ARCHITECTURE.md
CHANGELOG.md
DECISIONS.md
FRESHNESS.md
PRD.md
docs/.gitkeep
eslint.config.mjs
next-env.d.ts
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public/.gitkeep
src/ai/.gitkeep
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/components/.gitkeep
src/connectors/.gitkeep
src/domain/.gitkeep
src/features/.gitkeep
src/lib/.gitkeep
src/types/.gitkeep
tests/fixtures/.gitkeep
tests/integration/.gitkeep
tests/unit/home.test.tsx
tsconfig.json
vitest.config.mts
```

Exit code: 0.

### `git check-ignore .env .env.local .env.production`

```text
.env
.env.local
.env.production
```

Exit code: 0.

## Canonical import verification

The required four-line header was added. All 57 sections and source lines are retained, with trailing whitespace normalized on eight metadata lines and a final newline added. The imported body equals the supplied source after exactly that normalization. No wording, architecture, priorities, or requirements were changed.

## Governance consistency review

No contradictions found between PRD.md, ARCHITECTURE.md, DECISIONS.md, README.md, and FRESHNESS.md. PRD sections 34, 39, 55 and governance agree on Next.js/React/TypeScript, Gemini via Google Gen AI SDK, deterministic truth, Firestore, Cloud Run, human authority, standalone freshness, and P1 read-only Sheets. PRD sections 8 and 39 define P0 demo plus CSV/XLSX; governance does not exclude demo. PRD sections 6.4 and 19 disable automatic external actions; read-only integration and human approval ADRs agree. Manufacturing is the PRD theme; no governance document asserts another theme. Planned authentication and target product requirements do not imply current implementation. Current source remains foundation only.

## Secret-scan methodology and result

Enumerated tracked and untracked non-ignored project files with `git ls-files --cached --others --exclude-standard`. Checked private-key markers, Google/AWS/GitHub credential shapes, service-account credential indicators, and literal assignments for API keys, OAuth client secrets, access tokens, and passwords. No environment values or credentials were printed. Checked `.env.example` assignments are empty and Git ignores real `.env` variants.

```text
PASS: scanned 33 tracked and untracked non-ignored project files; no credential-pattern matches. Empty environment placeholders verified. LICENSE unchanged. PRD source normalized comparison: PASS.
```

This pattern scan is supporting evidence, not a certification about unobserved external files.

## Scope and review

All untracked files were reviewed: foundation source and rendering tests, package/lock/config files, governance, generated AGENTS.md and Next.js declarations, and empty-directory markers. No WU-01+ product source, manufacturing fixtures, runtime integration, or deployment was added. `git diff --stat` above excludes untracked files; a staged whole-bootstrap summary follows. No dependency versions were upgraded in WU-00A. The exact non-blocking ESLint warning is retained in npm ci output above.

## Staged whole-bootstrap snapshot

Captured before appending this snapshot to the evidence file; its own line count will grow.

### `git diff --cached --stat`

```text
 .env.example                              |    6 +
 .gitignore                                |    7 +
 AGENTS.md                                 |    9 +
 ARCHITECTURE.md                           |   27 +
 CHANGELOG.md                              |   14 +
 DECISIONS.md                              |   75 +
 FRESHNESS.md                              |   13 +
 PRD.md                                    | 2558 ++++++++++
 README.md                                 |   59 +-
 docs/.gitkeep                             |    0
 docs/evidence/WU-00-bootstrap-evidence.md |  303 ++
 eslint.config.mjs                         |    9 +
 next-env.d.ts                             |    7 +
 next.config.ts                            |    4 +
 package-lock.json                         | 7779 +++++++++++++++++++++++++++++
 package.json                              |   33 +
 postcss.config.mjs                        |    2 +
 public/.gitkeep                           |    0
 src/ai/.gitkeep                           |    0
 src/app/globals.css                       |    8 +
 src/app/layout.tsx                        |   12 +
 src/app/page.tsx                          |   10 +
 src/components/.gitkeep                   |    0
 src/connectors/.gitkeep                   |    0
 src/domain/.gitkeep                       |    0
 src/features/.gitkeep                     |    0
 src/lib/.gitkeep                          |    0
 src/types/.gitkeep                        |    0
 tests/fixtures/.gitkeep                   |    0
 tests/integration/.gitkeep                |    0
 tests/unit/home.test.tsx                  |   22 +
 tsconfig.json                             |   41 +
 vitest.config.mts                         |    5 +
 33 files changed, 11001 insertions(+), 2 deletions(-)
```

Exit code: 0.

### `git diff --cached --check`

```text

```

Exit code: 0.
