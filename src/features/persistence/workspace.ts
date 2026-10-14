import "server-only";
import type { WorkspaceRepository, RepositoryReader, Write } from "../../repositories/types";
import { type Collection } from "../../repositories/types";
import { validateReferences } from "../../repositories/workspace-repository";
import { buildDemoWorkspace, evidenceDisplay, evidenceLabel, issueTitle, type DemoViewModel } from "../demo/workspace";
import { buildDatasetOperationalFacts } from "../../domain/operations";
import { abcApparelDataset, type DemoDataset } from "../../domain";
import { PersistenceError } from "../../lib/firestore/errors";
const fields = { data_sources: "dataSources", imports: "importSessions", orders: "orders", production_jobs: "productionJobs", inventory_items: "inventoryItems", issues: "issues", evidence: "evidence", ai_analyses: "aiAnalyses", actions: "actions", audit_events: "auditEvents" } as const;
export async function loadWorkspace(repository: WorkspaceRepository, organizationId: string): Promise<DemoDataset> {
  return repository.transaction(organizationId, async (read) => {
  const organization = await read.get("organizations", organizationId);
  if (!organization) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Workspace does not exist.");
  const entries = await Promise.all(Object.entries(fields).map(async ([collection, field]) => [field, await read.list(collection as keyof typeof fields)] as const));
  const data = { asOfDate: abcApparelDataset.asOfDate, organization, ...Object.fromEntries(entries) } as DemoDataset;
  const writes: Write[] = Object.keys(fields).flatMap((collection) => (data[fields[collection as keyof typeof fields]] as Array<{ id: string }>).map((value) => ({ collection, value } as Write)));
  await validateReferences(read, writes);
  return data;
  });
}
export async function ensureDemoWorkspace(repository: WorkspaceRepository): Promise<void> {
  const { dataset, detection } = buildDemoWorkspace(); const org = dataset.organization.id;
  const records = { ...dataset, issues: detection.issues, evidence: detection.evidence };
  const seed: Write[] = [{ collection: "organizations", value: records.organization }];
  for (const collection of ["data_sources", "imports", "orders", "production_jobs", "inventory_items", "issues", "evidence"] as const) {
    for (const value of records[fields[collection]]) seed.push({ collection, value } as Write);
  }
  // Create-only batch cannot overwrite history/source records. A raced complete seed is harmless.
  const present = await repository.read(org).get("organizations", org);
  if (present) {
    const loaded = await loadWorkspace(repository, org);
    for (const write of seed) {
      if (write.collection === "organizations") continue;
      const field = fields[write.collection as keyof typeof fields];
      if (!loaded[field].some((entity) => entity.id === write.value.id)) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "The demo workspace is incomplete; existing records were not overwritten.");
    }
    return;
  }
  try { await repository.batch(org, seed.map((write) => ({ ...write, mode: "create" }))); }
  catch (error) { if (!(error instanceof PersistenceError) || error.code !== "PERSISTENCE_CONFLICT") throw error; await ensureDemoWorkspace(repository); }
}
export function workspaceView(data: DemoDataset): DemoViewModel {
  // WU-08 owns imported dashboard integration: this demo view selects only canonical demo source IDs.
  const demoOrderIds = new Set(abcApparelDataset.orders.map((order) => order.id));
  const sources = { ...data, orders: data.orders.filter((order) => demoOrderIds.has(order.id)), productionJobs: data.productionJobs.filter((job) => abcApparelDataset.productionJobs.some((seed) => seed.id === job.id)), inventoryItems: data.inventoryItems.filter((item) => abcApparelDataset.inventoryItems.some((seed) => seed.id === item.id)) };
  const facts = buildDatasetOperationalFacts(sources, data.asOfDate); const priority = { critical: 0, high: 1, medium: 2, low: 3 };
  const details = data.issues.filter((issue) => issue.status === "open" && demoOrderIds.has(issue.orderId)).map((issue) => ({ issue, title: issueTitle(issue), daysToDeadline: facts.find((fact) => fact.orderId === issue.orderId)!.deadline.daysToDeadline,
    evidence: data.evidence.filter((item) => issue.evidenceIds.includes(item.id)).map((item) => ({ ...item, label: evidenceLabel(item.type), display: evidenceDisplay(item) })) })).sort((a,b) => priority[a.issue.severity] - priority[b.issue.severity] || a.daysToDeadline - b.daysToDeadline || (a.issue.id < b.issue.id ? -1 : a.issue.id > b.issue.id ? 1 : 0));
  return { organizationName: data.organization.name, asOfDate: data.asOfDate, metrics: { orders: sources.orders.length, atRisk: new Set(details.filter((item) => item.issue.type === "order_delay_risk").map((item) => item.issue.orderId)).size, materialShortages: details.filter((item) => item.issue.type === "material_shortage").length, criticalIssues: details.filter((item) => item.issue.severity === "critical").length }, details };
}
export async function requireRecord<C extends Collection>(reader: RepositoryReader, collection: C, id: string) {
  const value = await reader.get(collection, id);
  if (!value) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "The selected record is not available in this workspace.");
  return value;
}
