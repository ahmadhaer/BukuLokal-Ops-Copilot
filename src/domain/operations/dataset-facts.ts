import { OrganizationSchema } from "../organizations/schema";
import { OperationsEngineError } from "./errors";
import { validateAsOfDate } from "./deadline";
import { buildOrderOperationalFacts } from "./order-facts";
import type { OperationsDatasetInput, OrderOperationalFacts } from "./types";
import { validateSource } from "./validation";

export function buildDatasetOperationalFacts(dataset: OperationsDatasetInput, asOfDate: string): OrderOperationalFacts[] {
  validateAsOfDate(asOfDate);
  const organization = validateSource(OrganizationSchema, dataset.organization);
  const orderIds = new Set(dataset.orders.map((order) => order.id));
  if (orderIds.size !== dataset.orders.length) throw new OperationsEngineError("DUPLICATE_ENTITY_ID", "Dataset order IDs must be unique.");
  for (const row of [...dataset.orders, ...dataset.productionJobs, ...dataset.inventoryItems]) {
    if (row.organizationId !== organization.id) throw new OperationsEngineError("ORGANIZATION_MISMATCH", "Operational records must belong to the dataset organization.");
  }
  for (const job of dataset.productionJobs) {
    if (!orderIds.has(job.orderId)) throw new OperationsEngineError("ORDER_NOT_FOUND", "Production references an order absent from the dataset.");
  }
  for (const item of dataset.inventoryItems) {
    if (item.relatedOrderId != null && !orderIds.has(item.relatedOrderId)) throw new OperationsEngineError("ORDER_NOT_FOUND", "Inventory correlation references an order absent from the dataset.");
  }
  return dataset.orders.slice().sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    .map((order) => buildOrderOperationalFacts(order.id, dataset, asOfDate));
}
