import "server-only";
import { Firestore } from "@google-cloud/firestore";
import { PersistenceError } from "./errors";
let client: Firestore | undefined;
export function firestoreConfigured(): boolean { return Boolean(process.env.GOOGLE_CLOUD_PROJECT?.trim()); }
export function getFirestore(): Firestore {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  if (!projectId) throw new PersistenceError("PERSISTENCE_NOT_CONFIGURED", "Workspace storage is not configured in this environment.");
  // SDK discovers ADC / Cloud Run identity and honors FIRESTORE_EMULATOR_HOST itself.
  client ??= new Firestore({ projectId });
  return client;
}
