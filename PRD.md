PRD ID: BL-AIBC-PRD-001
Version: v0.1
Status: BUILD BASELINE
Canonical Owner-Approved Product Requirements

# PRODUCT REQUIREMENTS DOCUMENT

## BukuLokal Ops Copilot — AI Builder Cup 2026

**PRD ID:** BL-AIBC-PRD-001
**Version:** v0.1
**Date:** 12 October 2026
**Status:** BUILD BASELINE
**Product Owner:** Founder / Team BukuLokal
**Hackathon:** Google Cloud AI Builder Cup 2026
**Theme:** Manufacturing — Intelligent Operations & Industrial Efficiency
**Prototype Submission Deadline:** 18 October 2026
**Team Formation Deadline:** 14 October 2026

---

# 1. Executive Summary

BukuLokal Ops Copilot adalah aplikasi web berbasis AI untuk membantu pemilik dan manajer usaha manufaktur ringan mengetahui:

1. masalah operasional apa yang sedang terjadi;
2. mengapa masalah tersebut terjadi;
3. seberapa mendesak masalah tersebut;
4. tindakan apa yang sebaiknya dilakukan selanjutnya.

Produk menerima data sederhana seperti:

- sales/order;
- inventory/material;
- progress produksi;
- due date.

Data dapat berasal dari:

- demo dataset;
- CSV/XLSX;
- Google Sheets.

Sistem terlebih dahulu menghitung fakta menggunakan deterministic business engine.

Gemini **tidak digunakan sebagai kalkulator utama**.

Setelah fakta diketahui, Gemini digunakan untuk:

- menjelaskan masalah;
- menghubungkan beberapa fakta operasional;
- menyusun rekomendasi;
- membuat draft tindakan;
- menjelaskan informasi yang masih kurang.

Setiap tindakan penting tetap melewati:

**Human Approval Gate.**

Core workflow:

**Input → Validate → Normalize → Calculate → Detect → Explain → Recommend → Human Approve**

---

# 2. Hackathon Constraint

Prototype wajib merupakan project baru yang dibangun selama periode hackathon. Existing BukuLokal source code tidak boleh dijadikan dasar implementasi submission.

Official FAQ menyatakan bahwa project yang sudah ada atau dimulai sebelum program tidak eligible. Prototype harus bekerja end-to-end dan deployed ke Cloud Run/GCP/Firebase. Submission juga memerlukan deployed prototype, video demo kurang dari tiga menit, public GitHub repository, dan deck.

Karena itu:

**Boleh digunakan:**

- problem knowledge BukuLokal;
- pengalaman founder;
- pengetahuan domain manufaktur;
- business insight;
- konsep human approval;
- product vision.

**Tidak boleh digunakan sebagai source submission:**

- existing BukuLokal repository;
- existing BukuLokal application code;
- existing UI implementation;
- existing application assets;
- copy-paste implementation dari project lama.

Repository hackathon wajib baru.

---

# 3. Problem Statement

Small manufacturers often already have operational data but still struggle to turn that data into timely decisions.

Data order, inventory, procurement, dan production progress sering tersebar di:

- spreadsheet;
- catatan manual;
- software berbeda;
- file yang dibuat dengan format berbeda.

Akibatnya, owner atau operations manager harus mencari sendiri:

- order mana yang berisiko terlambat;
- material mana yang kurang;
- produksi mana yang tertinggal;
- masalah mana yang harus ditangani terlebih dahulu.

Masalah inti bukan selalu:

> “Tidak ada data.”

Masalahnya:

> “Data tersedia, tetapi sulit diubah menjadi keputusan operasional yang cepat.”

Theme Manufacturing AI Builder Cup secara spesifik meminta solusi yang menggunakan AI untuk mengubah operational data menjadi insight, recommendation, atau action.

---

# 4. Product Vision

BukuLokal Ops Copilot ingin menjawab satu pertanyaan sederhana bagi pemilik usaha:

> **“Apa yang perlu saya perhatikan dan lakukan hari ini?”**

Bukan menggantikan ERP.

Bukan menggantikan manusia.

Bukan menjadi chatbot generik.

Produk bertindak sebagai:

**Operational Intelligence Layer.**

---

# 5. Target User

## Primary Persona

**Owner / Operations Manager usaha manufaktur ringan**

Karakteristik:

- bukan orang IT;
- terbiasa menggunakan Excel atau Google Sheets;
- mengerti bisnis tetapi tidak memahami API;
- menginginkan informasi cepat;
- tidak ingin melakukan konfigurasi teknis;
- membutuhkan penjelasan dengan bahasa sederhana.

