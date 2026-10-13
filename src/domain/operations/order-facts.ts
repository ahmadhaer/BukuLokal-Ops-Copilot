import { OrderSchema } from "../orders/schema";
import { OperationsEngineError } from "./errors";
import { calculateDeadlineFacts, validateAsOfDate } from "./deadline";
import { calculateMaterialFacts } from "./materials";
import { calculateProductionFacts } from "./production";
import { OrderOperationalFactsSchema, type OperationsDatasetInput, type OrderOperationalFacts } from "./types";
import { validateFacts, validateSource } from "./validation";

export function buildOrderOperationalFacts(orderId: string, dataset: OperationsDatasetInput, asOfDate: string): OrderOperationalFacts {
  const explicitDate = validateAsOfDate(asOfDate);
  const matches = dataset.orders.filter((order) => order.id === orderId);
  if (!matches.length) throw new OperationsEngineError("ORDER_NOT_FOUND", "Order is not present in the supplied dataset.");
  if (matches.length > 1) throw new OperationsEngineError("DUPLICATE_ENTITY_ID", "Dataset contains more than one order with this ID.");
  const order = validateSource(OrderSchema, matches[0]);
  if (order.organizationId !== dataset.organization.id) throw new OperationsEngineError("ORGANIZATION_MISMATCH", "Order must belong to the dataset organization.");
  const inventory = dataset.inventoryItems.filter((item) => item.relatedOrderId === order.id).slice().sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const seen = new Set<string>();
  const materials = inventory.map((item) => {
    if (item.organizationId !== order.organizationId) throw new OperationsEngineError("ORGANIZATION_MISMATCH", "Related inventory must belong to the order organization.");
    if (seen.has(item.id)) throw new OperationsEngineError("DUPLICATE_ENTITY_ID", "Related inventory contains a duplicate ID.");
    seen.add(item.id);
    return calculateMaterialFacts(item);
  });
  return validateFacts(OrderOperationalFactsSchema, {
    orderId: order.id, organizationId: order.organizationId, asOfDate: explicitDate,
    production: calculateProductionFacts(order, dataset.productionJobs), materials,
    deadline: calculateDeadlineFacts(order.id, order.dueDate, explicitDate),
  });
}
