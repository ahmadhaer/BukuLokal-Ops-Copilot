import "server-only";
import { DataSourceSchema, ImportSessionSchema, type DataSource } from "../../domain";
import type { WorkspaceRepository, Write } from "../../repositories/types";
import type { ConfirmedFieldMapping, RawTable } from "../imports/types";
import { normalizeTable } from "../imports";
import { PersistenceError } from "../../lib/firestore/errors";
export async function persistValidatedImport(repository: WorkspaceRepository, table: RawTable, mapping: ConfirmedFieldMapping, sourceInput: DataSource, importedAt: string) {
  // Normalize with the WU-02 service; callers cannot submit arbitrary alleged valid rows.
  const result = normalizeTable(table, mapping);
  const source = DataSourceSchema.parse(sourceInput); const context = mapping.context;
  if (source.id !== context.dataSourceId || source.organizationId !== context.organizationId || !["csv", "xlsx"].includes(source.type)) throw new PersistenceError("PERSISTENCE_INVALID_DOCUMENT", "Import source does not match the confirmed mapping.");
  const session = ImportSessionSchema.parse({ id: context.importSessionId, organizationId: context.organizationId, dataSourceId: source.id, sourceType: source.type, status: "validated", importedAt });
  const collection = mapping.datasetKind === "orders" ? "orders" : mapping.datasetKind === "production" ? "production_jobs" : "inventory_items";
  const writes: Write[] = [{ collection: "data_sources", value: source }, { collection: "imports", value: session }, ...result.validRecords.map((value) => ({ collection, value } as Write))];
  // Create-only import prevents repeat/stale input from overwriting existing source records.
  await repository.batch(context.organizationId, writes.map((write) => ({ ...write, mode: "create" })));
  return result;
}