Contoh bisnis:

- konveksi;
- garment;
- packaging;
- percetakan;
- furniture kecil;
- food manufacturing ringan;
- merchandise manufacturing;
- workshop produksi.

---

# 6. Product Principles

## 6.1 No Technical Literacy Required

User tidak boleh perlu memahami:

- API;
- OAuth;
- JSON;
- database;
- endpoint;
- Gemini;
- Google Cloud.

User hanya melihat:

> Upload data

atau:

> Connect Google Sheets

---

## 6.2 Deterministic Facts Before AI

Perhitungan dilakukan oleh program.

Contoh:

```text
Ordered Qty = 500
Completed Qty = 150

Completion = 30%
```

Gemini menerima:

```text
Completion = 30%
```

bukan menghitung sendiri dari sumber data kecuali diperlukan sebagai fallback non-authoritative.

---

## 6.3 Evidence-Grounded AI

Setiap penjelasan dan rekomendasi AI harus mempunyai referensi terhadap evidence yang diberikan sistem.

Gemini tidak boleh menciptakan:

- jumlah barang;
- deadline;
- harga;
- customer;
- supplier;
- status order.

---

## 6.4 Human Final Authority

AI:

**recommend**

Manusia:

**approve / edit / reject**

Prototype tidak boleh otomatis:

- membeli barang;
- mengubah production schedule;
- mengirim pesan;
- mengubah spreadsheet eksternal;
- mengubah order.

---

## 6.5 Read First, Write Later

External integration dalam hackathon diprioritaskan **read-only**.

Write-back merupakan future capability.

---

# 7. Core User Journey

Golden Path:

```text
OPEN APP
    ↓
TRY DEMO / LOGIN
    ↓
SELECT DATA SOURCE
    ↓
UPLOAD DATA
    ↓
MAP COLUMNS
    ↓
VALIDATE DATA
    ↓
PROCESS DATA
    ↓
DASHBOARD
    ↓
ISSUES DETECTED
    ↓
SELECT ISSUE
    ↓
GEMINI ANALYSIS
    ↓
RECOMMENDED ACTION
    ↓
APPROVE / EDIT / REJECT
    ↓
ACTION LOGGED
```

---

# 8. Input Design

## Input Method A — Demo Dataset

Priority: **P0 — Mandatory**

User clicks:

**Try Demo**

System creates synthetic manufacturing data.

Purpose:

- judge demo;
- testing;
- onboarding;
- reproducibility.

No login should be required before judge can experience the basic demo.

---

## Input Method B — CSV/XLSX

Priority: **P0 — Mandatory**

Supported initial files:

- `.csv`
- `.xlsx`

Recommended limit:

- maximum 5 MB;
- maximum ±5,000 rows for hackathon prototype.

System reads:

### Orders

Required canonical fields:

```text
order_id
customer_name
product_name
ordered_quantity
due_date
```

### Production

```text
order_id
planned_quantity
completed_quantity
```

### Inventory

```text
material_id
material_name
available_quantity
required_quantity
```

---

# 9. Column Mapping

Different companies may use different headings.

Example:

```text
No PO
Jumlah
Deadline
Selesai
```

System converts them into:

```text
order_id
ordered_quantity
due_date
completed_quantity
```

## P0 Mapping

Use deterministic synonym dictionary.

Example:

```text
"qty"
"quantity"
"jumlah"
"jumlah pesanan"
"order qty"
```

→

```text
ordered_quantity
```

## P1 Mapping

If deterministic matching fails:

Gemini may suggest mappings based on:

- column name;
- small sanitized sample;
- known canonical schema.

AI suggestions must require user confirmation.

Example UI:

```text
We think these columns mean:

No PO              → Order Number       ✓
Jumlah Pesanan     → Ordered Quantity   ✓
Tanggal Selesai    → Due Date           ?

[Confirm Mapping]
```

---

# 10. Validation Layer

Data is validated before business rules or AI execution.

Examples:

```text
order_id missing
ordered_quantity invalid
due_date invalid
completed_quantity > ordered_quantity
negative stock
duplicate order ID
```

Invalid data must not silently enter analysis.

Output example:

```text
3 rows need attention.

Row 4 — Missing Due Date
Row 8 — Invalid Quantity
Row 14 — Duplicate Order ID
```

---

# 11. Normalization Layer

All data sources must be converted into a single internal structure.

External:

```text
Jumlah Pesanan
500
```

Internal:

```text
ordered_quantity: 500
```

Every connector must produce the same canonical structure.

This decouples BukuLokal from individual platforms.

---

