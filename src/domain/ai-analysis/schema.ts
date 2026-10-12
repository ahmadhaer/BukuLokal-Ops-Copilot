import { z } from "zod";
import { EntityIdSchema, TimestampSchema } from "../common/schema";

export const AIAnalysisSchema = z.strictObject({
  id: EntityIdSchema,
  issueId: EntityIdSchema,
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  output: z.record(z.string(), z.json()),
  evidenceRefs: z.array(EntityIdSchema),
  createdAt: TimestampSchema,
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
