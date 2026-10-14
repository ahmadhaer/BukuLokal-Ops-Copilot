// Test-only HTTP network boundary; no repository/provider implementation enters this bundle.
import { createRoot } from "react-dom/client";
import type { Application } from "../../src/application/application";
import { ApplicationHarness } from "../integration/application/ui-harness";
import "../../src/app/globals.css";
async function call(method:string,args:unknown[]=[]){const response=await fetch("/__test/application",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({method,args})});return response.json();}
const health=await call("health");
const application=new Proxy({health:()=>health},{get(target,key){if(key==="health")return target.health;return(...args:unknown[])=>call(String(key),args);}}) as unknown as Application;
createRoot(document.getElementById("root")!).render(<ApplicationHarness application={application} initialPath={new URL(location.href).searchParams.get("path")??"/"}/>);
