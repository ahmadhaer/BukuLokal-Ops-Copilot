"use client";
import { useState, useTransition, useRef } from "react";
import type { DemoViewModel } from "../../features/demo/workspace";
import type { DemoAnalysisResponse } from "../../features/demo/analysis-service";
import type { ImportPreviewResponse, ImportHealthResponse } from "../../features/import-ui/service";
import { ProductLink } from "./navigation";
import { useSession } from "./session";
import { ActionReview } from "./action-review";
import type { OrderOperationalFacts } from "../../domain/operations/types";
import type { ImportSaveResponse } from "../../application/contracts";
import { ImportFlow } from "./import-flow";

type View = "data" | "dashboard" | "issues" | "detail" | "actions" | "activity" | "import";
export type ProductProps = { view: View; workspace?: DemoViewModel; issueId?: string; issueFacts?: OrderOperationalFacts; aiConfigured: boolean; persistenceAvailable?: boolean;
  analyzeAction(issueId: string, operationId?: string): Promise<DemoAnalysisResponse>; previewAction(data: FormData): Promise<ImportPreviewResponse>;
  validateAction(data: FormData, selection: unknown): Promise<ImportHealthResponse>; saveAction?(data: FormData, selection: unknown, reviewKey: unknown): Promise<ImportSaveResponse> };
