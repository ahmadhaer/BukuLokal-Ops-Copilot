# WU-10A Vertex structured-schema evidence

Baseline: 15fb01c3c8383fc53a6a5ae5895e1fa04165ffa4. Branch: wu/10-google-cloud-live-deployment.

The exported ISSUE_ANALYSIS_JSON_SCHEMA was loaded directly using Vite ssrLoadModule from src/ai/schemas/issue-analysis.ts. Before the fix, two unsupported pattern keywords had value ^\S+$:

- $.properties.evidenceRefs.items.pattern
- $.properties.recommendations.items.properties.evidenceRefs.items.pattern

Installed @google/genai 2.29.0 declares the GenerateContentConfig.responseJsonSchema supported subset in dist/genai.d.ts (lines 6208–6223). It excludes pattern, minLength, maxLength, and $schema. The application uses responseJsonSchema, not responseSchema.

The new regression suite failed before the fix: 2 failures reported ['pattern', 'pattern']; the other 7 tests passed. After the fix, the generated schema equals the original with only the two pattern properties removed. Local Zod schemas, grounding, retry implementation, model configuration, and Human Gate are unchanged.

This confirms a response schema contract incompatibility. The generic live UI error does not establish that this is the sole live failure; no live provider error, deployment, or live retest was performed for this work unit.

## Exact generated schema before

```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string"
    },
    "whyItMatters": {
      "type": "string"
    },
    "evidenceRefs": {
      "minItems": 1,
      "maxItems": 64,
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^\\S+$"
      }
    },
    "recommendations": {
      "maxItems": 8,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "actionType": {
            "type": "string",
            "enum": [
              "supplier_followup_draft",
              "production_priority_note",
              "delivery_review_note"
            ]
          },
          "title": {
            "type": "string"
          },
          "rationale": {
            "type": "string"
          },
          "evidenceRefs": {
            "minItems": 1,
            "maxItems": 64,
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^\\S+$"
            }
          },
          "draft": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "required": [
          "actionType",
          "title",
          "rationale",
          "evidenceRefs"
        ],
        "additionalProperties": false
      }
    },
    "missingData": {
      "maxItems": 16,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "field",
          "reason"
        ],
        "additionalProperties": false
      }
    },
    "cannotDetermine": {
      "maxItems": 16,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "summary",
    "whyItMatters",
    "evidenceRefs",
    "recommendations",
    "missingData",
    "cannotDetermine"
  ],
  "additionalProperties": false
}
```

## Exact generated schema after

```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string"
    },
    "whyItMatters": {
      "type": "string"
    },
    "evidenceRefs": {
      "minItems": 1,
      "maxItems": 64,
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "recommendations": {
      "maxItems": 8,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "actionType": {
            "type": "string",
            "enum": [
              "supplier_followup_draft",
              "production_priority_note",
              "delivery_review_note"
            ]
          },
          "title": {
            "type": "string"
          },
          "rationale": {
            "type": "string"
          },
          "evidenceRefs": {
            "minItems": 1,
            "maxItems": 64,
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "draft": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "required": [
          "actionType",
          "title",
          "rationale",
          "evidenceRefs"
        ],
        "additionalProperties": false
      }
    },
    "missingData": {
      "maxItems": 16,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "field",
          "reason"
        ],
        "additionalProperties": false
      }
    },
    "cannotDetermine": {
      "maxItems": 16,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "summary",
    "whyItMatters",
    "evidenceRefs",
    "recommendations",
    "missingData",
    "cannotDetermine"
  ],
  "additionalProperties": false
}
```

## Verification results

- npm test: PASS, 398 tests in 45 files (including 9 new regressions).
- npm run lint: PASS.
- npm run typecheck: PASS.
- npm run build: PASS, production build completed.
- git diff --check: PASS.
- Only the Vertex-facing sanitizer, regression tests, and this evidence document changed.
- No credentials, environment files, cloud configuration, IAM, Firestore data, deployment, or GitHub push changes were made.
