// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationHarness } from "./ui-harness";
import { buildTestApplication, goldenIssue, OPERATION } from "./helpers";
import { Harness } from "../../unit/product/ui-helpers";
import { selectedRequest } from "../../unit/ai/helpers";

afterEach(cleanup);
const restored = "This analysis was previously generated and restored from persistent storage.";
describe("persisted AI analysis UX", () => {
  it("opens a never-analyzed issue without a restored notice or automatic AI call", async () => {
    const built = buildTestApplication(); const issueId = await goldenIssue(built.application);
    render(<ApplicationHarness application={built.application} initialPath={`/issues/${encodeURIComponent(issueId)}`} />);
    await screen.findByRole("button", { name: "Analyze with AI" });
    expect(screen.queryByText("Previous AI analysis")).toBeNull();
    expect(screen.queryByText(restored)).toBeNull(); expect(built.provider.requests).toHaveLength(0);
  });
  it("explains a restored analysis and existing action without invoking AI or creating duplicates", async () => {
    const built = buildTestApplication(); const issueId = await goldenIssue(built.application);
    expect((await built.application.analyzeIssue(issueId, OPERATION)).status).toBe("success");
    const reloaded = buildTestApplication({ state: built.state }); const user = userEvent.setup();
    render(<ApplicationHarness application={reloaded.application} initialPath={`/issues/${encodeURIComponent(issueId)}`} />);
    await screen.findByText("Synthetic order needs operational review.");
    expect(screen.getByRole("button", { name: "Analyze Again with AI" })).toBeTruthy();
    expect(screen.getByText("Previous AI analysis")).toBeTruthy(); expect(screen.getByText(restored)).toBeTruthy();
    const button = screen.getByRole("button", { name: "Suggested action already created" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true); await user.click(button);
    expect(screen.queryByRole("button", { name: "Create Suggested Action" })).toBeNull();
    expect(reloaded.provider.requests).toHaveLength(0);
    expect(await reloaded.repository.read("ORG-001").list("actions")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
  });
  it("keeps a newly requested durable result distinct until the page is reloaded", async () => {
    const built = buildTestApplication(); const issueId = await goldenIssue(built.application); const user = userEvent.setup();
    const path = `/issues/${encodeURIComponent(issueId)}`;
    render(<ApplicationHarness application={built.application} initialPath={path} />);
    await user.click(await screen.findByRole("button", { name: "Analyze with AI" }));
    await screen.findByText("Synthetic order needs operational review.");
    await waitFor(() => expect((screen.getByRole("button", { name: "Analyze Again with AI" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.queryByText(restored)).toBeNull(); expect(screen.queryByText("Previous AI analysis")).toBeNull();
    expect(screen.getByText("AI recommendation · human review required")).toBeTruthy();
    cleanup();
    const reloaded = buildTestApplication({ state: built.state });
    render(<ApplicationHarness application={reloaded.application} initialPath={path} />);
    await screen.findByText(restored); expect(reloaded.provider.requests).toHaveLength(0);
  });
  it("keeps an unconverted recommendation actionable and explains duplicate prevention after creation", async () => {
    const user = userEvent.setup();
    render(<Harness path={`/issues/${encodeURIComponent(selectedRequest().issueId)}`} />);
    await user.click(screen.getByRole("button", { name: "Analyze with AI" }));
    const create = await screen.findByRole("button", { name: "Create Suggested Action" });
    expect((create as HTMLButtonElement).disabled).toBe(false); await user.click(create);
    const existing = screen.getByRole("button", { name: "Suggested action already created" }) as HTMLButtonElement;
    expect(existing.disabled).toBe(true); await user.click(existing);
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(1);
  });
});
