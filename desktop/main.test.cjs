const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const main = readFileSync(join(__dirname, "main.cjs"), "utf8");
const preload = readFileSync(join(__dirname, "preload.cjs"), "utf8");
const webIndex = readFileSync(join(__dirname, "..", "web", "index.html"), "utf8");
const webBootstrap = readFileSync(join(__dirname, "..", "web", "flutter_bootstrap.js"), "utf8");
const packageJson = readFileSync(join(__dirname, "..", "package.json"), "utf8");

test("desktop host enables the Electron safety boundary", () => {
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /setPermissionRequestHandler/);
  assert.match(main, /will-navigate/);
  assert.match(main, /webRequest\.onBeforeRequest/);
  assert.match(main, /networkRequest && !developmentRequest/);
});

test("preload exposes exactly five named product methods", () => {
  const methods = [...preload.matchAll(/^\s{2}([a-zA-Z]+):/gm)].map((match) => match[1]);
  assert.deepEqual(methods.sort(), ["exportBackup", "getAppInfo", "importBackup", "quit", "setDirty"]);
});

test("desktop import and export enforce an eight MiB boundary", () => {
  assert.equal((main.match(/8 \* 1024 \* 1024/g) || []).length, 2);
  assert.match(main, /JSON\.parse\(content\)/);
  assert.match(main, /trustedSender/);
});

test("desktop shutdown waits for an active save", () => {
  assert.match(main, /while \(saving && Date\.now\(\) < timeoutAt\)/);
  assert.match(main, /typeof value\.saving !== "boolean"/);
  assert.match(preload, /\{ dirty, saving \}/);
});

test("release assets are self-contained and constrained by a content policy", () => {
  assert.match(webIndex, /Content-Security-Policy/);
  assert.match(webBootstrap, /canvasKitBaseUrl: "canvaskit\/"/);
  assert.doesNotMatch(webBootstrap, /serviceWorkerSettings/);
  assert.match(packageJson, /--no-web-resources-cdn/);
});
