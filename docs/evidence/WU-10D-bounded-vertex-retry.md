# WU-10D bounded Vertex retry

## User-supplied live and controlled evidence

Baseline: `e74843a827311191815af862e83566d80fa74412` on `wu/10-google-cloud-live-deployment`.

Cloud Run revision `bukulokal-ops-copilot-00004-bqm` has resolved the schema HTTP 400 issue; the production-equivalent request is valid. The request path still repeatedly reports HTTP 504 DEADLINE_EXCEEDED. These observations were supplied by the user, not independently reproduced in Codex.

| Controlled test | Result | Elapsed |
| --- | --- | --- |
| A_30S_1 | PASS | 16780 ms |
| B_60S_1 | PASS | 14544 ms |
| A_30S_2 | PASS | 15326 ms |
| B_60S_2 | FAIL, HTTP 504 DEADLINE_EXCEEDED | 57547 ms |

Timeout-only mitigation was rejected: 30-second requests can succeed, while a 60-second request still failed. Variable provider latency supports one cautious retry of a transient failure, without increasing timeout or altering inference inputs.

## Installed SDK contract and exact policy

Inspected `@google/genai` 2.29.0 `HttpRetryOptions` in `dist/genai.d.ts` (8552–8567), and its `apiCall` implementation in `dist/node/index.mjs` (13827–13891):

- attempts includes the original request; SDK uses attempts minus one as retries.
- initialDelay and maxDelay are in seconds, converted internally to milliseconds.
- expBase sets the exponential multiplier; jitter controls randomized delay.
- httpStatusCodes explicitly selects retryable HTTP responses.
- timeout applies independently to each HTTP attempt.
- final retryable HTTP failure preserves typed ApiError/status.
- non-retryable HTTP responses bypass the SDK retry loop and become errors afterward.

Both request and SDK default options now use:

```json
{
  "timeout": 30000,
  "retryOptions": {
    "attempts": 2,
    "initialDelay": 1,
    "maxDelay": 2,
    "expBase": 2,
    "jitter": 0,
    "httpStatusCodes": [408, 429, 500, 503, 504]
  }
}
```

This allows one HTTP retry per generateContent call, with a one-second first delay and bounded exponential policy. Jitter is disabled so the minimum delay stays explicit and deterministic. With one retry, there is no second exponential delay. Two 30-second attempt budgets plus the first delay give approximately 61 seconds per SDK invocation, excluding surrounding application work. SDK transport-error handling remains its existing implementation; no application transport/provider retry loop was added.

HTTP 400, 401, 403, 404, and every unlisted HTTP status are excluded. Validation, grounding, action compatibility, and persistence failures do not enter the SDK HTTP retry mechanism. The pre-existing single advisory validation retry is unchanged: a valid HTTP response with invalid advisory output can still cause a second generation. The two-attempt bound is per SDK invocation; an exhausted provider failure stops the application immediately rather than initiating another generation.

## Regression and security evidence

Offline tests run the installed Vertex SDK with an injected fake fetch, synthetic test key, and fake timers. They prove:

- first-attempt success makes one HTTP call;
- each allowed status can recover on the second HTTP call after at least 1000 ms;
- 400/401/403/404/502 make one call;
- repeated 504 stops after two calls, preserves public AI_PROVIDER_ERROR, and logs safe final provider_request/ApiError/status metadata;
- raw SDK message, synthetic key, issue ID, and full response summary are absent from diagnostics;
- request configuration retains 30000 ms timeout, 4096 output tokens, temperature zero, and no thinkingConfig.

Authoritative Zod validation and grounding remain local and unchanged, as do diagnostics, deterministic facts/severity, Human Gate, persistence, prompt, schema, model, location, and public UI behavior. No real credentials or network calls are used by the new tests. No cloud deployment, IAM, Firestore mutation, environment file, tag, release, merge, or push is included.

Live success is not claimed. Redeployment and the canonical live golden-path test are still required.

## Verification results

- `npm test`: PASS, 430 tests across 47 files; 12 new offline SDK tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Protected validation, grounding, prompt/schema, application, deterministic domain, and Human Gate paths have no diff against the baseline.
