import "server-only";
import type { RawReader, RawStore, RawWrite } from "../types";
import { PersistenceError } from "../../lib/firestore/errors";
export type MemoryState = { documents: Map<string, unknown>; queue: Promise<unknown> };
export const createMemoryState = (): MemoryState => ({ documents: new Map(), queue: Promise.resolve() });
// Test transport only. A shared state lets tests reconstruct independent repository instances.
export function createMemoryStore(state = createMemoryState()): RawStore {
  function reader(documents: Map<string, unknown>): RawReader { return {
    async get(path) { return documents.has(path) ? structuredClone(documents.get(path)) : null; },
    async list(path) { return [...documents].filter(([key]) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/")).map(([key, data]) => ({ id: key.slice(path.length + 1), data: structuredClone(data) })); },
  }; }
  function apply(writes: RawWrite[]) { const next = new Map(state.documents); for (const write of writes) { if (write.mode === "create" && next.has(write.path)) throw new PersistenceError("PERSISTENCE_CONFLICT", "The record already exists."); next.set(write.path, structuredClone(write.value)); } state.documents = next; }
  function locked<T>(work: () => Promise<T>): Promise<T> { const result = state.queue.then(work); state.queue = result.then(() => undefined, () => undefined); return result; }
  return { get: (path) => reader(state.documents).get(path), list: (path) => reader(state.documents).list(path),
    batch: (writes) => locked(async () => { apply(writes); }),
    transaction: (work) => locked(async () => { const { result, writes } = await work(reader(state.documents)); apply(writes); return result; }),
  };
}