# 12. Deterministic Business Engine

Business engine performs factual calculations.

Examples:

### Production Completion

```text
completed_quantity / ordered_quantity × 100
```

### Material Shortage

```text
required_quantity - available_quantity
```

if result > 0.

### Days to Deadline

```text
due_date - current_date
```

### Remaining Quantity

```text
ordered_quantity - completed_quantity
```

---

# 13. Issue Detection Engine

Rules in v0.1 are **hackathon demonstration policies**, not universal manufacturing standards.

Rules must be configurable.

Example:

### MATERIAL_SHORTAGE

```text
available_quantity < required_quantity
```

### CRITICAL_ORDER_RISK

Example demo rule:

```text
days_to_deadline <= 2
AND
(
 production_completion < 50%
 OR
 material_shortage > 0
)
```

### HIGH_ORDER_RISK

```text
days_to_deadline <= 3
AND production_completion < 80%
```

### MEDIUM_ORDER_RISK

```text
days_to_deadline <= 7
AND production_completion < 80%
```

The UI must clearly avoid presenting these thresholds as industry standards.

---

# 14. Evidence Object

Before Gemini is called, system creates an evidence package.

Example:

```json
{
  "issueId": "ISS-001",
  "orderId": "SO-001",
  "severity": "critical",
  "evidence": [
    {
      "id": "EV-001",
      "type": "production_completion",
      "value": 30,
      "unit": "%"
    },
    {
      "id": "EV-002",
      "type": "material_shortage",
      "value": 200,
      "unit": "pcs"
    },
    {
      "id": "EV-003",
      "type": "days_to_deadline",
      "value": 2,
      "unit": "days"
    }
  ]
}
```

Gemini only reasons over this evidence package plus limited contextual information.

---

# 15. Gemini Role

Gemini performs:

### A. Explanation

Explain why an issue matters.

### B. Prioritization Context

Explain why an already deterministic severity deserves attention.

Gemini cannot overwrite the calculated severity.

### C. Recommendation

Suggest operational next steps.

### D. Action Draft

Generate drafts such as:

- supplier follow-up;
- production priority note;
- internal operations note;
- customer delivery review draft.

### E. Missing Information Detection

Example:

> Supplier lead time is unavailable, so delivery feasibility cannot be confirmed.

This behavior is preferable to hallucinating supplier lead time.

Google's current Gen AI SDK supports structured JSON output, and Google recommends the `@google/genai` SDK for JavaScript/TypeScript. Structured output is appropriate here because the UI requires predictable schema rather than uncontrolled free-form text.

---

# 16. Gemini Input Contract

```json
{
  "organizationContext": {
    "industry": "light_manufacturing",
    "timezone": "Asia/Jakarta"
  },
  "issue": {
    "issueId": "ISS-001",
    "type": "order_delay_risk",
    "severity": "critical"
  },
  "evidence": [
    {
      "id": "EV-001",
      "fact": "production_completion",
      "value": 30,
      "unit": "%"
    },
    {
      "id": "EV-002",
      "fact": "material_shortage",
      "value": 200,
      "unit": "pcs"
    },
    {
      "id": "EV-003",
      "fact": "days_to_deadline",
      "value": 2,
      "unit": "days"
    }
  ],
  "allowedActions": [
    "supplier_followup_draft",
    "production_priority_note",
    "delivery_review_note"
  ]
}
```

---

# 17. Gemini Output Contract

Gemini must return strict structured JSON.

```json
{
  "summary": "SO-001 has a high risk of missing its deadline.",
  "whyItMatters": "Production is only 30% complete with two days remaining and required material is unavailable.",
  "evidenceRefs": [
    "EV-001",
    "EV-002",
    "EV-003"
  ],
  "recommendations": [
    {
      "actionType": "supplier_followup_draft",
      "title": "Contact supplier",
      "rationale": "200 pcs of required material are currently unavailable.",
      "evidenceRefs": [
        "EV-002"
      ]
    }
  ],
  "missingData": [],
  "cannotDetermine": []
}
```

Every recommendation must contain:

```text
evidenceRefs
```

No evidence → recommendation must be rejected by validation.

---

# 18. Gemini Guardrails

System instruction must include:

```text
Use only supplied evidence.

Never invent quantities, dates, costs,
supplier information, customer information,
production capacity, or lead times.

Do not modify deterministic calculations.

If information is insufficient,
place it in missingData or cannotDetermine.

Recommendations are advisory.

Never claim that an external action
has been executed.

Return only the required schema.
```

Output must pass Zod validation.

Invalid output:

```text
retry once
```

