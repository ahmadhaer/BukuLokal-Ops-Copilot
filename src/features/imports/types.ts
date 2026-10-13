import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, QuantityUnitSchema, TimestampSchema } from "../../domain/common/schema";
import type { InventoryItem, Order, ProductionJob } from "../../domain";

export type DatasetKind = "orders" | "production" | "inventory";
export type RawRow = { rowNumber: number; values: Record<string, unknown> };
export type RawTable = { sourceName: string; sheetName?: string; headers: string[]; rows: RawRow[] };
export type ImportFile = { name: string; bytes: Uint8Array };
export type MappingSuggestion = {
  datasetKind: DatasetKind | null;
  suggestions: Array<{ sourceHeader: string; canonicalField: string | null; reason: "exact" | "synonym" | "unmatched" | "ambiguous" }>;
  unmappedHeaders: string[];
  missingRequiredFields: string[];
  ambiguousMappings: string[];
  requiresConfirmation: true;
};
const common = {
  confirmed: z.literal(true),
  assignments: z.array(z.strictObject({ sourceHeader: z.string().min(1), canonicalField: z.string().min(1) })),
  context: z.strictObject({ organizationId: OrganizationIdSchema, dataSourceId: EntityIdSchema, importSessionId: EntityIdSchema }),
};
export const ConfirmedFieldMappingSchema = z.discriminatedUnion("datasetKind", [
  z.strictObject({ ...common, datasetKind: z.literal("orders"), defaults: z.strictObject({ quantityUnit: QuantityUnitSchema.optional() }) }),
  z.strictObject({ ...common, datasetKind: z.literal("production"), defaults: z.strictObject({ quantityUnit: QuantityUnitSchema.optional(), updatedAt: TimestampSchema.optional() }) }),
  z.strictObject({ ...common, datasetKind: z.literal("inventory"), defaults: z.strictObject({ unit: QuantityUnitSchema.optional(), updatedAt: TimestampSchema.optional() }) }),
]).brand<"ConfirmedFieldMapping">();
export type ConfirmedFieldMapping = z.infer<typeof ConfirmedFieldMappingSchema>;
export type CanonicalRecords = { orders: Order; production: ProductionJob; inventory: InventoryItem };
export type ImportRowError = {
  rowNumber: number; sourceField?: string; canonicalField?: string;
  errorCode: import("./errors").ImportErrorCode; humanReadableMessage: string;
};
export type ImportValidationResult<T> = {
  validRecords: T[]; errors: ImportRowError[];
  summary: { totalRows: number; validRows: number; invalidRows: number };
};
