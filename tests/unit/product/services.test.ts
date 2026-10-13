import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { buildDemoWorkspace } from "../../../src/features/demo/workspace";
import { analyzeDemoIssue } from "../../../src/features/demo/analysis-service";
import { previewImport, validateImport } from "../../../src/features/import-ui/service";
import { validOutput, StubProvider, execution, selectedRequest } from "../ai/helpers";

describe("server/application boundaries", () => {
  it("derives metrics and stable priority feed from existing engines", () => {
    const workspace = buildDemoWorkspace();
    expect(workspace.view.metrics).toEqual({ orders: 12, atRisk: 5, materialShortages: 5, criticalIssues: 2 });
    expect(workspace.view.details[0].issue.severity).toBe("critical");
    for (const detail of workspace.view.details) for (const item of detail.evidence) expect(workspace.detection.evidence.some((source) => source.id === item.id && source.value === item.value)).toBe(true);
  });
  it("reconstructs bounded server-side evidence for configured fake-provider success", async () => {
    const provider = new StubProvider([JSON.stringify(validOutput())]); const request = selectedRequest();
    const result = await analyzeDemoIssue(request.issueId, execution.createdAt, () => ({ provider, config: { model: execution.model } }));
    expect(result.status).toBe("success"); expect(provider.requests[0].input.evidence).toHaveLength(3);
  });
  it("does not call a provider for unknown issue IDs; reports honest missing config", async () => {
    const runtime = vi.fn(() => { throw new Error("unconfigured"); });
    expect((await analyzeDemoIssue("ISS-SYNTHETIC-ABSENT", execution.createdAt, runtime)).status).toBe("invalid"); expect(runtime).not.toHaveBeenCalled();
    expect((await analyzeDemoIssue(selectedRequest().issueId, execution.createdAt, runtime)).status).toBe("unconfigured");
  });
  it("keeps failures separate from deterministic evidence", async () => {
    const result = await analyzeDemoIssue(selectedRequest().issueId, execution.createdAt, () => ({ provider: new StubProvider([new Error("private transport")]), config: { model: execution.model } }));
    expect(result.status).toBe("unavailable"); expect(JSON.stringify(result)).not.toContain("private transport"); expect(buildDemoWorkspace().view.details.length).toBeGreaterThan(0);
  });
  it("previews both formats and checks real canonical records after confirmation", async () => {
    for (const name of ["orders.csv", "manufacturing.xlsx"]) {
      const file = { name, bytes: readFileSync(`tests/fixtures/imports/${name}`) }; const preview = await previewImport(file); expect(preview.ok).toBe(true);
      if (!preview.ok) throw new Error("Expected synthetic preview");
      const result = await validateImport(file, { sheetIndex: 0, datasetKind: "orders", confirmed: true, defaults: { quantityUnit: "pcs" }, assignments: preview.previews[0].mapping.suggestions.filter((item) => item.canonicalField).map((item) => ({ sourceHeader: item.sourceHeader, canonicalField: item.canonicalField })) });
      expect(result.ok).toBe(true); if (result.ok) { expect(result.result.summary.validRows).toBe(1); expect(result.result.validRecords[0]).toHaveProperty("organizationId", "ORG-001"); }
    }
  });
  it("rejects missing confirmation and unsupported files without raw parser errors", async () => {
    const file = { name: "orders.csv", bytes: readFileSync("tests/fixtures/imports/orders.csv") };
    expect((await validateImport(file, { confirmed: false })).ok).toBe(false);
    const result = await previewImport({ ...file, name: "synthetic.xls" }); expect(result).toEqual({ ok: false, message: "Choose a CSV or Excel (.xlsx) file." });
  });
});