If still invalid:

```text
AI analysis unavailable
```

and deterministic data remains visible.

The application must never become unusable merely because Gemini fails.

---

# 19. Human Gate

Possible statuses:

```text
suggested
approved
edited
rejected
```

Actions never execute automatically.

Example:

```text
Recommended Action

Contact supplier regarding
200 pcs material shortage.

[Approve]
[Edit]
[Reject]
```

After approval:

```text
Approved Action

Draft supplier message created.
```

For hackathon, approval records the action but does **not** send the message externally.

---

# 20. Google Sheets Integration

Priority:

**P1 — High-value target, but not allowed to block core submission.**

Initial UX:

```text
Connect Google Sheets

Paste your Google Sheets link:

[________________________]

[Connect with Google]
```

We intentionally avoid building a full Drive browser initially.

Reason:

lower complexity and fewer permissions.

Google Sheets API supports reading spreadsheet values by spreadsheet ID and range. Google OAuth allows users to authorize access without sharing their Google password with BukuLokal.

Initial permission:

```text
spreadsheets.readonly
```

No write permission.

Integration flow:

```text
USER
 ↓
Paste Sheet URL
 ↓
Google Consent
 ↓
Read-only token
 ↓
Sheets API
 ↓
Raw rows
 ↓
Connector Adapter
 ↓
Normalization
 ↓
BukuLokal Core
```

---

# 21. Connector Architecture

Every future integration must implement a common contract.

Conceptual interface:

```text
Connector

connect()
testConnection()
read()
normalize()
disconnect()
```

Standard result:

```json
{
  "source": "google_sheets",
  "records": [],
  "metadata": {
    "importedAt": "...",
    "recordCount": 100
  }
}
```

Future possible connectors:

```text
Google Sheets
Excel
CSV
Accurate
Odoo
ERP
POS
Marketplace
Accounting software
```

But they are explicitly **out of scope** for hackathon unless needed for demo.

---

# 22. Screen Architecture

## SCREEN 01 — Landing

Purpose:

Explain product immediately.

Content:

```text
BukuLokal Ops Copilot

Know what needs your attention today.

Turn operations data into
prioritized actions with AI.
```

Buttons:

```text
[Try Demo]
[Sign In]
```

---

## SCREEN 02 — Data Source

```text
Where is your operations data?

[Demo Data]

[Upload CSV / Excel]

[Connect Google Sheets]
```

No technical terminology.

---

## SCREEN 03 — Import Preview

Shows:

```text
File:
production_october.xlsx

Rows detected:
825

Sheets detected:
3
```

Continue:

```text
[Review Data Mapping]
```

---

## SCREEN 04 — Mapping

Show:

```text
Your Column          BukuLokal Field

No PO                Order Number
Customer             Customer
Jumlah               Ordered Quantity
Deadline             Due Date
Sudah Produksi       Completed Quantity
```

Buttons:

```text
[Confirm]
[Change Mapping]
```

---

## SCREEN 05 — Data Health

Example:

```text
822 rows ready.

3 rows need attention.
```

User can:

```text
[Fix]
[Exclude Invalid Rows]
```

---

## SCREEN 06 — Operations Dashboard

Primary screen.

Top section:

```text
TODAY

12 Orders

3 At Risk

2 Material Shortages

1 Critical Issue
```

Priority feed:

```text
CRITICAL

SO-001
2 days remaining
30% complete
200 pcs shortage

[Review]
```

---

## SCREEN 07 — Issue Detail

Three layers:

### WHAT

```text
SO-001 may miss its deadline.
```

### WHY

```text
Production completion     30%
Material shortage         200 pcs
Deadline                  2 days
```

### WHAT TO DO

Gemini recommendations.

---

## SCREEN 08 — Action Review

Example:

```text
Supplier Follow-up Draft

Hello...

We need an additional 200 pcs...
```

Buttons:

```text
[Approve]
[Edit]
[Reject]
```

---

## SCREEN 09 — Activity

Audit trail:

```text
20:10 Issue detected
20:11 AI analysis generated
20:12 Action approved
```

---

# 23. Information Architecture

Navigation:

```text
Dashboard
Issues
Actions
Data
Integrations
```

For hackathon the sidebar must remain small.

No modules for:

- accounting;
- payroll;
- CRM;
- POS;
- finance reports.

---

# 24. Firestore Data Schema

Cloud Firestore is selected because it allows a simple document/collection model and rapid iteration suitable for this prototype. Google documents Firestore as a document-oriented NoSQL database where records are stored as documents organized into collections.

Structure:

