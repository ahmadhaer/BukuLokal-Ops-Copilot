import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
import { buildTestApplication } from "./helpers";
import { loadWorkspace } from "../../../src/features/persistence/workspace";
async function review(application:ReturnType<typeof buildTestApplication>["application"],name="orders.csv"){
 const file={name,bytes:readFileSync(`tests/fixtures/imports/${name}`)};const preview=await application.previewImport(file);if(!preview.ok)throw new Error("Expected preview");const table=preview.previews[0];const selection={sheetIndex:0,datasetKind:"orders",confirmed:true,assignments:table.mapping.suggestions.filter(x=>x.canonicalField).map(x=>({sourceHeader:x.sourceHeader,canonicalField:x.canonicalField})),defaults:table.mapping.suggestions.some(x=>x.canonicalField==="quantityUnit")?{}:{quantityUnit:"pcs"}};const health=await application.checkImport(file,selection);if(!health.ok)throw new Error("Expected health");return {file,selection,health};
}
describe("explicit reviewed import save",()=>{
  it("preview/check has no writes; explicit save persists valid data and session",async()=>{
    const {application,repository,state}=buildTestApplication();await application.openDemoWorkspace();const before=structuredClone(state.documents);const {file,selection,health}=await review(application);expect(state.documents).toEqual(before);expect(await application.saveValidData(file,selection,health.reviewKey)).toMatchObject({ok:true,savedRecords:1,invalidRows:0});const data=await loadWorkspace(repository,"ORG-001");expect(data.orders).toHaveLength(13);expect(data.importSessions).toHaveLength(2);
    const dashboard=await application.getDashboard();expect(dashboard.ok&&dashboard.value.workspace.metrics.orders).toBe(12);
  });
  it("excludes invalid rows and reports accurate counts without issue reconciliation",async()=>{
    const {application,repository}=buildTestApplication();await application.openDemoWorkspace();const before=await loadWorkspace(repository,"ORG-001");const {file,selection,health}=await review(application,"invalid-orders.csv");expect(await application.saveValidData(file,selection,health.reviewKey)).toMatchObject({ok:true,savedRecords:1,invalidRows:6});const after=await loadWorkspace(repository,"ORG-001");expect(after.issues).toEqual(before.issues);expect(after.evidence).toEqual(before.evidence);expect(after.orders).toHaveLength(13);
  });
  it("rejects unreviewed/mismatched file/mapping and browser-owned organization fields",async()=>{
    const {application,state}=buildTestApplication();await application.openDemoWorkspace();const {file,selection,health}=await review(application);const before=structuredClone(state.documents);
    expect(await application.saveValidData(file,selection,undefined)).toMatchObject({ok:false});expect(await application.saveValidData({...file,name:"other.csv"},selection,health.reviewKey)).toMatchObject({ok:false});expect(await application.saveValidData(file,{...selection,organizationId:"OTHER"},health.reviewKey)).toMatchObject({ok:false});expect(state.documents).toEqual(before);
  });
  it("repeat save returns conflict and never replaces existing records/history",async()=>{
    const {application,state}=buildTestApplication();await application.openDemoWorkspace();const {file,selection,health}=await review(application);await application.saveValidData(file,selection,health.reviewKey);const before=structuredClone(state.documents);expect(await application.saveValidData(file,selection,health.reviewKey)).toMatchObject({ok:false,code:"PERSISTENCE_CONFLICT"});expect(state.documents).toEqual(before);
  });
  it("storage unavailable does not prevent health review and does prevent saving",async()=>{
    const {application,state}=buildTestApplication({persistence:false});const {file,selection,health}=await review(application);expect(health.result.summary.validRows).toBe(1);expect(await application.saveValidData(file,selection,health.reviewKey)).toMatchObject({ok:false,code:"PERSISTENCE_NOT_CONFIGURED"});expect(state.documents.size).toBe(0);
  });
});
