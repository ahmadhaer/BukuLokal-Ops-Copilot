import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema, EntityTypeSchema } from "../common/schema";

export const AuditEventSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  actor: z.string().min(1),
  event: z.string().min(1),
  entityType: EntityTypeSchema,
  entityId: EntityIdSchema,
  timestamp: TimestampSchema,
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