```text
organizations/
  {organizationId}/

    data_sources/
      {dataSourceId}

    imports/
      {importId}

    orders/
      {orderId}

    inventory_items/
      {inventoryItemId}

    production_jobs/
      {productionJobId}

    issues/
      {issueId}

    ai_analyses/
      {analysisId}

    actions/
      {actionId}

    audit_events/
      {eventId}
```

---

# 25. Core Entity — Order

```json
{
  "id": "SO-001",
  "organizationId": "ORG-001",
  "customerName": "Customer A",
  "productName": "T-Shirt",
  "orderedQuantity": 500,
  "dueDate": "2026-10-15",
  "status": "in_production",
  "sourceId": "IMPORT-001"
}
```

---

# 26. Production Job

```json
{
  "id": "PJ-001",
  "orderId": "SO-001",
  "plannedQuantity": 500,
  "completedQuantity": 150,
  "updatedAt": "..."
}
```

---

# 27. Inventory Item

```json
{
  "id": "MAT-001",
  "materialName": "Fabric A",
  "availableQuantity": 300,
  "requiredQuantity": 500,
  "unit": "pcs"
}
```

---

# 28. Issue

```json
{
  "id": "ISS-001",
  "organizationId": "ORG-001",
  "orderId": "SO-001",
  "type": "order_delay_risk",
  "severity": "critical",
  "status": "open",
  "evidence": [],
  "detectedAt": "..."
}
```

---

# 29. AI Analysis

```json
{
  "id": "AI-001",
  "issueId": "ISS-001",
  "model": "configured-gemini-model",
  "promptVersion": "v1",
  "output": {},
  "evidenceRefs": [],
  "createdAt": "..."
}
```

The exact Gemini model must be configurable via:

```text
GEMINI_MODEL
```

Do not hard-code model version throughout the codebase.

---

# 30. Action

```json
{
  "id": "ACT-001",
  "issueId": "ISS-001",
  "type": "supplier_followup_draft",
  "status": "suggested",
  "draft": "...",
  "approvedBy": null,
  "approvedAt": null
}
```

---

# 31. Audit Event

```json
{
  "id": "AUD-001",
  "actor": "user",
  "event": "action_approved",
  "entityType": "action",
  "entityId": "ACT-001",
  "timestamp": "..."
}
```

---

# 32. API Contract

## Dashboard

```text
GET /api/dashboard
```

Returns:

```json
{
  "orders": 12,
  "atRisk": 3,
  "materialShortages": 2,
  "criticalIssues": 1
}
```

---

## Demo Dataset

```text
POST /api/demo/seed
```

Purpose:

create fresh synthetic demo workspace.

---

## File Import

```text
POST /api/import/file
```

Input:

```text
multipart/form-data
```

Return:

```json
{
  "importId": "IMPORT-001",
  "detectedColumns": [],
  "recordCount": 825
}
```

---

## Mapping Preview

```text
GET /api/import/{id}/mapping
```

---

## Confirm Mapping

```text
POST /api/import/{id}/mapping
```

---

## Validate Import

```text
POST /api/import/{id}/validate
```

---

## Process Import

```text
POST /api/import/{id}/process
```

---

## Run Issue Detection

```text
POST /api/issues/detect
```

---

## Issue Detail

```text
GET /api/issues/{issueId}
```

---

## Analyze Issue

```text
POST /api/issues/{issueId}/analyze
```

This endpoint calls Gemini.

---

## Approve Action

```text
POST /api/actions/{actionId}/approve
```

---

## Reject Action

```text
POST /api/actions/{actionId}/reject
```

---

## Edit Action

```text
PATCH /api/actions/{actionId}
```

---

# 33. Google Sheets API Contract

## Start Connection

```text
POST /api/integrations/google-sheets/connect
```

---

## OAuth Callback

```text
GET /api/integrations/google-sheets/callback
```

---

## Import Sheet

```text
POST /api/integrations/google-sheets/import
```

Input:

```json
{
  "spreadsheetUrl": "...",
  "range": "Orders!A1:G1000"
}
```

MVP should not write to Google Sheets.

---

# 34. Recommended Tech Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

## Backend

```text
Next.js Server Routes
TypeScript
```

## Schema Validation

```text
Zod
```

## AI

```text
Google Gen AI SDK
@google/genai
Gemini
```

Google currently recommends the Google Gen AI SDK as its unified SDK for Gemini Developer API and Vertex AI access.

## Database

```text
Cloud Firestore
```

## Authentication

```text
Firebase Authentication
```

Firebase Authentication supports web sign-in mechanisms including email/password and federated identity providers such as Google.

