import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema } from "../common/schema";

export const IssueSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  orderId: EntityIdSchema,
  type: z.enum(["material_shortage", "order_delay_risk"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "resolved"]),
  evidenceIds: z.array(EntityIdSchema),
  detectedAt: TimestampSchema,
});

export type Issue = z.infer<typeof IssueSchema>;
