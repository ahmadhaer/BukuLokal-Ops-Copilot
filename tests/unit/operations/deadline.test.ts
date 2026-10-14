import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateDeadlineFacts } from "../../../src/domain/operations";

describe("calendar deadline facts", () => {
  it.each([
    ["2026-10-12", "2026-10-14", 2], ["2026-10-12", "2026-10-12", 0], ["2026-10-12", "2026-10-11", -1],
    ["2026-10-31", "2026-11-02", 2], ["2026-12-31", "2027-01-01", 1],
    ["2024-02-28", "2024-03-01", 2], ["2024-02-29", "2024-03-01", 1],
    ["1900-02-28", "1900-03-01", 1], ["2000-02-28", "2000-03-01", 2],
    ["0099-12-31", "0100-01-01", 1], ["0000-02-28", "0000-03-01", 2],
  ])("as of %s due %s gives %s calendar days", (asOfDate, dueDate, daysToDeadline) => {
    expect(calculateDeadlineFacts("SO-SYNTHETIC-TEST", dueDate, asOfDate)).toEqual({ orderId: "SO-SYNTHETIC-TEST", dueDate, asOfDate, daysToDeadline });
  });
  it.each(["", "tomorrow", "12/10/26", "2026-02-30", "2026-10-12T00:00:00Z"])("rejects invalid explicit as-of %s", (asOfDate) => {
    expect(() => calculateDeadlineFacts("SO-SYNTHETIC-TEST", "2026-10-14", asOfDate)).toThrowError(expect.objectContaining({ errorCode: "INVALID_AS_OF_DATE" }));
  });
  it("rejects omitted as-of and malformed deadline with controlled errors", () => {
    // @ts-expect-error An explicit as-of argument is mandatory.
    expect(() => calculateDeadlineFacts("SO-SYNTHETIC-TEST", "2026-10-14")).toThrowError(expect.objectContaining({ errorCode: "INVALID_AS_OF_DATE" }));
    expect(() => calculateDeadlineFacts("SO-SYNTHETIC-TEST", "2026-02-29", "2026-10-12")).toThrowError(expect.objectContaining({ errorCode: "INVALID_DUE_DATE" }));
  });
  it("is invariant across runtime timezone selections and DST boundaries", () => {
    const previous = process.env.TZ;
    try {
      for (const timezone of ["UTC", "Asia/Jakarta", "America/New_York", "Pacific/Kiritimati"]) {
        process.env.TZ = timezone;
        expect(calculateDeadlineFacts("SO-SYNTHETIC-TEST", "2026-03-09", "2026-03-07").daysToDeadline).toBe(2);
        expect(calculateDeadlineFacts("SO-SYNTHETIC-TEST", "2026-10-14", "2026-10-12").daysToDeadline).toBe(2);
      }
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
  it("uses numeric civil components with no Date/locale/timezone APIs", () => {
    const source = readFileSync("src/domain/operations/deadline.ts", "utf8");
    expect(source).not.toMatch(/new Date\s*\(|Date\.(now|parse|UTC)|Intl\.|getTimezoneOffset|toLocale/);
    expect(source).toContain('date.split("-").map(Number)');
  });
});
