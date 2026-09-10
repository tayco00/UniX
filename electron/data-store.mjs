import { mkdir, open, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

const DATA_VERSION = 1;
const MAX_FILE_BYTES = 64 * 1024 * 1024;

export function createEmptyData() {
  return {
    version: DATA_VERSION,
    onboardingCompleted: false,
    profile: {
      name: "",
      university: "",
      studyProgram: "",
      semester: "",
    },
    tasks: [],
    settings: {
      theme: "system",
      weekStartsOn: 1,
    },
    updatedAt: new Date().toISOString(),
  };
}

function isString(value, max = 5000) {
  return typeof value === "string" && value.length <= max;
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function isValidData(value) {
  if (!value || typeof value !== "object" || value.version !== DATA_VERSION)
    return false;
  if (typeof value.onboardingCompleted !== "boolean") return false;
  if (!value.profile || !isString(value.profile.name, 80)) return false;
  if (
    !isString(value.profile.university, 120) ||
    !isString(value.profile.studyProgram, 120)
  )
    return false;
  if (!isString(value.profile.semester, 40)) return false;
  if (
    value.onboardingCompleted &&
    ![
      value.profile.name,
      value.profile.university,
      value.profile.studyProgram,
    ].every((entry) => entry.trim().length > 0)
  )
    return false;
  if (!Array.isArray(value.tasks) || value.tasks.length > 5000) return false;
  if (
    !value.settings ||
    !["light", "dark", "system"].includes(value.settings.theme)
  )
    return false;
  if (![0, 1].includes(value.settings.weekStartsOn)) return false;
  if (!isString(value.updatedAt, 40)) return false;

  const identifiers = new Set();

  return value.tasks.every((task) => {
    if (
      !task ||
      !isString(task.id, 80) ||
      task.id.trim().length === 0 ||
      identifiers.has(task.id)
    )
      return false;
    identifiers.add(task.id);
    return (
      isString(task.title, 140) &&
      task.title.trim().length > 0 &&
      isString(task.module, 100) &&
      ["exam", "assignment", "study", "admin"].includes(task.type) &&
      isCalendarDate(task.dueDate) &&
      Number.isInteger(task.estimateMinutes) &&
      task.estimateMinutes >= 0 &&
      task.estimateMinutes <= 1440 &&
      ["low", "medium", "high"].includes(task.priority) &&
      ["open", "done"].includes(task.status) &&
      isString(task.notes, 2000) &&
      isString(task.createdAt, 40) &&
      isString(task.updatedAt, 40)
    );
  });
}

export async function readValidated(filePath) {
  const file = await open(filePath, "r");
  try {
    if ((await file.stat()).size > MAX_FILE_BYTES) {
      throw Object.assign(new Error("UniX-Datendatei ist zu groß"), {
        code: "UNIX_INVALID_DATA",
      });
    }
    let parsed;
    try {
      parsed = JSON.parse(await file.readFile("utf8"));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      throw Object.assign(new Error("Ungültiges UniX-JSON"), {
        code: "UNIX_INVALID_DATA",
      });
    }
    if (!isValidData(parsed)) {
      throw Object.assign(new Error("Ungültiges UniX-Datenschema"), {
        code: "UNIX_INVALID_DATA",
      });
    }
    return parsed;
  } finally {
    await file.close();
  }
}

async function replaceAtomically(filePath, contents) {
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporaryPath, "wx", 0o600);
    try {
      await file.writeFile(contents, "utf8");
      await file.sync();
    } finally {
      await file.close();
    }
    // Rename replaces the destination; never delete the last good file first.
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export class DataStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.backupPath = `${filePath}.backup`;
    this.writeQueue = Promise.resolve();
    this.recoveredFromBackup = false;
  }

  enqueue(operation) {
    const pending = this.writeQueue.then(operation);
    this.writeQueue = pending.catch(() => undefined);
    return pending;
  }

  load() {
    return this.enqueue(() => this.readOrRecover());
  }

  async readOrRecover() {
    let primaryError;
    try {
      return await readValidated(this.filePath);
    } catch (error) {
      primaryError = error;
    }

    let backup;
    try {
      backup = await readValidated(this.backupPath);
    } catch (backupError) {
      if (primaryError?.code === "ENOENT" && backupError?.code === "ENOENT") {
        const initial = createEmptyData();
        await this.write(initial);
        return initial;
      }
      throw new Error("Die UniX-Daten konnten nicht sicher gelesen werden.");
    }
    await this.write(backup, { preserveBackup: true });
    this.recoveredFromBackup = true;
    return backup;
  }

  async save(data) {
    if (!isValidData(data)) throw new Error("Ungültiger UniX-Datensatz");
    const snapshot = structuredClone(data);
    return this.enqueue(() => this.write(snapshot));
  }

  async write(data, { preserveBackup = false } = {}) {
    const contents = `${JSON.stringify(data, null, 2)}\n`;
    if (Buffer.byteLength(contents, "utf8") > MAX_FILE_BYTES)
      throw new Error("UniX-Datendatei ist zu groß");
    await mkdir(dirname(this.filePath), { recursive: true });
    if (!preserveBackup) {
      let previous;
      try {
        previous = await readValidated(this.filePath);
      } catch (error) {
        if (!["ENOENT", "UNIX_INVALID_DATA"].includes(error?.code)) throw error;
      }
      if (previous)
        await replaceAtomically(
          this.backupPath,
          `${JSON.stringify(previous, null, 2)}\n`,
        );
    }
    await replaceAtomically(this.filePath, contents);
    return data;
  }

  async reset() {
    return this.enqueue(async () => {
      const empty = createEmptyData();
      await mkdir(dirname(this.filePath), { recursive: true });
      // Reset both generations, so old tasks cannot reappear after a later recovery.
      await replaceAtomically(
        this.backupPath,
        `${JSON.stringify(empty, null, 2)}\n`,
      );
      await this.write(empty, { preserveBackup: true });
      return empty;
    });
  }
}
