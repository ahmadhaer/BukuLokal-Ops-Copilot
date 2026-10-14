import { parseCsv } from "../../connectors/csv/parse-csv";
import { parseXlsx } from "../../connectors/excel/parse-xlsx";
import { ImportError } from "./errors";
import type { ImportFile, RawTable } from "./types";

export async function parseImportFile(file: ImportFile): Promise<RawTable[]> {
  const extension = file.name.toLowerCase().split(".").at(-1);
  if (extension === "csv") return [parseCsv(file)];
  if (extension === "xlsx") return parseXlsx(file);
  throw new ImportError("UNSUPPORTED_FILE_TYPE", "Only .csv and .xlsx files are supported.");
}
