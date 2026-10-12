import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "../../src/app/page";
import RootLayout, { metadata } from "../../src/app/layout";

describe("foundation rendering contract", () => {
  it("renders the project identity and truthful bootstrap status", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('<h1 class="text-3xl font-semibold">BukuLokal Ops Copilot</h1>');
    expect(html).toContain("AI Builder Cup 2026");
    expect(html).toContain("Fresh prototype foundation initialized.");
    expect(html).toContain("Product functionality will be implemented in subsequent gated Work Units.");
    expect(html).not.toMatch(/<(form|input|button|table)\b/);
  });

  it("wraps the homepage in the root document and supplies project metadata", () => {
    const html = renderToStaticMarkup(<RootLayout><Home /></RootLayout>);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<body><main");
    expect(metadata.title).toBe("BukuLokal Ops Copilot");
  });
});
