import "server-only";
import { z } from "zod";
import { OrganizationSchema, DataSourceSchema, ImportSessionSchema, OrderSchema, ProductionJobSchema, InventoryItemSchema, IssueSchema, EvidenceSchema, AIAnalysisSchema, ActionSchema, AuditEventSchema } from "../domain";
export const schemas = { organizations: OrganizationSchema, data_sources: DataSourceSchema, imports: ImportSessionSchema, orders: OrderSchema, production_jobs: ProductionJobSchema, inventory_items: InventoryItemSchema, issues: IssueSchema, evidence: EvidenceSchema, ai_analyses: AIAnalysisSchema, actions: ActionSchema, audit_events: AuditEventSchema };
export type Collection = keyof typeof schemas;
export type Entity<C extends Collection> = z.output<(typeof schemas)[C]>;
export type Write = { [C in Collection]: { collection: C; value: Entity<C>; mode?: "create" | "set" } }[Collection];
export interface RepositoryReader {
  get<C extends Collection>(collection: C, id: string): Promise<Entity<C> | null>;
  list<C extends Collection>(collection: C): Promise<Entity<C>[]>;
}
export interface RepositoryTransaction extends RepositoryReader { write(write: Write): void; }
export interface WorkspaceRepository {
  read(organizationId: string): RepositoryReader;
  batch(organizationId: string, writes: Write[]): Promise<void>;
  transaction<T>(organizationId: string, work: (tx: RepositoryTransaction) => Promise<T>): Promise<T>;
}
// Narrow storage transport: Firestore owns SDK objects; repositories own domain validation.
export interface RawReader {
  get(path: string): Promise<unknown | null>;
  list(path: string): Promise<Array<{ id: string; data: unknown }>>;
}
export type RawWrite = { path: string; value: Record<string, unknown>; mode: "create" | "set" };
export interface RawStore extends RawReader {
  batch(writes: RawWrite[]): Promise<void>;
  transaction<T>(work: (reader: RawReader) => Promise<{ result: T; writes: RawWrite[] }>): Promise<T>;
}
