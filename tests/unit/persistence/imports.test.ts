import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
import { fixture,org,context } from "./helpers";
import { parseImportFile,createImportPreview,confirmMapping } from "../../../src/features/imports";
import { persistValidatedImport } from "../../../src/features/persistence/imports";
import { loadWorkspace,workspaceView } from "../../../src/features/persistence/workspace";
async function importInput(name="orders.csv") {
  const table=(await parseImportFile({name,bytes:readFileSync(`tests/fixtures/imports/${name}`)}))[0];const preview=createImportPreview(table);
  const mapping=confirmMapping(table,{confirmed:true,datasetKind:"orders",assignments:preview.mapping.suggestions.filter(x=>x.canonicalField).map(x=>({sourceHeader:x.sourceHeader,canonicalField:x.canonicalField})),defaults:preview.mapping.suggestions.some(x=>x.canonicalField==="quantityUnit")?{}:{quantityUnit:"pcs"},context:{organizationId:org,dataSourceId:"DS-NEW",importSessionId:"IMPORT-NEW"}});
  const source={id:"DS-NEW",organizationId:org,type:"csv" as const,name:"Synthetic test upload",readOnly:true,createdAt:context.occurredAt};
  return {table,mapping,source};
}
describe("canonical normalized import persistence",()=>{
  it("atomically writes confirmed orders, source and ImportSession with preserved IDs",async()=>{
    const {repository,store}=await fixture();const {table,mapping,source}=await importInput();const batches:number[]=[];const original=store.batch;store.batch=async writes=>{batches.push(writes.length);await original(writes);};
    const result=await persistValidatedImport(repository,table,mapping,source,context.occurredAt);const data=await loadWorkspace(repository,org);
    expect(result.summary.validRows).toBe(1);expect(batches).toEqual([3]);expect(data.importSessions.find(x=>x.id==="IMPORT-NEW")).toMatchObject({organizationId:org,dataSourceId:"DS-NEW",status:"validated"});expect(data.orders.find(x=>x.sourceId==="IMPORT-NEW")).toEqual(result.validRecords[0]);expect(workspaceView(data).metrics.orders).toBe(12);
  });
  it("writes valid rows only; invalid rows never reach storage",async()=>{
    const {repository}=await fixture();const {table,mapping,source}=await importInput("invalid-orders.csv");const result=await persistValidatedImport(repository,table,mapping,source,context.occurredAt);const data=await loadWorkspace(repository,org);
    expect(result.summary).toMatchObject({validRows:1,invalidRows:6});expect(data.orders.filter(x=>x.sourceId==="IMPORT-NEW")).toHaveLength(1);
  });
  it.each(["production","inventory"] as const)("persists validated %s without changing demo dashboard facts",async(kind)=>{
    const {repository}=await fixture();const name=kind+".csv";const table=(await parseImportFile({name,bytes:readFileSync(`tests/fixtures/imports/${name}`)}))[0];
    const rows=table.rows.map(row=>({...row,values:{...row.values,[kind==="production"?"Order No":"No PO"]:"SO-001"}}));const selected={...table,rows};const preview=createImportPreview(selected);
    const mapping=confirmMapping(selected,{confirmed:true,datasetKind:kind,assignments:preview.mapping.suggestions.filter(x=>x.canonicalField).map(x=>({sourceHeader:x.sourceHeader,canonicalField:x.canonicalField})),defaults:kind==="production"?{quantityUnit:"pcs",updatedAt:context.occurredAt}:{unit:"pcs",updatedAt:context.occurredAt},context:{organizationId:org,dataSourceId:"DS-SECOND",importSessionId:"IMPORT-SECOND"}});
    const result=await persistValidatedImport(repository,selected,mapping,{id:"DS-SECOND",organizationId:org,type:"csv",name:"Synthetic supplemental records",readOnly:true,createdAt:context.occurredAt},context.occurredAt);expect(result.summary.validRows).toBe(1);
    const loaded=await loadWorkspace(repository,org);expect(workspaceView(loaded).metrics).toEqual({orders:12,atRisk:5,materialShortages:5,criticalIssues:2});
    const records=kind==="production"?loaded.productionJobs:loaded.inventoryItems;expect(records.some(x=>x.id===result.validRecords[0].id)).toBe(true);
  });
  it("repeated import fails with conflict and retains original complete state",async()=>{
    const {repository}=await fixture();const {table,mapping,source}=await importInput();await persistValidatedImport(repository,table,mapping,source,context.occurredAt);const before=await loadWorkspace(repository,org);
    await expect(persistValidatedImport(repository,table,mapping,source,context.occurredAt)).rejects.toMatchObject({code:"PERSISTENCE_CONFLICT"});expect(await loadWorkspace(repository,org)).toEqual(before);
  });
  it("rejects inconsistent organization/source ownership before writing",async()=>{
    const {repository,state}=await fixture();const {table,mapping,source}=await importInput();const before=structuredClone(state.documents);
    await expect(persistValidatedImport(repository,table,mapping,{...source,organizationId:"FOREIGN"},context.occurredAt)).rejects.toMatchObject({code:"PERSISTENCE_INVALID_DOCUMENT"});expect(state.documents).toEqual(before);
  });
  it("rejects >500 writes atomically after WU-02 normalization",async()=>{
    const {repository,state}=await fixture();const {table,mapping,source}=await importInput();const before=structuredClone(state.documents);
    const large={...table,rows:Array.from({length:499},(_,i)=>({rowNumber:i+2,values:{...table.rows[0].values,"No PO":`NEW-${i}`}}))};
    await expect(persistValidatedImport(repository,large,mapping,source,context.occurredAt)).rejects.toMatchObject({code:"PERSISTENCE_WRITE_FAILED"});expect(state.documents).toEqual(before);
  });
});
