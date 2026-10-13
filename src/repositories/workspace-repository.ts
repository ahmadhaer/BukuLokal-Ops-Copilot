import "server-only";
import { collectionPath, documentPath, safeId } from "../lib/firestore/paths";
import { serialize, validateEntity } from "../lib/firestore/serialization";
import { PersistenceError, providerError } from "../lib/firestore/errors";
import { schemas, type Collection, type Entity, type RawReader, type RawStore, type RawWrite, type RepositoryReader, type Write, type WorkspaceRepository } from "./types";
export const MAX_ATOMIC_WRITES = 500;
const sourceCollections: Record<string, Collection> = { organization: "organizations", data_source: "data_sources", import_session: "imports", order: "orders", production_job: "production_jobs", inventory_item: "inventory_items", issue: "issues", evidence: "evidence", ai_analysis: "ai_analyses", action: "actions", audit_event: "audit_events" };
function validateWrites(org: string, writes: Write[]): RawWrite[] {
  safeId(org);
  if (writes.length > MAX_ATOMIC_WRITES) throw new PersistenceError("PERSISTENCE_WRITE_FAILED", "This import exceeds the 500-write atomic limit. Split the input into smaller files.");
  const result = writes.map((write) => {
    if (!Object.hasOwn(schemas, write.collection) || (write.mode && !["create", "set"].includes(write.mode))) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Unsupported entity write.");
    const value = serialize(org, write.collection, write.value);
    return { path: documentPath(org, write.collection, value.id as string), value, mode: write.mode ?? "set" };
  });
  if (new Set(result.map((item) => item.path)).size !== result.length) throw new PersistenceError("PERSISTENCE_CONFLICT", "Duplicate document writes are not permitted.");
  if (new TextEncoder().encode(JSON.stringify(result)).length > 8_000_000) throw new PersistenceError("PERSISTENCE_WRITE_FAILED", "This atomic write exceeds the supported request size.");
  return result;
}
function scoped(org: string, raw: RawReader): RepositoryReader {
  safeId(org);
  return {
    async get<C extends Collection>(collection: C, id: string) {
      const value = await raw.get(documentPath(org, collection, id));
      return value === null ? null : validateEntity(org, collection, value, id);
    },
    async list<C extends Collection>(collection: C): Promise<Entity<C>[]> {
      if (collection === "organizations") { const value = await this.get("organizations", org); return (value ? [value] : []) as Entity<C>[]; }
      const docs = await raw.list(collectionPath(org, collection));
      return docs.map((doc) => validateEntity(org, collection, doc.data, doc.id)).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    },
  };
}
export async function validateReferences(reader: RepositoryReader, writes: Write[]): Promise<void> {
  async function requireEntity(collection: Collection, id: string) {
    const pending = writes.find((write) => write.collection === collection && write.value.id === id);
    const entity = pending?.value ?? await reader.get(collection, id);
    if (!entity) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "A linked record is missing from this organization.");
    return entity;
  }
  for (const write of writes) {
    const value = write.value;
    if (write.collection === "imports" && "dataSourceId" in value) await requireEntity("data_sources", value.dataSourceId);
    if (write.collection === "orders" && "sourceId" in value) await requireEntity("imports", value.sourceId);
    if ("orderId" in value) await requireEntity("orders", value.orderId);
    if ("relatedOrderId" in value && value.relatedOrderId) await requireEntity("orders", value.relatedOrderId);
    if ("issueId" in value) {
      const issue = await requireEntity("issues", value.issueId);
      if (write.collection === "evidence" && "evidenceIds" in issue && !issue.evidenceIds.includes(value.id)) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Evidence is not referenced by its owning issue.");
    }
    if (write.collection === "issues" && "evidenceIds" in value) {
      for (const id of value.evidenceIds) { const evidence = await requireEntity("evidence", id); if (!("issueId" in evidence) || evidence.issueId !== value.id) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Issue evidence must belong to its owner."); }
    }
    if (write.collection === "evidence" && "sourceEntityType" in value) await requireEntity(sourceCollections[value.sourceEntityType], value.sourceEntityId);
    if (write.collection === "ai_analyses" && "evidenceRefs" in value) {
      for (const id of value.evidenceRefs) { const evidence = await requireEntity("evidence", id); if (!("issueId" in evidence) || evidence.issueId !== value.issueId) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Analysis evidence belongs to another issue."); }
    }
    if (write.collection === "audit_events" && "entityType" in value) await requireEntity(sourceCollections[value.entityType], value.entityId);
  }
}
export function createWorkspaceRepository(store: RawStore): WorkspaceRepository {
  return {
    read(org) { const base = scoped(org, store); return {
      async get(collection, id) { try { return await base.get(collection, id); } catch (error) { throw providerError(error, "read"); } },
      async list(collection) { try { return await base.list(collection); } catch (error) { throw providerError(error, "read"); } },
    }; },
    async batch(org, writes) {
      const prepared = validateWrites(org, writes); // All shapes/paths validated before any transport access.
      try { if (writes.some((write) => write.collection !== "organizations") && !writes.some((write) => write.collection === "organizations") && !await scoped(org, store).get("organizations", org)) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Organization does not exist.");
        await validateReferences(scoped(org, store), writes); if (prepared.length) await store.batch(prepared);
      } catch (error) { throw providerError(error, "write"); }
    },
    async transaction(org, work) {
      safeId(org);
      try { return await store.transaction(async (raw) => {
        const base = scoped(org, raw); const writes: Write[] = [];
        const result = await work({ ...base, write(write) { validateWrites(org, [write]); writes.push(write); } });
        const prepared = validateWrites(org, writes);
        if (writes.length && !writes.some((write) => write.collection === "organizations") && !await base.get("organizations", org)) throw new PersistenceError("PERSISTENCE_NOT_FOUND", "Organization does not exist.");
        await validateReferences(base, writes);
        return { result, writes: prepared };
      }); } catch (error) { throw providerError(error, "write"); }
    },
  };
}
