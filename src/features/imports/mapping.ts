import { DATASET_FIELDS, KIND_SIGNATURES, REQUIRED_FIELDS } from "./constants";
import { ImportError } from "./errors";
import { checkHeaders, normalizeHeader } from "./raw";
import { ConfirmedFieldMappingSchema } from "./types";
import type { ConfirmedFieldMapping, DatasetKind, MappingSuggestion, RawTable } from "./types";

const orderId = ["order id", "order no", "order number", "no order", "no po", "po number", "sales order", "so number"];
const dictionaries: Record<DatasetKind, Record<string, string[]>> = {
  orders: {
    id: orderId,
    customerName: ["customer", "customer name", "nama customer", "nama pelanggan", "pelanggan"],
    productName: ["product", "product name", "item", "nama barang", "produk"],
    orderedQuantity: ["qty", "quantity", "order qty", "ordered quantity", "jumlah", "jumlah pesanan", "qty order"],
    quantityUnit: ["unit", "quantity unit", "satuan"],
    dueDate: ["due date", "deadline", "tanggal jatuh tempo", "target selesai"],
    status: ["order status"],
  },
  production: {
    id: ["production id", "job id", "production job", "work order"],
    orderId: orderId,
    plannedQuantity: ["planned qty", "planned quantity", "target production", "qty plan", "rencana produksi"],
    completedQuantity: ["completed qty", "completed quantity", "produced", "produced qty", "sudah produksi", "hasil produksi"],
    quantityUnit: ["unit", "quantity unit", "satuan"],
    updatedAt: ["updated at", "update timestamp"],
  },
  inventory: {
    id: ["material id", "inventory id"],
    materialName: ["material", "material name", "bahan", "nama bahan"],
    availableQuantity: ["available", "available qty", "stock", "stok", "stok tersedia", "available quantity"],
    requiredQuantity: ["required", "required qty", "kebutuhan", "kebutuhan bahan", "required quantity"],
    unit: ["quantity unit", "satuan"],
    relatedOrderId: [...orderId, "related order id"],
    updatedAt: ["updated at", "update timestamp"],
  },
};
function analyze(headers: string[], kind: DatasetKind): MappingSuggestion["suggestions"] {
  return headers.map((sourceHeader) => {
    const normalized = normalizeHeader(sourceHeader);
    const exact = DATASET_FIELDS[kind].find((field) => normalizeHeader(field) === normalized);
    if (exact) return { sourceHeader, canonicalField: exact, reason: "exact" };
    const matches = Object.entries(dictionaries[kind]).filter(([, synonyms]) => synonyms.some((synonym) => normalizeHeader(synonym) === normalized));
    return { sourceHeader, canonicalField: matches.length === 1 ? matches[0][0] : null, reason: matches.length > 1 ? "ambiguous" : matches.length === 1 ? "synonym" : "unmatched" };
  });
}
export function suggestMapping(table: RawTable, chosenKind?: DatasetKind): MappingSuggestion {
  checkHeaders(table.headers);
  const kinds: DatasetKind[] = ["orders", "production", "inventory"];
  let datasetKind = chosenKind ?? null;
  if (!chosenKind) {
    const candidates = kinds.map((kind) => {
      const fields = analyze(table.headers, kind).map((item) => item.canonicalField).filter((field): field is string => field !== null);
      const coverage = new Set(fields);
      return { kind, sufficient: coverage.size === fields.length && KIND_SIGNATURES[kind].every((field) => coverage.has(field)), score: coverage.size };
    }).filter((item) => item.sufficient);
    const best = candidates.filter((item) => item.score === Math.max(...candidates.map((item) => item.score)));
    if (best.length === 1) datasetKind = best[0].kind;
  }
  const suggestions: MappingSuggestion["suggestions"] = datasetKind ? analyze(table.headers, datasetKind) : table.headers.map((sourceHeader) => {
    const candidates = kinds.map((kind) => analyze([sourceHeader], kind)[0]);
    const targets = new Set(candidates.map((item) => item.canonicalField).filter((field): field is string => field !== null));
    return { sourceHeader, canonicalField: targets.size === 1 ? [...targets][0] : null, reason: targets.size > 1 ? "ambiguous" : targets.size === 1 ? "synonym" : "unmatched" };
  });
  const mapped = suggestions.map((item) => item.canonicalField).filter((field): field is string => field !== null);
  const duplicateTargets = [...new Set(mapped.filter((field, i) => mapped.indexOf(field) !== i))];
  const ambiguousMappings = [...suggestions.filter((item) => item.reason === "ambiguous").map((item) => item.sourceHeader), ...duplicateTargets];
  return {
    datasetKind, suggestions, requiresConfirmation: true,
    unmappedHeaders: suggestions.filter((item) => !item.canonicalField).map((item) => item.sourceHeader),
    missingRequiredFields: datasetKind ? REQUIRED_FIELDS[datasetKind].filter((field) => !mapped.includes(field)) : [],
    ambiguousMappings,
  };
}
export function confirmMapping(table: RawTable, input: unknown): ConfirmedFieldMapping {
  const parsed = ConfirmedFieldMappingSchema.safeParse(input);
  if (!parsed.success) throw new ImportError("MAPPING_INCOMPLETE", "An explicit confirmed mapping with valid context and allowed defaults is required.");
  const mapping = parsed.data;
  checkHeaders(table.headers);
  const sourceSeen = new Set<string>();
  const targetSeen = new Set<string>();
  for (const assignment of mapping.assignments) {
    if (!table.headers.includes(assignment.sourceHeader)) throw new ImportError("MAPPING_INCOMPLETE", "Mapped source header does not exist in this table.");
    if (!(DATASET_FIELDS[mapping.datasetKind] as readonly string[]).includes(assignment.canonicalField)) throw new ImportError("MAPPING_CONFLICT", "Mapping target is not an allowed canonical field.");
    if (sourceSeen.has(assignment.sourceHeader) || targetSeen.has(assignment.canonicalField)) throw new ImportError("MAPPING_CONFLICT", "Each source column and canonical target may be assigned only once.");
    if (Object.hasOwn(mapping.defaults, assignment.canonicalField)) throw new ImportError("MAPPING_CONFLICT", "A field cannot have both a source mapping and a dataset default.");
    sourceSeen.add(assignment.sourceHeader); targetSeen.add(assignment.canonicalField);
  }
  for (const field of REQUIRED_FIELDS[mapping.datasetKind]) {
    if (!targetSeen.has(field) && (!Object.hasOwn(mapping.defaults, field) || (mapping.defaults as Record<string, unknown>)[field] === undefined)) throw new ImportError("MAPPING_INCOMPLETE", `Required mapping or authorized default is missing: ${field}.`);
  }
  return mapping;
}
