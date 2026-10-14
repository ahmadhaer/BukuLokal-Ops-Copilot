import { afterEach,describe,expect,it,vi } from "vitest";
import type { Firestore } from "@google-cloud/firestore";
import { createFirestoreStore } from "../../../src/repositories/firestore/store";
import { firestoreConfigured,getFirestore } from "../../../src/lib/firestore/client";
import type { RawWrite } from "../../../src/repositories/types";
afterEach(()=>vi.unstubAllEnvs());
describe("official Firestore adapter boundary",()=>{
  it("does not initialize without explicit project and preserves ADC configuration",()=>{
    vi.stubEnv("GOOGLE_CLOUD_PROJECT","");expect(firestoreConfigured()).toBe(false);expect(()=>getFirestore()).toThrow("not configured");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT","synthetic-test-project");vi.stubEnv("FIRESTORE_EMULATOR_HOST","127.0.0.1:8099");const client=getFirestore();expect(client).toBe(getFirestore());expect(firestoreConfigured()).toBe(true);
  });
  it("reads canonical document data and collection IDs from SDK snapshots",async()=>{
    const db={doc:()=>({get:async()=>({exists:true,data:()=>({id:"SO-001"})})}),collection:()=>({get:async()=>({docs:[{id:"SO-001",data:()=>({id:"SO-001"})}]})})} as unknown as Firestore;
    const store=createFirestoreStore(db);expect(await store.get("organizations/ORG-001/orders/SO-001")).toEqual({id:"SO-001"});expect(await store.list("organizations/ORG-001/orders")).toEqual([{id:"SO-001",data:{id:"SO-001"}}]);
  });
  it("uses official batch create/set and commits once",async()=>{
    const create=vi.fn();const set=vi.fn();const commit=vi.fn(async()=>[]);const db={doc:(path:string)=>({path}),batch:()=>({create,set,commit})} as unknown as Firestore;
    const writes:RawWrite[]=[{path:"organizations/ORG-001",value:{id:"ORG-001"},mode:"create"},{path:"organizations/ORG-001/orders/SO-001",value:{id:"SO-001"},mode:"set"}];
    await createFirestoreStore(db).batch(writes);expect(create).toHaveBeenCalledWith({path:writes[0].path},writes[0].value);expect(set).toHaveBeenCalledWith({path:writes[1].path},writes[1].value);expect(commit).toHaveBeenCalledTimes(1);
  });
  it("performs transaction reads before writes and propagates the transaction result",async()=>{
    const operations:string[]=[];const tx={get:async(ref:{path:string})=>{operations.push(`read:${ref.path}`);return {exists:true,data:()=>({id:"ACT-001",status:"suggested"})};},set:(ref:{path:string})=>operations.push(`set:${ref.path}`),create:(ref:{path:string})=>operations.push(`create:${ref.path}`)};
    const db={doc:(path:string)=>({path}),runTransaction:async(fn:(transaction:typeof tx)=>Promise<unknown>)=>fn(tx)} as unknown as Firestore;
    const result=await createFirestoreStore(db).transaction(async(reader)=>{const current=await reader.get("organizations/ORG-001/actions/ACT-001");expect(current).toMatchObject({status:"suggested"});return {result:"approved",writes:[{path:"organizations/ORG-001/actions/ACT-001",value:{status:"approved"},mode:"set"},{path:"organizations/ORG-001/audit_events/AUD-001",value:{event:"action_approved"},mode:"create"}]};});
    expect(result).toBe("approved");expect(operations).toEqual(["read:organizations/ORG-001/actions/ACT-001","set:organizations/ORG-001/actions/ACT-001","create:organizations/ORG-001/audit_events/AUD-001"]);
  });
});
