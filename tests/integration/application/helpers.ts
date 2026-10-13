import { buildApplication } from "../../../src/application/application";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryStore, createMemoryState, type MemoryState } from "../../../src/repositories/memory/store";
import { PersistenceError } from "../../../src/lib/firestore/errors";
import type { IssueAnalysisProvider, IssueAnalysisGenerationRequest } from "../../../src/ai/analysis/provider";
export const OPERATION = "11111111-1111-4111-8111-111111111111";
export const NEXT_OPERATION = "22222222-2222-4222-8222-222222222222";
export class TestProvider implements IssueAnalysisProvider {
  requests: IssueAnalysisGenerationRequest[] = [];
  constructor(public mode: "success" | "failure" | "invalid" = "success", private wait?: Promise<void>) {}
  async generate(request: IssueAnalysisGenerationRequest) {
    this.requests.push(structuredClone(request)); if (this.wait) await this.wait;
    if (this.mode === "failure") throw new Error("Synthetic provider outage");
    if (this.mode === "invalid") return JSON.stringify({ summary: "invalid output" });
    const refs = request.input.evidence.map((item) => item.id);
    return JSON.stringify({ summary: "Synthetic order needs operational review.", whyItMatters: "The supplied deterministic evidence warrants attention.", evidenceRefs: refs,
      recommendations: [{ actionType: "production_priority_note", title: "Review production priorities", rationale: "Review the supplied progress and deadline evidence.", evidenceRefs: refs, draft: "Review production and delivery priorities with the owner." }],
      missingData: [{ field: "supplierLeadTime", reason: "Supplier lead time is not supplied." }], cannotDetermine: ["Production capacity is unavailable; delivery feasibility cannot be confirmed."] });
  }
}
export function buildTestApplication(options: { state?: MemoryState; provider?: TestProvider; persistence?: boolean; ai?: boolean; clockOffset?: number } = {}) {
  const state = options.state ?? createMemoryState(); const repository = createWorkspaceRepository(createMemoryStore(state)); const provider = options.provider ?? new TestProvider();
  let clock = Date.parse("2026-10-12T12:01:00Z") + (options.clockOffset ?? 0);
  const application = buildApplication({
    repository: async () => { if (options.persistence === false) throw new PersistenceError("PERSISTENCE_NOT_CONFIGURED", "Workspace storage is not configured."); return repository; },
    ai: () => options.ai === false ? null : { provider, model: "synthetic-test-model" },
    capabilities: () => ({ persistence: options.persistence === false ? "unavailable" : "configured", ai: options.ai === false ? "unavailable" : "configured" }),
    now: () => new Date(clock++).toISOString(),
  });
  return { application, repository, state, provider };
}
export async function goldenIssue(application: ReturnType<typeof buildTestApplication>["application"]) {
  const opened = await application.openDemoWorkspace(); if (!opened.ok) throw new Error(opened.message);
  return opened.value.workspace.details.find((item) => item.issue.orderId === "SO-001" && item.issue.type === "order_delay_risk")!.issue.id;
}
