import { z } from "zod";
import { DateOnlySchema } from "../common/schema";
import { OrganizationSchema } from "../organizations/schema";
import { DataSourceSchema } from "../data-sources/schema";
import { ImportSessionSchema } from "../imports/schema";
import { OrderSchema } from "../orders/schema";
import { ProductionJobSchema } from "../production/schema";
import { InventoryItemSchema } from "../inventory/schema";
import { IssueSchema } from "../issues/schema";
import { EvidenceSchema } from "../evidence/schema";
import { AIAnalysisSchema } from "../ai-analysis/schema";
import { ActionSchema } from "../actions/schema";
import { AuditEventSchema } from "../audit/schema";

// Shape validation only; fixture relationships are verified in tests.
export const DemoDatasetSchema = z.strictObject({
  asOfDate: DateOnlySchema,
  organization: OrganizationSchema,
  dataSources: z.array(DataSourceSchema),
  importSessions: z.array(ImportSessionSchema),
  orders: z.array(OrderSchema),
  productionJobs: z.array(ProductionJobSchema),
  inventoryItems: z.array(InventoryItemSchema),
  issues: z.array(IssueSchema),
  evidence: z.array(EvidenceSchema),
  aiAnalyses: z.array(AIAnalysisSchema),
  actions: z.array(ActionSchema),
  auditEvents: z.array(AuditEventSchema),
});

export type DemoDataset = z.infer<typeof DemoDatasetSchema>;
