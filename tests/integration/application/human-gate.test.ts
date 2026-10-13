import { describe,expect,it } from "vitest";
import { buildTestApplication,goldenIssue,OPERATION } from "./helpers";
async function suggested(){const built=buildTestApplication();const issue=await goldenIssue(built.application);await built.application.analyzeIssue(issue,OPERATION);const session=await built.application.getSession();if(!session.ok)throw new Error("Expected state");return {...built,id:session.value.actions[0].action.id};}
describe("integrated persistent human authority",()=>{
  it.each(["approve","edit","reject"] as const)("%s uses persisted gate and survives application reconstruction",async(intent)=>{
    const {application,state,id}=await suggested();const review=await application.reviewAction(id,intent,intent==="edit"?"Owner-adjusted draft":undefined);expect(review.ok).toBe(true);
    const rebuilt=buildTestApplication({state});const session=await rebuilt.application.getSession();if(!session.ok)throw new Error("Expected reloaded state");expect(session.value.actions[0].action.status).toBe({approve:"approved",edit:"edited",reject:"rejected"}[intent]);const activity=await rebuilt.application.getActivity();if(!activity.ok)throw new Error("Expected activity");expect(activity.value.some(event=>event.event===`action_${session.value.actions[0].action.status}`)).toBe(true);
    if(intent==="approve")expect(session.value.actions[0].action).toMatchObject({approvedBy:"demo-owner"});if(intent==="edit")expect(session.value.actions[0]).toMatchObject({userModified:true,action:{draft:"Owner-adjusted draft"}});
  });
  it("edited draft stays represented after approval; repeated Try Demo preserves history",async()=>{
    const {application,state,id}=await suggested();await application.reviewAction(id,"edit","Owner-adjusted draft");await application.reviewAction(id,"approve");const before=structuredClone(state.documents);await application.openDemoWorkspace();expect(state.documents).toEqual(before);const session=await application.getSession();if(session.ok)expect(session.value.actions[0]).toMatchObject({userModified:true,action:{status:"approved",draft:"Owner-adjusted draft"}});
  });
  it("stale terminal request cannot overwrite status or add misleading audit",async()=>{
    const {application,state,id}=await suggested();await application.reviewAction(id,"approve");const before=structuredClone(state.documents);expect(await application.reviewAction(id,"reject")).toMatchObject({ok:false,code:"PERSISTENCE_CONFLICT"});expect(state.documents).toEqual(before);
  });
  it("rejects invalid draft and raw action paths; records no external execution",async()=>{
    const {application,id}=await suggested();expect(await application.reviewAction(id,"edit","")).toMatchObject({ok:false});expect(await application.reviewAction("organizations/OTHER/actions/id","approve")).toMatchObject({ok:false,code:"PERSISTENCE_INVALID_DOCUMENT"});const activity=await application.getActivity();expect(JSON.stringify(activity)).not.toMatch(/supplier_contacted|email_sent|order_changed/);
  });
});