## File Parsing

```text
Papa Parse
ExcelJS
```

## Google Integration

```text
Google OAuth
Google Sheets API
```

## Deployment

```text
Google Cloud Run
```

## Source Control

```text
Fresh GitHub repository
```

---

# 35. Runtime Architecture

```text
                        USER
                          │
                          ▼
                   WEB BROWSER
                          │
                          ▼
                ┌────────────────┐
                │ NEXT.JS WEB APP│
                └───────┬────────┘
                        │
                   CLOUD RUN
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
    FILE INPUT       SHEETS API      FIREBASE AUTH
        │               │
        └───────┬───────┘
                ▼
          NORMALIZATION
                │
                ▼
           VALIDATION
                │
                ▼
      DETERMINISTIC ENGINE
                │
                ▼
         ISSUE DETECTION
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
     FIRESTORE       GEMINI
                       │
                       ▼
                  AI ANALYSIS
                       │
                       ▼
                  HUMAN GATE
                       │
                       ▼
                   ACTION LOG
```

Cloud Run is suitable because it provides a managed container runtime and produces a stable deployed service URL. It supports deployment from source or container images.

---

# 36. Deployment Design

Recommended region:

```text
asia-southeast1
```

subject to service availability and team project configuration.

Deployment flow:

```text
GitHub
  ↓
Build
  ↓
Container / source deployment
  ↓
Cloud Run
  ↓
Public prototype URL
```

Environment variables:

```text
GEMINI_MODEL
GOOGLE_CLOUD_PROJECT
FIREBASE_PROJECT_ID
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
APP_BASE_URL
```

Secrets must not be committed to Git.

---

# 37. Repository Structure

```text
bukulokal-ops-copilot/
│
├── README.md
├── FRESHNESS.md
├── PRD.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── SUBMISSION.md
│
├── docs/
│   ├── demo-script.md
│   ├── test-evidence.md
│   └── screenshots/
│
├── src/
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── features/
│   │   ├── imports/
│   │   ├── dashboard/
│   │   ├── issues/
│   │   ├── actions/
│   │   └── integrations/
│   │
│   ├── domain/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── production/
│   │   └── issues/
│   │
│   ├── ai/
│   │   ├── prompts/
│   │   ├── schemas/
│   │   └── gemini.ts
│   │
│   ├── connectors/
│   │   ├── csv/
│   │   ├── excel/
│   │   └── google-sheets/
│   │
│   ├── lib/
│   └── types/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── public/
```

---

# 38. Freshness Control

`FRESHNESS.md` must state:

```text
This repository was created specifically
during the AI Builder Cup 2026 development period.

No pre-existing BukuLokal application
source code was copied into this repository.

The prototype is a new standalone implementation
built for the competition.
```

Git history becomes supporting evidence.

---

# 39. Priority Classification

## P0 — Submission Critical

Must work:

- fresh repository;
- demo dataset;
- CSV/XLSX import;
- mapping;
- validation;
- normalization;
- deterministic calculations;
- issue detection;
- dashboard;
- issue detail;
- Gemini analysis;
- structured AI response;
- evidence references;
- recommended actions;
- human gate;
- Firestore;
- Cloud Run deployment;
- public working prototype;
- README;
- tests;
- demo script.

If any P0 item threatens deadline, P1 must be stopped.

---

## P1 — Target

Build after P0 golden path works:

- Google Sheets read-only connector;
- Google authentication;
- enhanced activity log;
- AI-assisted column mapping.

---

## P2 — Post Hackathon

Not built before submission unless all P0/P1 complete:

- Odoo;
- Accurate;
- POS;
- marketplaces;
- supplier API;
- automatic messaging;
- write-back to Sheets;
- accounting;
- invoice management;
- purchase order creation;
- autonomous agents;
- multi-agent orchestration;
- mobile native app.

---

# 40. Non-Goals

The prototype is explicitly NOT:

- complete ERP;
- complete manufacturing execution system;
- accounting application;
- POS;
- CRM;
- inventory platform replacement;
- autonomous procurement system;
- general AI chatbot.

---

# 41. Acceptance Criteria — Data

### AC-DATA-001

User can load demo dataset without external configuration.

### AC-DATA-002

User can upload valid CSV/XLSX.

### AC-DATA-003

System displays detected columns.

### AC-DATA-004

User can confirm field mappings.

### AC-DATA-005

Invalid records are reported before processing.

### AC-DATA-006

No invalid numerical data is silently accepted.

---

# 42. Acceptance Criteria — Business Engine

### AC-BIZ-001

Production completion is calculated deterministically.

