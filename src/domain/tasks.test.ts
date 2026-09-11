import { describe, expect, it } from "vitest";
import type { Task } from "./model";
import {
  dueLabel,
  minutesLabel,
  openTasks,
  sortTasks,
  weekTasks,
} from "./tasks";

const make = (overrides: Partial<Task> = {}): Task => ({
  id: crypto.randomUUID(),
  title: "Aufgabe",
  course: "Modul",
  type: "assignment",
  dueDate: "2026-09-12",
  estimateMinutes: 60,
  priority: "medium",
  status: "open",
  notes: "",
  createdAt: "2026-09-01",
  updatedAt: "2026-09-01",
  ...overrides,
});

describe("task selectors", () => {
  const now = new Date("2026-09-11T12:00:00");
  it("sorts open tasks before completed tasks", () =>
    expect(
      sortTasks([make({ status: "done" }), make({ id: "open" })])[0].id,
    ).toBe("open"));
  it("sorts by due date", () =>
    expect(
      sortTasks([
        make({ id: "later", dueDate: "2026-09-14" }),
        make({ id: "first", dueDate: "2026-09-12" }),
      ])[0].id,
    ).toBe("first"));
  it("sorts equal dates by priority", () =>
    expect(
      sortTasks([
        make({ id: "low", priority: "low" }),
        make({ id: "high", priority: "high" }),
      ])[0].id,
    ).toBe("high"));
  it("returns only open tasks", () =>
    expect(openTasks([make(), make({ status: "done" })])).toHaveLength(1));
  it.each([
    [0, "Heute"],
    [1, "Morgen"],
    [-1, "Seit gestern fällig"],
    [-3, "Seit 3 Tagen fällig"],
    [4, "In 4 Tagen"],
  ])("formats offset %i", (offset, label) => {
    const date = new Date(2026, 8, 11 + Number(offset));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    expect(dueLabel(key, now)).toBe(label);
  });
  it("limits weekly tasks to seven days", () =>
    expect(
      weekTasks(
        [
          make({ dueDate: "2026-09-11" }),
          make({ dueDate: "2026-09-17" }),
          make({ dueDate: "2026-09-18" }),
        ],
        now,
      ),
    ).toHaveLength(2));
  it.each([
    [0, "Noch nicht geschätzt"],
    [20, "20 Min."],
    [60, "1 Std."],
    [95, "1 Std. 35 Min."],
  ])("formats %i minutes", (minutes, label) =>
    expect(minutesLabel(Number(minutes))).toBe(label),
  );
});
