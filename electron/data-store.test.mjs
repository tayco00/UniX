// @vitest-environment node
import { mkdtemp, open, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEmptyData,
  DataStore,
  isValidData,
  readValidated,
} from "./data-store.mjs";

const temporaryDirectories = [];

async function createStore() {
  const directory = await mkdtemp(join(tmpdir(), "unix-store-test-"));
  temporaryDirectories.push(directory);
  return {
    directory,
    path: join(directory, "unix-data.json"),
    store: new DataStore(join(directory, "unix-data.json")),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("desktop data store", () => {
  it("creates the canonical empty data file on first load", async () => {
    const { path, store } = await createStore();
    const data = await store.load();
    expect(data.onboardingCompleted).toBe(false);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(data);
  });

  it("keeps a rotating backup before replacing data", async () => {
    const { path, store } = await createStore();
    const first = createEmptyData();
    await store.save(first);
    await store.save({
      ...first,
      profile: {
        name: "Alex",
        university: "TU",
        studyProgram: "Informatik",
        semester: "",
      },
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    expect(JSON.parse(await readFile(`${path}.backup`, "utf8"))).toEqual(first);
  });

  it("recovers from a corrupt primary file with the valid backup", async () => {
    const { path, store } = await createStore();
    const valid = createEmptyData();
    await store.save(valid);
    await store.save({
      ...valid,
      profile: {
        name: "Alex",
        university: "TU",
        studyProgram: "Informatik",
        semester: "",
      },
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    await writeFile(path, "not-json", "utf8");
    expect((await store.load()).onboardingCompleted).toBe(false);
    expect(JSON.parse(await readFile(`${path}.backup`, "utf8"))).toEqual(valid);
    // A second recovery must still work, even if no intervening save occurred.
    await writeFile(path, "still-not-json", "utf8");
    expect(await store.load()).toEqual(valid);
  });

  it("restores an absent primary from the backup instead of initializing empty data", async () => {
    const { path, store } = await createStore();
    const valid = createEmptyData();
    valid.profile.name = "Existing student";
    await writeFile(`${path}.backup`, JSON.stringify(valid), "utf8");
    expect(await store.load()).toEqual(valid);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(valid);
    expect(JSON.parse(await readFile(`${path}.backup`, "utf8"))).toEqual(valid);
  });

  it("does not silently reset when the primary is absent and the backup is corrupt", async () => {
    const { path, store } = await createStore();
    await writeFile(`${path}.backup`, "broken-backup", "utf8");
    await expect(store.load()).rejects.toThrow("nicht sicher gelesen");
    await expect(readFile(path, "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(await readFile(`${path}.backup`, "utf8")).toBe("broken-backup");
  });

  it("leaves both damaged files untouched when recovery is impossible", async () => {
    const { path, store } = await createStore();
    await writeFile(path, "broken-primary", "utf8");
    await writeFile(`${path}.backup`, "broken-backup", "utf8");
    await expect(store.load()).rejects.toThrow("nicht sicher gelesen");
    expect(await readFile(path, "utf8")).toBe("broken-primary");
    expect(await readFile(`${path}.backup`, "utf8")).toBe("broken-backup");
  });

  it("serializes first-load initialization with a following save and load", async () => {
    const { path, store } = await createStore();
    const intended = createEmptyData();
    intended.profile.name = "New student";
    const initialization = store.load();
    const saving = store.save(intended);
    const finalRead = store.load();
    await Promise.all([initialization, saving]);
    expect(await finalRead).toEqual(intended);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(intended);
  });

  it("waits for a pending save before reading the current file", async () => {
    const { store } = await createStore();
    const intended = createEmptyData();
    intended.profile.name = "Saved student";
    const saving = store.save(intended);
    expect(await store.load()).toEqual(intended);
    await saving;
  });

  it("captures saved data before caller mutation can change the queued write", async () => {
    const { store } = await createStore();
    const intended = createEmptyData();
    intended.profile.name = "Original";
    const saving = store.save(intended);
    intended.profile.name = "Changed after save";
    await saving;
    expect((await store.load()).profile.name).toBe("Original");
  });

  it("preserves a valid backup when saving after the primary was corrupted externally", async () => {
    const { path, store } = await createStore();
    const old = createEmptyData();
    old.profile.name = "Old";
    await writeFile(`${path}.backup`, JSON.stringify(old), "utf8");
    await writeFile(path, "corrupt", "utf8");
    const fresh = createEmptyData();
    fresh.profile.name = "Fresh";
    await store.save(fresh);
    expect(await store.load()).toEqual(fresh);
    expect(JSON.parse(await readFile(`${path}.backup`, "utf8"))).toEqual(old);
  });

  it("serializes concurrent writes so the newest data remains valid", async () => {
    const { path, store } = await createStore();
    const base = createEmptyData();
    await Promise.all([
      store.save({
        ...base,
        profile: { ...base.profile, name: "A" },
        updatedAt: new Date().toISOString(),
      }),
      store.save({
        ...base,
        profile: { ...base.profile, name: "B" },
        updatedAt: new Date().toISOString(),
      }),
    ]);
    expect(JSON.parse(await readFile(path, "utf8")).profile.name).toBe("B");
  });
});

describe("desktop task validation", () => {
  it("rejects completed but empty profiles", () => {
    expect(
      isValidData({ ...createEmptyData(), onboardingCompleted: true }),
    ).toBe(false);
  });
  it("resets the recovery generation so erased data cannot return", async () => {
    const { store, path } = await createStore();
    const original = createEmptyData();
    original.profile.name = "Do not resurrect";
    await store.save(original);
    const reset = await store.reset();
    expect(await readValidated(`${path}.backup`)).toEqual(reset);
    await writeFile(path, "corrupt", "utf8");
    expect((await store.load()).profile.name).toBe("");
  });
  it("rejects oversized imported files before reading their contents", async () => {
    const { path } = await createStore();
    const file = await open(path, "w");
    try {
      await file.truncate(64 * 1024 * 1024 + 1);
    } finally {
      await file.close();
    }
    await expect(readValidated(path)).rejects.toThrow("zu groß");
  });
  const task = {
    id: "task-1",
    title: "Task",
    module: "Module",
    type: "assignment",
    dueDate: "2028-02-29",
    estimateMinutes: 30,
    priority: "medium",
    status: "open",
    notes: "",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
  };

  it("accepts a real leap date and rejects nonexistent calendar dates", () => {
    expect(isValidData({ ...createEmptyData(), tasks: [task] })).toBe(true);
    for (const dueDate of [
      "2027-02-29",
      "2026-02-30",
      "2026-13-01",
      "2026-00-10",
    ]) {
      expect(
        isValidData({ ...createEmptyData(), tasks: [{ ...task, dueDate }] }),
      ).toBe(false);
    }
  });

  it("persists, exports and reimports dining alongside existing task types", async () => {
    const { store, path, directory } = await createStore();
    const data = {
      ...createEmptyData(),
      tasks: [
        task,
        { ...task, id: "dining-1", type: "dining", title: "Mittagspause" },
      ],
    };
    await store.save(data);
    expect((await store.load()).tasks[1].type).toBe("dining");
    const backup = join(directory, "export.json");
    await writeFile(backup, await readFile(path));
    const imported = await readValidated(backup);
    await store.save(imported);
    expect((await store.load()).tasks.map((entry) => entry.type)).toEqual([
      "assignment",
      "dining",
    ]);
  });

  it("rejects empty or duplicate task IDs before they can replace the current data", async () => {
    const { store } = await createStore();
    const original = await store.load();
    for (const tasks of [
      [{ ...task, id: "" }],
      [{ ...task, id: " " }],
      [task, { ...task }],
    ]) {
      await expect(store.save({ ...original, tasks })).rejects.toThrow(
        "Ungültiger",
      );
      expect(await store.load()).toEqual(original);
    }
  });
});
