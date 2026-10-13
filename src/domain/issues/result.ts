import { z } from "zod";
import { EntityIdSchema, TimestampSchema } from "../common/schema";
import { EvidenceSchema } from "../evidence/schema";
import { IssueSchema } from "./schema";
import { RuleIdSchema } from "./rules";

export const IssueDetectionContextSchema = z.strictObject({ detectedAt: TimestampSchema });
export type IssueDetectionContext = z.infer<typeof IssueDetectionContextSchema>;
export const IssueDetectionResultSchema = z.strictObject({
  issues: z.array(IssueSchema), evidence: z.array(EvidenceSchema),
  ruleTraces: z.array(z.strictObject({ issueId: EntityIdSchema, ruleId: RuleIdSchema })),
}).superRefine((result, ctx) => {
  const issueIds = new Set(result.issues.map((issue) => issue.id));
  const evidenceIds = new Set(result.evidence.map((evidence) => evidence.id));
  if (issueIds.size !== result.issues.length || evidenceIds.size !== result.evidence.length) ctx.addIssue({ code: "custom", message: "Issue and evidence IDs must be unique." });
  for (const issue of result.issues) {
    if (!issue.evidenceIds.length || new Set(issue.evidenceIds).size !== issue.evidenceIds.length) ctx.addIssue({ code: "custom", message: "Each issue must reference unique nonempty evidence." });
    for (const id of issue.evidenceIds) {
      if (!result.evidence.some((item) => item.id === id && item.issueId === issue.id)) ctx.addIssue({ code: "custom", message: "Issue evidence references must resolve to their owner." });
    }
    if (result.ruleTraces.filter((trace) => trace.issueId === issue.id).length !== 1) ctx.addIssue({ code: "custom", message: "Each issue must have one rule trace." });
  }
  for (const evidence of result.evidence) {
    if (!result.issues.some((issue) => issue.id === evidence.issueId && issue.evidenceIds.includes(evidence.id))) ctx.addIssue({ code: "custom", message: "Evidence must resolve to and be referenced by its issue." });
  }
  if (result.ruleTraces.some((trace) => !issueIds.has(trace.issueId))) ctx.addIssue({ code: "custom", message: "Rule traces must reference existing issues." });
});
export type IssueDetectionResult = z.infer<typeof IssueDetectionResultSchema>;
export type IssueDetectionErrorCode = "INVALID_CONTEXT" | "INVALID_RULES" | "INVALID_INPUT" | "FACT_SOURCE_MISMATCH" | "COMPLETED_ORDER_INCONSISTENT" | "INVALID_RESULT";
export class IssueDetectionError extends Error {
  constructor(public readonly errorCode: IssueDetectionErrorCode, public readonly humanReadableMessage: string) {
    super(humanReadableMessage); this.name = "IssueDetectionError";
  }
  toJSON() { return { errorCode: this.errorCode, humanReadableMessage: this.humanReadableMessage }; }
}
export function validateResult(input: IssueDetectionResult): IssueDetectionResult {
  const parsed = IssueDetectionResultSchema.safeParse(input);
  if (!parsed.success) throw new IssueDetectionError("INVALID_RESULT", "Detected issues, evidence, or rule traces violate their canonical contracts.");
  return parsed.data;
}
