import { useState } from "react";
import { ProductUI } from "../../../src/components/product/product-ui";
import Landing from "../../../src/components/product/landing";
import { AppShell } from "../../../src/components/product/shell";
import { SessionProvider } from "../../../src/components/product/session";
import { NavigationContext } from "../../../src/components/product/navigation";
import { buildDemoWorkspace } from "../../../src/features/demo/workspace";
import { analyzeDemoIssue, type DemoAnalysisResponse } from "../../../src/features/demo/analysis-service";
import { previewImport, validateImport } from "../../../src/features/import-ui/service";
import { StubProvider, validOutput, execution, selectedRequest } from "../ai/helpers";

export async function fakeAnalyze(id: string) {
  const request = selectedRequest(); request.issueId = id;
  return analyzeDemoIssue(id, execution.createdAt, () => ({ provider: new StubProvider([JSON.stringify(validOutput(request))]), config: { model: execution.model } }));
}
async function bytes(data: FormData) {
  const file = data.get("file") as File;
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as ArrayBuffer); reader.onerror = reject; reader.readAsArrayBuffer(file); });
  return { name: file.name, bytes: new Uint8Array(buffer) };
}
export function Harness({ path: initialPath = "/", configured = true, analyze = fakeAnalyze }: { path?: string; configured?: boolean; analyze?: (id: string) => Promise<DemoAnalysisResponse> }) {
  const [path, setPath] = useState(initialPath); const workspace = buildDemoWorkspace().view;
  const view = path === "/demo" ? "dashboard" : path === "/data" ? "data" : path === "/issues" ? "issues" : path.startsWith("/issues/") ? "detail" : path === "/actions" ? "actions" : path === "/activity" ? "activity" : "import";
  const issueId = view === "detail" ? decodeURIComponent(path.slice("/issues/".length)) : undefined;
  return <SessionProvider organizationId="ORG-001"><NavigationContext.Provider value={setPath}><AppShell>{path === "/" ? <Landing /> : <ProductUI key={path} view={view} issueId={issueId} workspace={workspace} aiConfigured={configured} analyzeAction={analyze}
    previewAction={async (data) => previewImport(await bytes(data))} validateAction={async (data, selection) => validateImport(await bytes(data), selection)} />}</AppShell></NavigationContext.Provider></SessionProvider>;
}
