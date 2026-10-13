import { suggestMapping } from "./mapping";
import type { DatasetKind, RawTable } from "./types";

export function createImportPreview(table: RawTable, chosenKind?: DatasetKind) {
  const mapping = suggestMapping(table, chosenKind);
  return {
    sourceName: table.sourceName, sheetName: table.sheetName,
    rowCount: table.rows.length, headers: [...table.headers],
    suggestedDatasetKind: mapping.datasetKind, mapping,
    mappingWarnings: [
      ...(mapping.datasetKind === null ? [{ errorCode: "AMBIGUOUS_DATASET_KIND" as const, humanReadableMessage: "Dataset kind is ambiguous or lacks sufficient header coverage; choose it explicitly." }] : []),
      ...(mapping.missingRequiredFields.length ? [{ errorCode: "MAPPING_INCOMPLETE" as const, humanReadableMessage: "Required fields need confirmed mappings or authorized explicit defaults." }] : []),
      ...(mapping.ambiguousMappings.length ? [{ errorCode: "MAPPING_CONFLICT" as const, humanReadableMessage: "Mapping conflicts must be resolved before confirmation." }] : []),
    ],
  };
}
