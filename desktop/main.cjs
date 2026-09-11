const { app, BrowserWindow, dialog, ipcMain, net, protocol } = require("electron");
const { mkdirSync } = require("node:fs");
const { readFile, stat, writeFile } = require("node:fs/promises");
const { join, resolve, sep } = require("node:path");
const { pathToFileURL } = require("node:url");

const webRoot = resolve(__dirname, "..", "build", "web");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "unixapp",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

const smoke = process.argv.includes("--unix-smoke-test");
if (smoke) {
  const smokeDirectory = process.env.UNIX_SMOKE_DIRECTORY;
  if (!smokeDirectory) throw new Error("Smoke directory is required");
  mkdirSync(smokeDirectory, { recursive: true });
  app.setPath("userData", smokeDirectory);
} else {
  app.setPath("userData", join(app.getPath("appData"), "UniX"));
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let mainWindow;
let dirty = false;
let saving = false;
let allowClose = false;

function trustedSender(event) {
  return (
    mainWindow &&
    event.sender === mainWindow.webContents &&
    event.senderFrame === mainWindow.webContents.mainFrame
  );
}

function handle(channel, listener) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!trustedSender(event)) throw new Error("Unauthorized request");
    return listener(...args);
  });
}

async function confirmClose() {
  if (!dirty) return true;
  const result = await dialog.showMessageBox(mainWindow, {
    type: "warning",
    buttons: ["Weiter bearbeiten", "Verwerfen und schließen"],
    defaultId: 0,
    cancelId: 0,
    message: "Es gibt ungespeicherte Eingaben.",
    detail: "Beim Schließen gehen diese Eingaben verloren.",
  });
  return result.response === 1;
}

async function requestQuit() {
  const timeoutAt = Date.now() + 10_000;
  while (saving && Date.now() < timeoutAt) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 50));
  }
  if (saving) {
    await dialog.showMessageBox(mainWindow, {
      type: "warning",
      buttons: ["Weiter warten"],
      message: "UniX speichert noch.",
      detail: "Bitte versuche das Beenden gleich erneut.",
    });
    return false;
  }
  if (!(await confirmClose())) {
    mainWindow?.show();
    mainWindow?.focus();
    return false;
  }
  allowClose = true;
  app.quit();
  return true;
}

async function registerProductProtocol() {
  await protocol.handle("unixapp", (request) => {
    const url = new URL(request.url);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    const filePath = resolve(webRoot, relative);
    if (filePath !== webRoot && !filePath.startsWith(`${webRoot}${sep}`)) {
      return new Response("Not found", { status: 404 });
    }
    return net.fetch(pathToFileURL(filePath).href);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "UniX",
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  mainWindow.webContents.session.setPermissionCheckHandler(() => false);
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    const networkRequest = /^https?:/i.test(details.url);
    const developmentRequest =
      process.env.UNIX_DEV_URL && details.url.startsWith(process.env.UNIX_DEV_URL);
    callback({ cancel: networkRequest && !developmentRequest });
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const allowed = process.env.UNIX_DEV_URL
      ? url.startsWith(process.env.UNIX_DEV_URL)
      : url.startsWith("unixapp://app/");
    if (!allowed) event.preventDefault();
  });
  mainWindow.on("close", (event) => {
    if (allowClose || !dirty) return;
    event.preventDefault();
    void requestQuit();
  });
  if (!smoke) mainWindow.once("ready-to-show", () => mainWindow?.show());
  if (process.env.UNIX_DEV_URL) void mainWindow.loadURL(process.env.UNIX_DEV_URL);
  else void mainWindow.loadURL("unixapp://app/index.html");
  if (smoke) {
    void import("./smoke-runner.cjs").then(({ runSmoke }) =>
      runSmoke({ app, dialog, mainWindow }),
    );
  }
}

if (gotLock) {
  app.whenReady().then(async () => {
    app.setName("UniX");
    await registerProductProtocol();
    handle("unix:dirty", (value) => {
      if (
        !value ||
        typeof value !== "object" ||
        typeof value.dirty !== "boolean" ||
        typeof value.saving !== "boolean"
      )
        throw new Error("Invalid window state");
      dirty = value.dirty;
      saving = value.saving;
      return true;
    });
    handle("unix:info", () =>
      JSON.stringify({ version: app.getVersion(), platform: process.platform }),
    );
    handle("unix:quit", () => requestQuit());
    handle("unix:export", async (payload) => {
      if (typeof payload !== "string" || Buffer.byteLength(payload) > 8 * 1024 * 1024)
        throw new Error("Invalid export");
      const parsed = JSON.parse(payload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("Invalid export");
      const result = await dialog.showSaveDialog(mainWindow, {
        title: "UniX-Sicherung exportieren",
        defaultPath: `UniX-Backup-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (result.canceled || !result.filePath) return false;
      await writeFile(result.filePath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
      return true;
    });
    handle("unix:import", async () => {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: "UniX-Sicherung auswählen",
        properties: ["openFile"],
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (result.canceled || !result.filePaths[0]) return "";
      const selected = result.filePaths[0];
      if ((await stat(selected)).size > 8 * 1024 * 1024) throw new Error("Import too large");
      const content = await readFile(selected, "utf8");
      JSON.parse(content);
      return content;
    });
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("second-instance", (_event, argv) => {
    if (argv.includes("--unix-quit")) {
      void requestQuit();
      return;
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  app.on("window-all-closed", () => app.quit());
}
