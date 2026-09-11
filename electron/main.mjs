import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DataStore, readValidated, validate } from "./data-store.mjs";

const directory = fileURLToPath(new URL(".", import.meta.url));
const developmentUrl = !app.isPackaged
  ? process.env.VITE_DEV_SERVER_URL
  : undefined;
const productionUrl = pathToFileURL(
  join(directory, "..", "dist", "index.html"),
).href;
const smoke = process.argv.includes("--unix-smoke-test");
if (smoke) {
  if (!process.env.UNIX_SMOKE_DIRECTORY)
    throw new Error("Smoke directory required");
  mkdirSync(process.env.UNIX_SMOKE_DIRECTORY, { recursive: true });
  app.setPath("userData", process.env.UNIX_SMOKE_DIRECTORY);
}
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let window;
let store;
let quitAfterSave = false;

function trusted(url) {
  if (developmentUrl)
    return new URL(url).origin === new URL(developmentUrl).origin;
  return url.split("#")[0] === productionUrl;
}

function createWindow() {
  window = new BrowserWindow({
    title: "UniX",
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    backgroundColor: "#f6f7f1",
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(directory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });
  if (!smoke) window.once("ready-to-show", () => window?.show());
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  window.webContents.session.setPermissionCheckHandler(() => false);
  window.webContents.on("will-navigate", (event, url) => {
    if (!trusted(url)) event.preventDefault();
  });
  window.webContents.on("will-prevent-unload", (event) => {
    const choice = dialog.showMessageBoxSync(window, {
      type: "warning",
      buttons: ["Weiter bearbeiten", "Schließen"],
      defaultId: 0,
      cancelId: 0,
      message: "Es gibt ungespeicherte Eingaben.",
      detail: "Wenn du schließt, gehen diese Eingaben verloren.",
    });
    if (choice === 1) event.preventDefault();
    else quitAfterSave = false;
  });
  if (smoke)
    void import("./smoke-test.mjs").then(({ runSmokeTest }) =>
      runSmokeTest(window, app, dialog),
    );
  if (developmentUrl) void window.loadURL(developmentUrl);
  else void window.loadFile(join(directory, "..", "dist", "index.html"));
}

function register(channel, handler) {
  ipcMain.handle(channel, (event, ...args) => {
    if (
      !window ||
      event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame
    )
      throw new Error("Nicht autorisierte Anfrage");
    return handler(...args);
  });
}

if (gotLock) app.whenReady().then(() => {
  app.setName("UniX");
  store = new DataStore(join(app.getPath("userData"), "unix-data.json"));
  register("unix:data:load", () => store.load());
  register("unix:data:save", (data) => {
    if (!validate(data)) throw new Error("Ungültige Daten");
    return store.save(data);
  });
  register("unix:data:reset", () => store.reset());
  register("unix:app:info", () => ({
    version: app.getVersion(),
    platform: process.platform,
    recoveredFromBackup: store.recoveredFromBackup,
  }));
  register("unix:data:export", async () => {
    const result = await dialog.showSaveDialog(window, {
      title: "UniX-Sicherung exportieren",
      defaultPath: `UniX-Backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    const data = await store.load();
    await writeFile(
      result.filePath,
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
    return { canceled: false };
  });
  register("unix:data:import", async () => {
    const result = await dialog.showOpenDialog(window, {
      title: "UniX-Sicherung wiederherstellen",
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const data = await readValidated(result.filePaths[0]);
    const choice = await dialog.showMessageBox(window, {
      type: "warning",
      buttons: ["Abbrechen", "Wiederherstellen"],
      defaultId: 0,
      cancelId: 0,
      message: "Aktuelle Daten ersetzen?",
      detail:
        "Profil und Aufgaben werden durch die gewählte Sicherung ersetzt.",
    });
    if (choice.response !== 1) return { canceled: true };
    return { canceled: false, data: await store.save(data) };
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

if (gotLock) app.on("second-instance", (_event, argv) => {
  if (argv.includes("--unix-quit")) {
    app.quit();
    return;
  }
  if (window) {
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  }
});
if (gotLock) app.on("before-quit", (event) => {
  if (quitAfterSave || !store) return;
  event.preventDefault();
  quitAfterSave = true;
  void store.drain().finally(() => app.quit());
});
if (gotLock) app.on("window-all-closed", () => app.quit());

// Keep preload visible to packaging analysis on Windows.
if (!app.isPackaged && process.env.UNIX_DEBUG_PRELOAD)
  readFileSync(join(directory, "preload.cjs"));
