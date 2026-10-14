import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema, SourceTypeSchema } from "../common/schema";

export const ImportSessionSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  dataSourceId: EntityIdSchema,
  sourceType: SourceTypeSchema,
  status: z.enum(["pending", "validated", "processed", "failed"]),
  importedAt: TimestampSchema,
});

export type ImportSession = z.infer<typeof ImportSessionSchema>;
