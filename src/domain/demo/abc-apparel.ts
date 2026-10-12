import type { DemoDataset } from "./schema";

// Entirely fictional source data. Fixed business dates and explicit Jakarta offsets.
// No randomness, runtime clock, or derived operational facts.
export const abcApparelDataset = {
  "asOfDate": "2026-10-12",
  "organization": {
    "id": "ORG-001",
    "name": "ABC Apparel Manufacturing",
    "industry": "light_manufacturing",
    "timezone": "Asia/Jakarta",
    "currency": "IDR"
  },
  "dataSources": [
    {
      "id": "DS-001",
      "organizationId": "ORG-001",
      "type": "synthetic_demo",
      "name": "Synthetic ABC Apparel Demo",
      "readOnly": true,
      "createdAt": "2026-10-12T08:00:00+07:00"
    }
  ],
  "importSessions": [
    {
      "id": "IMPORT-001",
      "organizationId": "ORG-001",
      "dataSourceId": "DS-001",
      "sourceType": "synthetic_demo",
      "status": "validated",
      "importedAt": "2026-10-12T08:00:00+07:00"
    }
  ],
  "orders": [
    {
      "id": "SO-001",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 01",
      "productName": "Classic T-Shirt",
      "orderedQuantity": 500,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-14",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-002",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 02",
      "productName": "Synthetic Hoodie",
      "orderedQuantity": 200,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-30",
      "status": "planned",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-003",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 03",
      "productName": "Synthetic Polo",
      "orderedQuantity": 300,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-15",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-004",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 04",
      "productName": "Synthetic Apron",
      "orderedQuantity": 100,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-13",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-005",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 05",
      "productName": "Synthetic Tote",
      "orderedQuantity": 80,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-12",
      "status": "completed",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-006",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 06",
      "productName": "Synthetic Uniform",
      "orderedQuantity": 400,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-20",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-007",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 07",
      "productName": "Synthetic Jacket",
      "orderedQuantity": 120,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-16",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-008",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 08",
      "productName": "Synthetic Cap",
      "orderedQuantity": 600,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-14",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-009",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 09",
      "productName": "Synthetic Shorts",
      "orderedQuantity": 250,
      "quantityUnit": "pcs",
      "dueDate": "2026-11-02",
      "status": "planned",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-010",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 10",
      "productName": "Synthetic Scarf",
      "orderedQuantity": 150,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-18",
      "status": "on_hold",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-011",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 11",
      "productName": "Synthetic Vest",
      "orderedQuantity": 90,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-25",
      "status": "cancelled",
      "sourceId": "IMPORT-001"
    },
    {
      "id": "SO-012",
      "organizationId": "ORG-001",
      "customerName": "Synthetic Customer 12",
      "productName": "Synthetic Shirt",
      "orderedQuantity": 350,
      "quantityUnit": "pcs",
      "dueDate": "2026-10-19",
      "status": "in_production",
      "sourceId": "IMPORT-001"
    }
  ],
  "productionJobs": [
    {
      "id": "PJ-001",
      "organizationId": "ORG-001",
      "orderId": "SO-001",
      "plannedQuantity": 500,
      "completedQuantity": 150,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-002",
      "organizationId": "ORG-001",
      "orderId": "SO-002",
      "plannedQuantity": 200,
      "completedQuantity": 0,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-003",
      "organizationId": "ORG-001",
      "orderId": "SO-003",
      "plannedQuantity": 300,
      "completedQuantity": 120,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-004",
      "organizationId": "ORG-001",
      "orderId": "SO-004",
      "plannedQuantity": 100,
      "completedQuantity": 95,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-005",
      "organizationId": "ORG-001",
      "orderId": "SO-005",
      "plannedQuantity": 80,
      "completedQuantity": 80,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-006",
      "organizationId": "ORG-001",
      "orderId": "SO-006",
      "plannedQuantity": 400,
      "completedQuantity": 40,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-007",
      "organizationId": "ORG-001",
      "orderId": "SO-007",
      "plannedQuantity": 120,
      "completedQuantity": 60,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-008",
      "organizationId": "ORG-001",
      "orderId": "SO-008",
      "plannedQuantity": 600,
      "completedQuantity": 590,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-009",
      "organizationId": "ORG-001",
      "orderId": "SO-009",
      "plannedQuantity": 250,
      "completedQuantity": 0,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-010",
      "organizationId": "ORG-001",
      "orderId": "SO-010",
      "plannedQuantity": 150,
      "completedQuantity": 50,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-011",
      "organizationId": "ORG-001",
      "orderId": "SO-011",
      "plannedQuantity": 90,
      "completedQuantity": 0,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "PJ-012",
      "organizationId": "ORG-001",
      "orderId": "SO-012",
      "plannedQuantity": 350,
      "completedQuantity": 200,
      "quantityUnit": "pcs",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    }
  ],
  "inventoryItems": [
    {
      "id": "MAT-001",
      "organizationId": "ORG-001",
      "materialName": "Fabric A",
      "availableQuantity": 300,
      "requiredQuantity": 500,
      "unit": "pcs",
      "relatedOrderId": "SO-001",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-002",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Fleece B",
      "availableQuantity": 300,
      "requiredQuantity": 200,
      "unit": "pcs",
      "relatedOrderId": "SO-002",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-003",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Knit C",
      "availableQuantity": 200,
      "requiredQuantity": 300,
      "unit": "pcs",
      "relatedOrderId": "SO-003",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-004",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Canvas D",
      "availableQuantity": 100,
      "requiredQuantity": 100,
      "unit": "pcs",
      "relatedOrderId": "SO-004",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-005",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Canvas E",
      "availableQuantity": 100,
      "requiredQuantity": 80,
      "unit": "pcs",
      "relatedOrderId": "SO-005",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-006",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Twill F",
      "availableQuantity": 0,
      "requiredQuantity": 400,
      "unit": "pcs",
      "relatedOrderId": "SO-006",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-007",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Shell G",
      "availableQuantity": 90,
      "requiredQuantity": 120,
      "unit": "pcs",
      "relatedOrderId": "SO-007",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-008",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Cotton H",
      "availableQuantity": 650,
      "requiredQuantity": 600,
      "unit": "pcs",
      "relatedOrderId": "SO-008",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-009",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Jersey I",
      "availableQuantity": 250,
      "requiredQuantity": 250,
      "unit": "pcs",
      "relatedOrderId": "SO-009",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-010",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Weave J",
      "availableQuantity": 75,
      "requiredQuantity": 150,
      "unit": "pcs",
      "relatedOrderId": "SO-010",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-011",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Lining K",
      "availableQuantity": 0,
      "requiredQuantity": 0,
      "unit": "pcs",
      "relatedOrderId": "SO-011",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    },
    {
      "id": "MAT-012",
      "organizationId": "ORG-001",
      "materialName": "Synthetic Poplin L",
      "availableQuantity": 500,
      "requiredQuantity": 350,
      "unit": "pcs",
      "relatedOrderId": "SO-012",
      "updatedAt": "2026-10-12T08:00:00+07:00"
    }
  ],
  "issues": [],
  "evidence": [],
  "aiAnalyses": [],
  "actions": [],
  "auditEvents": []
} satisfies DemoDataset;
