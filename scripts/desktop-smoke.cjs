const { mkdtemp, readFile } = require("node:fs/promises");
const { spawn } = require("node:child_process");
const { join, resolve } = require("node:path");
const { tmpdir } = require("node:os");

async function main() {
const packaged = process.argv.includes("--packaged");
const root = resolve(__dirname, "..");
const executable = packaged
  ? join(root, "release", "win-unpacked", "UniX.exe")
  : require("electron");
const args = packaged ? ["--unix-smoke-test"] : [root, "--unix-smoke-test"];
const directory = await mkdtemp(join(tmpdir(), "unix-smoke-"));
console.log(`Desktop smoke directory: ${directory}`);

const child = spawn(executable, args, {
  cwd: root,
  env: { ...process.env, UNIX_SMOKE_DIRECTORY: directory },
  stdio: "inherit",
  windowsHide: true,
});
const exitCode = await new Promise((resolveExit, reject) => {
  const timeout = setTimeout(() => {
    child.kill();
    reject(new Error("Desktop smoke timed out"));
  }, 45_000);
  child.once("error", reject);
  child.once("exit", (code) => {
    clearTimeout(timeout);
    resolveExit(code);
  });
});
const report = JSON.parse(await readFile(join(directory, "report.json"), "utf8"));
if (exitCode !== 0 || !report.ok) throw new Error(report.error || `Desktop exited ${exitCode}`);
console.log(`Desktop smoke verified: ${directory}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
