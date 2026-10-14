// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Harness } from "./ui-helpers";
afterEach(cleanup);
describe("golden demo UI with fake provider", () => {
  it("navigates landing → dashboard → SO-001 → analysis → suggestion → approval → activity", async () => {
    const user = userEvent.setup(); render(<Harness />);
    await user.click(screen.getByRole("link", { name: "Try Demo" }));
    expect(screen.getByRole("heading", { name: "Operations overview" })).toBeTruthy();
    await user.click(within(screen.getByRole("heading", { name: "SO-001 may miss its deadline" }).closest("article")!).getByRole("link", { name: "Review Issue" })); expect(screen.getByText("30%")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Analyze with AI" })); await screen.findByRole("heading", { name: "Summary" });
    await user.click(screen.getByRole("button", { name: "Create Suggested Action" })); expect(screen.getByText("suggested", { exact: true })).toBeTruthy();
    expect(screen.getAllByText("Nothing will be sent automatically.").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Approve" })); expect(screen.getByText("approved", { exact: true })).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "Activity" })); expect(screen.getByText("Action approved")).toBeTruthy(); expect(screen.getByText("Action suggested")).toBeTruthy();
    expect(screen.queryByText("Supplier contacted")).toBeNull();
  });
  it("edits a suggested draft, retains user modification, then rejects without execution", async () => {
    const user = userEvent.setup(); render(<Harness />); await user.click(screen.getByRole("link", { name: "Try Demo" })); await user.click(within(screen.getByRole("heading", { name: "SO-001 may miss its deadline" }).closest("article")!).getByRole("link", { name: "Review Issue" }));
    await user.click(screen.getByRole("button", { name: "Analyze with AI" })); await screen.findByRole("heading", { name: "Summary" }); await user.click(screen.getByRole("button", { name: "Create Suggested Action" }));
    await user.click(screen.getByRole("button", { name: "Edit" })); const draft = screen.getByLabelText("Edit draft text"); await user.clear(draft); await user.type(draft, "Synthetic user-edited note"); await user.click(screen.getByRole("button", { name: "Save Edit" }));
    expect(screen.getByText("User-modified draft")).toBeTruthy(); expect(screen.getByText("Synthetic user-edited note")).toBeTruthy(); await user.click(screen.getByRole("button", { name: "Reject" })); expect(screen.getByText("Rejected. No external action occurred.")).toBeTruthy();
  });
});
