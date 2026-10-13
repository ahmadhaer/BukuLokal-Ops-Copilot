import { DateOnlySchema, InventoryItemSchema, OrderSchema, ProductionJobSchema, TimestampSchema } from "../../domain";
import { DATASET_FIELDS } from "./constants";
import { ImportError } from "./errors";
import { confirmMapping } from "./mapping";
import { checkRowLimit, isBlank } from "./raw";
import type { CanonicalRecords, ConfirmedFieldMapping, DatasetKind, ImportRowError, ImportValidationResult, RawTable } from "./types";

const quantityFields = new Set(["orderedQuantity", "plannedQuantity", "completedQuantity", "availableQuantity", "requiredQuantity"]);
const statusAliases: Record<string, string> = {
  planned: "planned", "in production": "in_production", in_production: "in_production",
  production: "in_production", completed: "completed", "on hold": "on_hold", on_hold: "on_hold", cancelled: "cancelled",
};
function convert(field: string, value: unknown): unknown {
  if (typeof value === "string") value = value.trim();
  if (quantityFields.has(field)) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) && Number.isFinite(Number(value))) return Number(value);
    throw new ImportError("INVALID_NUMBER", "Quantity must be an unambiguous finite number without unit text.");
  }
  if (field === "dueDate" || field === "updatedAt") {
    if (value instanceof Date && Number.isFinite(value.getTime())) value = field === "dueDate" ? value.toISOString().slice(0, 10) : value.toISOString();
    const schema = field === "dueDate" ? DateOnlySchema : TimestampSchema;
    if (!schema.safeParse(value).success) throw new ImportError("INVALID_DATE", field === "dueDate" ? "Date must be a valid YYYY-MM-DD date." : "Timestamp must contain a valid explicit UTC/offset value.");
  }
  if (field === "status") {
    if (typeof value !== "string" || !Object.hasOwn(statusAliases, value.toLowerCase())) throw new ImportError("INVALID_STATUS", "Order status is unsupported.");
    return statusAliases[value.toLowerCase()];
  }
  return value;
}
export function normalizeTable<K extends DatasetKind>(table: RawTable, confirmed: ConfirmedFieldMapping & { datasetKind: K }): ImportValidationResult<CanonicalRecords[K]> {
  // Revalidate even branded inputs: suggestions/forged casts cannot bypass runtime checks.
  const mapping = confirmMapping(table, confirmed);
  checkRowLimit(table.rows.length);
  const schema = { orders: OrderSchema, production: ProductionJobSchema, inventory: InventoryItemSchema }[mapping.datasetKind];
  const validRecords: CanonicalRecords[K][] = [];
  const errors: ImportRowError[] = [];
  const ids = new Set<string>();
  let invalidRows = 0;
  for (const row of table.rows) {
    const rowErrors: ImportRowError[] = [];
    const candidate: Record<string, unknown> = { organizationId: mapping.context.organizationId };
    if (mapping.datasetKind === "orders") candidate.sourceId = mapping.context.importSessionId;
    for (const field of DATASET_FIELDS[mapping.datasetKind]) {
      const sourceField = mapping.assignments.find((item) => item.canonicalField === field)?.sourceHeader;
      const value = sourceField === undefined ? (mapping.defaults as Record<string, unknown>)[field] : row.values[sourceField];
      if (isBlank(value)) {
        if (field === "relatedOrderId") { candidate[field] = null; continue; }
        rowErrors.push({ rowNumber: row.rowNumber, sourceField, canonicalField: field, errorCode: "MISSING_REQUIRED_VALUE", humanReadableMessage: `Required value is missing: ${field}.` });
        continue;
      }
      try { candidate[field] = convert(field, value); }
      catch (error) {
        if (!(error instanceof ImportError)) throw error;
        rowErrors.push({ rowNumber: row.rowNumber, sourceField, canonicalField: field, errorCode: error.errorCode, humanReadableMessage: error.humanReadableMessage });
      }
    }
    if (!rowErrors.length) {
      const parsed = schema.safeParse(candidate);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const canonicalField = typeof issue.path[0] === "string" ? issue.path[0] : undefined;
          // Canonical chained constraints can report several issues for one field.
          if (rowErrors.some((error) => error.canonicalField === canonicalField)) continue;
          rowErrors.push({ rowNumber: row.rowNumber, canonicalField,
            sourceField: mapping.assignments.find((item) => item.canonicalField === canonicalField)?.sourceHeader,
            errorCode: "SCHEMA_VALIDATION_FAILED", humanReadableMessage: issue.message });
        }
      } else if (ids.has(parsed.data.id)) {
        rowErrors.push({ rowNumber: row.rowNumber, canonicalField: "id", sourceField: mapping.assignments.find((item) => item.canonicalField === "id")?.sourceHeader,
          errorCode: "SCHEMA_VALIDATION_FAILED", humanReadableMessage: "Duplicate entity ID in this import table." });
      } else { ids.add(parsed.data.id); validRecords.push(parsed.data as CanonicalRecords[K]); }
    }
    if (rowErrors.length) { invalidRows++; errors.push(...rowErrors); }
  }
  return { validRecords, errors, summary: { totalRows: table.rows.length, validRows: validRecords.length, invalidRows } };
}
