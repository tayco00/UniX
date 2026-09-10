import { z } from "zod";

export const taskTypeSchema = z.enum(["exam", "assignment", "study", "admin"]);
export const prioritySchema = z.enum(["low", "medium", "high"]);
export const taskStatusSchema = z.enum(["open", "done"]);

export const profileSchema = z.object({
  name: z.string().trim().max(80),
  university: z.string().trim().max(120),
  studyProgram: z.string().trim().max(120),
  semester: z.string().trim().max(40),
});

export const taskSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(80)
    .refine((id) => id.trim().length > 0),
  title: z.string().trim().min(1).max(140),
  module: z.string().trim().max(100),
  type: taskTypeSchema,
  dueDate: z.iso.date(),
  estimateMinutes: z.number().int().min(0).max(1440),
  priority: prioritySchema,
  status: taskStatusSchema,
  notes: z.string().max(2000),
  createdAt: z.string().max(40),
  updatedAt: z.string().max(40),
});

export const appDataSchema = z
  .object({
    version: z.literal(1),
    onboardingCompleted: z.boolean(),
    profile: profileSchema,
    tasks: z
      .array(taskSchema)
      .max(5000)
      .refine(
        (tasks) => new Set(tasks.map((task) => task.id)).size === tasks.length,
        "Aufgaben-IDs müssen eindeutig sein",
      ),
    settings: z.object({
      theme: z.enum(["light", "dark", "system"]),
      weekStartsOn: z.union([z.literal(0), z.literal(1)]),
    }),
    updatedAt: z.string().max(40),
  })
  .refine(
    (data) =>
      !data.onboardingCompleted ||
      [
        data.profile.name,
        data.profile.university,
        data.profile.studyProgram,
      ].every((entry) => entry.length > 0),
    "Ein eingerichtetes Profil braucht Name, Hochschule und Studiengang",
  );

export type Task = z.infer<typeof taskSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type AppData = z.infer<typeof appDataSchema>;
export type Theme = AppData["settings"]["theme"];

export type AppInfo = {
  version: string;
  dataPath: string;
  platform: string;
  recoveredFromBackup?: boolean;
};

export const emptyAppData = (): AppData => ({
  version: 1,
  onboardingCompleted: false,
  profile: { name: "", university: "", studyProgram: "", semester: "" },
  tasks: [],
  settings: { theme: "system", weekStartsOn: 1 },
  updatedAt: new Date().toISOString(),
});
