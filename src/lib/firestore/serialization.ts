import "server-only";
import type { Collection, Entity } from "../../repositories/types";
import { schemas } from "../../repositories/types";
import { safeId } from "./paths";
import { PersistenceError } from "./errors";
export function validateEntity<C extends Collection>(organizationId: string, collection: C, value: unknown, documentId?: string): Entity<C> {
  const parsed = schemas[collection].safeParse(value);
  if (!parsed.success) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Stored data does not match its canonical contract.");
  const entity = parsed.data; safeId(entity.id);
  if ((documentId && entity.id !== documentId) || ("organizationId" in entity && entity.organizationId !== organizationId) || (collection === "organizations" && entity.id !== organizationId)) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Entity ownership or document identifier does not match its scope.");
  return entity as Entity<C>;
}
export function serialize<C extends Collection>(organizationId: string, collection: C, value: unknown): Record<string, unknown> {
  const entity = validateEntity(organizationId, collection, value);
  // Zod validates first; JSON omits optional undefined fields and retains canonical null/string fields.
  const json = JSON.stringify(entity);
  if (new TextEncoder().encode(json).length > 900_000) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "The document exceeds the supported storage size.");
  return JSON.parse(json) as Record<string, unknown>;
}
