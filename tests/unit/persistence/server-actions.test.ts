import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
vi.mock("../../../src/features/persistence/runtime",async(importOriginal)=>({...(await importOriginal<typeof import("../../../src/features/persistence/runtime")>()),demoRepository:vi.fn(),persistedSession:vi.fn()}));
import { demoRepository,persistedSession } from "../../../src/features/persistence/runtime";
import { suggestDemoAction,reviewDemoAction,analyzeDemoAction } from "../../../src/app/server-actions";
import { restoreSession } from "../../../src/features/persistence/human-gate";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { fixture,org } from "./helpers";
beforeEach(()=>vi.clearAllMocks());afterEach(()=>vi.unstubAllEnvs());
describe("trusted demo Server Actions",()=>{
  it("rejects raw Firestore paths before repository access",async()=>{
    const result=await reviewDemoAction("organizations/foreign/actions/action","approve");expect(result).toMatchObject({ok:false,code:"PERSISTENCE_INVALID_DOCUMENT"});expect(demoRepository).not.toHaveBeenCalled();
  });
  it("suggests and approves stored canonical analysis in the fixed demo organization",async()=>{
    const {repository,result}=await fixture(true);vi.mocked(demoRepository).mockResolvedValue(repository);vi.mocked(persistedSession).mockImplementation(async()=>({ok:true,state:restoreSession(await loadWorkspace(repository,org))}));
    const suggested=await suggestDemoAction(result.record.id,0);expect(suggested.ok).toBe(true);if(!suggested.ok)throw new Error("Expected persisted state");
    const approved=await reviewDemoAction(suggested.state.actions[0].action.id,"approve");expect(approved.ok).toBe(true);if(approved.ok)expect(approved.state.actions[0].action).toMatchObject({status:"approved",approvedBy:"demo-owner"});
    const rejected=await reviewDemoAction(suggested.state.actions[0].action.id,"reject");expect(rejected).toMatchObject({ok:false,code:"PERSISTENCE_CONFLICT"});
  });
  it("unconfigured Gemini returns controlled unavailable configuration with no fake record",async()=>{
    vi.stubEnv("GOOGLE_CLOUD_PROJECT","");const {repository,data}=await fixture();vi.mocked(demoRepository).mockResolvedValue(repository);
    const response=await analyzeDemoAction(data.issues[0].id);expect(response.status).toBe("unconfigured");expect((await loadWorkspace(repository,org)).aiAnalyses).toHaveLength(0);
  });
});
