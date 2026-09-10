import { describe, expect, it } from "vitest";
import { appDataSchema, emptyAppData, taskSchema } from "./model";

describe("data contracts", () => {
  it("accepts the canonical empty state", () => expect(appDataSchema.parse(emptyAppData()).version).toBe(1));
  it("rejects unknown data versions", () => expect(() => appDataSchema.parse({ ...emptyAppData(), version: 2 })).toThrow());
  it("rejects invalid themes", () => expect(() => appDataSchema.parse({ ...emptyAppData(), settings: { theme: "neon", weekStartsOn: 1 } })).toThrow());
  it("rejects empty task titles", () => expect(() => taskSchema.parse({ id: "1", title: "", module: "", type: "study", dueDate: "2026-09-10", estimateMinutes: 60, priority: "medium", status: "open", notes: "", createdAt: "now", updatedAt: "now" })).toThrow());
  it("rejects implausible task durations", () => expect(() => taskSchema.parse({ id: "1", title: "Lernen", module: "", type: "study", dueDate: "2026-09-10", estimateMinutes: 1441, priority: "medium", status: "open", notes: "", createdAt: "now", updatedAt: "now" })).toThrow());
});
