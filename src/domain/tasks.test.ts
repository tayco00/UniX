import { describe, expect, it } from "vitest";
import type { Task } from "./model";
import {
  daysUntil,
  dueThisWeek,
  formatDueLabel,
  plannedMinutes,
  sortTasks,
  todayKey,
} from "./tasks";

const task = (changes: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Test",
  module: "Statistik",
  type: "assignment",
  dueDate: "2026-09-10",
  estimateMinutes: 60,
  priority: "medium",
  status: "open",
  notes: "",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
  ...changes,
});

describe("task domain", () => {
  const now = new Date("2026-09-10T08:00:00+02:00");

  it("creates a locale-safe date key", () =>
    expect(todayKey(now)).toBe("2026-09-10"));
  it("calculates calendar days without UTC drift", () =>
    expect(daysUntil("2026-09-11", now)).toBe(1));
  it("uses human due labels", () => {
    expect(formatDueLabel("2026-09-10", now)).toBe("Heute");
    expect(formatDueLabel("2026-09-11", now)).toBe("Morgen");
    expect(formatDueLabel("2026-09-09", now)).toContain("überfällig");
  });
  it("sorts open tasks ahead of completed tasks and then by date", () => {
    const sorted = sortTasks([
      task({ id: "done", status: "done" }),
      task({ id: "later", dueDate: "2026-09-12" }),
      task({ id: "first", dueDate: "2026-09-11" }),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual(["first", "later", "done"]);
  });
  it("counts today through Sunday, excluding next Monday and overdue dates", () => {
    expect(
      dueThisWeek(
        [
          task(),
          task({ id: "sunday", dueDate: "2026-09-13" }),
          task({ id: "monday", dueDate: "2026-09-14" }),
          task({ id: "overdue", dueDate: "2026-09-09" }),
          task({ id: "done", status: "done" }),
        ],
        now,
      ).map((entry) => entry.id),
    ).toEqual(["task-1", "sunday"]);
    expect(
      dueThisWeek(
        [
          task({ dueDate: "2026-09-13" }),
          task({ id: "next", dueDate: "2026-09-14" }),
        ],
        new Date("2026-09-13T12:00:00"),
      ),
    ).toHaveLength(1);
  });
  it("includes the year for deadlines in another year", () => {
    expect(formatDueLabel("2027-01-15", now)).toContain("2027");
  });
  it("sums estimates for open tasks only", () =>
    expect(
      plannedMinutes([
        task(),
        task({ id: "two", estimateMinutes: 30 }),
        task({ id: "done", status: "done", estimateMinutes: 999 }),
      ]),
    ).toBe(90));
});
