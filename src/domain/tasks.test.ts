import { describe, expect, it } from "vitest";
import type { Task } from "./model";
import { daysUntil, dueThisWeek, formatDueLabel, plannedMinutes, sortTasks, todayKey } from "./tasks";

const task = (changes: Partial<Task> = {}): Task => ({
  id: "task-1", title: "Test", module: "Statistik", type: "assignment",
  dueDate: "2026-09-10", estimateMinutes: 60, priority: "medium", status: "open",
  notes: "", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z", ...changes,
});

describe("task domain", () => {
  const now = new Date("2026-09-10T08:00:00+02:00");

  it("creates a locale-safe date key", () => expect(todayKey(now)).toBe("2026-09-10"));
  it("calculates calendar days without UTC drift", () => expect(daysUntil("2026-09-11", now)).toBe(1));
  it("uses human due labels", () => {
    expect(formatDueLabel("2026-09-10", now)).toBe("Heute");
    expect(formatDueLabel("2026-09-11", now)).toBe("Morgen");
    expect(formatDueLabel("2026-09-09", now)).toContain("überfällig");
  });
  it("sorts open tasks ahead of completed tasks and then by date", () => {
    const sorted = sortTasks([task({ id: "done", status: "done" }), task({ id: "later", dueDate: "2026-09-12" }), task({ id: "first", dueDate: "2026-09-11" })]);
    expect(sorted.map((entry) => entry.id)).toEqual(["first", "later", "done"]);
  });
  it("finds only open tasks due during the next seven days", () => {
    expect(dueThisWeek([task(), task({ id: "later", dueDate: "2026-09-18" }), task({ id: "done", status: "done" })], now)).toHaveLength(1);
  });
  it("sums estimates for open tasks only", () => expect(plannedMinutes([task(), task({ id: "two", estimateMinutes: 30 }), task({ id: "done", status: "done", estimateMinutes: 999 })])).toBe(90));
});
