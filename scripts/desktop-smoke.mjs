import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import electron from "electron";

await mkdir(".runtime", { recursive: true });
const directory = await mkdtemp(resolve(".runtime", "desktop-smoke-v2-"));
const packaged = process.argv.includes("--packaged");
const executable = packaged
  ? resolve("release/win-unpacked/UniX.exe")
  : electron;
const env = { ...process.env, UNIX_SMOKE_DIRECTORY: directory };
delete env.ELECTRON_RUN_AS_NODE;
delete env.VITE_DEV_SERVER_URL;
const child = spawn(
  executable,
  [...(packaged ? [] : ["."]), "--unix-smoke-test"],
  { env, stdio: "inherit", windowsHide: true },
);
const code = await new Promise((resolveExit, reject) => {
  child.on("error", reject);
  child.on("exit", resolveExit);
});
assert.equal(code, 0, "Desktop smoke process failed");
const report = JSON.parse(
  await readFile(join(directory, "smoke-result.json"), "utf8"),
);
assert.equal(report.passed, true);
assert.equal(report.packaged, packaged);
console.log(`Desktop smoke verified: ${directory}`);
