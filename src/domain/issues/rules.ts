import { z } from "zod";

// Code-reviewed hackathon demonstration policies, not universal industry standards.
export const IssueRulesSchema = z.strictObject({
  criticalDeadlineDays: z.number().int().nonnegative(),
  criticalCompletionThreshold: z.number().min(0).max(100),
  highDeadlineDays: z.number().int().nonnegative(),
  mediumDeadlineDays: z.number().int().nonnegative(),
  delayCompletionThreshold: z.number().min(0).max(100),
}).refine((rules) => rules.criticalDeadlineDays <= rules.highDeadlineDays &&
  rules.highDeadlineDays <= rules.mediumDeadlineDays &&
  rules.criticalCompletionThreshold <= rules.delayCompletionThreshold,
{ message: "Thresholds must preserve critical/high/medium precedence." });
export type IssueRules = z.infer<typeof IssueRulesSchema>;
export const ISSUE_RULES_V1: Readonly<IssueRules> = Object.freeze({
  criticalDeadlineDays: 2, criticalCompletionThreshold: 50,
  highDeadlineDays: 3, mediumDeadlineDays: 7, delayCompletionThreshold: 80,
});
export const RuleIdSchema = z.enum([
  "ORDER_DELAY_CRITICAL_V1", "ORDER_DELAY_HIGH_V1", "ORDER_DELAY_MEDIUM_V1", "MATERIAL_SHORTAGE_V1",
]);
export type RuleId = z.infer<typeof RuleIdSchema>;
