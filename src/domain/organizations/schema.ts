import { z } from "zod";
import { OrganizationIdSchema, CurrencyCodeSchema } from "../common/schema";

export const OrganizationSchema = z.strictObject({
  id: OrganizationIdSchema,
  name: z.string().min(1),
  industry: z.literal("light_manufacturing"),
  timezone: z.string().min(1).refine((value) => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch { return false; }
  }, "Valid timezone required"),
  currency: CurrencyCodeSchema,
});

export type Organization = z.infer<typeof OrganizationSchema>;
