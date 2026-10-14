// Fresh synthetic fixture generator; never reads real business data.
import ExcelJS from "exceljs";
import { fileURLToPath } from "node:url";
const book = new ExcelJS.Workbook();
book.created = new Date("2026-10-12T00:00:00Z");
book.modified = new Date("2026-10-12T00:00:00Z");
const orders = book.addWorksheet("Orders");
orders.getRow(3).values = ["No PO", "Customer", "Nama Barang", "Jumlah", "Deadline", "Status"];
orders.getRow(4).values = ["SO-IMPORT-001", "Synthetic Customer A", "Classic T-Shirt", 500, new Date("2026-10-14T00:00:00Z"), "in production"];
orders.getCell("E4").numFmt = "yyyy-mm-dd";
orders.getRow(12).values = ["", "", ""];
const production = book.addWorksheet("Production");
production.addRow(["Job ID", "Order No", "Planned Qty", "Completed Qty"]);
production.addRow(["PJ-IMPORT-001", "SO-IMPORT-001", 500, 150]);
const inventory = book.addWorksheet("Inventory");
inventory.addRow(["Material ID", "Nama Bahan", "Stok Tersedia", "Kebutuhan Bahan", "No PO"]);
inventory.addRow(["MAT-IMPORT-001", "Fabric A", 300, 500, "SO-IMPORT-001"]);
book.addWorksheet("Empty");
await book.xlsx.writeFile(fileURLToPath(new URL("./manufacturing.xlsx", import.meta.url)));
