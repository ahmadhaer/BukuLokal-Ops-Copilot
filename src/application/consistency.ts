import "server-only";
import { abcApparelDataset, type DemoDataset } from "../domain";
import { buildDatasetOperationalFacts } from "../domain/operations";
import { detectDatasetIssues } from "../domain/issues";
import { DEMO_DETECTED_AT } from "../features/demo/workspace";
import { PersistenceError } from "../lib/firestore/errors";
export function checkedDemo(data: DemoDataset) {
  const sources = { organization: data.organization,
    orders: data.orders.filter((item) => abcApparelDataset.orders.some((seed) => seed.id === item.id)),
    productionJobs: data.productionJobs.filter((item) => abcApparelDataset.productionJobs.some((seed) => seed.id === item.id)),
    inventoryItems: data.inventoryItems.filter((item) => abcApparelDataset.inventoryItems.some((seed) => seed.id === item.id)) };
  try {
    if (sources.orders.length !== abcApparelDataset.orders.length || sources.productionJobs.length !== abcApparelDataset.productionJobs.length || sources.inventoryItems.length !== abcApparelDataset.inventoryItems.length) throw new Error("missing source");
    const facts = buildDatasetOperationalFacts(sources, data.asOfDate);
    const expected = detectDatasetIssues(sources, facts, { detectedAt: DEMO_DETECTED_AT });
    // Read-only comparison: never replace persisted issue/evidence histories.
    for (const issue of expected.issues) {
      const stored = data.issues.find((item) => item.id === issue.id);
      if (!stored || stored.orderId !== issue.orderId || stored.type !== issue.type || stored.severity !== issue.severity || JSON.stringify(stored.evidenceIds) !== JSON.stringify(issue.evidenceIds)) throw new Error("issue mismatch");
    }
    for (const evidence of expected.evidence) {
      const stored = data.evidence.find((item) => item.id === evidence.id);
      if (!stored || Object.keys(evidence).some((key) => stored[key as keyof typeof stored] !== evidence[key as keyof typeof evidence])) throw new Error("evidence mismatch");
    }
    if (data.issues.some((item) => sources.orders.some((order) => order.id === item.orderId) && !expected.issues.some((issue) => issue.id === item.id))) throw new Error("unexpected issue");
    return { sources, facts };
  } catch { throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Workspace facts and saved evidence are inconsistent. Existing history was not changed."); }
}
