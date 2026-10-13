import "server-only";
import { connection } from "next/server";
import { buildDemoWorkspace } from "../../features/demo/workspace";
import { isAiConfigured } from "../../features/demo/analysis-service";
import { firestoreConfigured } from "../../lib/firestore/client";
import { demoRepository, persistenceFailure } from "../../features/persistence/runtime";
import { loadWorkspace, workspaceView } from "../../features/persistence/workspace";
import { abcApparelDataset } from "../../domain";
import { analyzeDemoAction, previewImportAction, validateImportAction } from "../../app/server-actions";
import { ProductUI, type ProductProps } from "./product-ui";
export async function ProductPage({ view, issueId }: Pick<ProductProps, "view" | "issueId">) {
  await connection(); // Database work is request-time; builds never require cloud credentials.
  let workspace = buildDemoWorkspace().view; let storageError = "";
  if (firestoreConfigured()) {
    try { const repository = await demoRepository(); workspace = workspaceView(await loadWorkspace(repository, abcApparelDataset.organization.id)); }
    catch (error) { storageError = persistenceFailure(error).message; }
  }
  return <>{storageError && <p className="notice" role="alert">{storageError} Showing read-only demo data.</p>}<ProductUI view={view} issueId={issueId} workspace={workspace} aiConfigured={isAiConfigured() && firestoreConfigured() && !storageError}
    analyzeAction={analyzeDemoAction} previewAction={previewImportAction} validateAction={validateImportAction} /></>;
}
