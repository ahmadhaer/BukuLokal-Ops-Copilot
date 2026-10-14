import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { buildDatasetOperationalFacts } from "../../../src/domain/operations";
import { detectDatasetIssues } from "../../../src/domain/issues";
import { buildIssueAnalysisInput } from "../../../src/ai/analysis/input";
import type { IssueAnalysisProvider, IssueAnalysisGenerationRequest } from "../../../src/ai/analysis/provider";

export const execution = { model: "synthetic-test-model", createdAt: "2026-10-12T12:01:00Z" };
export function selectedRequest(orderId = "SO-001") {
  const detection = detectDatasetIssues(abcApparelDataset, buildDatasetOperationalFacts(abcApparelDataset, abcApparelDataset.asOfDate), { detectedAt: "2026-10-12T12:00:00Z" });
  return { organization: abcApparelDataset.organization,
    issueId: detection.issues.find((issue) => issue.orderId === orderId && issue.type === "order_delay_risk")!.id, detection };
}
export function validOutput(request = selectedRequest()) {
  const input = buildIssueAnalysisInput(request);
  const refs = input.evidence.map((item) => item.id);
  return { summary: "Synthetic order needs operational review.", whyItMatters: "The supplied deterministic evidence warrants attention.",
    evidenceRefs: refs, recommendations: [{ actionType: "production_priority_note", title: "Review production priorities",
      rationale: "Review the supplied progress and deadline evidence.", evidenceRefs: refs, draft: null as string | null }],
    missingData: [{ field: "supplierLeadTime", reason: "Supplier lead time is not supplied." }],
    cannotDetermine: ["Production capacity is unavailable; delivery feasibility cannot be confirmed."] };
}
export class StubProvider implements IssueAnalysisProvider {
  readonly requests: IssueAnalysisGenerationRequest[] = [];
  constructor(private readonly responses: Array<string | Error>) {}
  async generate(request: IssueAnalysisGenerationRequest) {
    this.requests.push(structuredClone(request));
    const response = this.responses[this.requests.length - 1];
    if (response instanceof Error) throw response;
    return response ?? "invalid";
  }
}
