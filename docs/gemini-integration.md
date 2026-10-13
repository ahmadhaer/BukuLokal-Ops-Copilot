# WU-05 evidence-grounded Gemini intelligence

## Role and authority

Gemini explains and recommends over one deterministic Issue and its Evidence. It never owns numerical truth, issue type, severity, or execution authority. The application does not extract numbers from prose or overwrite source objects. Recommendations/drafts remain advisory output; no canonical Action records or external execution occur.

## Installed SDK and Vertex compatibility

`@google/genai` **2.29.0**, the stable registry version observed during WU-05. No legacy SDK was installed. The Node adapter initializes `new GoogleGenAI({ vertexai: true, project, location, apiVersion: "v1", httpOptions: ... })`. This version still supports vertexai mode (the SDK now also advertises an enterprise alias). Existing authentication architecture remains Vertex AI with Application Default Credentials, compatible with a future Cloud Run service identity. No API key or credential value is passed or embedded.

Generation method: `client.models.generateContent`. The installed GenerateContentConfig supports `responseMimeType: "application/json"` plus `responseJsonSchema`. This is the current JSON Schema alternative to responseSchema, not a copied legacy response-schema example. responseFormat appears elsewhere in this SDK's declarations, but is not a GenerateContentConfig field for this method. Installed declarations and Node conversion code were inspected; requests compile and are tested against an SDK-shaped fake transport.

The output JSON schema is derived from the strict application Zod schema. `$schema`, minLength, and maxLength are omitted for the Vertex-supported JSON Schema subset; local Zod validation still enforces nonempty/length bounds. No fallback to free-form generation is implemented.

Actual generation configuration: temperature 0, candidateCount 1, maxOutputTokens 4096, HTTP timeout 30 seconds, SDK retry attempts 1 (no internal request retry). The application permits at most two generation attempts. Low temperature reduces variance but does not prove model determinism; model-specific support and live behavior remain to be verified for the owner's configured model.

## Runtime configuration and credentials

Required server environment values: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GEMINI_MODEL. `.env.example` contains empty placeholders only. Configuration fails clearly when missing/invalid; there is no hard-coded project, model, or silent fallback. The model in analysis execution must match the adapter's configured model. `global` is accepted by the installed SDK and used only in offline synthetic adapter tests, not as an automatic location selection. No real model example is claimed compatible without live project/model verification.

Use ADC or the approved Cloud Run service identity. The factory refuses browser initialization. Never import or initialize the live adapter in a client component; future UI/API wiring must invoke it server-side. No IAM provisioning, credentials-file copy, API-key prompt, or authentication login was performed.

Runtime inspection found an injected GOOGLE_APPLICATION_CREDENTIALS variable/file, but no configured ready GCP identity in the platform manifest/status. Project, location, and model were unset. File/variable presence alone does not establish usable Vertex authorization. The optional live smoke was not run; no network inference occurred. Configure an authorized Vertex project/location/model and verified ADC separately before a live smoke.

## Provider architecture and bounded input

`IssueAnalysisProvider.generate` separates transport from application logic. The real GeminiIssueAnalysisProvider uses the Google SDK. Tests inject deterministic StubProvider responses or a fake generateContent method typed to the installed SDK request/response contracts; none calls a live model.

`analyzeIssue` builds input from canonical organization, selected issue ID, and WU-04 detection result. It verifies the issue exists in that organization, each issue evidence ref resolves to its owner, and duplicates/invalid contracts fail before generation. The provider receives only organization industry/timezone, selected issue ID/type/severity, selected evidence IDs/types/values/units/source refs, and allowed actions. No full workbook, unrelated order, company/customer record, or organization dataset is sent. Bounds: at most 64 evidence records and 32 KiB serialized input. The SDK adapter repeats strict shape/size/duplicate checks at its boundary.

The source detector result is expected to be trusted WU-04 output. These checks establish reference integrity; they do not independently authenticate fabricated source facts. Input strings are designated data rather than instructions in the system instruction.

## Prompt and structured output

Prompt version is exactly `issue-analysis-v1` and is recorded in AIAnalysis metadata. The system instruction prohibits invented quantities/dates/costs/suppliers/customers/capacity/lead times/inventory/executed actions, numerical recalculation, severity/type changes, external execution claims, and unsupported supplier identity. Insufficient evidence must be disclosed through missingData/cannotDetermine. Supplier drafts remain generic because no supplier identity is supplied.

The strict output contract contains summary, whyItMatters, evidenceRefs, recommendations (actionType/title/rationale/evidenceRefs/optional nullable draft), missingData (field/reason), and cannotDetermine. All object levels reject extra fields, including severity/type/numerical fact overrides. Top-level and recommendation evidence refs must be nonempty, known, and unique. Output text is bounded locally; responses above 65,536 UTF-16 units reject before parsing.

## Grounding and allowed actions

Supported actions are supplier_followup_draft, production_priority_note, delivery_review_note. Supplier intent enters the input whitelist only when positive numeric material_shortage evidence is present. Every recommendation must cite supplied evidence; supplier follow-up must itself cite that positive shortage evidence. Unsupported actions/refs are rejected, not silently removed.

Schema validation and reference grounding cannot prove that arbitrary prose contains no invented fact or falsely claims an action. Defense in depth includes bounded evidence, strong versioned instructions, structured output, strict schema/ref/action validation, no data expansion, low-variance generation, and no tools. Human authority remains required. Do not treat acceptance as mathematical proof of hallucination-free prose or action execution.

## Retry and failure contract

One invalid response may receive one reinforced generation retry: malformed JSON, strict-schema failure, unsupported refs/actions, or forbidden function-call response. A second invalid response yields AI_ANALYSIS_UNAVAILABLE with a safe cause code. Provider transport failures return AI_PROVIDER_ERROR without an indefinite/network retry loop. Input/config failures return before invoking the provider. Unknown SDK details/stacks are not exposed. The optional SDK tools/function-call getter is only inspected to reject prohibited returned calls; no tools are configured.

Typed codes: AI_CONFIG_MISSING, AI_INPUT_INVALID, AI_PROVIDER_ERROR, AI_INVALID_RESPONSE, AI_UNSUPPORTED_EVIDENCE_REF, AI_ACTION_UNSUPPORTED, AI_ANALYSIS_UNAVAILABLE. Deterministic Issue/Evidence remain unchanged and usable for every failure. Provider inputs/schema are private clones, including each retry.

## Canonical record and provenance

Successful grounded output becomes an in-memory AIAnalysis using the unchanged canonical schema: id, issueId, model, promptVersion, output, evidenceRefs, createdAt. Execution receives explicit model/createdAt. IDs use collision-safe length-prefixed issueId/model/promptVersion/createdAt values; no hidden clock or randomness is used. Stable metadata IDs do not imply reproducible live prose or constitute persistence/lifecycle reconciliation.

## Validation and live status

Normal tests require no Google credentials: schema, grounding, action compatibility, retry/failure, provider contract, SO-001, provenance, and immutability. SO-001 stub tests preserve critical/order_delay_risk and evidence 30 percent, 2 days, 200 pcs, with grounded advice and missing-data disclosures.

LIVE_GEMINI_SMOKE_TEST: NOT_RUN_NO_CREDENTIALS (no verified ready Vertex identity; project/location/model also unset). ADC path presence was observed without printing credential values. Offline SDK construction and mocked request validation are not a successful live Vertex invocation.

## Scope

No Google Search, function calling, code execution, external tool execution, Action entity generation, Firestore, database repository, UI, API route, dashboard, Cloud Run deployment, or cloud provisioning. WU-06 is not started.
