import "server-only";
import { connection } from "next/server";
import { getProductionApplication } from "../../application/production";
import { analyzeDemoAction, previewImportAction, validateImportAction, saveValidDataAction } from "../../app/server-actions";
import type { IssueSnapshot } from "../../application/contracts";
import { ProductLink } from "./navigation";
import { ProductUI, type ProductProps } from "./product-ui";
export async function ProductPage({ view, issueId }: Pick<ProductProps, "view" | "issueId">) {
  await connection();
  const application = getProductionApplication(); const health = application.health();
  const actions = { analyzeAction: analyzeDemoAction, previewAction: previewImportAction, validateAction: validateImportAction, saveAction: saveValidDataAction };
  if (view === "data" || view === "import") return <ProductUI view={view} aiConfigured={health.capabilities.ai === "configured"} persistenceAvailable={health.capabilities.persistence === "configured"} {...actions} />;
  const result = view === "detail" ? await application.getIssueDetail(issueId ?? "") : view === "dashboard" ? await application.openDemoWorkspace() : await application.getDashboard();
  if (!result.ok) return <main className="workspace"><h1>{view === "detail" ? "Issue unavailable" : "Workspace unavailable"}</h1><p className="notice" role="alert">{result.message}</p><p>The persistent demo requires configured, reachable server storage. No substitute workspace was created.</p><ProductLink href="/demo" className="button">Try Demo Again</ProductLink><ProductLink href="/" className="button">Return to Landing</ProductLink></main>;
  const facts = view === "detail" ? (result.value as IssueSnapshot).facts : undefined;
  return <ProductUI view={view} issueId={issueId} workspace={result.value.workspace} issueFacts={facts} aiConfigured={health.capabilities.ai === "configured"} persistenceAvailable={true} {...actions} />;
}
