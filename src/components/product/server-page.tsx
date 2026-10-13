import "server-only";
import { buildDemoWorkspace } from "../../features/demo/workspace";
import { isAiConfigured } from "../../features/demo/analysis-service";
import { analyzeDemoAction, previewImportAction, validateImportAction } from "../../app/server-actions";
import { ProductUI, type ProductProps } from "./product-ui";
export function ProductPage({ view, issueId }: Pick<ProductProps, "view" | "issueId">) {
  let workspace;
  try { workspace = buildDemoWorkspace().view; }
  catch { return <main className="workspace"><h1>Workspace temporarily unavailable</h1><p>The demo data could not be prepared. Please try again.</p></main>; }
  return <ProductUI view={view} issueId={issueId} workspace={workspace} aiConfigured={isAiConfigured()}
    analyzeAction={analyzeDemoAction} previewAction={previewImportAction} validateAction={validateImportAction} />;
}
