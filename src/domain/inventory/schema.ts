import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema, QuantitySchema, QuantityUnitSchema } from "../common/schema";

export const InventoryItemSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  materialName: z.string().min(1),
  availableQuantity: QuantitySchema,
  requiredQuantity: QuantitySchema,
  unit: QuantityUnitSchema,
  relatedOrderId: EntityIdSchema.nullable().optional(),
  updatedAt: TimestampSchema,
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
