import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema, QuantitySchema, QuantityUnitSchema } from "../common/schema";

export const ProductionJobSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  orderId: EntityIdSchema,
  plannedQuantity: QuantitySchema.positive(),
  completedQuantity: QuantitySchema,
  quantityUnit: QuantityUnitSchema,
  updatedAt: TimestampSchema,
}).refine((job) => job.completedQuantity <= job.plannedQuantity, {
  message: "Completed quantity must not exceed planned quantity",
  path: ["completedQuantity"],
});

export type ProductionJob = z.infer<typeof ProductionJobSchema>;
