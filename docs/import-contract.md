# WU-02 import contract

## Files and boundaries

Only UTF-8 comma-delimited `.csv` and `.xlsx` are supported (case-insensitive extension). Papa Parse handles CSV; ExcelJS handles XLSX. `parseImportFile({ name, bytes })` returns raw tables; format-specific parsers are also available. Unsupported extensions, invalid UTF-8/quoting, corrupt workbooks, missing headers, duplicate normalized headers, and extra nonempty cells outside header columns raise typed `ImportError` objects. These serialize only `errorCode` and `humanReadableMessage`; never serialize a stack trace for the UI.

Named limits: `MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024` and `MAX_IMPORT_ROWS = 5_000`. Limits are inclusive. No truncation occurs. The XLSX row limit applies across all nonempty tables in one workbook; normalizers also check directly supplied table sizes. ExcelJS loads the workbook into memory before row inspection: these prototype limits do not constitute a decompressed ZIP size/memory budget. There is no upload endpoint or disk upload storage.

## Raw representation

A `RawTable` contains sourceName, optional sheetName, original headers, and rows with `rowNumber` and a record of raw values. The first meaningful row is the header. Entirely blank rows/sheets are ignored; physical row numbers are retained, including gaps and quoted multiline CSV records. CSV quantities remain text until normalization. XLSX numeric cells remain numbers; spreadsheet dates remain Date values.

XLSX formulas are never calculated. Only available cached results are read; formulas without cached results and spreadsheet error cells cause PARSE_ERROR. Rich text is flattened to its displayed text. Hyperlinks yield displayed text only; no URL is fetched. No macro, uploaded code, arbitrary expression, external workbook link, or network request is executed.

## Dataset kinds and mapping

Only `orders`, `production`, and `inventory` can become canonical records. `suggestMapping(table, chosenKind?)` compares normalized headers: trimmed, lowercase, repeated spaces collapsed, underscore/hyphen/space presentation differences normalized. It preserves original header names. Matching uses canonical field names and a small explicit English/Indonesian synonym dictionary; there is no fuzzy or AI matching.

Automatic kind recognition requires all non-defaultable core fields, unique target coverage, and a unique best coverage score. Defaultable unit/timestamp fields can be absent without inventing their values; suggestions still report them as missing required mappings. Ties, insufficient core coverage, and mapping ambiguity leave datasetKind null. Callers may explicitly select a dataset kind and resolve conflicts. Unmatched columns stay outside canonical records, including imported derived-fact columns.

Every suggestion has `requiresConfirmation: true`, including perfect matches. `createImportPreview` returns filename, sheet, row count, headers, suggested kind, suggestions, and typed mapping warnings. It performs no canonical processing.

## Confirmation and context

Call `confirmMapping(table, input)` only after an explicit caller/user confirmation. The input must include `confirmed: true`, datasetKind, assignments (`sourceHeader` → `canonicalField`), defaults, and context (`organizationId`, `dataSourceId`, `importSessionId`). The result is a branded inferred `ConfirmedFieldMapping`. The schema/runtime checks are contract guards, not a cryptographic proof of a human click; a future UI must supply genuine user confirmation.

`normalizeTable` accepts only that contract in TypeScript and revalidates it at runtime. A mapping suggestion cannot be passed directly. Validation rejects absent/invalid confirmation, missing required mappings, missing source headers, unknown canonical targets, repeated source/target assignments, and mapped-field/default conflicts. No silent repair occurs.

Orders require id, customerName, productName, orderedQuantity, quantityUnit, dueDate, status. Production requires id, orderId, plannedQuantity, completedQuantity, quantityUnit, updatedAt. Inventory requires id, materialName, availableQuantity, requiredQuantity, unit, updatedAt; relatedOrderId is optional/nullable. Canonical schemas are unchanged.

Explicit defaults may supply only order quantityUnit; production quantityUnit/updatedAt; inventory unit/updatedAt. Unit strings are supplied by the caller, never inferred. Defaults satisfy absent mappings only; blank mapped cells produce errors and are never silently replaced. All context IDs must validate. organizationId always comes from context; orders.sourceId is the explicit importSessionId, matching WU-01 provenance. dataSourceId remains source context and is not added as an undeclared entity field. No IDs or timestamps are generated using randomness or runtime time.

## Normalization and validation

Strings trim surrounding whitespace while preserving meaningful internal text. Quantities accept finite numeric cells and strict decimal text (for example `500`, `500.0`, `.5`); unit-bearing text, thousands separators, exponent notation, booleans, NaN, and Infinity are rejected. Canonical schemas own positivity and production integrity rules.

Dates accept calendar-valid `YYYY-MM-DD`. Timestamps require explicit ISO UTC/offset. Actual spreadsheet Date cells use UTC components (`toISOString`), not host-local timezone, preserving Excel's stored calendar date. Broad natural-language/ambiguous date parsing is absent. Status uses only explicit aliases: planned, in production/in_production/production, completed, on hold/on_hold, cancelled. No status is inferred from quantities.

The final object is validated by the existing OrderSchema, ProductionJobSchema, or InventoryItemSchema. Optional missing inventory correlation becomes null. No independent copy of canonical quantity/integrity rules is maintained. Duplicate canonical IDs within a table are reported on subsequent rows; the first valid occurrence remains valid. Cross-table/database relationship enforcement is outside WU-02.

## Row errors and partial results

`ImportValidationResult<T>` contains validRecords, errors, and summary (totalRows, validRows, invalidRows). Every error identifies rowNumber, sourceField/canonicalField when applicable, errorCode, and humanReadableMessage. Summary invalidRows counts rows, not messages. Repeated canonical constraint errors for one field are reduced to the first message. Materially invalid records never enter validRecords, while valid siblings remain available.

Stable codes: FILE_TOO_LARGE, TOO_MANY_ROWS, UNSUPPORTED_FILE_TYPE, PARSE_ERROR, DUPLICATE_HEADER, AMBIGUOUS_DATASET_KIND, MAPPING_INCOMPLETE, MAPPING_CONFLICT, MISSING_REQUIRED_VALUE, INVALID_NUMBER, INVALID_DATE, INVALID_STATUS, SCHEMA_VALIDATION_FAILED. File/header/mapping failures abort processing; row failures return partial results. Raw Zod exceptions or stack traces are not the result contract.

## Scope

Synthetic test fixtures only. No business calculations, completion percentage, shortage, deadline distance, risk/issue/evidence generation, Gemini, Firestore, Google Sheets, upload screen, API, dashboard, Cloud Run, or deployment. WU-03 requires its independent gate.
