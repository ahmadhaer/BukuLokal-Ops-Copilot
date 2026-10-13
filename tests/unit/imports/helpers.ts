import { readFileSync } from "node:fs";
import { parseCsv } from "../../../src/connectors/csv/parse-csv";
import { confirmMapping, suggestMapping } from "../../../src/features/imports/mapping";
import type { DatasetKind, RawTable } from "../../../src/features/imports/types";

export const context = { organizationId: "ORG-TEST", dataSourceId: "DS-TEST", importSessionId: "IMPORT-TEST" };
export const timestamp = "2026-10-12T08:00:00+07:00";
export const csv = (text: string, name = "synthetic.csv") => parseCsv({ name, bytes: new TextEncoder().encode(text) });
export function fixture(name: string) { return readFileSync(`tests/fixtures/imports/${name}`); }
export function confirmed(table: RawTable, datasetKind: DatasetKind, defaults: Record<string, string> = {}) {
  const suggestion = suggestMapping(table, datasetKind);
  return confirmMapping(table, {
    confirmed: true, datasetKind, context, defaults,
    assignments: suggestion.suggestions.filter((item) => item.canonicalField).map((item) => ({ sourceHeader: item.sourceHeader, canonicalField: item.canonicalField })),
  });
}
