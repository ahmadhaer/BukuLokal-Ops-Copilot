import { z } from "zod";

// Canonical values validate without coercion, trimming, or normalization.
export const EntityIdSchema = z.string().regex(/^\S+$/, "Nonempty ID without whitespace required");
export type EntityId = z.infer<typeof EntityIdSchema>;
export const OrganizationIdSchema = EntityIdSchema;
export type OrganizationId = z.infer<typeof OrganizationIdSchema>;
export const DateOnlySchema = z.iso.date();
export type DateOnly = z.infer<typeof DateOnlySchema>;
export const TimestampSchema = z.iso.datetime({ offset: true });
export type Timestamp = z.infer<typeof TimestampSchema>;
export const QuantitySchema = z.number().nonnegative();
export type Quantity = z.infer<typeof QuantitySchema>;
export const QuantityUnitSchema = z.string().min(1).refine((value) => value.trim().length > 0);
export type QuantityUnit = z.infer<typeof QuantityUnitSchema>;
// Three-uppercase-letter currency contract; no currency registry or conversion.
export const CurrencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export const SourceTypeSchema = z.enum(["synthetic_demo", "csv", "xlsx", "google_sheets"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;
export const EntityTypeSchema = z.enum([
  "organization", "data_source", "import_session", "order", "production_job",
  "inventory_item", "issue", "evidence", "ai_analysis", "action", "audit_event",
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;
