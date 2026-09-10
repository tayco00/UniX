import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DataStore, readValidated } from "./data-store.mjs";

const currentDirectory = fileURLToPath(new URL(".", import.meta.url));
const developmentUrl = !app.isPackaged
  ? process.env.VITE_DEV_SERVER_URL
  : undefined;
const productionUrl = pathToFileURL(
  join(currentDirectory, "..", "dist", "index.html"),
).href;
const smokeTest = process.argv.includes("--unix-smoke-test");
if (smokeTest) {
  if (!process.env.UNIX_SMOKE_DIRECTORY)
    throw new Error("Smoke test requires an isolated data directory");
  mkdirSync(process.env.UNIX_SMOKE_DIRECTORY, { recursive: true });
  app.setPath("userData", process.env.UNIX_SMOKE_DIRECTORY);
}
let mainWindow;
let store;

function trustedNavigation(url) {
  if (developmentUrl)
    return new URL(url).origin === new URL(developmentUrl).origin;
  return url.split("#")[0] === productionUrl;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "UniX",
    icon: join(currentDirectory, "..", "build", "icon.png"),
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    backgroundColor: "#101d18",
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(currentDirectory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (!smokeTest) mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  mainWindow.webContents.session.setPermissionCheckHandler(() => false);
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!trustedNavigation(url)) event.preventDefault();
  });
  mainWindow.webContents.on("will-prevent-unload", (event) => {
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: "warning",
      buttons: ["Weiter bearbeiten", "Schließen"],
      defaultId: 0,
      cancelId: 0,
      message:
        "Es gibt noch ungespeicherte Eingaben oder einen laufenden Vorgang.",
      detail: "Wenn du jetzt schließt, gehen ungespeicherte Eingaben verloren.",
    });
    if (response === 1) event.preventDefault();
    else quitAfterSave = false;
  });
  if (smokeTest) {
    void import("./smoke-test.mjs").then(({ runSmokeTest }) =>
      runSmokeTest(mainWindow, app, dialog),
    );
  }

  if (developmentUrl) {
    void mainWindow.loadURL(developmentUrl);
  } else {
    void mainWindow.loadFile(
      join(currentDirectory, "..", "dist", "index.html"),
    );
  }
}

function registerIpc() {
  function handle(channel, handler) {
    ipcMain.handle(channel, (event, ...args) => {
      if (
        event.sender !== mainWindow?.webContents ||
        event.senderFrame !== mainWindow.webContents.mainFrame ||
        !trustedNavigation(event.senderFrame.url)
      ) {
        throw new Error("Untrusted IPC sender");
      }
      return handler(...args);
    });
  }
  handle("unix:data:load", () => store.load());
  handle("unix:data:save", (data) => store.save(data));
  handle("unix:data:reset", () => store.reset());
  handle("unix:data:export", async () => {
    const data = await store.load();
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "UniX-Backup speichern",
      defaultPath: `UniX-Backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "UniX JSON-Backup", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    await writeFile(
      result.filePath,
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
    return { canceled: false, filePath: result.filePath };
  });
  handle("unix:data:import", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "UniX-Backup öffnen",
      properties: ["openFile"],
      filters: [{ name: "UniX JSON-Backup", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const parsed = await readValidated(result.filePaths[0]);
    const confirmation = await dialog.showMessageBox(mainWindow, {
      type: "warning",
      buttons: ["Abbrechen", "Backup wiederherstellen"],
      defaultId: 0,
      cancelId: 0,
      message: "Aktuelle UniX-Daten durch dieses Backup ersetzen?",
      detail: `${parsed.tasks.length} Aufgaben werden wiederhergestellt. Exportiere deine bisherigen Daten vorher, wenn du sie behalten möchtest.`,
    });
    if (confirmation.response !== 1) return { canceled: true };
    await store.save(parsed);
    return { canceled: false, data: parsed };
  });
  handle("unix:app:info", () => ({
    version: app.getVersion(),
    dataPath: app.getPath("userData"),
    platform: process.platform,
    recoveredFromBackup: store.recoveredFromBackup,
  }));
}

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    if (commandLine.includes("--unix-quit")) {
      app.quit();
      return;
    }
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    if (process.argv.includes("--unix-quit")) {
      app.quit();
      return;
    }
    store = new DataStore(join(app.getPath("userData"), "unix-data.json"));
    registerIpc();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

let quitAfterSave = false;
app.on("before-quit", (event) => {
  if (!store || quitAfterSave) return;
  event.preventDefault();
  void store.writeQueue.finally(() => {
    quitAfterSave = true;
    app.quit();
  });
});
