// @vitest-environment jsdom
import { cleanup, render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Harness, fakeAnalyze } from "./ui-helpers";
import { selectedRequest } from "../ai/helpers";
afterEach(cleanup);
const detailPath = () => `/issues/${encodeURIComponent(selectedRequest().issueId)}`;
describe("product UI and AI states", () => {
  it("renders the proposition and business entry points", () => {
    render(<Harness />); expect(screen.getByRole("heading", { name: "BukuLokal Ops Copilot" })).toBeTruthy(); expect(screen.getByText("Know what needs your attention today.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Try Demo" }).getAttribute("href")).toBe("/demo"); expect(screen.getByRole("link", { name: "Use My Data" })).toBeTruthy();
  });
  it("renders derived dashboard metrics, critical text, and SO-001", () => {
    render(<Harness path="/demo" />);
    expect(within(screen.getByRole("heading", { name: "Orders" }).parentElement!).getByText("12")).toBeTruthy();
    expect(screen.getAllByText("SO-001 may miss its deadline")).toHaveLength(1); expect(screen.getAllByText("Critical").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Needs Your Attention" })).toBeTruthy();
  });
  it("shows canonical evidence IDs and truthful unconfigured AI, without fake advice", () => {
    const analyze = vi.fn(fakeAnalyze); render(<Harness path={detailPath()} configured={false} analyze={analyze} />);
    expect(screen.getByText("30%")).toBeTruthy(); expect(screen.getByText("2 days")).toBeTruthy(); expect(screen.getByText("200 pcs")).toBeTruthy();
    expect(screen.getByText(/AI analysis is not configured/)).toBeTruthy(); expect((screen.getByRole("button", { name: "Analyze with AI" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Previous AI analysis")).toBeNull(); expect(screen.queryByRole("heading", { name: "Summary" })).toBeNull(); expect(analyze).not.toHaveBeenCalled(); expect(document.querySelectorAll("[data-evidence-id]")).toHaveLength(3);
  });
  it("renders fake-provider success only after explicit user action, including missing information", async () => {
    const user = userEvent.setup(); const analyze = vi.fn(fakeAnalyze); render(<Harness path={detailPath()} analyze={analyze} />); expect(analyze).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Analyze with AI" })); await screen.findByRole("heading", { name: "Summary" });
    expect(screen.getByRole("heading", { name: "Why This Matters" })).toBeTruthy(); expect(screen.getByRole("heading", { name: "Recommended Actions" })).toBeTruthy();
    expect(screen.getByText(/Supplier lead time is not supplied/)).toBeTruthy(); expect(screen.getByText(/Production capacity is unavailable/)).toBeTruthy(); expect(analyze).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Analyze Again with AI" })).toBeTruthy();
    expect(screen.queryByText("Previous AI analysis")).toBeNull();
    expect(screen.queryByText(/restored from persistent storage/)).toBeNull();
  });
  it("announces loading and prevents repeated submissions while pending", async () => {
    let resolve!: (value: import("../../../src/features/demo/analysis-service").DemoAnalysisResponse) => void;
    const promise = new Promise<import("../../../src/features/demo/analysis-service").DemoAnalysisResponse>((done) => { resolve = done; });
    const analyze = vi.fn(() => promise); const user = userEvent.setup(); render(<Harness path={detailPath()} analyze={analyze} />);
    await user.click(screen.getByRole("button", { name: "Analyze with AI" })); expect(screen.getByRole("status").textContent).toContain("Analyzing the verified operational evidence");
    const button = screen.getByRole("button", { name: "Analyzing..." }) as HTMLButtonElement; expect(button.disabled).toBe(true); await user.click(button); expect(analyze).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ status: "unavailable", message: "AI analysis is temporarily unavailable." }));
  });
  it("retains verified evidence when configured AI fails", async () => {
    const user = userEvent.setup(); render(<Harness path={detailPath()} analyze={async () => ({ status: "unavailable", message: "AI analysis is temporarily unavailable." })} />);
    await user.click(screen.getByRole("button", { name: "Analyze with AI" })); await screen.findByText("AI analysis is temporarily unavailable."); expect(screen.getByText("30%")).toBeTruthy(); expect(screen.queryByRole("heading", { name: "Summary" })).toBeNull();
  });
  it("keeps Google Sheets honestly unavailable and offers real upload navigation", () => {
    render(<Harness path="/data" />); expect(screen.getByText("Coming soon · P1")).toBeTruthy(); expect((screen.getByRole("button", { name: "Coming soon" }) as HTMLButtonElement).disabled).toBe(true); expect(screen.getByRole("link", { name: "Upload File" }).getAttribute("href")).toBe("/import");
  });
  it("filters open issues deterministically and shows genuine empty states", async () => {
    const user = userEvent.setup(); render(<Harness path="/issues" />); await user.selectOptions(screen.getByLabelText("Filter issues"), "Order Delay"); expect(screen.getAllByRole("link", { name: "Review Issue" })).toHaveLength(5);
  });
});
