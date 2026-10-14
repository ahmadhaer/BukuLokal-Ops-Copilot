import { EvidenceSchema, type Evidence } from "../evidence/schema";
import type { MaterialFacts, OrderOperationalFacts } from "../operations/types";
import { evidenceIdentifier } from "./identifiers";

function factEvidence(issueId: string, type: Evidence["type"], value: number, unit: string, sourceEntityType: Evidence["sourceEntityType"], sourceEntityId: string): Evidence {
  return EvidenceSchema.parse({ id: evidenceIdentifier(issueId, type, sourceEntityType, sourceEntityId),
    issueId, type, value, unit, sourceEntityType, sourceEntityId });
}
export function completionEvidence(issueId: string, facts: OrderOperationalFacts): Evidence {
  // Aggregate completion belongs to the order, not an invented single production job.
  return factEvidence(issueId, "production_completion", facts.production.completionPercentage, "percent", "order", facts.orderId);
}
export function deadlineEvidence(issueId: string, facts: OrderOperationalFacts): Evidence {
  return factEvidence(issueId, "days_to_deadline", facts.deadline.daysToDeadline, "days", "order", facts.orderId);
}
export function shortageEvidence(issueId: string, material: MaterialFacts): Evidence {
  return factEvidence(issueId, "material_shortage", material.shortageQuantity, material.unit, "inventory_item", material.inventoryItemId);
}
