import type { AuditEvent } from "../../domain";
import type { ActionEntry } from "../actions/human-gate";
import type { DemoAnalysisResponse } from "../demo/analysis-service";
export type SessionState = { actions: ActionEntry[]; events: AuditEvent[]; analyses: Record<string, DemoAnalysisResponse> };
export type PersistenceResponse = { ok: true; state: SessionState } | { ok: false; code: string; message: string };
export type PersistenceTransport = {
  load(): Promise<PersistenceResponse>;
  suggest(analysisId: string, index: number): Promise<PersistenceResponse>;
  review(actionId: string, intent: "approve" | "edit" | "reject", draft?: string): Promise<PersistenceResponse>;
};
