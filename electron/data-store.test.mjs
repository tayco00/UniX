// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  DataStore,
  emptyData,
  readValidated,
  validate,
} from "./data-store.mjs";

const directories = [];
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "unix-v2-test-"));
  directories.push(directory);
  return { directory, path: join(directory, "unix-data.json") };
}

const validTask = {
  id: "1",
  title: "Lernen",
  course: "",
  type: "study",
  dueDate: "2026-09-11",
  estimateMinutes: 60,
  priority: "medium",
  status: "open",
  notes: "",
  createdAt: "x",
  updatedAt: "x",
};

describe("desktop data store", () => {
  it("returns a fresh state when no file exists", async () => {
    const { path } = await fixture();
    expect(await new DataStore(path).load()).toMatchObject({
      version: 2,
      setupCompleted: false,
      tasks: [],
    });
  });
  it("writes readable JSON", async () => {
    const { path } = await fixture();
    await new DataStore(path).save(emptyData());
    expect(JSON.parse(await readFile(path, "utf8")).version).toBe(2);
  });
  it("serializes concurrent writes", async () => {
    const { path } = await fixture();
    const store = new DataStore(path);
    const first = emptyData();
    const second = { ...emptyData(), updatedAt: "second" };
    await Promise.all([store.save(first), store.save(second)]);
    expect((await store.load()).updatedAt).toBe("second");
  });
  it("recovers from a valid backup", async () => {
    const { path } = await fixture();
    const store = new DataStore(path);
    await store.save(emptyData());
    await store.save({ ...emptyData(), updatedAt: "new" });
    await writeFile(path, "broken");
    expect((await store.load()).version).toBe(2);
    expect(store.recoveredFromBackup).toBe(true);
  });
  it("does not accept arbitrary objects", () =>
    expect(validate({ hello: "world" })).toBe(false));
  it("rejects impossible dates and duplicate task IDs", () => {
    expect(
      validate({
        ...emptyData(),
        tasks: [{ ...validTask, dueDate: "2026-02-30" }],
      }),
    ).toBe(false);
    expect(
      validate({ ...emptyData(), tasks: [validTask, { ...validTask }] }),
    ).toBe(false);
  });
  it("rejects malformed imports", async () => {
    const { path } = await fixture();
    await writeFile(path, "not-json");
    await expect(readValidated(path)).rejects.toMatchObject({
      code: "UNIX_INVALID_DATA",
    });
  });
  it("reset removes all tasks", async () => {
    const { path } = await fixture();
    const store = new DataStore(path);
    await store.save(emptyData());
    expect((await store.reset()).tasks).toHaveLength(0);
  });
});
