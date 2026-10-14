// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Harness } from "./ui-helpers";
afterEach(cleanup);
function uploadFile(name: string) { return new File([new Uint8Array(readFileSync(`tests/fixtures/imports/${name}`))], name); }
describe("import UI preserves confirmation and canonical validation", () => {
  it("previews CSV, allows mapping/default changes, and requires explicit confirmation", async () => {
    const user = userEvent.setup(); render(<Harness path="/import" />); await user.upload(screen.getByLabelText("CSV or Excel file"), uploadFile("orders.csv")); await user.click(screen.getByRole("button", { name: "Import Preview" }));
    await screen.findByRole("heading", { name: "Review Mapping" }); expect(screen.getByText(/Detected columns: No PO/)).toBeTruthy(); expect((screen.getByLabelText("Map Jumlah") as HTMLSelectElement).value).toBe("orderedQuantity");
    await user.selectOptions(screen.getByLabelText("Map Jumlah"), ""); await user.selectOptions(screen.getByLabelText("Map Jumlah"), "orderedQuantity"); await user.selectOptions(screen.getByLabelText(/Explicit default quantity unit/), "pcs");
    const confirmButton = screen.getByRole("button", { name: "Confirm Mapping and Check Data" }) as HTMLButtonElement; expect(confirmButton.disabled).toBe(true);
    await user.click(screen.getByLabelText("I confirm these mappings and explicit defaults.")); await user.click(confirmButton); await screen.findByText("1 rows ready · 0 rows need attention"); expect(screen.getByText(/These records are not saved/)).toBeTruthy();
  });
  it("previews workbook sheets and allows selecting a table", async () => {
    const user = userEvent.setup(); render(<Harness path="/import" />); await user.upload(screen.getByLabelText("CSV or Excel file"), uploadFile("manufacturing.xlsx")); await user.click(screen.getByRole("button", { name: "Import Preview" }));
    const sheets = await screen.findByLabelText("Sheet to review"); expect((sheets as HTMLSelectElement).options).toHaveLength(3); await user.selectOptions(sheets, "1");
    expect(screen.getByText(/Detected columns: Job ID/)).toBeTruthy(); expect((screen.getByLabelText("Data type") as HTMLSelectElement).value).toBe("production");
  });
  it("shows valid/invalid counts and readable row-field errors", async () => {
    const user = userEvent.setup(); render(<Harness path="/import" />); await user.upload(screen.getByLabelText("CSV or Excel file"), uploadFile("invalid-orders.csv")); await user.click(screen.getByRole("button", { name: "Import Preview" })); await screen.findByRole("heading", { name: "Review Mapping" });
    await user.click(screen.getByLabelText("I confirm these mappings and explicit defaults.")); await user.click(screen.getByRole("button", { name: "Confirm Mapping and Check Data" })); await screen.findByText("1 rows ready · 6 rows need attention");
    expect(screen.getByRole("columnheader", { name: "Problem" })).toBeTruthy(); expect(screen.getByText("Required value is missing: id.")).toBeTruthy(); expect(screen.getByText("Date must be a valid YYYY-MM-DD date.")).toBeTruthy();
  });
  it("requires explicit data-type selection when headers are ambiguous", async () => {
    const user = userEvent.setup(); render(<Harness path="/import" />); await user.upload(screen.getByLabelText("CSV or Excel file"), uploadFile("ambiguous.csv")); await user.click(screen.getByRole("button", { name: "Import Preview" })); await screen.findByRole("heading", { name: "Review Mapping" });
    expect((screen.getByLabelText("Data type") as HTMLSelectElement).value).toBe(""); await user.click(screen.getByLabelText("I confirm these mappings and explicit defaults.")); expect((screen.getByRole("button", { name: "Confirm Mapping and Check Data" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("rejects unsupported files without a fake preview", async () => {
    const user = userEvent.setup({ applyAccept: false }); render(<Harness path="/import" />); await user.upload(screen.getByLabelText("CSV or Excel file"), new File(["synthetic"], "synthetic.xls")); await user.click(screen.getByRole("button", { name: "Import Preview" }));
    expect(screen.getByRole("alert").textContent).toBe("Choose a CSV or Excel (.xlsx) file."); expect(screen.queryByRole("heading", { name: "Review Mapping" })).toBeNull();
  });
});
