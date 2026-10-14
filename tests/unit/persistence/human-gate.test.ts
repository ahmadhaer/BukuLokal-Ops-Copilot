import { describe,expect,it } from "vitest";
import { fixture,org,context } from "./helpers";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { restoreSession,transitionPersistedAction,suggestPersistedAction } from "../../../src/features/persistence/human-gate";
import { persistValidatedAnalysis } from "../../../src/features/persistence/analysis";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryStore } from "../../../src/repositories/memory/store";
describe("transactional persisted Human Gate",()=>{
  it("creates a suggested action from stored analysis and deduplicates repeats",async()=>{
    const {repository,result}=await fixture();await persistValidatedAnalysis(repository,org,result.record,context);
    await suggestPersistedAction(repository,org,result.record.id,0,context);const first=await loadWorkspace(repository,org);
    await suggestPersistedAction(repository,org,result.record.id,0,context);expect(await loadWorkspace(repository,org)).toEqual(first);expect(first.actions[0].status).toBe("suggested");
  });
  it.each(["approve","edit","reject"] as const)("persists %s plus its audit across repository reconstruction",async(intent)=>{
    const {repository,state,data}=await fixture(true);const id=data.actions[0].id;
    await transitionPersistedAction(repository,org,id,intent,intent==="edit"?"User-revised internal draft":undefined,context);
    const rebuilt=createWorkspaceRepository(createMemoryStore(state));const restored=restoreSession(await loadWorkspace(rebuilt,org));
    expect(restored.actions[0].action.status).toBe({approve:"approved",edit:"edited",reject:"rejected"}[intent]);
    expect(restored.events.some(x=>x.event===`action_${restored.actions[0].action.status}`&&x.entityId===id)).toBe(true);
    if(intent==="approve")expect(restored.actions[0].action).toMatchObject({approvedBy:"demo-owner",approvedAt:context.occurredAt});
    if(intent==="edit")expect(restored.actions[0]).toMatchObject({userModified:true,action:{draft:"User-revised internal draft"}});
  });
  it("keeps modified provenance after edit then approval",async()=>{
    const {repository,data}=await fixture(true);const id=data.actions[0].id;
    await transitionPersistedAction(repository,org,id,"edit","Changed by owner",context);await transitionPersistedAction(repository,org,id,"approve",undefined,context);
    expect(restoreSession(await loadWorkspace(repository,org)).actions[0]).toMatchObject({userModified:true,action:{status:"approved",draft:"Changed by owner"}});
  });
  it("rejects terminal transitions without appending audit",async()=>{
    const {repository,data}=await fixture(true);const id=data.actions[0].id;await transitionPersistedAction(repository,org,id,"approve",undefined,context);const before=await loadWorkspace(repository,org);
    await expect(transitionPersistedAction(repository,org,id,"reject",undefined,context)).rejects.toMatchObject({code:"PERSISTENCE_CONFLICT"});expect(await loadWorkspace(repository,org)).toEqual(before);
  });
  it("concurrent approve/reject yields one terminal update and one audit",async()=>{
    const {repository,data}=await fixture(true);const id=data.actions[0].id;
    const results=await Promise.allSettled([transitionPersistedAction(repository,org,id,"approve",undefined,context),transitionPersistedAction(repository,org,id,"reject",undefined,context)]);
    expect(results.filter(x=>x.status==="fulfilled")).toHaveLength(1);expect(results.filter(x=>x.status==="rejected")).toHaveLength(1);
    const loaded=await loadWorkspace(repository,org);expect(loaded.actions[0].status).toBe("approved");expect(loaded.auditEvents.filter(x=>["action_approved","action_rejected"].includes(x.event))).toHaveLength(1);
  });
  it("failed commit rolls back both action and review audit",async()=>{
    const {store,repository,data}=await fixture(true);const before=await loadWorkspace(repository,org);
    const failing=createWorkspaceRepository({...store,transaction:(work)=>store.transaction(async(reader)=>{const prepared=await work(reader);if(prepared.writes.some(x=>x.path.includes("/actions/")&&x.value.status==="approved"))throw new Error("commit failed");return prepared;})});
    await expect(transitionPersistedAction(failing,org,data.actions[0].id,"approve",undefined,context)).rejects.toMatchObject({code:"PERSISTENCE_WRITE_FAILED"});expect(await loadWorkspace(repository,org)).toEqual(before);
  });
});
