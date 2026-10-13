"use client";
import { useState } from "react";
import type { ActionEntry } from "../../features/actions/human-gate";
import { useSession } from "./session";
const titles = { supplier_followup_draft: "Supplier follow-up draft", production_priority_note: "Production priority note", delivery_review_note: "Delivery review note" };
export function ActionReview({ entry }: { entry: ActionEntry }) {
  const session = useSession(); const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(entry.action.draft); const [error, setError] = useState("");
  const editable = entry.action.status === "suggested" || entry.action.status === "edited";
  function review(intent: "approve" | "edit" | "reject") {
    if (intent === "edit" && !draft.trim()) { setError("Enter draft text before saving."); return; }
    try { session.review(entry.action.id, intent, draft); setEditing(false); setError(""); } catch { setError("This action cannot be changed in its current state."); }
  }
  return <article className="panel action-card"><div className="section-top"><h2>{titles[entry.action.type]}</h2><span className="status">{entry.action.status}</span></div>
    <p className="muted">Suggested Action · {entry.action.issueId.includes("SO-") ? "Linked to an operational issue" : "Operational review"}</p>
    {entry.userModified && <p className="notice">User-modified draft</p>}
    {editing ? <><label htmlFor={`draft-${entry.action.id}`}>Edit draft text</label><textarea id={`draft-${entry.action.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} /><button onClick={() => review("edit")} disabled={!draft.trim()}>Save Edit</button><button onClick={() => setEditing(false)}>Cancel Edit</button></> : <p className="draft">{entry.action.draft}</p>}
    <p className="non-execution">Nothing will be sent automatically.</p>
    {editable && !editing && <div className="button-row"><button className="primary" onClick={() => review("approve")}>Approve</button><button onClick={() => setEditing(true)}>Edit</button><button onClick={() => review("reject")}>Reject</button></div>}
    {entry.action.status === "approved" && <p>Approved by Demo owner at {entry.action.approvedAt}. Internal approval only.</p>}
    {entry.action.status === "rejected" && <p>Rejected. No external action occurred.</p>}
    {error && <p role="alert">{error}</p>}
  </article>;
}
