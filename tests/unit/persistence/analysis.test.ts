import { describe,expect,it,vi } from "vitest";
import { fixture,org,context } from "./helpers";
import { persistValidatedAnalysis,analyzePersistedIssue } from "../../../src/features/persistence/analysis";
import { analyzeIssue } from "../../../src/ai/analysis/analyze-issue";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { StubProvider,execution,selectedRequest,validOutput } from "../ai/helpers";
describe("validated AI persistence",()=>{
  it("persists canonical analysis and suggestions/audits in one atomic batch",async()=>{
    const {repository,store}=await fixture();const request=selectedRequest();const output=validOutput(request);
    const response=await analyzeIssue(request,new StubProvider([JSON.stringify({...output,recommendations:[...output.recommendations,{...output.recommendations[0],actionType:"delivery_review_note",title:"Review delivery"}]})]),execution);
    if(!response.ok)throw new Error("Expected validated test advice");const result=response;const batch=vi.spyOn(store,"batch");await persistValidatedAnalysis(repository,org,result.record,context,[0,1]);
    expect(batch).toHaveBeenCalledTimes(1);const data=await loadWorkspace(repository,org);expect(data.aiAnalyses[0]).toEqual(result.record);expect(data.actions).toHaveLength(2);expect(data.auditEvents).toHaveLength(3);
    expect(data.aiAnalyses[0].evidenceRefs).toEqual(result.analysis.evidenceRefs);
  });
  it.each(["output","evidenceRefs"] as const)("rejects invalid %s with no analysis/action/audit write",async(field)=>{
    const {repository,result,state}=await fixture();const before=structuredClone(state.documents);
    const bad={...result.record,...(field==="output"?{output:{summary:"fabricated"}}:{evidenceRefs:["FOREIGN-EVIDENCE"]})};
    await expect(persistValidatedAnalysis(repository,org,bad,context,[0])).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});expect(state.documents).toEqual(before);
  });
  it("rejects unsupported recommendation index before atomic batch",async()=>{
    const {repository,result,state}=await fixture();const before=structuredClone(state.documents);
    await expect(persistValidatedAnalysis(repository,org,result.record,context,[99])).rejects.toThrow();expect(state.documents).toEqual(before);
  });
  it("successful server analysis persists its validated record and analysis audit",async()=>{
    const {repository}=await fixture();const request=selectedRequest();const response=await analyzePersistedIssue(repository,org,request.issueId,execution.createdAt,()=>({provider:new StubProvider([JSON.stringify(validOutput(request))]),config:{model:execution.model}}));
    expect(response.status).toBe("success");const data=await loadWorkspace(repository,org);expect(data.aiAnalyses).toHaveLength(1);expect(data.auditEvents[0].event).toBe("ai_analysis_completed");expect(data.aiAnalyses[0].evidenceRefs).toEqual(validOutput(request).evidenceRefs);
  });
  it("provider failure creates no fake analysis and retains deterministic evidence",async()=>{
    const {repository,data}=await fixture();const response=await analyzePersistedIssue(repository,org,data.issues.find(x=>x.type==="order_delay_risk"&&x.orderId==="SO-001")!.id,execution.createdAt,()=>({provider:new StubProvider([new Error("provider outage")]),config:{model:execution.model}}));
    expect(response.status).toBe("unavailable");const after=await loadWorkspace(repository,org);expect(after.aiAnalyses).toHaveLength(0);expect(after.actions).toHaveLength(0);expect(after.evidence).toEqual(data.evidence);
  });
  it("unconfigured AI writes no analysis and arbitrary issue prevents provider invocation",async()=>{
    const {repository,data}=await fixture();const factory=vi.fn(()=>{throw new Error("unconfigured");});
    const response=await analyzePersistedIssue(repository,org,data.issues[0].id,execution.createdAt,factory);expect(response.status).toBe("unconfigured");
    factory.mockClear();await expect(analyzePersistedIssue(repository,org,"unknown",execution.createdAt,factory)).rejects.toMatchObject({code:"PERSISTENCE_NOT_FOUND"});expect(factory).not.toHaveBeenCalled();expect((await loadWorkspace(repository,org)).aiAnalyses).toHaveLength(0);
  });
});
