import { describe,expect,it } from "vitest";
import { buildTestApplication,goldenIssue } from "./helpers";
import { buildApplication } from "../../../src/application/application";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryStore,createMemoryState } from "../../../src/repositories/memory/store";
import { documentPath } from "../../../src/lib/firestore/paths";
describe("persistent demo application use cases",()=>{
  it("Try Demo seeds/reloads derived dashboard and repeated opening retains IDs",async()=>{
    const {application,state}=buildTestApplication();const first=await application.openDemoWorkspace();expect(first.ok).toBe(true);
    if(!first.ok)throw new Error("Expected workspace");expect(first.value.workspace.metrics).toEqual({orders:12,atRisk:5,materialShortages:5,criticalIssues:2});const before=structuredClone(state.documents);
    expect(await application.getDashboard()).toEqual(first);await application.openDemoWorkspace();expect(state.documents).toEqual(before);
  });
  it("SO-001 detail reconstructs persisted order, evidence and approved facts",async()=>{
    const {application}=buildTestApplication();const id=await goldenIssue(application);const result=await application.getIssueDetail(id);expect(result.ok).toBe(true);if(!result.ok)throw new Error("Expected detail");
    expect(result.value.order.id).toBe("SO-001");expect(result.value.facts.production).toMatchObject({completionPercentage:30,remainingQuantity:350,quantityUnit:"pcs"});expect(result.value.facts.deadline.daysToDeadline).toBe(2);expect(result.value.facts.materials[0].shortageQuantity).toBe(200);expect(result.value.workspace.details.find(x=>x.issue.id===id)?.issue.severity).toBe("critical");
  });
  it("rejects deep links with missing IDs or arbitrary paths safely",async()=>{
    const {application}=buildTestApplication();await application.openDemoWorkspace();expect(await application.getIssueDetail("MISSING")).toMatchObject({ok:false,code:"PERSISTENCE_NOT_FOUND"});expect(await application.getIssueDetail("organizations/OTHER/issues/id")).toMatchObject({ok:false,code:"PERSISTENCE_INVALID_DOCUMENT"});
  });
  it("detects fact/evidence inconsistency without overwriting persisted history",async()=>{
    const {application,state}=buildTestApplication();await application.openDemoWorkspace();const path=documentPath("ORG-001","orders","SO-001");const value=state.documents.get(path) as Record<string,unknown>;state.documents.set(path,{...value,orderedQuantity:600});const before=structuredClone(state.documents);
    expect(await application.getDashboard()).toMatchObject({ok:false,code:"PERSISTENCE_INVALID_DOCUMENT"});expect(state.documents).toEqual(before);
  });
  it("seed failure is controlled and leaves no substitute or partial workspace",async()=>{
    const state=createMemoryState();const store=createMemoryStore(state);const repository=createWorkspaceRepository({...store,async batch(){throw new Error("raw provider trace");}});
    const application=buildApplication({repository:async()=>repository,ai:()=>null,capabilities:()=>({persistence:"configured",ai:"unavailable"}),now:()=>"2026-10-12T12:01:00Z"});
    const result=await application.openDemoWorkspace();expect(result).toMatchObject({ok:false,code:"PERSISTENCE_WRITE_FAILED"});expect(JSON.stringify(result)).not.toContain("raw provider trace");expect(state.documents.size).toBe(0);
  });
  it("workspace read failure produces a safe error and never fabricates facts",async()=>{
    const built=buildTestApplication();await built.application.openDemoWorkspace();const before=structuredClone(built.state.documents);const store=createMemoryStore(built.state);
    const repository=createWorkspaceRepository({...store,transaction:(work)=>store.transaction(async(reader)=>work({...reader,async list(){throw new Error("raw database stack");}}))});
    const application=buildApplication({repository:async()=>repository,ai:()=>null,capabilities:()=>({persistence:"configured",ai:"unavailable"}),now:()=>"2026-10-12T12:01:00Z"});
    const result=await application.getDashboard();expect(result.ok).toBe(false);expect(JSON.stringify(result)).not.toMatch(/raw database stack|completionPercentage/);expect(built.state.documents).toEqual(before);
  });
  it("unavailable persistence reports a configuration failure without a fixture fallback",async()=>{
    const {application,state}=buildTestApplication({persistence:false});expect(await application.openDemoWorkspace()).toMatchObject({ok:false,code:"PERSISTENCE_NOT_CONFIGURED"});expect(state.documents.size).toBe(0);expect(application.health()).toMatchObject({applicationReady:false,goldenPathReady:false});
  });
});
