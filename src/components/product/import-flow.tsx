"use client";
import { useState, useTransition } from "react";
import type { ImportPreviewResponse, ImportHealthResponse } from "../../features/import-ui/service";
import type { ImportSaveResponse } from "../../application/contracts";
import { FIELD_LABELS } from "../../features/import-ui/labels";
import { DATASET_FIELDS, MAX_IMPORT_FILE_BYTES } from "../../features/imports/constants";
import type { DatasetKind } from "../../features/imports/types";

type Props = { previewAction(data: FormData): Promise<ImportPreviewResponse>; validateAction(data: FormData, selection: unknown): Promise<ImportHealthResponse>; saveAction?(data: FormData, selection: unknown, reviewKey: unknown): Promise<ImportSaveResponse>; persistenceAvailable?: boolean };
export function ImportFlow({ previewAction, validateAction, saveAction, persistenceAvailable }: Props) {
  const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState<Extract<ImportPreviewResponse, { ok: true }> | null>(null);
  const [sheet, setSheet] = useState(0); const [kind, setKind] = useState<DatasetKind | "">(""); const [mapping, setMapping] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState(""); const [time, setTime] = useState(""); const [confirmed, setConfirmed] = useState(false); const [health, setHealth] = useState<Extract<ImportHealthResponse, { ok: true }> | null>(null);
  const [saved, setSaved] = useState<Extract<ImportSaveResponse, { ok: true }> | null>(null);
  const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  function form() { const data = new FormData(); if (file) data.set("file", file); return data; }
  function chooseTable(index: number, chosenKind?: DatasetKind) {
    const table = preview?.previews[index]; if (!table) return;
    const selected = chosenKind ?? table.mapping.datasetKind ?? "";
    setSheet(index); setKind(selected); setConfirmed(false); setHealth(null); setSaved(null); setUnit(""); setTime("");
    setMapping(Object.fromEntries(table.mapping.suggestions.map((item) => [item.sourceHeader, selected && item.canonicalField && (DATASET_FIELDS[selected] as readonly string[]).includes(item.canonicalField) ? item.canonicalField : ""])));
  }
  function upload() {
    if (!file || !/\.(csv|xlsx)$/i.test(file.name)) { setError("Choose a CSV or Excel (.xlsx) file."); return; }
    if (file.size > MAX_IMPORT_FILE_BYTES) { setError("This file exceeds the 5 MB limit."); return; }
    startTransition(async () => {
      try { const response = await previewAction(form()); if (!response.ok) { setError(response.message); return; }
        setPreview(response); setSheet(0); const table = response.previews[0]; const selected = table.mapping.datasetKind ?? "";
        setKind(selected); setUnit(""); setTime(""); setMapping(Object.fromEntries(table.mapping.suggestions.map((item) => [item.sourceHeader, selected && item.canonicalField && (DATASET_FIELDS[selected] as readonly string[]).includes(item.canonicalField) ? item.canonicalField : ""]))); setConfirmed(false); setHealth(null); setSaved(null); setError("");
      } catch { setError("The file could not be previewed. Please try again."); }
    });
  }
  function selection() {
    const defaults: Record<string, string> = {};
    if (unit) defaults[kind === "inventory" ? "unit" : "quantityUnit"] = unit;
    if (time && kind !== "orders") defaults.updatedAt = time;
    return { sheetIndex: sheet, datasetKind: kind, confirmed: true, assignments: Object.entries(mapping).filter(([, target]) => target).map(([sourceHeader, canonicalField]) => ({ sourceHeader, canonicalField })), defaults };
  }
  function save() {
    if (!saveAction || !health || !confirmed || pending || saved) return;
    startTransition(async () => {
      try { const response = await saveAction(form(), selection(), health.reviewKey); if (!response.ok) { setError(response.message); return; } setSaved(response); setError(""); }
      catch { setError("The data could not be saved. Review the storage configuration and try again."); }
    });
  }
  function validate() {
    if (!kind) { setError("Choose the data type before confirming mapping."); return; }
    if (!confirmed) { setError("Confirm your mapping before checking the data."); return; }
    startTransition(async () => {
      try { const response = await validateAction(form(), selection());
        if (!response.ok) { setError(response.message); return; } setHealth(response); setSaved(null); setError("");
      } catch { setError("The data could not be checked. Please review your mapping."); }
    });
  }
  const table = preview?.previews[sheet];
  return <><header className="page-heading"><p className="eyebrow">Use your data</p><h1>Upload and review</h1><p>Preview a file, confirm its columns, and see which rows are ready.</p></header>
    <section className="panel"><h2>Upload File</h2><label htmlFor="upload-file">CSV or Excel file</label><input id="upload-file" type="file" accept=".csv,.xlsx" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); setHealth(null); setSaved(null); setConfirmed(false); }} /><p className="muted">Maximum file size: 5 MB · up to 5,000 rows</p><button onClick={upload} disabled={!file || pending}>Import Preview</button></section>
    {pending && <p role="status">Checking your file...</p>}{error && <p className="notice" role="alert">{error}</p>}
    {table && <section className="panel"><h2>Import Preview</h2><p>{table.sourceName} · {table.rowCount} data rows</p>
      {preview!.previews.length > 1 && <><label htmlFor="sheet">Sheet to review</label><select id="sheet" value={sheet} onChange={(event) => chooseTable(Number(event.target.value))}>{preview!.previews.map((item, index) => <option key={index} value={index}>{item.sheetName ?? item.sourceName}</option>)}</select></>}
      <p>Detected columns: {table.headers.join(", ")}</p><p>Suggested data type: {table.suggestedDatasetKind ?? "Please choose"}</p>
      <label htmlFor="dataset-kind">Data type</label><select id="dataset-kind" value={kind} onChange={(event) => chooseTable(sheet, event.target.value as DatasetKind)}><option value="" disabled>Choose data type</option><option value="orders">Orders</option><option value="production">Production</option><option value="inventory">Inventory</option></select>
      <h2>Review Mapping</h2><p>Your column → BukuLokal field. Suggestions require your confirmation.</p>
      <div className="mapping-grid">{table.headers.map((header) => <label key={header}>{header}<select aria-label={`Map ${header}`} value={mapping[header] ?? ""} onChange={(event) => { setMapping({ ...mapping, [header]: event.target.value }); setConfirmed(false); setHealth(null); setSaved(null); }}><option value="">Leave unmapped</option>{(kind ? DATASET_FIELDS[kind] : []).map((field) => <option key={field} value={field}>{FIELD_LABELS[field]}</option>)}</select></label>)}</div>
      <label htmlFor="default-unit">Explicit default quantity unit (only when no column is mapped)</label><select id="default-unit" value={unit} onChange={(event) => { setUnit(event.target.value); setConfirmed(false); setHealth(null); setSaved(null); }}><option value="">Use mapped unit</option><option value="pcs">pcs</option><option value="kg">kg</option><option value="unit">unit</option></select>
      {kind !== "orders" && <><label htmlFor="default-time">Explicit default update time (only when no column is mapped)</label><input id="default-time" value={time} placeholder="YYYY-MM-DDTHH:mm:ssZ" onChange={(event) => { setTime(event.target.value); setConfirmed(false); setHealth(null); setSaved(null); }} /></>}
      <label className="check-label"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I confirm these mappings and explicit defaults.</label><button onClick={validate} disabled={!kind || !confirmed || pending}>Confirm Mapping and Check Data</button>
    </section>}
    {health && <section className="panel" aria-live="polite"><h2>Data Health</h2><p className="health-count">{health.result.summary.validRows} rows ready · {health.result.summary.invalidRows} rows need attention</p>{!saved && <p className="muted">These records are not saved or added to the demo dashboard.</p>}
      {saveAction && <><p>Save only the valid records after reviewing Data Health. Existing records and issue history will not be replaced.</p><button className="primary" onClick={save} disabled={pending || !!saved || !confirmed || health.result.summary.validRows === 0 || persistenceAvailable === false}>Save Valid Data</button>{persistenceAvailable === false && <p role="status">Storage is not configured. You can review data health, but saving is unavailable.</p>}</>}
      {saved && <div className="notice" role="status"><p>{saved.savedRecords} valid records saved · {saved.invalidRows} invalid rows were not saved</p><p>{saved.message}</p></div>}
      {health.result.errors.length > 0 && <div className="table-scroll"><table><thead><tr><th>Row</th><th>Field</th><th>Problem</th></tr></thead><tbody>{health.result.errors.map((item, index) => <tr key={index}><td>{item.rowNumber}</td><td>{FIELD_LABELS[item.canonicalField ?? ""] ?? item.sourceField ?? "Record"}</td><td>{item.humanReadableMessage}</td></tr>)}</tbody></table></div>}
    </section>}</>;
}