### AC-BIZ-002

Material shortage is calculated deterministically.

### AC-BIZ-003

Days remaining is calculated deterministically.

### AC-BIZ-004

Issue severity follows documented configurable rules.

### AC-BIZ-005

Identical input produces identical deterministic results.

---

# 43. Acceptance Criteria — Gemini

### AC-AI-001

Gemini receives structured evidence.

### AC-AI-002

Gemini output must conform to schema.

### AC-AI-003

Every recommendation contains evidence references.

### AC-AI-004

AI cannot change deterministic facts.

### AC-AI-005

Missing data is explicitly surfaced.

### AC-AI-006

Invalid Gemini output does not crash application.

### AC-AI-007

Core deterministic dashboard remains usable if Gemini fails.

---

# 44. Acceptance Criteria — Human Gate

### AC-HG-001

Suggested actions default to:

```text
suggested
```

### AC-HG-002

No action is approved without explicit user action.

### AC-HG-003

User can:

```text
approve
edit
reject
```

### AC-HG-004

Approval is recorded in audit log.

### AC-HG-005

Prototype does not automatically execute external actions.

---

# 45. Acceptance Criteria — User Experience

A first-time nontechnical user should be able to:

```text
open app
→ try demo
→ see critical issue
→ understand why
→ request AI analysis
→ review recommendation
→ approve/reject action
```

without documentation.

Target:

**≤ 2 minutes from landing page to first useful AI recommendation using demo data.**

---

# 46. Acceptance Criteria — Deployment

Prototype must:

- run from a public URL;
- be deployed on Google Cloud;
- load without developer machine;
- not expose private secrets;
- use Gemini as a meaningful part of the workflow;
- survive basic refresh/navigation;
- use synthetic demo data by default.

This directly supports official hackathon requirements for a functional Google Cloud-deployed prototype.

---

# 47. Testing Requirements

Unit tests required for:

```text
normalization
validation
production calculations
inventory calculations
issue rules
AI schema validation
```

Integration test:

```text
demo data
→ processing
→ issue
→ AI contract
→ action
```

At least one end-to-end smoke test:

```text
Landing
→ Try Demo
→ Dashboard
→ Issue
→ Analyze
→ Approve
```

---

# 48. Synthetic Demo Scenario

Primary demo company:

**ABC Apparel Manufacturing**

Order:

```text
SO-001
500 T-Shirts
Deadline: 2 days
```

Production:

```text
Completed:
150 pcs

Completion:
30%
```

Material:

```text
Required:
500

Available:
300

Shortage:
200
```

Expected deterministic issue:

```text
CRITICAL
```

Expected Gemini behavior:

Explain that:

- only 30% production is complete;
- deadline is near;
- material shortage exists.

Recommended actions:

- contact supplier;
- prioritize production;
- review delivery feasibility.

---

# 49. Judge Demo Flow

## 0:00–0:20

Problem.

> Small manufacturers already have data, but turning it into timely decisions is difficult.

## 0:20–0:40

Open BukuLokal Ops Copilot.

Click:

**Try Demo**

## 0:40–1:00

Dashboard detects:

```text
1 Critical Issue
2 Material Shortages
3 At-Risk Orders
```

## 1:00–1:30

Open SO-001.

Show deterministic evidence.

## 1:30–2:00

Click:

**Analyze with AI**

Gemini explains problem.

## 2:00–2:30

Generate recommended supplier follow-up.

Show:

```text
Approve
Edit
Reject
```

## 2:30–2:50

Approve action.

Show audit trail.

## 2:50–3:00

Vision:

> BukuLokal turns fragmented operations data into evidence-grounded actions for small manufacturers.

---

# 50. Success Metrics

Hackathon success does not depend on number of features.

Prototype considered successful when:

### Functional

Golden path works reliably.

### Explainable

Every AI output can be traced to evidence.

### Useful

User can understand operational risk faster than manually inspecting raw data.

### Simple

A nontechnical user can operate it.

### Eligible

Project satisfies hackathon platform and freshness requirements.

### Demonstrable

Core value can be shown in less than three minutes.

---

# 51. Hackathon Judging Alignment

Official judging weights:

```text
Technical Merit & GenAI Implementation      40%
Problem Alignment & Impact                  25%
Innovation & Creativity                     25%
UX & Solution Design                        10%
```


## Technical Merit

Demonstrated through:

- deterministic engine;
- structured Gemini integration;
- evidence grounding;
- output validation;
- Cloud deployment;
- connector architecture;
- graceful AI failure.

## Problem Alignment

Demonstrated through:

