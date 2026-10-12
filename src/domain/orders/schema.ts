import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, DateOnlySchema, QuantitySchema, QuantityUnitSchema } from "../common/schema";

export const OrderSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  customerName: z.string().min(1),
  productName: z.string().min(1),
  orderedQuantity: QuantitySchema.positive(),
  quantityUnit: QuantityUnitSchema,
  dueDate: DateOnlySchema,
  status: z.enum(["planned", "in_production", "completed", "on_hold", "cancelled"]),
  sourceId: EntityIdSchema,
});

export type Order = z.infer<typeof OrderSchema>;
