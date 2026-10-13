import "server-only";
import { abcApparelDataset } from "../../domain";
import { getWorkspaceRepository } from "../../repositories/firestore/workspace-repository";
import { ensureDemoWorkspace, loadWorkspace } from "./workspace";
import { restoreSession } from "./human-gate";
import { PersistenceError } from "../../lib/firestore/errors";
import type { PersistenceResponse } from "./contracts";
export async function demoRepository() { const repository = getWorkspaceRepository(); await ensureDemoWorkspace(repository); return repository; }
export async function persistedSession(): Promise<PersistenceResponse> {
  try { const repository = await demoRepository(); return { ok: true, state: restoreSession(await loadWorkspace(repository, abcApparelDataset.organization.id)) }; }
  catch (error) { return persistenceFailure(error); }
}
export function persistenceFailure(error: unknown): Extract<PersistenceResponse, { ok: false }> {
  if (error instanceof PersistenceError) return { ok: false, code: error.code, message: error.message };
  return { ok: false, code: "PERSISTENCE_WRITE_FAILED", message: "Workspace storage is temporarily unavailable. Please try again." };
}
