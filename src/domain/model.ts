import { z } from "zod";

export const taskTypeSchema = z.enum([
  "exam",
  "assignment",
  "study",
  "organization",
  "dining",
]);
export const prioritySchema = z.enum(["low", "medium", "high"]);
export const taskStatusSchema = z.enum(["open", "done"]);

function isDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateKeySchema = z.string().refine(isDateKey, "Ungültiges Datum");

export const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  university: z.string().trim().min(1).max(120),
  courseOfStudy: z.string().trim().min(1).max(120),
  semester: z.string().trim().max(40),
});

export const taskSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(140),
  course: z.string().trim().max(100),
  type: taskTypeSchema,
  dueDate: dateKeySchema,
  estimateMinutes: z.number().int().min(0).max(1440),
  priority: prioritySchema,
  status: taskStatusSchema,
  notes: z.string().trim().max(2000),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const appDataSchema = z
  .object({
    version: z.literal(2),
    setupCompleted: z.boolean(),
    profile: z.object({
      firstName: z.string().trim().max(80),
      university: z.string().trim().max(120),
      courseOfStudy: z.string().trim().max(120),
      semester: z.string().trim().max(40),
    }),
    tasks: z.array(taskSchema).max(5000),
    updatedAt: z.string().min(1),
  })
  .superRefine((data, context) => {
    if (data.setupCompleted) {
      for (const field of [
        "firstName",
        "university",
        "courseOfStudy",
      ] as const) {
        if (!data.profile[field].trim())
          context.addIssue({
            code: "custom",
            path: ["profile", field],
            message: "Pflichtfeld fehlt",
          });
      }
    }
    const ids = new Set<string>();
    data.tasks.forEach((task, index) => {
      if (ids.has(task.id))
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "id"],
          message: "Aufgaben-ID ist nicht eindeutig",
        });
      ids.add(task.id);
    });
  });

export type AppData = z.infer<typeof appDataSchema>;
export type Profile = AppData["profile"];
export type Task = z.infer<typeof taskSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type Priority = z.infer<typeof prioritySchema>;

export const emptyData = (): AppData => ({
  version: 2,
  setupCompleted: false,
  profile: { firstName: "", university: "", courseOfStudy: "", semester: "" },
  tasks: [],
  updatedAt: new Date().toISOString(),
});

export function parseData(value: unknown): AppData {
  return appDataSchema.parse(value);
}

export function migrateData(value: unknown): AppData {
  const current = appDataSchema.safeParse(value);
  if (current.success) return current.data;
  if (!value || typeof value !== "object")
    throw new Error("Ungültige UniX-Daten");
  const old = value as Record<string, unknown>;
  if (old.version !== 1 || !old.profile || !Array.isArray(old.tasks))
    throw new Error("Nicht unterstützte UniX-Daten");
  const profile = old.profile as Record<string, unknown>;
  const migrated = {
    version: 2,
    setupCompleted: old.onboardingCompleted === true,
    profile: {
      firstName:
        typeof profile.name === "string" ? profile.name.split(/\s+/)[0] : "",
      university:
        typeof profile.university === "string" ? profile.university : "",
      courseOfStudy:
        typeof profile.studyProgram === "string" ? profile.studyProgram : "",
      semester: typeof profile.semester === "string" ? profile.semester : "",
    },
    tasks: old.tasks.map((task) => {
      const candidate = task as Record<string, unknown>;
      return {
        ...candidate,
        course: candidate.module ?? "",
        type: candidate.type === "admin" ? "organization" : candidate.type,
      };
    }),
    updatedAt:
      typeof old.updatedAt === "string"
        ? old.updatedAt
        : new Date().toISOString(),
  };
  return appDataSchema.parse(migrated);
}
