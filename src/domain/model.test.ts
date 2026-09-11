import { describe, expect, it } from "vitest";
import {
  appDataSchema,
  emptyData,
  migrateData,
  taskSchema,
  taskTypeSchema,
} from "./model";

const validTask = {
  id: "1",
  title: "Lernen",
  course: "",
  type: "study" as const,
  dueDate: "2026-09-11",
  estimateMinutes: 60,
  priority: "medium" as const,
  status: "open" as const,
  notes: "",
  createdAt: "x",
  updatedAt: "x",
};

describe("UniX data model", () => {
  it("accepts the empty state", () =>
    expect(appDataSchema.parse(emptyData()).version).toBe(2));
  it.each(["exam", "assignment", "study", "organization", "dining"])(
    "accepts task type %s",
    (type) => expect(taskTypeSchema.parse(type)).toBe(type),
  );
  it("rejects unknown task types", () =>
    expect(() => taskTypeSchema.parse("event")).toThrow());
  it("requires profile fields after setup", () =>
    expect(() =>
      appDataSchema.parse({ ...emptyData(), setupCompleted: true }),
    ).toThrow());
  it("rejects more than 5000 tasks", () =>
    expect(() =>
      appDataSchema.parse({ ...emptyData(), tasks: Array(5001).fill(null) }),
    ).toThrow());
  it("rejects blank titles", () =>
    expect(() =>
      taskSchema.parse({
        ...validTask,
        title: " ",
      }),
    ).toThrow());
  it("rejects effort beyond one day", () =>
    expect(() =>
      taskSchema.parse({
        ...validTask,
        estimateMinutes: 1441,
      }),
    ).toThrow());
  it("rejects impossible calendar dates", () =>
    expect(() =>
      taskSchema.parse({ ...validTask, dueDate: "2026-02-30" }),
    ).toThrow());
  it("rejects duplicate task IDs", () =>
    expect(() =>
      appDataSchema.parse({
        ...emptyData(),
        tasks: [validTask, { ...validTask }],
      }),
    ).toThrow());
  it("migrates a previous UniX profile and task", () => {
    const migrated = migrateData({
      version: 1,
      onboardingCompleted: true,
      profile: {
        name: "Mina Muster",
        university: "TU Berlin",
        studyProgram: "Informatik",
        semester: "3",
      },
      tasks: [
        {
          id: "1",
          title: "Rückmeldung",
          module: "Studium",
          type: "admin",
          dueDate: "2026-09-12",
          estimateMinutes: 10,
          priority: "medium",
          status: "open",
          notes: "",
          createdAt: "x",
          updatedAt: "x",
        },
      ],
      updatedAt: "x",
    });
    expect(migrated.profile.firstName).toBe("Mina");
    expect(migrated.tasks[0]).toMatchObject({
      course: "Studium",
      type: "organization",
    });
  });
});
