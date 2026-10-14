import { describe,expect,it } from "vitest";
import { fixture,org } from "./helpers";
import { documentPath,safeId } from "../../../src/lib/firestore/paths";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
import { providerError } from "../../../src/lib/firestore/errors";
import type { Write } from "../../../src/repositories/types";
describe("organization and server path boundaries",()=>{
  it.each(["organizations/x/actions/y","../escape","a\\b","bad id",".","..","__reserved__","a\u0000b","a".repeat(1501)])("rejects unsafe identifier %s",(id)=>{expect(()=>safeId(id)).toThrow();});
  it("uses canonical IDs directly in deterministic organization paths",()=>{
    expect(documentPath(org,"orders","SO-001")).toBe("organizations/ORG-001/orders/SO-001");expect(documentPath(org,"issues","ISS:deterministic:001")).toBe("organizations/ORG-001/issues/ISS:deterministic:001");expect(()=>documentPath(org,"organizations","ORG-OTHER")).toThrow();
  });
  it("isolates duplicate entity IDs in two organizations",async()=>{
    const {repository,data}=await fixture();const other="ORG-OTHER";
    await repository.batch(other,[{collection:"organizations",value:{...data.organization,id:other}},{collection:"data_sources",value:{...data.dataSources[0],organizationId:other}},{collection:"imports",value:{...data.importSessions[0],organizationId:other}},{collection:"orders",value:{...data.orders[0],organizationId:other,customerName:"Other synthetic customer"}}]);
    expect((await repository.read(org).get("orders",data.orders[0].id))?.customerName).toBe(data.orders[0].customerName);expect((await repository.read(other).get("orders",data.orders[0].id))?.customerName).toBe("Other synthetic customer");expect(await repository.read(other).get("issues",data.issues[0].id)).toBeNull();
    await expect(repository.batch(other,[{collection:"orders",value:data.orders[0]}])).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
  });
  it.each(["production_jobs","inventory_items","issues","evidence","ai_analyses","actions"] as const)("rejects missing/foreign links for %s",async(collection)=>{
    const {repository,data}=await fixture(true);
    const value=collection==="production_jobs"?{...data.productionJobs[0],orderId:"FOREIGN-ORDER"}:collection==="inventory_items"?{...data.inventoryItems[0],relatedOrderId:"FOREIGN-ORDER"}:collection==="issues"?{...data.issues[0],orderId:"FOREIGN-ORDER"}:collection==="evidence"?{...data.evidence[0],issueId:"FOREIGN-ISSUE"}:collection==="ai_analyses"?{...data.aiAnalyses[0],issueId:"FOREIGN-ISSUE"}:{...data.actions[0],issueId:"FOREIGN-ISSUE"};
    await expect(repository.batch(org,[{collection,value} as Write])).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
  });
  it("rejects corrupt relational links when reconstructing the workspace",async()=>{
    const {repository,state,data}=await fixture();state.documents.set(documentPath(org,"production_jobs",data.productionJobs[0].id),{...data.productionJobs[0],orderId:"FOREIGN-ORDER"});await expect(loadWorkspace(repository,org)).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
  });
  it("sanitizes provider stack/error details",()=>{
    const error=providerError(new Error("secret path and provider stack"),"read");expect(error.code).toBe("PERSISTENCE_READ_FAILED");expect(error.message).not.toContain("secret");
  });
});
