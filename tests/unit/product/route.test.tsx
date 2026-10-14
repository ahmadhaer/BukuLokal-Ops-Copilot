import { describe, expect, it, vi } from "vitest";
vi.mock("../../../src/components/product/server-page", () => ({ ProductPage: () => null }));
import IssuePage from "../../../src/app/issues/[id]/page";
describe("issue route boundary", () => {
  it("decodes URL-encoded canonical identifiers from Next route params", async () => {
    const id = "ISS:order_delay_risk:7:ORG-001:6:SO-001";
    const page = await IssuePage({ params: Promise.resolve({ id: encodeURIComponent(id) }) });
    expect(page.props.issueId).toBe(id);
  });
  it("handles malformed encoding without exposing an exception", async () => {
    const page = await IssuePage({ params: Promise.resolve({ id: "%broken" }) });
    expect(page.props.issueId).toBe("");
  });
});