const eventLabels: Record<string, string> = { action_suggested: "Action suggested", action_edited: "Action edited", action_approved: "Action approved", action_rejected: "Action rejected", ai_analysis_completed: "AI analysis generated" };
function Badge({ severity }: { severity: string }) { return <span className={`badge ${severity}`}>{severity[0].toUpperCase() + severity.slice(1)}</span>; }
function IssueCards({ details }: { details: DemoViewModel["details"] }) {
  return <div className="issue-feed">{details.map((detail) => <article className="panel" key={detail.issue.id}><div className="section-top"><Badge severity={detail.issue.severity} /><span className="muted">{detail.issue.type === "material_shortage" ? "Material Shortage" : "Order Delay"}</span></div>
    <h2>{detail.title}</h2><ul className="fact-list">{detail.evidence.map((item) => <li key={item.id} data-evidence-id={item.id}>{item.label}: <strong>{item.display}</strong></li>)}</ul>
    <ProductLink className="button" href={`/issues/${encodeURIComponent(detail.issue.id)}`}>Review Issue</ProductLink></article>)}</div>;
}
export function ProductUI(props: ProductProps) {
  const { workspace, view } = props; const session = useSession(); const [filter, setFilter] = useState("All"); const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  const details = workspace?.details ?? []; const operation = useRef<string | null>(null);
  const detail = details.find((item) => item.issue.id === props.issueId);
  const analysis = props.issueId ? session.analyses[props.issueId] : undefined;
  function analyze() {
    if (!detail || pending) return;
    startTransition(async () => {
      try { operation.current ??= crypto.randomUUID(); const result = await props.analyzeAction(detail.issue.id, operation.current); await session.saveAnalysis(detail.issue.id, result); setError(""); }
      catch { setError("AI analysis is temporarily unavailable. The operational evidence remains visible."); }
    });
  }
  return <main className="workspace">{session.persistenceError && <p className="notice" role="alert">{session.persistenceError} Changes could not be saved; reload to check the latest server state.</p>}{session.pending && <p role="status">Saving workspace changes...</p>}{workspace && <p className="workspace-label">{workspace.organizationName} · Fictional demo · As of {workspace.asOfDate}</p>}
    {view === "data" && <><header className="page-heading"><h1>Where is your operations data?</h1><p>Start with the demo or preview your own file.</p></header><div className="source-grid"><section className="panel"><h2>Try Demo Data</h2><p>A fictional apparel company with operational issues to review.</p><ProductLink href="/demo" className="button primary">Try Demo Data</ProductLink></section><section className="panel"><h2>Upload CSV / Excel</h2><p>Review columns and data health before any future processing.</p><ProductLink href="/import" className="button">Upload File</ProductLink></section><section className="panel"><h2>Connect Google Sheets</h2><p className="status">Coming soon · P1</p><button disabled>Coming soon</button></section></div></>}
    {view === "dashboard" && workspace && <><header className="page-heading"><h1>Operations overview</h1><p>See what needs attention, then review the verified evidence.</p></header><div className="metrics">{Object.entries({ Orders: workspace.metrics.orders, "At Risk": workspace.metrics.atRisk, "Material Shortages": workspace.metrics.materialShortages, "Critical Issues": workspace.metrics.criticalIssues }).map(([label, value]) => <section className="metric" key={label}><h2>{label}</h2><p>{value}</p></section>)}</div><h2 className="section-title">Needs Your Attention</h2><IssueCards details={details} /></>}
    {view === "issues" && <><header className="page-heading"><h1>Issues</h1><p>Open operational issues, ordered by priority.</p></header><label htmlFor="issue-filter">Filter issues</label><select id="issue-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>{["All", "Critical", "High", "Medium", "Material Shortage", "Order Delay"].map((value) => <option key={value}>{value}</option>)}</select>
      <IssueCards details={details.filter((item) => filter === "All" || item.issue.severity === filter.toLowerCase() || (filter === "Material Shortage" && item.issue.type === "material_shortage") || (filter === "Order Delay" && item.issue.type === "order_delay_risk"))} />
      {details.filter((item) => filter === "All" || item.issue.severity === filter.toLowerCase() || (filter === "Material Shortage" && item.issue.type === "material_shortage") || (filter === "Order Delay" && item.issue.type === "order_delay_risk")).length === 0 && <p>No matching issues.</p>}</>}
    {view === "detail" && (detail ? <><header className="page-heading"><Badge severity={detail.issue.severity} /><h1>{detail.title}</h1></header><section className="panel"><h2>What is happening?</h2><p>{detail.title}.</p><h2>Why was this detected?</h2><p className="eyebrow">Verified operational evidence · computed from demo data</p><div className="evidence-grid">{detail.evidence.map((item) => <article key={item.id} data-evidence-id={item.id}><h3>{item.label}</h3><p>{item.display}</p></article>)}</div>{props.issueFacts && <p><strong>Remaining production:</strong> {props.issueFacts.production.remainingQuantity} {props.issueFacts.production.quantityUnit}</p>}</section>
      <section className="panel ai-panel"><h2>AI Analysis</h2><p>AI recommendations are advisory. Verified evidence above remains authoritative.</p><button className="primary" onClick={analyze} disabled={!props.aiConfigured || pending}>{pending ? "Analyzing..." : "Analyze with AI"}</button>
        {pending && <p role="status">Analyzing the verified operational evidence...</p>}
        {!props.aiConfigured && <p className="notice" role="status">AI analysis is not configured in this environment. The operational issue and evidence remain available.</p>}
        {error && <p role="alert">{error}</p>}{analysis && analysis.status !== "success" && <p className="notice" role="status">{analysis.message}</p>}
        {analysis?.status === "success" && <div className="analysis-result"><p className="eyebrow">AI recommendation · human review required</p><h3>Summary</h3><p>{analysis.result.analysis.summary}</p><h3>Why This Matters</h3><p>{analysis.result.analysis.whyItMatters}</p><h3>Recommended Actions</h3>
          {analysis.result.analysis.recommendations.map((recommendation, index) => <article className="recommendation" key={index}><h4>{recommendation.title}</h4><p>{recommendation.rationale}</p>{recommendation.draft && <p className="draft">{recommendation.draft}</p>}<button disabled={session.pending || session.actions.some((entry) => entry.analysisId === analysis.result.record.id && entry.recommendationIndex === index)} onClick={async () => { try { await session.suggest(analysis, index); } catch { setError("This recommendation could not be added for review."); } }}>Create Suggested Action</button></article>)}
          <h3>Missing Information</h3>{analysis.result.analysis.missingData.length === 0 && analysis.result.analysis.cannotDetermine.length === 0 ? <p>No additional information gaps were reported.</p> : <ul>{analysis.result.analysis.missingData.map((item, index) => <li key={index}>{item.field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ")}: {item.reason}</li>)}{analysis.result.analysis.cannotDetermine.map((item, index) => <li key={`cannot-${index}`}>{item}</li>)}</ul>}
        </div>}
      </section><section><h2>Human review</h2><p>Nothing will be sent automatically.</p>{session.actions.filter((entry) => entry.action.issueId === detail.issue.id).map((entry) => <ActionReview key={entry.action.id} entry={entry} />)}{session.actions.every((entry) => entry.action.issueId !== detail.issue.id) && <p>No suggested actions yet.</p>}</section></> : <section className="panel"><h1>Issue unavailable</h1><p>Choose an issue from the demo workspace.</p><ProductLink href="/issues">Back to Issues</ProductLink></section>)}
    {view === "actions" && <><header className="page-heading"><h1>Actions</h1><p>Review advisory drafts. Nothing will be sent automatically.</p></header>{session.actions.length ? session.actions.map((entry) => <ActionReview key={entry.action.id} entry={entry} />) : <section className="panel"><h2>No actions yet</h2><p>Analyze an issue, then choose a validated recommendation for review.</p><ProductLink href="/issues">Review Issues</ProductLink></section>}</>}
    {view === "activity" && <><header className="page-heading"><h1>Activity</h1><p>Internal analysis and human review events. No external actions are executed.</p></header>{session.events.length ? <ol className="activity-list">{[...session.events].reverse().map((event) => <li className="panel" key={event.id}><strong>{eventLabels[event.event] ?? "Internal review recorded"}</strong><p>{event.timestamp} · Demo owner</p></li>)}</ol> : <section className="panel"><h2>No activity yet</h2><p>Human review events will appear here after a persisted human review.</p></section>}</>}
    {view === "import" && <ImportFlow previewAction={props.previewAction} validateAction={props.validateAction} saveAction={props.saveAction} persistenceAvailable={props.persistenceAvailable} />}
  </main>;
}
