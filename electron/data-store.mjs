import { constants } from "node:fs";
import { access, copyFile, mkdir, open, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";

const allowedTypes = new Set([
  "exam",
  "assignment",
  "study",
  "organization",
  "dining",
]);
const allowedPriorities = new Set(["low", "medium", "high"]);
const allowedStatuses = new Set(["open", "done"]);
const maxBytes = 64 * 1024 * 1024;

export const emptyData = () => ({
  version: 2,
  setupCompleted: false,
  profile: { firstName: "", university: "", courseOfStudy: "", semester: "" },
  tasks: [],
  updatedAt: new Date().toISOString(),
});

function text(value, maximum, required = false) {
  return (
    typeof value === "string" &&
    value.length <= maximum &&
    (!required || value.trim().length > 0)
  );
}

function dateKey(value) {
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

export function validate(value) {
  if (
    !value ||
    typeof value !== "object" ||
    value.version !== 2 ||
    typeof value.setupCompleted !== "boolean"
  )
    return false;
  const profile = value.profile;
  if (
    !profile ||
    !text(profile.firstName, 80, value.setupCompleted) ||
    !text(profile.university, 120, value.setupCompleted) ||
    !text(profile.courseOfStudy, 120, value.setupCompleted) ||
    !text(profile.semester, 40)
  )
    return false;
  if (
    !Array.isArray(value.tasks) ||
    value.tasks.length > 5000 ||
    !text(value.updatedAt, 100, true)
  )
    return false;
  const ids = new Set();
  return value.tasks.every((task) => {
    const valid =
      task &&
      text(task.id, 100, true) &&
      !ids.has(task.id) &&
      text(task.title, 140, true) &&
      text(task.course, 100) &&
      allowedTypes.has(task.type) &&
      dateKey(task.dueDate) &&
      Number.isInteger(task.estimateMinutes) &&
      task.estimateMinutes >= 0 &&
      task.estimateMinutes <= 1440 &&
      allowedPriorities.has(task.priority) &&
      allowedStatuses.has(task.status) &&
      text(task.notes, 2000) &&
      text(task.createdAt, 100, true) &&
      text(task.updatedAt, 100, true);
    if (valid) ids.add(task.id);
    return valid;
  });
}

function migrate(value) {
  if (validate(value)) return structuredClone(value);
  if (
    !value ||
    value.version !== 1 ||
    !value.profile ||
    !Array.isArray(value.tasks)
  )
    throw Object.assign(new Error("Ungültige UniX-Daten"), {
      code: "UNIX_INVALID_DATA",
    });
  const migrated = {
    version: 2,
    setupCompleted: value.onboardingCompleted === true,
    profile: {
      firstName:
        typeof value.profile.name === "string"
          ? value.profile.name.trim().split(/\s+/)[0]
          : "",
      university: value.profile.university ?? "",
      courseOfStudy: value.profile.studyProgram ?? "",
      semester: value.profile.semester ?? "",
    },
    tasks: value.tasks.map((task) => ({
      ...task,
      course: task.module ?? "",
      type: task.type === "admin" ? "organization" : task.type,
    })),
    updatedAt: value.updatedAt ?? new Date().toISOString(),
  };
  if (!validate(migrated))
    throw Object.assign(new Error("Ungültige UniX-Daten"), {
      code: "UNIX_INVALID_DATA",
    });
  return migrated;
}

export async function readValidated(path) {
  const handle = await open(path, "r");
  try {
    const stats = await handle.stat();
    if (stats.size > maxBytes)
      throw Object.assign(new Error("Die Sicherung ist zu groß"), {
        code: "UNIX_FILE_TOO_LARGE",
      });
    return migrate(JSON.parse(await handle.readFile("utf8")));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw Object.assign(new Error("Ungültige UniX-Datei"), {
        code: "UNIX_INVALID_DATA",
      });
    throw error;
  } finally {
    await handle.close();
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export class DataStore {
  #path;
  #backup;
  #queue = Promise.resolve();
  recoveredFromBackup = false;
  constructor(path) {
    this.#path = path;
    this.#backup = `${path}.backup`;
  }
  #serial(action) {
    const next = this.#queue.then(action, action);
    this.#queue = next.catch(() => undefined);
    return next;
  }
  load() {
    return this.#serial(async () => {
      this.recoveredFromBackup = false;
      if (!(await exists(this.#path))) return emptyData();
      try {
        return await readValidated(this.#path);
      } catch (mainError) {
        if (!(await exists(this.#backup))) throw mainError;
        const restored = await readValidated(this.#backup);
        this.recoveredFromBackup = true;
        return restored;
      }
    });
  }
  save(value) {
    return this.#serial(async () => {
      const valid = migrate(value);
      await mkdir(dirname(this.#path), { recursive: true });
      if (await exists(this.#path)) {
        try {
          await readValidated(this.#path);
          await copyFile(this.#path, this.#backup);
        } catch {
          /* never back up corrupt input */
        }
      }
      const temporary = `${this.#path}.${process.pid}.${Date.now()}.tmp`;
      const handle = await open(temporary, "wx");
      try {
        await handle.writeFile(`${JSON.stringify(valid, null, 2)}\n`, "utf8");
        await handle.sync();
      } finally {
        await handle.close();
      }
      try {
        await rename(temporary, this.#path);
      } catch (error) {
        await rm(temporary, { force: true });
        throw error;
      }
      return valid;
    });
  }
  reset() {
    return this.#serial(async () => {
      const fresh = emptyData();
      await mkdir(dirname(this.#path), { recursive: true });
      await rm(this.#backup, { force: true });
      const temporary = `${this.#path}.${process.pid}.${Date.now()}.reset.tmp`;
      await open(temporary, "wx").then(async (handle) => {
        try {
          await handle.writeFile(`${JSON.stringify(fresh, null, 2)}\n`);
          await handle.sync();
        } finally {
          await handle.close();
        }
      });
      await rename(temporary, this.#path);
      return fresh;
    });
  }
  drain() {
    return this.#queue;
  }
}
