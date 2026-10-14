import "server-only";
import { getFirestore } from "../../lib/firestore/client";
import { createWorkspaceRepository } from "../workspace-repository";
import { createFirestoreStore } from "./store";
import type { WorkspaceRepository } from "../types";
let repository: WorkspaceRepository | undefined;
export function getWorkspaceRepository(): WorkspaceRepository { return repository ??= createWorkspaceRepository(createFirestoreStore(getFirestore())); }
