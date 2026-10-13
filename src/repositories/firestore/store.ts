import "server-only";
import type { Firestore, Transaction } from "@google-cloud/firestore";
import type { RawReader, RawStore, RawWrite } from "../types";
function reader(db: Firestore, tx?: Transaction): RawReader {
  return {
    async get(path) { const ref = db.doc(path); const snapshot = tx ? await tx.get(ref) : await ref.get(); return snapshot.exists ? snapshot.data() : null; },
    async list(path) { const ref = db.collection(path); const snapshot = tx ? await tx.get(ref) : await ref.get(); return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })); },
  };
}
export function createFirestoreStore(db: Firestore): RawStore {
  return { ...reader(db),
    async batch(writes) { const batch = db.batch(); for (const write of writes) { const ref = db.doc(write.path); if (write.mode === "create") batch.create(ref, write.value); else batch.set(ref, write.value); } await batch.commit(); },
    async transaction<T>(work: (reader: RawReader) => Promise<{ result: T; writes: RawWrite[] }>) {
      return db.runTransaction(async (tx) => {
        const { result, writes } = await work(reader(db, tx));
        // All validated reads completed before any SDK transaction writes.
        for (const write of writes) { const ref = db.doc(write.path); if (write.mode === "create") tx.create(ref, write.value); else tx.set(ref, write.value); }
        return result;
      });
    },
  };
}
