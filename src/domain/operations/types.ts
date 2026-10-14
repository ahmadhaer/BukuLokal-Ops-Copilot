import { z } from "zod";
import { DateOnlySchema, EntityIdSchema, OrganizationIdSchema, QuantitySchema, QuantityUnitSchema } from "../common/schema";
import type { InventoryItem } from "../inventory/schema";
import type { Order } from "../orders/schema";
import type { Organization } from "../organizations/schema";
import type { ProductionJob } from "../production/schema";

// Derived views only; none is a new source/persistence entity.
export const ProductionFactsSchema = z.strictObject({
  orderId: EntityIdSchema, orderedQuantity: QuantitySchema.positive(),
  totalPlannedQuantity: QuantitySchema, totalCompletedQuantity: QuantitySchema,
  remainingQuantity: QuantitySchema, completionPercentage: z.number().min(0).max(100),
  quantityUnit: QuantityUnitSchema,
});
export type ProductionFacts = z.infer<typeof ProductionFactsSchema>;
export const MaterialFactsSchema = z.strictObject({
  inventoryItemId: EntityIdSchema, relatedOrderId: EntityIdSchema.nullable(),
  materialName: z.string().min(1), availableQuantity: QuantitySchema,
  requiredQuantity: QuantitySchema, shortageQuantity: QuantitySchema,
  unit: QuantityUnitSchema, hasShortage: z.boolean(),
});
export type MaterialFacts = z.infer<typeof MaterialFactsSchema>;
export const DeadlineFactsSchema = z.strictObject({
  orderId: EntityIdSchema, asOfDate: DateOnlySchema, dueDate: DateOnlySchema,
  daysToDeadline: z.number().int(),
});
export type DeadlineFacts = z.infer<typeof DeadlineFactsSchema>;
export const OrderOperationalFactsSchema = z.strictObject({
  orderId: EntityIdSchema, organizationId: OrganizationIdSchema, asOfDate: DateOnlySchema,
  production: ProductionFactsSchema, materials: z.array(MaterialFactsSchema), deadline: DeadlineFactsSchema,
});
export type OrderOperationalFacts = z.infer<typeof OrderOperationalFactsSchema>;
export type OperationsDatasetInput = {
  organization: Organization; orders: readonly Order[];
  productionJobs: readonly ProductionJob[]; inventoryItems: readonly InventoryItem[];
};