- manufacturing operations;
- inventory;
- production;
- deadline risk.

## Innovation

Demonstrated through:

```text
Operational Data
→ Deterministic Evidence
→ AI Reasoning
→ Human-Controlled Action
```

rather than basic chatbot behavior.

## UX

Demonstrated through:

- no API configuration;
- simple upload;
- automatic mapping;
- prioritized dashboard;
- plain-language explanation.

---

# 52. Development Governance

Codex / Antigravity may implement this PRD.

Development agents are NOT authorized to:

- reuse code from existing BukuLokal repositories;
- expand scope without approval;
- add new infrastructure without reason;
- implement external write actions;
- automatically send communications;
- weaken human approval;
- commit secrets;
- change core business rules without documented decision.

Every architectural change must be recorded in:

```text
DECISIONS.md
```

---

# 53. Build Sequence

## Gate 0 — Freshness

Create:

```text
fresh repository
FRESHNESS.md
PRD.md
ARCHITECTURE.md
```

PASS condition:

No copied source code.

---

## Gate 1 — Data Foundation

Implement:

```text
demo fixture
file import
normalization
validation
```

PASS:

Canonical data produced reliably.

---

## Gate 2 — Business Engine

Implement:

```text
calculations
issue detection
evidence object
```

PASS:

Same input → same result.

---

## Gate 3 — AI

Implement:

```text
Gemini
structured response
evidence references
guardrails
```

PASS:

AI output valid and grounded.

---

## Gate 4 — Product

Implement:

```text
dashboard
issue detail
actions
human gate
```

PASS:

Golden path end-to-end works.

---

## Gate 5 — Deployment

Implement:

```text
Firestore
Cloud Run
production configuration
```

PASS:

Public deployed link works independently.

---

## Gate 6 — Integration

Implement if P0 is stable:

```text
Google Sheets read-only
```

---

## Gate 7 — Submission

Produce:

```text
public GitHub
README
deployed URL
demo video < 3 minutes
PDF deck
submission copy
```

---

# 54. Schedule

## 12 October

Lock:

```text
PRD
Architecture
Repo
Freshness
Synthetic dataset
```

## 13 October

Complete:

```text
data pipeline
business engine
issue engine
```

## 14 October

Complete:

```text
Gemini integration
team formation
```

Official team formation closes October 14.

## 15 October

Complete:

```text
dashboard
issue detail
human gate
```

## 16 October

Complete:

```text
Google Sheets if P0 stable
Cloud Run deployment
```

## 17 October

Complete:

```text
QA
README
deck
video
submission rehearsal
```

## 18 October

Only:

```text
final verification
submission
```

Official prototype submission deadline is October 18, 2026.

---

# 55. Architecture Decision Baseline

The following decisions are considered locked for v0.1:

```text
Product:
BukuLokal Ops Copilot — Hackathon Fresh Build

Theme:
Manufacturing

Platform:
Responsive Web Application

Language:
TypeScript end-to-end

Framework:
Next.js / React

Database:
Cloud Firestore

Authentication:
Firebase Authentication

AI:
Gemini through Google Gen AI SDK

Structured Validation:
Zod

Deployment:
Google Cloud Run

P0 Input:
Demo + CSV/XLSX

P1 Integration:
Google Sheets read-only

AI Role:
Explain + Recommend + Draft

Numerical Truth:
Deterministic Engine

External Actions:
Disabled

Decision Authority:
Human

Repository:
Fresh standalone GitHub repository
```

Any change from this baseline requires a documented architectural decision.

---

# 56. Final Product Statement

**English submission statement:**

> BukuLokal Ops Copilot helps small manufacturers turn fragmented operational data into prioritized, evidence-grounded actions. It combines deterministic operational analysis with Gemini-powered reasoning, while keeping humans in control of every important action.

**Simplified explanation:**

> BukuLokal tells a business owner what operational problem needs attention today, why it is happening, and what they should consider doing next.

---

# 57. Definition of Done

The hackathon MVP is DONE only when:

```text
Fresh project verified
✓

Demo dataset works
✓

CSV/XLSX import works
✓

Operational facts calculated correctly
✓

Issues detected
✓

Gemini analysis works
✓

Gemini output schema validated
✓

Evidence displayed
✓

Human approval works
✓

Application deployed on Cloud Run
✓

Public URL works
✓

GitHub repository public
✓

README complete
✓

Video under 3 minutes
✓

Submission deck complete
✓

Final QA PASS
✓
```

Anything beyond those requirements is optional until the submission has been secured.

---

**END — BL-AIBC-PRD-001 v0.1**
