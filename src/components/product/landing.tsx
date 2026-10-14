import { ProductLink } from "./navigation";
export default function Landing() {
  return <main className="landing"><p className="eyebrow">AI Builder Cup 2026 · Manufacturing</p>
    <h1>BukuLokal Ops Copilot</h1><p className="hero-title">Know what needs your attention today.</p>
    <p className="lead">Turn operations data into prioritized, evidence-grounded actions. See the facts first, review the advice, and stay in control.</p>
    <div className="button-row"><ProductLink href="/demo" className="button primary">Try Demo</ProductLink><ProductLink href="/data" className="button">Use My Data</ProductLink></div>
    <div className="principles"><section><h2>Find what matters</h2><p>Review production progress, deadlines, and material gaps in one place.</p></section><section><h2>See the evidence</h2><p>Every detected issue links to computed operational facts.</p></section><section><h2>You make the decision</h2><p>Review suggestions before approving any internal action.</p></section></div>
    <p className="muted">Try a fictional apparel company without signing in. Nothing is sent or changed externally.</p>
  </main>;
}
