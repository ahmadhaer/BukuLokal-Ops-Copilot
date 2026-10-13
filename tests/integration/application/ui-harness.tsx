import { useCallback,useEffect,useState } from "react";
import type { Application } from "../../../src/application/application";
import type { WorkspaceSnapshot,IssueSnapshot } from "../../../src/application/contracts";
import type { PersistenceTransport,PersistenceResponse } from "../../../src/features/persistence/contracts";
import { SessionProvider } from "../../../src/components/product/session";
import { NavigationContext } from "../../../src/components/product/navigation";
import { AppShell } from "../../../src/components/product/shell";
import Landing from "../../../src/components/product/landing";
import { ProductUI } from "../../../src/components/product/product-ui";
async function file(data:FormData){
  const selected=data.get("file");if(!(selected instanceof File))throw new Error("Expected file");
  const buffer=typeof selected.arrayBuffer==="function"?await selected.arrayBuffer():await new Promise<ArrayBuffer>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as ArrayBuffer);reader.onerror=reject;reader.readAsArrayBuffer(selected);});
  return {name:selected.name,bytes:new Uint8Array(buffer)};
}
function transport(application:Application):PersistenceTransport{
  async function load():Promise<PersistenceResponse>{const response=await application.getSession();return response.ok?{ok:true,state:response.value}:response;}
  return {load,async suggest(id,index){const response=await application.createSuggestedAction(id,index);return response.ok?{ok:true,state:response.value}:response;},async review(id,intent,draft){const response=await application.reviewAction(id,intent,draft);return response.ok?{ok:true,state:response.value}:response;}};
}
// Test-only routing. Every DTO comes from actual application use cases, never copied fixtures.
export function ApplicationHarness({application,initialPath="/"}:{application:Application;initialPath?:string}){
  const [route,setRoute]=useState<{path:string;snapshot?:WorkspaceSnapshot|IssueSnapshot;error?:string}>({path:"/"});
  const [persistence]=useState(()=>transport(application));
  const navigate=useCallback(async(path:string)=>{
    if(path==="/"){setRoute({path});return;}
    if(path==="/data"||path==="/import"){setRoute({path});return;}
    const response=path.startsWith("/issues/")?await application.getIssueDetail(decodeURIComponent(path.slice(8))):path==="/demo"?await application.openDemoWorkspace():await application.getDashboard();
    setRoute(response.ok?{path,snapshot:response.value}:{path,error:response.message});
  },[application]);
  useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active&&initialPath!=="/")void navigate(initialPath);});return()=>{active=false;};},[initialPath,navigate]);
  const view=route.path==="/demo"?"dashboard":route.path==="/issues"?"issues":route.path.startsWith("/issues/")?"detail":route.path==="/actions"?"actions":route.path==="/activity"?"activity":route.path==="/data"?"data":"import";
  const issue=route.snapshot&&"facts" in route.snapshot?route.snapshot as IssueSnapshot:undefined;
  return <NavigationContext.Provider value={(path)=>{void navigate(path);}}><AppShell>{route.path==="/"?<Landing/>:route.error?<main><h1>Workspace unavailable</h1><p role="alert">{route.error}</p></main>:<SessionProvider organizationId="ORG-001" persistence={persistence}><ProductUI key={route.path} view={view} workspace={route.snapshot?.workspace} issueFacts={issue?.facts} issueId={view==="detail"?decodeURIComponent(route.path.slice(8)):undefined}
    aiConfigured={application.health().capabilities.ai==="configured"} persistenceAvailable={application.health().capabilities.persistence==="configured"}
    analyzeAction={(id,operation)=>application.analyzeIssue(id,operation??"11111111-1111-4111-8111-111111111111")}
    previewAction={async data=>application.previewImport(await file(data))} validateAction={async(data,selection)=>application.checkImport(await file(data),selection)} saveAction={async(data,selection,key)=>application.saveValidData(await file(data),selection,key)}/></SessionProvider>}</AppShell></NavigationContext.Provider>;
}
