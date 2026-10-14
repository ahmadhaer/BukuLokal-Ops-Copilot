import { z } from "zod";
import { EntityIdSchema, QuantityUnitSchema, EntityTypeSchema } from "../common/schema";

export const EvidenceSchema = z.strictObject({
  id: EntityIdSchema,
  issueId: EntityIdSchema,
  type: z.enum(["production_completion", "material_shortage", "days_to_deadline", "remaining_quantity"]),
  value: z.union([z.number(), z.string(), z.boolean()]),
  unit: QuantityUnitSchema,
  sourceEntityType: EntityTypeSchema,
  sourceEntityId: EntityIdSchema,
});

export type Evidence = z.infer<typeof EvidenceSchema>;
