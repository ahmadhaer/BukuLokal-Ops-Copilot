import { describe, expect, it } from "vitest";
import {
  ActionSchema, AIAnalysisSchema, AuditEventSchema, CurrencyCodeSchema,
  DataSourceSchema, DateOnlySchema, DemoDatasetSchema, EntityIdSchema,
  EvidenceSchema, ImportSessionSchema, InventoryItemSchema, IssueSchema,
  OrderSchema, OrganizationSchema, ProductionJobSchema, QuantitySchema,
  QuantityUnitSchema, TimestampSchema, abcApparelDataset,
} from "../../../src/domain";

const order = abcApparelDataset.orders[0];
const production = abcApparelDataset.productionJobs[0];
const inventory = abcApparelDataset.inventoryItems[0];
const time = "2026-10-12T08:00:00+07:00";
const issue = {
  id: "ISS-TEST", organizationId: "ORG-001", orderId: "SO-001",
  type: "order_delay_risk", severity: "critical", status: "open",
  evidenceIds: ["EV-TEST"], detectedAt: time,
};
const evidence = {
  id: "EV-TEST", issueId: "ISS-TEST", type: "production_completion", value: 1,
  unit: "pcs", sourceEntityType: "production_job", sourceEntityId: "PJ-001",
};
const analysis = {
  id: "AI-TEST", issueId: "ISS-TEST", model: "test-model", promptVersion: "v1",
  output: { nested: { values: [null, true, 1, "text"] } }, evidenceRefs: ["EV-TEST"], createdAt: time,
};
const action = {
  id: "ACT-TEST", issueId: "ISS-TEST", type: "supplier_followup_draft",
  status: "suggested", draft: "Synthetic test draft", approvedBy: null,
  approvedAt: null, createdAt: time,
};
const audit = {
  id: "AUD-TEST", organizationId: "ORG-001", actor: "synthetic_fixture",
  event: "dataset_initialized", entityType: "import_session", entityId: "IMPORT-001", timestamp: time,
};

