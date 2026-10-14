export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5_000;
export const DATASET_FIELDS = {
  orders: ["id", "customerName", "productName", "orderedQuantity", "quantityUnit", "dueDate", "status"],
  production: ["id", "orderId", "plannedQuantity", "completedQuantity", "quantityUnit", "updatedAt"],
  inventory: ["id", "materialName", "availableQuantity", "requiredQuantity", "unit", "relatedOrderId", "updatedAt"],
} as const;
export const REQUIRED_FIELDS = {
  orders: [...DATASET_FIELDS.orders],
  production: [...DATASET_FIELDS.production],
  inventory: DATASET_FIELDS.inventory.filter((field) => field !== "relatedOrderId"),
} as const;
// Kind recognition excludes only fields that a later confirmation may default.
export const KIND_SIGNATURES = {
  orders: ["id", "customerName", "productName", "orderedQuantity", "dueDate", "status"],
  production: ["id", "orderId", "plannedQuantity", "completedQuantity"],
  inventory: ["id", "materialName", "availableQuantity", "requiredQuantity"],
} as const;
