import type { ReactNode } from "react";
import { ProductLink } from "./navigation";
export function AppShell({ children }: { children: ReactNode }) {
  return <><a className="skip-link" href="#content">Skip to content</a><header className="app-header"><ProductLink href="/" className="brand">BukuLokal <span>Ops Copilot</span></ProductLink><nav aria-label="Main navigation">{[["/data", "Data"], ["/demo", "Dashboard"], ["/issues", "Issues"], ["/actions", "Actions"], ["/activity", "Activity"]].map(([href, label]) => <ProductLink href={href} key={href}>{label}</ProductLink>)}</nav></header><div id="content">{children}</div><footer><p>Demo owner is a synthetic actor; sign-in is not implemented. Human Gate history is retained when server storage is available. Storage errors are shown explicitly.</p><p>No messages, orders, or external systems are changed by approval.</p></footer></>;
}
