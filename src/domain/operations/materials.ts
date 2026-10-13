import { InventoryItemSchema, type InventoryItem } from "../inventory/schema";
import { MaterialFactsSchema, type MaterialFacts } from "./types";
import { validateFacts, validateSource } from "./validation";

export function calculateMaterialFacts(input: InventoryItem): MaterialFacts {
  const item = validateSource(InventoryItemSchema, input);
  const shortageQuantity = Math.max(item.requiredQuantity - item.availableQuantity, 0);
  return validateFacts(MaterialFactsSchema, {
    inventoryItemId: item.id, relatedOrderId: item.relatedOrderId ?? null, materialName: item.materialName,
    availableQuantity: item.availableQuantity, requiredQuantity: item.requiredQuantity, shortageQuantity,
    unit: item.unit, hasShortage: shortageQuantity > 0,
  });
}
