import { abcApparelDataset } from "../../../src/domain/demo/abc-apparel";
import { buildOrderOperationalFacts } from "../../../src/domain/operations";
import type { Order } from "../../../src/domain/orders/schema";

export const context = { detectedAt: "2026-10-12T12:00:00Z" };
export function scenario(days: number, completion: number, shortage = 0, status: Order["status"] = "in_production") {
  const order = { ...abcApparelDataset.orders[0], status };
  const facts = buildOrderOperationalFacts(order.id, { ...abcApparelDataset, orders: [order] }, abcApparelDataset.asOfDate);
  // Synthetic unit-test fact inputs isolate rule boundaries; the canonical fixture stays unchanged.
  facts.deadline.daysToDeadline = days;
  facts.production.completionPercentage = completion;
  facts.production.totalCompletedQuantity = completion * order.orderedQuantity / 100;
  facts.production.remainingQuantity = order.orderedQuantity - facts.production.totalCompletedQuantity;
  facts.materials[0].shortageQuantity = shortage;
  facts.materials[0].hasShortage = shortage > 0;
  return { order, facts };
}
