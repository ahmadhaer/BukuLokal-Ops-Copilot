"use client";
import { createContext, useContext, useState, useEffect, useTransition, type ReactNode } from "react";
import { AuditEventSchema, type AuditEvent } from "../../domain/audit/schema";
import type { DemoAnalysisResponse } from "../../features/demo/analysis-service";
import { createSuggestedAction, editAction, approveAction, rejectAction, type ActionEntry } from "../../features/actions/human-gate";

import type { PersistenceTransport, PersistenceResponse } from "../../features/persistence/contracts";
type State = { actions: ActionEntry[]; events: AuditEvent[]; analyses: Record<string, DemoAnalysisResponse> };
type Session = State & { pending: boolean; persistenceError: string; durable: boolean; saveAnalysis(id: string, value: DemoAnalysisResponse): void | Promise<void>; suggest(value: Extract<DemoAnalysisResponse, { status: "success" }>, index: number): void | Promise<void>; review(id: string, intent: "approve" | "edit" | "reject", draft?: string): void | Promise<void> };
class StorageResponseError extends Error {}
const Context = createContext<Session | null>(null);
export function SessionProvider({ children, organizationId, persistence }: { children: ReactNode; organizationId: string; persistence?: PersistenceTransport }) {
  const [state, setState] = useState<State>({ actions: [], events: [], analyses: {} });
  const [persistenceError, setPersistenceError] = useState(""); const [pending, startTransition] = useTransition();
  const [durable, setDurable] = useState(false);
  function accept(response: PersistenceResponse) {
    if (!response.ok) { setPersistenceError(response.message); throw new StorageResponseError(response.message); }
    setState(response.state); setPersistenceError(""); setDurable(true);
  }
  useEffect(() => {
    if (!persistence) return;
    let active = true;
    persistence.load().then((response) => { if (active) { if (response.ok) { setState(response.state); setDurable(true); setPersistenceError(""); } else setPersistenceError(response.message); } }).catch(() => { if (active) setPersistenceError("Workspace storage is temporarily unavailable."); });
    return () => { active = false; };
  }, [persistence]);
  function remote(work: () => Promise<PersistenceResponse>): Promise<void> {
    return new Promise((resolve, reject) => startTransition(async () => {
      try { accept(await work()); resolve(); }
      catch (error) { if (!(error instanceof StorageResponseError)) setPersistenceError("Workspace storage is temporarily unavailable."); reject(new Error("Workspace change could not be saved.")); }
    }));
  }
  function context(current: State) { return { actor: "demo-owner", organizationId, occurredAt: new Date().toISOString(), sequence: current.events.length }; }
  const value: Session = { ...state, pending, persistenceError, durable,
    saveAnalysis(id, result) { if (persistence && result.status === "success") return remote(() => persistence.load()); setState((current) => {
      const event = result.status === "success" ? AuditEventSchema.parse({ id: `AUD-AI:${result.result.record.id}:${current.events.length}`,
        organizationId, actor: "demo-owner", event: "ai_analysis_completed", entityType: "ai_analysis", entityId: result.result.record.id, timestamp: result.result.record.createdAt }) : null;
      return { ...current, analyses: { ...current.analyses, [id]: result }, events: event ? [...current.events, event] : current.events };
    }); },
    suggest(result, index) { if (persistence) return remote(() => persistence.suggest(result.result.record.id, index)); setState((current) => {
      const created = createSuggestedAction(result.result.record, result.input, index, context(current));
      if (current.actions.some((entry) => entry.action.id === created.entry.action.id)) return current;
      return { ...current, actions: [...current.actions, created.entry], events: [...current.events, created.event] };
    }); },
    review(id, intent, draft) { if (persistence) return remote(() => persistence.review(id, intent, draft)); setState((current) => {
      const entry = current.actions.find((item) => item.action.id === id); if (!entry || !["suggested", "edited"].includes(entry.action.status)) return current;
      const result = intent === "edit" ? editAction(entry, draft ?? "", context(current)) : intent === "approve" ? approveAction(entry, context(current)) : rejectAction(entry, context(current));
      return { ...current, actions: current.actions.map((item) => item.action.id === id ? result.entry : item), events: [...current.events, result.event] };
    }); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() { const value = useContext(Context); if (!value) throw new Error("SessionProvider is required."); return value; }
