import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "../../src/app/page";
import RootLayout, { metadata } from "../../src/app/layout";

describe("product landing rendering contract", () => {
  it("renders project identity, proposition, and approved entry points", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain("<h1>BukuLokal Ops Copilot</h1>");
    expect(html).toContain("AI Builder Cup 2026");
    expect(html).toContain("Know what needs your attention today.");
    expect(html).toContain("Try Demo");
    expect(html).toContain("Use My Data");
    expect(html).toContain('href="/demo"');
    expect(html).toContain('href="/data"');
    expect(html).toContain("Nothing is sent or changed externally.");
  });

  it("wraps the homepage in the root document and supplies project metadata", () => {
    const html = renderToStaticMarkup(<RootLayout><Home /></RootLayout>);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<body>");
    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain("<main");
    expect(metadata.title).toBe("BukuLokal Ops Copilot");
  });
});
