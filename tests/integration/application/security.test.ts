import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
import { buildTestApplication,goldenIssue,OPERATION } from "./helpers";
describe("orchestration security boundaries",()=>{
  it("cannot accept browser-supplied severity or evidence as issue truth",async()=>{
    const {application,provider}=buildTestApplication();const issueId=await goldenIssue(application);const forged={issueId,severity:"low",completionPercentage:100,shortageQuantity:0,daysToDeadline:99};expect(await application.getIssueDetail(forged as unknown as string)).toMatchObject({ok:false,code:"PERSISTENCE_INVALID_DOCUMENT"});expect((await application.analyzeIssue(forged as unknown as string,OPERATION)).status).toBe("invalid");expect(provider.requests).toHaveLength(0);
  });
  it("server model/prompt/evidence are selected independently of untrusted request extras",async()=>{
    const {application,provider}=buildTestApplication();const issueId=await goldenIssue(application);await application.analyzeIssue(issueId,OPERATION);const request=provider.requests[0];expect(request.model).toBe("synthetic-test-model");expect(request.input.issue.severity).toBe("critical");expect(request.input.evidence.some(item=>item.type==="production_completion"&&item.value===30)).toBe(true);expect(JSON.stringify(request.input)).not.toMatch(/Customer|Classic T-Shirt/);
  });
  it("production server page has no fixture fallback and every new server implementation is guarded",()=>{
    expect(readFileSync("src/components/product/server-page.tsx","utf8")).not.toContain("buildDemoWorkspace");for(const file of ["application","capabilities","consistency","production"]){expect(readFileSync(`src/application/${file}.ts`,"utf8")).toContain('import "server-only";');}expect(readFileSync("src/application/contracts.ts","utf8")).not.toMatch(/^(?!import type|export type|\s|}).*import /m);
  });
});
