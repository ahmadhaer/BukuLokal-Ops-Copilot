import { z } from "zod";
import { OrganizationSchema, type Organization } from "../../domain/organizations/schema";
import { IssueSchema } from "../../domain/issues/schema";
import { EvidenceSchema } from "../../domain/evidence/schema";
import { IssueDetectionResultSchema, type IssueDetectionResult } from "../../domain/issues/result";
import { AllowedActionTypeSchema } from "../schemas/issue-analysis";
import { AiAnalysisError } from "./errors";

export const MAX_ANALYSIS_INPUT_BYTES = 32 * 1024;
export const IssueAnalysisInputSchema = z.strictObject({
  organizationContext: z.strictObject({ industry: z.literal("light_manufacturing"), timezone: OrganizationSchema.shape.timezone }),
  issue: z.strictObject({ issueId: IssueSchema.shape.id, type: IssueSchema.shape.type, severity: IssueSchema.shape.severity }),
  evidence: z.array(EvidenceSchema.omit({ issueId: true })).min(1).max(64),
  allowedActions: z.array(AllowedActionTypeSchema).min(1).max(3),
}).superRefine((input, ctx) => {
  if (new Set(input.evidence.map((item) => item.id)).size !== input.evidence.length || new Set(input.allowedActions).size !== input.allowedActions.length) ctx.addIssue({ code: "custom", message: "Evidence IDs and allowed actions must be unique." });
  if (input.allowedActions.includes("supplier_followup_draft") && !input.evidence.some((item) => item.type === "material_shortage" && typeof item.value === "number" && item.value > 0)) ctx.addIssue({ code: "custom", message: "Supplier intent requires positive shortage evidence." });
});
export type IssueAnalysisInput = z.infer<typeof IssueAnalysisInputSchema>;
export type IssueAnalysisRequest = { organization: Organization; issueId: string; detection: IssueDetectionResult };
export function buildIssueAnalysisInput(request: IssueAnalysisRequest): IssueAnalysisInput {
  const organization = OrganizationSchema.safeParse(request.organization);
  const detection = IssueDetectionResultSchema.safeParse(request.detection);
  if (!organization.success || !detection.success) throw new AiAnalysisError("AI_INPUT_INVALID", "Canonical organization, issue, and resolved evidence are required.");
  const issue = detection.data.issues.find((item) => item.id === request.issueId);
  if (!issue || issue.organizationId !== organization.data.id) throw new AiAnalysisError("AI_INPUT_INVALID", "Selected issue does not exist in the organization.");
  const evidence = issue.evidenceIds.map((id) => detection.data.evidence.find((item) => item.id === id && item.issueId === issue.id));
  if (evidence.some((item) => !item) || new Set(evidence.map((item) => item?.id)).size !== evidence.length) throw new AiAnalysisError("AI_INPUT_INVALID", "Selected issue evidence is missing, duplicated, or belongs to another issue.");
  const selected = evidence.map((item) => {
    const parsed = EvidenceSchema.parse(item);
    return { id: parsed.id, type: parsed.type, value: parsed.value, unit: parsed.unit,
      sourceEntityType: parsed.sourceEntityType, sourceEntityId: parsed.sourceEntityId };
  });
  const hasShortage = selected.some((item) => item.type === "material_shortage" && typeof item.value === "number" && item.value > 0);
  const input = IssueAnalysisInputSchema.safeParse({
    organizationContext: { industry: organization.data.industry, timezone: organization.data.timezone },
    issue: { issueId: issue.id, type: issue.type, severity: issue.severity }, evidence: selected,
    allowedActions: hasShortage ? ["supplier_followup_draft", "production_priority_note", "delivery_review_note"] : ["production_priority_note", "delivery_review_note"],
  });
  if (!input.success || new TextEncoder().encode(JSON.stringify(input.data)).byteLength > MAX_ANALYSIS_INPUT_BYTES) throw new AiAnalysisError("AI_INPUT_INVALID", "Selected issue evidence exceeds the bounded analysis contract.");
  return input.data;
}