describe("canonical entity contracts", () => {
  it.each([
    ["Organization", OrganizationSchema, abcApparelDataset.organization],
    ["DataSource", DataSourceSchema, abcApparelDataset.dataSources[0]],
    ["ImportSession", ImportSessionSchema, abcApparelDataset.importSessions[0]],
    ["Order", OrderSchema, order], ["ProductionJob", ProductionJobSchema, production],
    ["InventoryItem", InventoryItemSchema, inventory], ["Issue", IssueSchema, issue],
    ["Evidence", EvidenceSchema, evidence], ["AIAnalysis", AIAnalysisSchema, analysis],
    ["Action", ActionSchema, action], ["AuditEvent", AuditEventSchema, audit],
    ["DemoDataset", DemoDatasetSchema, abcApparelDataset],
  ])("accepts valid %s data", (_name, schema, value) => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each([-1, 0, NaN, Infinity, -Infinity, "500"])("rejects invalid order quantity %s", (quantity) => {
    expect(OrderSchema.safeParse({ ...order, orderedQuantity: quantity }).success).toBe(false);
  });
  it.each(["14/10/2026", "2026-1-14", "2026-02-30", "2026-10-14T00:00:00Z"])("rejects invalid deadline %s", (dueDate) => {
    expect(OrderSchema.safeParse({ ...order, dueDate }).success).toBe(false);
  });
  it.each(["availableQuantity", "requiredQuantity"])("rejects negative and nonfinite inventory %s", (field) => {
    for (const quantity of [-1, NaN, Infinity]) {
      expect(InventoryItemSchema.safeParse({ ...inventory, [field]: quantity }).success).toBe(false);
    }
  });
  it("enforces production integrity without deriving completion", () => {
    for (const invalid of [
      { plannedQuantity: 0 }, { plannedQuantity: -1 }, { plannedQuantity: Infinity },
      { completedQuantity: -1 }, { completedQuantity: NaN }, { completedQuantity: 501 },
    ]) expect(ProductionJobSchema.safeParse({ ...production, ...invalid }).success).toBe(false);
    expect(ProductionJobSchema.safeParse({ ...production, completedQuantity: 0 }).success).toBe(true);
    expect(ProductionJobSchema.safeParse({ ...production, completedQuantity: 500 }).success).toBe(true);
    const result = ProductionJobSchema.safeParse({ ...production, completedQuantity: 501 });
    if (!result.success) expect(result.error.issues[0].path).toEqual(["completedQuantity"]);
  });
  it.each([undefined, null, "SO-001"])("allows optional inventory correlation %s", (relatedOrderId) => {
    expect(InventoryItemSchema.safeParse({ ...inventory, relatedOrderId }).success).toBe(true);
  });
  it.each([
    [OrderSchema, { ...order, status: "at_risk" }],
    [ImportSessionSchema, { ...abcApparelDataset.importSessions[0], status: "unknown" }],
    [DataSourceSchema, { ...abcApparelDataset.dataSources[0], type: "erp" }],
    [IssueSchema, { ...issue, status: "pending" }],
    [IssueSchema, { ...issue, severity: "urgent" }],
    [IssueSchema, { ...issue, type: "payment_risk" }],
    [ActionSchema, { ...action, status: "sent" }],
  ])("rejects unsupported vocabulary %#", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
  it("rejects undeclared derived fields instead of silently stripping them", () => {
    expect(OrderSchema.safeParse({ ...order, riskLevel: "critical" }).success).toBe(false);
    expect(InventoryItemSchema.safeParse({ ...inventory, materialShortage: 200 }).success).toBe(false);
    expect(DemoDatasetSchema.safeParse({ ...abcApparelDataset, dashboard: {} }).success).toBe(false);
  });
  it.each([undefined, () => 1, new Date("2026-10-12T00:00:00Z"), Infinity, BigInt(1)])("rejects non-JSON AI metadata %#", (value) => {
    expect(AIAnalysisSchema.safeParse({ ...analysis, output: { value } }).success).toBe(false);
  });
  it.each([1, "synthetic fact", false])("accepts supported evidence value %s", (value) => {
    expect(EvidenceSchema.safeParse({ ...evidence, value }).success).toBe(true);
  });
  it("rejects nonfinite evidence and malformed entity timestamps", () => {
    expect(EvidenceSchema.safeParse({ ...evidence, value: Infinity }).success).toBe(false);
    expect(ProductionJobSchema.safeParse({ ...production, updatedAt: "yesterday" }).success).toBe(false);
    expect(ActionSchema.safeParse({ ...action, approvedAt: "2026-13-12T00:00:00Z" }).success).toBe(false);
  });
});

describe("shared value contracts", () => {
  it.each(["2026-10-12T15:00:00Z", "2026-10-12T08:00:00+07:00"])("accepts explicit timestamp %s", (value) => {
    expect(TimestampSchema.safeParse(value).success).toBe(true);
  });
  it.each(["yesterday", "2026-10-12", "2026-10-12T08:00:00", "2026-02-30T08:00:00Z"])("rejects malformed timestamp %s", (value) => {
    expect(TimestampSchema.safeParse(value).success).toBe(false);
  });
  it("accepts real leap dates and rejects empty or malformed common values", () => {
    expect(DateOnlySchema.safeParse("2024-02-29").success).toBe(true);
    expect(DateOnlySchema.safeParse("2026-02-29").success).toBe(false);
    expect(EntityIdSchema.safeParse(" ").success).toBe(false);
    expect(EntityIdSchema.safeParse("SO 001").success).toBe(false);
    expect(QuantityUnitSchema.safeParse(" ").success).toBe(false);
    expect(CurrencyCodeSchema.safeParse("IDR").success).toBe(true);
    expect(CurrencyCodeSchema.safeParse("idr").success).toBe(false);
    expect(QuantitySchema.safeParse(0).success).toBe(true);
    expect(QuantitySchema.safeParse(Infinity).success).toBe(false);
    expect(OrganizationSchema.safeParse({ ...abcApparelDataset.organization, timezone: "not/a/timezone" }).success).toBe(false);
  });
});
