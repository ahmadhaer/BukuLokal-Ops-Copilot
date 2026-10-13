"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { AuditEventSchema, type AuditEvent } from "../../domain/audit/schema";
import type { DemoAnalysisResponse } from "../../features/demo/analysis-service";
import { createSuggestedAction, editAction, approveAction, rejectAction, type ActionEntry } from "../../features/actions/human-gate";

type State = { actions: ActionEntry[]; events: AuditEvent[]; analyses: Record<string, DemoAnalysisResponse> };
type Session = State & { saveAnalysis(id: string, value: DemoAnalysisResponse): void; suggest(value: Extract<DemoAnalysisResponse, { status: "success" }>, index: number): void; review(id: string, intent: "approve" | "edit" | "reject", draft?: string): void };
const Context = createContext<Session | null>(null);
export function SessionProvider({ children, organizationId }: { children: ReactNode; organizationId: string }) {
  const [state, setState] = useState<State>({ actions: [], events: [], analyses: {} });
  function context(current: State) { return { actor: "demo-owner", organizationId, occurredAt: new Date().toISOString(), sequence: current.events.length }; }
  const value: Session = { ...state,
    saveAnalysis(id, result) { setState((current) => {
      const event = result.status === "success" ? AuditEventSchema.parse({ id: `AUD-AI:${result.result.record.id}:${current.events.length}`,
        organizationId, actor: "demo-owner", event: "ai_analysis_completed", entityType: "ai_analysis", entityId: result.result.record.id, timestamp: result.result.record.createdAt }) : null;
      return { ...current, analyses: { ...current.analyses, [id]: result }, events: event ? [...current.events, event] : current.events };
    }); },
    suggest(result, index) { setState((current) => {
      const created = createSuggestedAction(result.result.record, result.input, index, context(current));
      if (current.actions.some((entry) => entry.action.id === created.entry.action.id)) return current;
      return { ...current, actions: [...current.actions, created.entry], events: [...current.events, created.event] };
    }); },
    review(id, intent, draft) { setState((current) => {
      const entry = current.actions.find((item) => item.action.id === id); if (!entry || !["suggested", "edited"].includes(entry.action.status)) return current;
      const result = intent === "edit" ? editAction(entry, draft ?? "", context(current)) : intent === "approve" ? approveAction(entry, context(current)) : rejectAction(entry, context(current));
      return { ...current, actions: current.actions.map((item) => item.action.id === id ? result.entry : item), events: [...current.events, result.event] };
    }); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() { const value = useContext(Context); if (!value) throw new Error("SessionProvider is required."); return value; }
