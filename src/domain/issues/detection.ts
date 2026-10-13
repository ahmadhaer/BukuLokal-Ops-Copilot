import { OrderSchema, type Order } from "../orders/schema";
import { OrderOperationalFactsSchema, type OrderOperationalFacts, type OperationsDatasetInput } from "../operations/types";
import { IssueSchema, type Issue } from "./schema";
import { completionEvidence, deadlineEvidence, shortageEvidence } from "./evidence";
import { issueIdentifier } from "./identifiers";
import { ISSUE_RULES_V1, IssueRulesSchema, type IssueRules, type RuleId } from "./rules";
import { IssueDetectionContextSchema, IssueDetectionError, validateResult,
  type IssueDetectionContext, type IssueDetectionResult } from "./result";

function checked(orderInput: Order, factsInput: OrderOperationalFacts, contextInput: IssueDetectionContext, rulesInput: Readonly<IssueRules>) {
  const context = IssueDetectionContextSchema.safeParse(contextInput);
  if (!context.success) throw new IssueDetectionError("INVALID_CONTEXT", "Detection requires an explicit valid timestamp.");
  const rules = IssueRulesSchema.safeParse(rulesInput);
  if (!rules.success) throw new IssueDetectionError("INVALID_RULES", "Detection thresholds must satisfy the reviewed policy contract.");
  const order = OrderSchema.safeParse(orderInput);
  const facts = OrderOperationalFactsSchema.safeParse(factsInput);
  if (!order.success || !facts.success) throw new IssueDetectionError("INVALID_INPUT", "Canonical order and validated operational facts are required.");
  const o = order.data; const f = facts.data;
  if (f.orderId !== o.id || f.production.orderId !== o.id || f.deadline.orderId !== o.id ||
      f.organizationId !== o.organizationId || f.asOfDate !== f.deadline.asOfDate || f.deadline.dueDate !== o.dueDate ||
      f.production.orderedQuantity !== o.orderedQuantity || f.production.quantityUnit !== o.quantityUnit) {
    throw new IssueDetectionError("FACT_SOURCE_MISMATCH", "Operational facts do not match the supplied order and date context.");
  }
  if (o.status === "completed" && (f.production.completionPercentage !== 100 || f.production.remainingQuantity !== 0 || f.production.totalCompletedQuantity !== o.orderedQuantity)) {
    throw new IssueDetectionError("COMPLETED_ORDER_INCONSISTENT", "Completed order status contradicts its production facts.");
  }
  return { order: o, facts: f, context: context.data, rules: rules.data };
}
const empty = (): IssueDetectionResult => ({ issues: [], evidence: [], ruleTraces: [] });
function correlatedMaterials(facts: OrderOperationalFacts) {
  return facts.materials.filter((item) => item.relatedOrderId === facts.orderId && item.shortageQuantity > 0)
    .slice().sort((a, b) => a.inventoryItemId < b.inventoryItemId ? -1 : a.inventoryItemId > b.inventoryItemId ? 1 : 0);
}
function delayRule(facts: OrderOperationalFacts, rules: IssueRules): { severity: Issue["severity"]; ruleId: RuleId; completionRelevant: boolean; shortageRelevant: boolean } | null {
  const days = facts.deadline.daysToDeadline; const completion = facts.production.completionPercentage;
  const incompleteForCritical = completion < rules.criticalCompletionThreshold;
  const shortage = correlatedMaterials(facts).length > 0;
  if (days <= rules.criticalDeadlineDays && (incompleteForCritical || shortage)) return {
    severity: "critical", ruleId: "ORDER_DELAY_CRITICAL_V1", completionRelevant: incompleteForCritical, shortageRelevant: shortage,
  };
  if (days <= rules.highDeadlineDays && completion < rules.delayCompletionThreshold) return { severity: "high", ruleId: "ORDER_DELAY_HIGH_V1", completionRelevant: true, shortageRelevant: false };
  if (days <= rules.mediumDeadlineDays && completion < rules.delayCompletionThreshold) return { severity: "medium", ruleId: "ORDER_DELAY_MEDIUM_V1", completionRelevant: true, shortageRelevant: false };
  return null;
}
export function detectOrderDelayIssue(order: Order, facts: OrderOperationalFacts, context: IssueDetectionContext, rules: Readonly<IssueRules> = ISSUE_RULES_V1): IssueDetectionResult {
  const input = checked(order, facts, context, rules);
  if (input.order.status === "completed" || input.order.status === "cancelled") return empty();
  const rule = delayRule(input.facts, input.rules);
  if (!rule) return empty();
  const id = issueIdentifier("order_delay_risk", input.order.organizationId, input.order.id);
  const evidence = [deadlineEvidence(id, input.facts)];
  if (rule.completionRelevant) evidence.push(completionEvidence(id, input.facts));
  if (rule.shortageRelevant) for (const material of correlatedMaterials(input.facts)) evidence.push(shortageEvidence(id, material));
  const issue = IssueSchema.parse({ id, organizationId: input.order.organizationId, orderId: input.order.id,
    type: "order_delay_risk", severity: rule.severity, status: "open", evidenceIds: evidence.map((item) => item.id), detectedAt: input.context.detectedAt });
  return validateResult({ issues: [issue], evidence, ruleTraces: [{ issueId: id, ruleId: rule.ruleId }] });
}
export function detectMaterialShortageIssues(order: Order, facts: OrderOperationalFacts, context: IssueDetectionContext, rules: Readonly<IssueRules> = ISSUE_RULES_V1): IssueDetectionResult {
  const input = checked(order, facts, context, rules);
  const result = empty();
  const days = input.facts.deadline.daysToDeadline;
  const severity: Issue["severity"] = days <= input.rules.criticalDeadlineDays ? "critical" : days <= input.rules.highDeadlineDays ? "high" : days <= input.rules.mediumDeadlineDays ? "medium" : "low";
  for (const material of correlatedMaterials(input.facts)) {
    const id = issueIdentifier("material_shortage", input.order.organizationId, material.inventoryItemId);
    const evidence = [shortageEvidence(id, material), deadlineEvidence(id, input.facts)];
    result.issues.push(IssueSchema.parse({ id, organizationId: input.order.organizationId, orderId: input.order.id,
      type: "material_shortage", severity, status: "open", evidenceIds: evidence.map((item) => item.id), detectedAt: input.context.detectedAt }));
    result.evidence.push(...evidence); result.ruleTraces.push({ issueId: id, ruleId: "MATERIAL_SHORTAGE_V1" });
  }
  return validateResult(result);
}
export function detectOrderIssues(order: Order, facts: OrderOperationalFacts, context: IssueDetectionContext, rules: Readonly<IssueRules> = ISSUE_RULES_V1): IssueDetectionResult {
  const results = [detectOrderDelayIssue(order, facts, context, rules), detectMaterialShortageIssues(order, facts, context, rules)];
  return validateResult({ issues: results.flatMap((result) => result.issues), evidence: results.flatMap((result) => result.evidence), ruleTraces: results.flatMap((result) => result.ruleTraces) });
}
export function detectDatasetIssues(dataset: OperationsDatasetInput, facts: readonly OrderOperationalFacts[], context: IssueDetectionContext, rules: Readonly<IssueRules> = ISSUE_RULES_V1): IssueDetectionResult {
  if (!IssueDetectionContextSchema.safeParse(context).success) throw new IssueDetectionError("INVALID_CONTEXT", "An explicit detection timestamp is required.");
  if (!IssueRulesSchema.safeParse(rules).success) throw new IssueDetectionError("INVALID_RULES", "Detection configuration is invalid.");
  const orders = new Map(dataset.orders.map((order) => [order.id, order]));
  const inventory = new Map(dataset.inventoryItems.map((item) => [item.id, item]));
  if (orders.size !== dataset.orders.length || inventory.size !== dataset.inventoryItems.length || new Set(facts.map((item) => item.orderId)).size !== facts.length || facts.length !== orders.size) throw new IssueDetectionError("FACT_SOURCE_MISMATCH", "Order/fact coverage and source IDs must be unique and complete.");
  const result = empty();
  for (const fact of [...facts].sort((a, b) => a.orderId < b.orderId ? -1 : a.orderId > b.orderId ? 1 : 0)) {
    const order = orders.get(fact.orderId);
    if (!order || order.organizationId !== dataset.organization.id) throw new IssueDetectionError("FACT_SOURCE_MISMATCH", "Fact order must resolve to the dataset organization.");
    for (const material of fact.materials) {
      const source = inventory.get(material.inventoryItemId);
      if (!source || source.organizationId !== order.organizationId || source.relatedOrderId !== material.relatedOrderId ||
          source.materialName !== material.materialName || source.unit !== material.unit || source.availableQuantity !== material.availableQuantity || source.requiredQuantity !== material.requiredQuantity) {
        throw new IssueDetectionError("FACT_SOURCE_MISMATCH", "Material evidence must trace to matching canonical inventory.");
      }
    }
    const detected = detectOrderIssues(order, fact, context, rules);
    result.issues.push(...detected.issues); result.evidence.push(...detected.evidence); result.ruleTraces.push(...detected.ruleTraces);
  }
  return validateResult(result);
}
