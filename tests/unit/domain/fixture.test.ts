import { describe, expect, it } from "vitest";
import { DemoDatasetSchema, abcApparelDataset as dataset } from "../../../src/domain";

describe("ABC Apparel canonical synthetic fixture", () => {
  it("parses without changing source data", () => {
    expect(DemoDatasetSchema.parse(dataset)).toEqual(dataset);
  });
  it("fixes the fictional organization, date, and record inventory", () => {
    expect(dataset.asOfDate).toBe("2026-10-12");
    expect(dataset.organization).toEqual({
      id: "ORG-001", name: "ABC Apparel Manufacturing", industry: "light_manufacturing",
      timezone: "Asia/Jakarta", currency: "IDR",
    });
    expect(dataset.orders).toHaveLength(12);
    expect(dataset.productionJobs).toHaveLength(12);
    expect(dataset.inventoryItems).toHaveLength(12);
    expect(dataset.dataSources).toHaveLength(1);
    expect(dataset.importSessions).toHaveLength(1);
    expect(dataset.dataSources[0].type).toBe("synthetic_demo");
    expect(dataset.dataSources[0].readOnly).toBe(true);
  });
  it("preserves the exact SO-001 raw scenario", () => {
    expect(dataset.orders.find((row) => row.id === "SO-001")).toEqual({
      id: "SO-001", organizationId: "ORG-001", customerName: "Synthetic Customer 01",
      productName: "Classic T-Shirt", orderedQuantity: 500, quantityUnit: "pcs",
      dueDate: "2026-10-14", status: "in_production", sourceId: "IMPORT-001",
    });
    expect(dataset.productionJobs.find((row) => row.orderId === "SO-001")).toMatchObject({
      plannedQuantity: 500, completedQuantity: 150, quantityUnit: "pcs",
    });
    expect(dataset.inventoryItems.find((row) => row.relatedOrderId === "SO-001")).toMatchObject({
      materialName: "Fabric A", requiredQuantity: 500, availableQuantity: 300, unit: "pcs",
    });
  });
  it("keeps IDs unique within every entity collection", () => {
    for (const rows of [dataset.orders, dataset.productionJobs, dataset.inventoryItems,
      dataset.dataSources, dataset.importSessions]) {
      expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    }
  });
  it("references the existing organization in every organization-scoped record", () => {
    for (const row of [...dataset.orders, ...dataset.productionJobs, ...dataset.inventoryItems,
      ...dataset.dataSources, ...dataset.importSessions, ...dataset.auditEvents]) {
      expect(row.organizationId).toBe(dataset.organization.id);
    }
  });
  it("references existing orders with matching organization and quantities", () => {
    for (const job of dataset.productionJobs) {
      const order = dataset.orders.find((row) => row.id === job.orderId);
      expect(order).toBeDefined();
      expect(job.organizationId).toBe(order?.organizationId);
      expect(job.plannedQuantity).toBe(order?.orderedQuantity);
      expect(job.quantityUnit).toBe(order?.quantityUnit);
    }
    for (const order of dataset.orders) {
      expect(dataset.productionJobs.filter((row) => row.orderId === order.id)).toHaveLength(1);
    }
    for (const item of dataset.inventoryItems) {
      if (item.relatedOrderId != null) {
        const order = dataset.orders.find((row) => row.id === item.relatedOrderId);
        expect(order).toBeDefined();
        expect(item.organizationId).toBe(order?.organizationId);
      }
    }
  });
  it("links import sessions to matching sources and order provenance", () => {
    for (const session of dataset.importSessions) {
      const source = dataset.dataSources.find((row) => row.id === session.dataSourceId);
      expect(source).toBeDefined();
      expect(source?.organizationId).toBe(session.organizationId);
      expect(source?.type).toBe(session.sourceType);
    }
    for (const order of dataset.orders) {
      const session = dataset.importSessions.find((row) => row.id === order.sourceId);
      expect(session).toBeDefined();
      expect(session?.organizationId).toBe(order.organizationId);
    }
  });
  it("retains varied raw production, deadline, and inventory values", () => {
    expect(dataset.productionJobs.some((row) => row.completedQuantity === 0)).toBe(true);
    expect(dataset.productionJobs.some((row) => row.completedQuantity === 40 && row.plannedQuantity === 400)).toBe(true);
    expect(dataset.productionJobs.some((row) => row.completedQuantity === 120 && row.plannedQuantity === 300)).toBe(true);
    expect(dataset.productionJobs.some((row) => row.completedQuantity === 95 && row.plannedQuantity === 100)).toBe(true);
    const completed = dataset.orders.find((row) => row.status === "completed");
    expect(completed).toBeDefined();
    const job = dataset.productionJobs.find((row) => row.orderId === completed?.id);
    expect(job?.completedQuantity).toBe(job?.plannedQuantity);
    expect(dataset.orders.some((row) => row.dueDate === "2026-10-13")).toBe(true);
    expect(dataset.orders.some((row) => row.dueDate === "2026-11-02")).toBe(true);
    expect(dataset.inventoryItems.some((row) => row.availableQuantity === 0 && row.requiredQuantity > 0)).toBe(true);
    expect(dataset.inventoryItems.some((row) => row.availableQuantity < row.requiredQuantity)).toBe(true);
    expect(dataset.inventoryItems.some((row) => row.availableQuantity > row.requiredQuantity)).toBe(true);
    expect(dataset.inventoryItems.some((row) => row.availableQuantity === row.requiredQuantity)).toBe(true);
  });
  it("leaves downstream output collections empty", () => {
    for (const rows of [dataset.issues, dataset.evidence, dataset.aiAnalyses, dataset.actions, dataset.auditEvents]) {
      expect(rows).toEqual([]);
    }
  });
  it("contains no derived fields at any depth", () => {
    const forbidden = new Set([
      "completionPercentage", "remainingProduction", "materialShortage", "daysToDeadline",
      "riskScore", "riskLevel", "issueSeverity", "recommendedAction",
    ]);
    function inspect(value: unknown) {
      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          expect(forbidden.has(key), key).toBe(false);
          inspect(child);
        }
      }
    }
    inspect(dataset);
  });
  it("uses fictional identities and explicit Jakarta timestamp offsets", () => {
    for (const row of dataset.orders) expect(row.customerName).toMatch(/^Synthetic Customer \d{2}$/);
    for (const row of [...dataset.productionJobs, ...dataset.inventoryItems]) {
      expect(row.updatedAt).toBe("2026-10-12T08:00:00+07:00");
    }
    expect(dataset.dataSources[0].createdAt).toBe("2026-10-12T08:00:00+07:00");
    expect(dataset.importSessions[0].importedAt).toBe("2026-10-12T08:00:00+07:00");
  });
});
