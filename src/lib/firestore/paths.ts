import "server-only";
import { EntityIdSchema } from "../../domain/common/schema";
import type { Collection } from "../../repositories/types";
import { PersistenceError } from "./errors";
export function safeId(value: unknown): string {
  const parsed = EntityIdSchema.safeParse(value);
  if (!parsed.success || /[\/\\\x00-\x1f\x7f]/.test(parsed.data) || parsed.data === "." || parsed.data === ".." || /^__.*__$/.test(parsed.data) || new TextEncoder().encode(parsed.data).length > 1500) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "A valid canonical identifier is required.");
  return parsed.data;
}
export function collectionPath(organizationId: string, collection: Collection): string {
  const org = safeId(organizationId);
  return collection === "organizations" ? "organizations" : `organizations/${org}/${collection}`;
}
export function documentPath(organizationId: string, collection: Collection, id: string): string {
  const org = safeId(organizationId); const key = safeId(id);
  if (collection === "organizations" && org !== key) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Organization identifiers must match their scope.");
  return `${collectionPath(org, collection)}/${key}`;
}
