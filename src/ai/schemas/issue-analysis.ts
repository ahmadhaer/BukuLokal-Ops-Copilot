import { z } from "zod";
import { EntityIdSchema } from "../../domain/common/schema";

export const AllowedActionTypeSchema = z.enum(["supplier_followup_draft", "production_priority_note", "delivery_review_note"]);
export type AllowedActionType = z.infer<typeof AllowedActionTypeSchema>;
const text = z.string().trim().min(1).max(4_000);
const refs = z.array(EntityIdSchema).min(1).max(64);
export const GeminiIssueAnalysisSchema = z.strictObject({
  summary: text, whyItMatters: text, evidenceRefs: refs,
  recommendations: z.array(z.strictObject({
    actionType: AllowedActionTypeSchema, title: text, rationale: text, evidenceRefs: refs,
    draft: text.nullable().optional(),
  })).max(8),
  missingData: z.array(z.strictObject({ field: text, reason: text })).max(16),
  cannotDetermine: z.array(text).max(16),
});
export type GeminiIssueAnalysis = z.infer<typeof GeminiIssueAnalysisSchema>;
// Vertex responseJsonSchema excludes string-length and pattern keywords; Zod enforces them locally.
function supportedJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(supportedJsonSchema);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["$schema", "minLength", "maxLength", "pattern"].includes(key))
    .map(([key, child]) => [key, supportedJsonSchema(child)]));
  return value;
}
export const ISSUE_ANALYSIS_JSON_SCHEMA = supportedJsonSchema(z.toJSONSchema(GeminiIssueAnalysisSchema, { target: "draft-7" }));
