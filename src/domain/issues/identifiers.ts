import type { Issue } from "./schema";
import type { Evidence } from "../evidence/schema";

// Length prefixes preserve boundaries even when canonical IDs contain separators.
const segment = (value: string) => `${value.length}:${value}`;
export function issueIdentifier(type: Issue["type"], organizationId: string, sourceId: string): string {
  return `ISS:${type}:${segment(organizationId)}:${segment(sourceId)}`;
}
export function evidenceIdentifier(issueId: string, type: Evidence["type"], sourceType: Evidence["sourceEntityType"], sourceId: string): string {
  return `EV:${segment(issueId)}:${type}:${sourceType}:${segment(sourceId)}`;
}
