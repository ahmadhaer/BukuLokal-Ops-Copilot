import { describe, expect, it } from "vitest";
import { ensureDemoWorkspace,loadWorkspace,workspaceView } from "../../../src/features/persistence/workspace";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryState,createMemoryStore } from "../../../src/repositories/memory/store";
import { fixture,org,context } from "./helpers";
import { transitionPersistedAction } from "../../../src/features/persistence/human-gate";
import { abcApparelDataset } from "../../../src/domain";
describe("deterministic atomic demo seed",()=>{
  it("creates all canonical sources and WU-04 records in one batch",async()=>{
    const state=createMemoryState();const base=createMemoryStore(state);const batches:number[]=[];
    const repository=createWorkspaceRepository({...base,async batch(writes){batches.push(writes.length);await base.batch(writes);}});
    await ensureDemoWorkspace(repository);const data=await loadWorkspace(repository,org);
    expect(batches).toHaveLength(1);expect(data.orders).toEqual(abcApparelDataset.orders);
    expect(data.orders).toHaveLength(12);expect(data.issues).toHaveLength(10);expect(data.evidence.length).toBeGreaterThan(10);
    expect([...state.documents.keys()].some(key=>key.includes("operational_facts"))).toBe(false);
    expect(workspaceView(data).metrics).toEqual({orders:12,atRisk:5,materialShortages:5,criticalIssues:2});
  });
  it("repeated and concurrent seeds retain canonical IDs and counts",async()=>{
    const state=createMemoryState();const repository=createWorkspaceRepository(createMemoryStore(state));
    await Promise.all([ensureDemoWorkspace(repository),ensureDemoWorkspace(repository)]);const first=structuredClone(state.documents);
    await ensureDemoWorkspace(repository);expect(state.documents).toEqual(first);expect((await loadWorkspace(repository,org)).orders).toHaveLength(12);
  });
  it("reseed preserves analysis/action/audit review history",async()=>{
    const {repository,state,data}=await fixture(true);await transitionPersistedAction(repository,org,data.actions[0].id,"approve",undefined,context);
    const before=structuredClone(state.documents);await ensureDemoWorkspace(repository);expect(state.documents).toEqual(before);
    const reloaded=await loadWorkspace(createWorkspaceRepository(createMemoryStore(state)),org);expect(reloaded.actions[0].status).toBe("approved");expect(reloaded.auditEvents.some(x=>x.event==="action_approved")).toBe(true);
  });
  it("detects incomplete existing seed without overwriting source data",async()=>{
    const state=createMemoryState();const repository=createWorkspaceRepository(createMemoryStore(state));
    await repository.batch(org,[{collection:"organizations",value:abcApparelDataset.organization}]);const before=structuredClone(state.documents);
    await expect(ensureDemoWorkspace(repository)).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});expect(state.documents).toEqual(before);
  });
  it("failed seed batch leaves no half workspace",async()=>{
    const state=createMemoryState();const base=createMemoryStore(state);const repository=createWorkspaceRepository({...base,async batch(){throw new Error("provider failure");}});
    await expect(ensureDemoWorkspace(repository)).rejects.toMatchObject({code:"PERSISTENCE_WRITE_FAILED"});expect(state.documents.size).toBe(0);
  });
});
