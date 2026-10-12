# Architecture

## TARGET ARCHITECTURE

Responsive Web Application using Next.js + React + TypeScript, Tailwind CSS, and Zod.

| Component | Priority / status |
| --- | --- |
| CSV/XLSX import | P0 target |
| Deterministic Operations Engine | P0 target |
| Issue Detection / Evidence Layer | P0 target |
| Gemini via Google Gen AI SDK | P0 target |
| Human Approval Gate | P0 target |
| Firestore | P0 target |
| Google Cloud Run | P0 deployment target |
| Firebase Authentication | Planned |
| Google Sheets read-only connector | P1 target; must not block submission |

Deterministic operational truth precedes AI reasoning. AI advice must be grounded in evidence and recommended actions require human approval. External integrations are initially read-only.

## CURRENTLY IMPLEMENTED

Only the Next.js App Router application foundation: strict TypeScript, React, Tailwind CSS, installed Zod, minimal homepage, and validation tooling. No product engine, domain schemas, AI, persistence, authentication, connectors, or deployment is implemented.

## Directory boundaries

`src/app` holds routes, root layout, and global styles. Reserved empty directories: `components` for shared UI, `features` for future feature orchestration, `domain` for future deterministic rules, `ai` for future advisory integration, `connectors` for future read-only adapters, `lib` for shared utilities, and `types` for shared TypeScript types. These directory boundaries do not implement functionality. Tests have unit, integration, and fixture locations; integration and fixture locations are empty at WU-00.
