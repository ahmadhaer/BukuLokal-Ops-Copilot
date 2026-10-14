import { describe,expect,it,vi } from "vitest";
import { buildTestApplication,goldenIssue,TestProvider,OPERATION,NEXT_OPERATION } from "./helpers";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { PersistenceError } from "../../../src/lib/firestore/errors";
describe("atomic analysis orchestration and replay",()=>{
  it("logs persistence failure after valid AI without exposing diagnostics to the browser",async()=>{
    const {application,repository}=buildTestApplication();const issueId=await goldenIssue(application);
    const log=vi.spyOn(console,"warn").mockImplementation(()=>{});
    const batch=vi.spyOn(repository,"batch").mockRejectedValue(new PersistenceError("PERSISTENCE_WRITE_FAILED","Workspace storage is temporarily unavailable. Please try again."));
    try {
      const response=await application.analyzeIssue(issueId,OPERATION);
      expect(response).toEqual({status:"unavailable",message:"Workspace storage is temporarily unavailable. Please try again."});
      expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({stage:"persistence",errorCode:"PERSISTENCE_WRITE_FAILED",model:"synthetic-test-model",attempt:1});
      expect(JSON.stringify(response)).not.toContain("PERSISTENCE_WRITE_FAILED");
      expect((await loadWorkspace(repository,"ORG-001")).aiAnalyses).toHaveLength(0);
    } finally {batch.mockRestore();log.mockRestore();}
  });
  it("validates bounded persisted input and commits analysis/suggestion/audits together",async()=>{
    const {application,provider,repository}=buildTestApplication();const issueId=await goldenIssue(application);const response=await application.analyzeIssue(issueId,OPERATION);expect(response.status).toBe("success");const data=await loadWorkspace(repository,"ORG-001");
    expect(provider.requests).toHaveLength(1);expect(provider.requests[0].input.issue).toMatchObject({issueId,severity:"critical"});expect(provider.requests[0].input.evidence.map(x=>x.value)).toEqual(expect.arrayContaining([30,200,2]));expect(data.aiAnalyses).toHaveLength(1);expect(data.actions[0].status).toBe("suggested");expect(data.actions[0].approvedBy).toBeNull();expect(data.auditEvents.map(x=>x.event).sort()).toEqual(["action_suggested","ai_analysis_completed"]);
  });
  it("AI unavailable retains evidence and writes no AI-success state",async()=>{
    const {application,repository,provider}=buildTestApplication({ai:false});const issueId=await goldenIssue(application);expect((await application.analyzeIssue(issueId,OPERATION)).status).toBe("unconfigured");const data=await loadWorkspace(repository,"ORG-001");expect(data.issues).toHaveLength(10);expect(data.aiAnalyses).toHaveLength(0);expect(data.actions).toHaveLength(0);expect(data.auditEvents).toHaveLength(0);expect(provider.requests).toHaveLength(0);
  });
  it.each(["failure","invalid"] as const)("%s AI creates no partial records and retry remains possible",async(mode)=>{
    const provider=new TestProvider(mode);const {application,repository}=buildTestApplication({provider});const issueId=await goldenIssue(application);expect((await application.analyzeIssue(issueId,OPERATION)).status).toBe("unavailable");let data=await loadWorkspace(repository,"ORG-001");expect(data.aiAnalyses).toHaveLength(0);expect(data.actions).toHaveLength(0);expect(data.auditEvents).toHaveLength(0);if(mode==="invalid")expect(provider.requests).toHaveLength(2);
    provider.mode="success";expect((await application.analyzeIssue(issueId,OPERATION)).status).toBe("success");data=await loadWorkspace(repository,"ORG-001");expect(data.aiAnalyses).toHaveLength(1);expect(data.actions).toHaveLength(1);
  });
  it("double submission coalesces provider calls and persisted replay survives a new application",async()=>{
    let release!:()=>void;const barrier=new Promise<void>(resolve=>{release=resolve;});const provider=new TestProvider("success",barrier);const {application,state}=buildTestApplication({provider});const issueId=await goldenIssue(application);const first=application.analyzeIssue(issueId,OPERATION);const second=application.analyzeIssue(issueId,OPERATION);release();const results=await Promise.all([first,second]);expect(results[0].status).toBe("success");expect(results[1]).toEqual(results[0]);expect(provider.requests).toHaveLength(1);
    const rebuilt=buildTestApplication({state});expect((await rebuilt.application.analyzeIssue(issueId,OPERATION)).status).toBe("success");expect(rebuilt.provider.requests).toHaveLength(0);const data=await loadWorkspace(rebuilt.repository,"ORG-001");expect(data.aiAnalyses).toHaveLength(1);expect(data.actions).toHaveLength(1);expect(data.auditEvents).toHaveLength(2);
  });
  it("concurrent applications racing the same operation commit only one complete result",async()=>{
    const first=buildTestApplication();const second=buildTestApplication({state:first.state,clockOffset:1000});const issueId=await goldenIssue(first.application);
    const results=await Promise.all([first.application.analyzeIssue(issueId,OPERATION),second.application.analyzeIssue(issueId,OPERATION)]);expect(results.map(x=>x.status)).toEqual(["success","success"]);const data=await loadWorkspace(first.repository,"ORG-001");expect(data.aiAnalyses).toHaveLength(1);expect(data.actions).toHaveLength(1);expect(data.auditEvents).toHaveLength(2);
  });
  it("replay returns its own original analysis even after another operation",async()=>{
    const {application}=buildTestApplication();const issueId=await goldenIssue(application);const first=await application.analyzeIssue(issueId,OPERATION);await application.analyzeIssue(issueId,NEXT_OPERATION);const replay=await application.analyzeIssue(issueId,OPERATION);if(first.status!=="success"||replay.status!=="success")throw new Error("Expected analysis");expect(replay.result.record.id).toBe(first.result.record.id);
  });
  it("invalid operation or issue prevents any provider call",async()=>{
    const {application,provider}=buildTestApplication();const issueId=await goldenIssue(application);expect((await application.analyzeIssue(issueId,"invalid-operation")).status).toBe("invalid");expect((await application.analyzeIssue("organizations/OTHER/issues/id",OPERATION)).status).toBe("invalid");expect(provider.requests).toHaveLength(0);
  });
});
