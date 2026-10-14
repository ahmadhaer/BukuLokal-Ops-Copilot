import { z } from "zod";
import { EntityIdSchema, TimestampSchema } from "../common/schema";

export const ActionSchema = z.strictObject({
  id: EntityIdSchema,
  issueId: EntityIdSchema,
  type: z.enum(["supplier_followup_draft", "production_priority_note", "delivery_review_note"]),
  status: z.enum(["suggested", "approved", "edited", "rejected"]),
  draft: z.string(),
  approvedBy: EntityIdSchema.nullable(),
  approvedAt: TimestampSchema.nullable(),
  createdAt: TimestampSchema,
});

export type Action = z.infer<typeof ActionSchema>;
