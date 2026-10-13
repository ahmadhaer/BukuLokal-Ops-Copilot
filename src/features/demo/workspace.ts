import { abcApparelDataset } from "../../domain/demo/abc-apparel";
import { buildDatasetOperationalFacts } from "../../domain/operations";
import { detectDatasetIssues } from "../../domain/issues";
import type { Evidence } from "../../domain/evidence/schema";
import type { Issue } from "../../domain/issues/schema";

export const DEMO_DETECTED_AT = "2026-10-12T12:00:00Z";
const priority = { critical: 0, high: 1, medium: 2, low: 3 };
export const evidenceLabel = (type: Evidence["type"]) => ({ production_completion: "Production complete", days_to_deadline: "Time remaining", material_shortage: "Material shortage", remaining_quantity: "Remaining production" })[type];
export function evidenceDisplay(item: Evidence) {
  return `${item.value}${item.unit === "percent" ? "%" : ` ${item.unit}`}`;
}
export function issueTitle(issue: Issue) {
  return issue.type === "order_delay_risk" ? `${issue.orderId} may miss its deadline` : `${issue.orderId} needs additional material`;
}
export function buildDemoWorkspace() {
  const dataset = abcApparelDataset;
  const facts = buildDatasetOperationalFacts(dataset, dataset.asOfDate);
  const detection = detectDatasetIssues(dataset, facts, { detectedAt: DEMO_DETECTED_AT });
  const details = detection.issues.filter((issue) => issue.status === "open").map((issue) => ({
    issue, title: issueTitle(issue), daysToDeadline: facts.find((fact) => fact.orderId === issue.orderId)!.deadline.daysToDeadline,
    evidence: detection.evidence.filter((item) => issue.evidenceIds.includes(item.id)).map((item) => ({ ...item, label: evidenceLabel(item.type), display: evidenceDisplay(item) })),
  })).sort((a, b) => priority[a.issue.severity] - priority[b.issue.severity] || a.daysToDeadline - b.daysToDeadline || (a.issue.id < b.issue.id ? -1 : a.issue.id > b.issue.id ? 1 : 0));
  const view = { organizationName: dataset.organization.name, asOfDate: dataset.asOfDate,
    metrics: { orders: dataset.orders.length, atRisk: new Set(detection.issues.filter((issue) => issue.type === "order_delay_risk").map((issue) => issue.orderId)).size,
      materialShortages: detection.issues.filter((issue) => issue.status === "open" && issue.type === "material_shortage").length,
      criticalIssues: detection.issues.filter((issue) => issue.status === "open" && issue.severity === "critical").length }, details };
  return { dataset, facts, detection, view };
}
export type DemoViewModel = ReturnType<typeof buildDemoWorkspace>["view"];
