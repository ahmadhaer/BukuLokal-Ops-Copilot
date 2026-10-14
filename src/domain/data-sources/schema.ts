import { z } from "zod";
import { EntityIdSchema, OrganizationIdSchema, TimestampSchema, SourceTypeSchema } from "../common/schema";

export const DataSourceSchema = z.strictObject({
  id: EntityIdSchema,
  organizationId: OrganizationIdSchema,
  type: SourceTypeSchema,
  name: z.string().min(1),
  readOnly: z.boolean(),
  createdAt: TimestampSchema,
});

export type DataSource = z.infer<typeof DataSourceSchema>;
