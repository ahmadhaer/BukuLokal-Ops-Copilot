import { OrderSchema, type Order } from "../orders/schema";
import { ProductionJobSchema, type ProductionJob } from "../production/schema";
import { OperationsEngineError } from "./errors";
import { ProductionFactsSchema, type ProductionFacts } from "./types";
import { validateFacts, validateSource } from "./validation";

export function calculateProductionFacts(orderInput: Order, jobs: readonly ProductionJob[]): ProductionFacts {
  const order = validateSource(OrderSchema, orderInput);
  let totalPlannedQuantity = 0;
  let totalCompletedQuantity = 0;
  const seen = new Set<string>();
  // Copy and sort matching IDs using UTF-16 string ordering; no locale or input mutation.
  const matching = jobs.filter((job) => job.orderId === order.id).slice().sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  for (const input of matching) {
    const job = validateSource(ProductionJobSchema, input);
    if (seen.has(job.id)) throw new OperationsEngineError("DUPLICATE_ENTITY_ID", "Matching production jobs contain a duplicate ID.");
    seen.add(job.id);
    if (job.organizationId !== order.organizationId) throw new OperationsEngineError("ORGANIZATION_MISMATCH", "Production job organization must match its order.");
    if (job.quantityUnit !== order.quantityUnit) throw new OperationsEngineError("PRODUCTION_UNIT_MISMATCH", "Production quantities must use the order unit; no conversion is performed.");
    totalPlannedQuantity += job.plannedQuantity;
    totalCompletedQuantity += job.completedQuantity;
  }
  if (!Number.isFinite(totalPlannedQuantity) || !Number.isFinite(totalCompletedQuantity)) throw new OperationsEngineError("INVALID_FACTS", "Aggregated production quantities must remain finite.");
  if (totalCompletedQuantity > order.orderedQuantity) throw new OperationsEngineError("COMPLETED_EXCEEDS_ORDERED", "Completed production exceeds the customer order quantity.");
  return validateFacts(ProductionFactsSchema, {
    orderId: order.id, orderedQuantity: order.orderedQuantity, totalPlannedQuantity, totalCompletedQuantity,
    remainingQuantity: order.orderedQuantity - totalCompletedQuantity,
    // Positive percentages rounded to nearest hundredth; halves round upward.
    completionPercentage: Math.round((totalCompletedQuantity / order.orderedQuantity) * 10_000) / 100,
    quantityUnit: order.quantityUnit,
  });
}
