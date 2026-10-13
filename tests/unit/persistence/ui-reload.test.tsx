// @vitest-environment jsdom
import { afterEach,describe,expect,it } from "vitest";
import { cleanup,render,screen,waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionProvider } from "../../../src/components/product/session";
import { ProductUI } from "../../../src/components/product/product-ui";
import { buildDemoWorkspace } from "../../../src/features/demo/workspace";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { restoreSession,transitionPersistedAction,suggestPersistedAction } from "../../../src/features/persistence/human-gate";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryStore } from "../../../src/repositories/memory/store";
import type { WorkspaceRepository } from "../../../src/repositories/types";
import type { PersistenceTransport } from "../../../src/features/persistence/contracts";
import { fixture,org,context } from "./helpers";
function transport(repository:WorkspaceRepository):PersistenceTransport {
  async function load(){return {ok:true as const,state:restoreSession(await loadWorkspace(repository,org))};}
  return {load,async suggest(id,index){await suggestPersistedAction(repository,org,id,index,context);return load();},async review(id,intent,draft){await transitionPersistedAction(repository,org,id,intent,draft,context);return load();}};
}
function UI({repository,view="actions"}:{repository:WorkspaceRepository;view?:"actions"|"activity"}){
  return <SessionProvider organizationId={org} persistence={transport(repository)}><ProductUI view={view} workspace={buildDemoWorkspace().view} aiConfigured={false} analyzeAction={async()=>({status:"unconfigured",message:"Not configured"})} previewAction={async()=>({ok:false,message:"Not used"})} validateAction={async()=>({ok:false,message:"Not used"})}/></SessionProvider>;
}
afterEach(cleanup);
describe("UI repository reconstruction",()=>{
  it("approve survives unmount/new repository mount and retains audit Activity",async()=>{
    const {repository,state}=await fixture(true);const user=userEvent.setup();render(<UI repository={repository}/>);await user.click(await screen.findByRole("button",{name:"Approve"}));await screen.findByText(/Approved by Demo owner/);cleanup();
    const reconstructed=createWorkspaceRepository(createMemoryStore(state));render(<UI repository={reconstructed}/>);await screen.findByText(/Approved by Demo owner/);expect(screen.queryByRole("button",{name:"Approve"})).toBeNull();cleanup();render(<UI repository={reconstructed} view="activity"/>);await screen.findByText("Action approved");
  });
  it("edited draft and user marker survive remount and subsequent rejection",async()=>{
    const {repository,state}=await fixture(true);const user=userEvent.setup();render(<UI repository={repository}/>);await user.click(await screen.findByRole("button",{name:"Edit"}));await user.clear(screen.getByLabelText("Edit draft text"));await user.type(screen.getByLabelText("Edit draft text"),"Owner-revised draft");await user.click(screen.getByRole("button",{name:"Save Edit"}));await screen.findByText("User-modified draft");cleanup();
    const rebuilt=createWorkspaceRepository(createMemoryStore(state));render(<UI repository={rebuilt}/>);await screen.findByText("Owner-revised draft");expect(screen.getByText("User-modified draft")).toBeTruthy();await user.click(screen.getByRole("button",{name:"Reject"}));await screen.findByText("Rejected. No external action occurred.");cleanup();render(<UI repository={createWorkspaceRepository(createMemoryStore(state))}/>);await screen.findByText("Rejected. No external action occurred.");expect(screen.queryByRole("button",{name:"Approve"})).toBeNull();
  });
  it("unconfigured storage displays an error without recording local approval",async()=>{
    const {data}=await fixture(true);const state=restoreSession(data);const user=userEvent.setup();
    const unavailable:PersistenceTransport={load:async()=>({ok:true,state}),suggest:async()=>({ok:false,code:"PERSISTENCE_NOT_CONFIGURED",message:"Workspace storage is not configured."}),review:async()=>({ok:false,code:"PERSISTENCE_NOT_CONFIGURED",message:"Workspace storage is not configured."})};
    render(<SessionProvider organizationId={org} persistence={unavailable}><ProductUI view="actions" workspace={buildDemoWorkspace().view} aiConfigured={false} analyzeAction={async()=>({status:"unconfigured",message:"Not configured"})} previewAction={async()=>({ok:false,message:"Not used"})} validateAction={async()=>({ok:false,message:"Not used"})}/></SessionProvider>);
    await user.click(await screen.findByRole("button",{name:"Approve"}));await waitFor(()=>expect(screen.getAllByRole("alert").some(x=>x.textContent?.includes("not configured"))).toBe(true));expect(screen.queryByText(/Approved by Demo owner/)).toBeNull();expect(screen.getByRole("button",{name:"Approve"})).toBeTruthy();
  });
});
