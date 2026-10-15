# WU-10C Vertex array constraint compatibility

## User-supplied live evidence

These live results were supplied in the WU-10C request; Codex did not independently run cloud tests or redeploy.

- Cloud Run revision: `bukulokal-ops-copilot-00003-5pm`.
- Model: `gemini-3.5-flash`.
- Diagnostic stage: `provider_request`.
- SDK error name: `ApiError`.
- Provider HTTP status: `400`.
- Error code: `AI_PROVIDER_ERROR`.
- Simple `responseJsonSchema`: PASS.
- Simple `responseSchema`: PASS.

| Exact production-schema isolation | Result |
| --- | --- |
| C: exact production schema | FAIL, HTTP 400, INVALID_ARGUMENT |
| D: without additionalProperties | FAIL, HTTP 400, INVALID_ARGUMENT |
| E: without minItems/maxItems | PASS |
| F: without additionalProperties and minItems/maxItems | PASS |

Array cardinality constraints in the exact provider-facing production schema are the confirmed compatibility trigger for this deployment path, according to this isolation evidence. The SDK documents minItems/maxItems as supported; this is a compatibility/complexity issue for the current production schema and Vertex/model path, not a claim of universal lack of support. Removing additionalProperties alone did not resolve it.

## Local implementation and regression evidence

Clean branch `wu/10-google-cloud-live-deployment` was fast-forwarded from `e6042e5c105d0039151a0f33e5c284ecc34f9ea4` to remote README update `392e002ba76e459e8a536910209a9cd9b36f5f98` before editing.

The provider-facing recursive sanitizer now omits `$schema`, `minLength`, `maxLength`, `pattern`, `minItems`, and `maxItems`. No authoritative Zod constraints were edited.

Before the fix, the regression suite failed on seven array-limit keyword occurrences (two minItems and five maxItems), both on the exported schema and on the schema passed to the provider during retry. The other 15 tests passed.

Local authoritative validation remains intact:

- Main and recommendation evidenceRefs accept 1–64 IDs and reject 0 or 65.
- recommendations accepts 8 entries and rejects 9.
- missingData and cannotDetermine accept 16 entries and reject 17.
- Whitespace IDs, unknown/duplicate references, unsupported actions, and supplier followup without positive material-shortage evidence remain rejected.
- Grounding, diagnostic instrumentation, retry, persistence, deterministic facts/severity, Human Gate, and model/cloud configuration are unchanged.

The final live application is not claimed fixed. Redeployment and a successful live golden-path verification remain necessary. No credentials, cloud mutation, deployment, or push are included in this work unit.

## Verification

- `npm test`: PASS, 418 tests in 46 files (8 added tests; existing retry test extended).
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Protected implementation paths have no diff relative to the fast-forwarded baseline.
