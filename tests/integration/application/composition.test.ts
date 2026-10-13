import { readFileSync } from "node:fs";
import { afterEach,describe,expect,it,vi } from "vitest";
import { buildProductionApplication } from "../../../src/application/production";
import { assessRuntimeCapabilities } from "../../../src/application/capabilities";
import { buildTestApplication } from "./helpers";
afterEach(()=>vi.unstubAllEnvs());
describe("production/test composition and runtime capabilities",()=>{
  it("production composition safely rejects missing persistence without test doubles",async()=>{
    vi.stubEnv("GOOGLE_CLOUD_PROJECT","");vi.stubEnv("GOOGLE_CLOUD_LOCATION","");vi.stubEnv("GEMINI_MODEL","");const application=buildProductionApplication();expect(application.health()).toEqual({applicationReady:false,goldenPathReady:false,capabilities:{persistence:"unavailable",ai:"unavailable"}});
    expect(await application.openDemoWorkspace()).toMatchObject({ok:false,code:"PERSISTENCE_NOT_CONFIGURED"});
  });
  it("tests explicitly inject network-boundary doubles and expose no production mode switch",async()=>{
    const {application,repository,provider}=buildTestApplication();expect(await application.openDemoWorkspace()).toMatchObject({ok:true});expect((await repository.read("ORG-001").list("orders"))).toHaveLength(12);expect(provider.requests).toHaveLength(0);
    const production=readFileSync("src/application/production.ts","utf8");expect(production).not.toMatch(/memory\/|TestProvider|Fake|NODE_ENV|TEST_MODE|buildTestApplication/);expect(production).toContain("createVertexProvider");expect(production).toContain("demoRepository");
  });
  it("assesses persistence-only and full configuration without exposing configuration values",()=>{
    expect(assessRuntimeCapabilities({GOOGLE_CLOUD_PROJECT:"synthetic-private-project"})).toEqual({persistence:"configured",ai:"unavailable"});
    const capabilities=assessRuntimeCapabilities({GOOGLE_CLOUD_PROJECT:"synthetic-private-project",GOOGLE_CLOUD_LOCATION:"synthetic-location",GEMINI_MODEL:"synthetic-model",GOOGLE_APPLICATION_CREDENTIALS:"synthetic-credential-path"});expect(capabilities).toEqual({persistence:"configured",ai:"configured"});expect(JSON.stringify(capabilities)).not.toMatch(/synthetic|GOOGLE|credential/);
  });
});
