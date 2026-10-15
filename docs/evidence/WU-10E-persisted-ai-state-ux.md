# WU-10E persisted AI analysis state UX

## Repository context recovery

Read-only diagnosis identified the intended checkout at `/workspace/BukuLokal-Ops-Copilot`, with correct origin `https://github.com/ahmadhaer/BukuLokal-Ops-Copilot.git`, clean worktree, active branch `work`, and HEAD `618b0c36121679b498d12dde353da0efed25517c`. Only `origin/main` and its HEAD alias were available. The five commits shown were:

```text
618b0c3 Merge pull request #1 from ahmadhaer/wu/10-google-cloud-live-deployment
392e002 docs: refresh README for deployed MVP status
e6042e5 feat: add safe server-side AI failure diagnostics
fb8dbe9 fix: omit unsupported pattern from Vertex response schema
15fb01c feat: integrate persistent end-to-end golden path
```

Explicitly fetching the canonical branch verified remote SHA `b99a29a239622f5caf199d6aa2b82a34cb4f2139`. The original origin fetch refspec tracked main only, so the initial `switch --create --track` failed while configuring tracking, after preparing the target tree/index. Inspection confirmed that the prepared contents exactly matched the canonical remote with no unrelated edits. An additive local fetch refspec for the canonical branch allowed the same normal tracking switch to succeed.

Before any WU-10E file edits, the gate was verified: clean worktree, branch `wu/10-google-cloud-live-deployment`, exact HEAD `b99a29a239622f5caf199d6aa2b82a34cb4f2139`. The original `work` branch and its HEAD were preserved. No reset, clean, force operation, or additional checkout was used.

## Observed ambiguity

The issue page already intentionally restores durable session state. A saved recommendation therefore appears on page open, without automatically invoking AI. Previously the button always said “Analyze with AI”, and a disabled “Create Suggested Action” button did not explain that the action already existed. This could make a saved analysis look like a hard-coded or automatically generated result.

## UX clarification

- Without a successful analysis, the button remains “Analyze with AI” and no restored-analysis notice appears.
- A successful analysis restored from durable session state shows “Previous AI analysis” and “This analysis was previously generated and restored from persistent storage.” Its button says “Analyze Again with AI”.
- A successful Analyze interaction records only the returned analysis ID in local ProductUI state after session refresh/save succeeds. That immediate result shows the normal recommendation and “Analyze Again with AI”, without the restored notice.
- The local ID is never saved to persistence. A new page instance or refresh can identify the durable result as previous analysis again. Transient in-memory session state is not described as persistent storage.
- “AI recommendation · human review required” remains visible.
- A matching analysisId + recommendationIndex retains its duplicate-prevention check and disabled button, now labeled “Suggested action already created”. Recommendations without an action still offer “Create Suggested Action”.
- Pending, AI-unconfigured, provider-failure, action review, and operation replay behavior remain unchanged. No automatic AI generation, approval, edit, rejection, or data reset was introduced.

## Scope and regression coverage

Only the UI, its tests, and this evidence document changed. No SessionProvider, persistence/domain/AI contract, server action, audit, deterministic calculation, severity, evidence, Human Gate, Vertex retry/schema, model/location, seeding, or cloud configuration changes were needed.

Four new tests cover a never-analyzed persisted issue, restored analysis/action with no automatic provider invocation, immediate durable success followed by a real memory-repository reconstruction, and enabled suggestion creation followed by duplicate prevention. Existing UI assertions cover pending/duplicate Analyze prevention, unconfigured/failure states, and human approve/edit/reject flows; those tests continue to run. Existing golden-path assertions were updated for the two intentional button-label changes.

Live UX verification is still required after deployment. No push, deployment, credentials, IAM change, or manual Firestore mutation is included.

## Verification

- `npm test`: PASS, 434 tests in 48 files; 4 new regression tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `work` still points to `618b0c36121679b498d12dde353da0efed25517c`.
- Protected AI/domain/application/features/session/config/lockfile paths have no diff from the canonical baseline.
- Dependency setup used Node 24.19.0 and `npm ci --cache /tmp/wu10e-npm-cache --no-audit --no-fund`; lockfile integrity verification remained enabled.
