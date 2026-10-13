import { describe, expect, it, vi } from "vitest";
import { createWorkspaceRepository } from "../../../src/repositories/workspace-repository";
import { createMemoryStore } from "../../../src/repositories/memory/store";
import { documentPath } from "../../../src/lib/firestore/paths";
import { fixture, org } from "./helpers";
import type { Write } from "../../../src/repositories/types";
import { abcApparelDataset } from "../../../src/domain";
describe("validated repository contract", () => {
  it("round-trips organization, source, import, order, production, inventory, issue and evidence", async () => {
    const { repository, data, state } = await fixture(); const second = createWorkspaceRepository(createMemoryStore(state));
    for (const [collection, entity] of [["organizations",data.organization],["data_sources",data.dataSources[0]],["imports",data.importSessions[0]],["orders",data.orders[0]],["production_jobs",data.productionJobs[0]],["inventory_items",data.inventoryItems[0]],["issues",data.issues[0]],["evidence",data.evidence[0]]] as const) {
      expect(await second.read(org).get(collection, entity.id)).toEqual(entity);
      expect(await repository.read(org).get(collection, entity.id)).toEqual(entity);
    }
  });
  it("round-trips analysis, action, and audit without changing dates", async () => {
    const { repository, data } = await fixture(true);
    expect(await repository.read(org).get("ai_analyses",data.aiAnalyses[0].id)).toEqual(data.aiAnalyses[0]);
    expect(await repository.read(org).get("actions",data.actions[0].id)).toEqual(data.actions[0]);
    expect(await repository.read(org).get("audit_events",data.auditEvents[0].id)).toEqual(data.auditEvents[0]);
    expect(typeof data.actions[0].createdAt).toBe("string");
  });
  it("rejects invalid writes before any transport call", async () => {
    const { store } = await fixture(); const write = vi.spyOn(store,"batch"); const read = vi.spyOn(store,"get"); const repository = createWorkspaceRepository(store);
    await expect(repository.batch(org,[{ collection:"orders",value:{...abcApparelDataset.orders[0],orderedQuantity:-1} }])).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
    expect(write).not.toHaveBeenCalled();expect(read).not.toHaveBeenCalled();
  });
  it("rejects corrupt stored shape and mismatched document ID on reads", async () => {
    const { repository,state } = await fixture(); const path=documentPath(org,"orders","SO-001");
    state.documents.set(path,{...abcApparelDataset.orders[0],dueDate:"bad"});
    await expect(repository.read(org).get("orders","SO-001")).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
    state.documents.set(path,{...abcApparelDataset.orders[0],id:"SO-OTHER"});
    await expect(repository.read(org).list("orders")).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});
  });
  it("omits optional undefined but preserves explicit null", async () => {
    const { repository,state,data } = await fixture();const item={...data.inventoryItems[0],id:"MAT-OPTIONAL",relatedOrderId:undefined};
    await repository.batch(org,[{collection:"inventory_items",value:item}]);
    expect(state.documents.get(documentPath(org,"inventory_items",item.id))).not.toHaveProperty("relatedOrderId");
    await repository.batch(org,[{collection:"inventory_items",value:{...item,relatedOrderId:null}}]);
    expect(await repository.read(org).get("inventory_items",item.id)).toHaveProperty("relatedOrderId",null);
  });
  it("returns deterministic list order and a safe not-found value", async () => {
    const { repository } = await fixture();const values=await repository.read(org).list("orders");
    expect(values.map(x=>x.id)).toEqual(values.map(x=>x.id).sort()); expect(await repository.read(org).get("orders","missing")).toBeNull();
  });
  it("fails oversized atomic requests before any write", async () => {
    const { repository,state } = await fixture();const before=structuredClone(state.documents);
    const writes=Array.from({length:501},(_,i)=>({collection:"orders",value:{...abcApparelDataset.orders[0],id:`IMPORTED-${i}`}} as Write));
    await expect(repository.batch(org,writes)).rejects.toMatchObject({code:"PERSISTENCE_WRITE_FAILED"});expect(state.documents).toEqual(before);
  });
});
