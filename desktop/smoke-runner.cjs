const { writeFile } = require("node:fs/promises");
const { join } = require("node:path");

async function waitForLoad(webContents) {
  if (!webContents.isLoadingMainFrame()) return;
  await new Promise((resolve, reject) => {
    webContents.once("did-finish-load", resolve);
    webContents.once("did-fail-load", (_event, code, description) =>
      reject(new Error(`${code}: ${description}`)),
    );
  });
}

async function waitForFlutter(webContents) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10_000) {
    const visible = await webContents.executeJavaScript(
      `document.querySelectorAll('flutter-view').length > 0`,
    );
    if (visible) return Date.now() - startedAt;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Flutter UI timed out");
}

function fixture() {
  const now = new Date();
  const due = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  return JSON.stringify({
    schemaVersion: 1,
    setupComplete: true,
    profile: {
      firstName: "Taylan",
      university: "HTW Dresden",
      program: "Wirtschaftsinformatik",
      semester: "3. Semester",
    },
    modules: [
      { id: "module-stat", name: "Statistik", shortName: "STAT", tone: "blue", archived: false },
      { id: "module-db", name: "Datenbanken", shortName: "DB", tone: "mint", archived: false },
    ],
    commitments: [
      { id: "item-1", title: "Übungsblatt abgeben", moduleId: "module-stat", kind: "submission", dueAt: due(4), durationMinutes: 45, priority: "high", status: "open", notes: "Aufgaben 1 bis 4 prüfen", createdAt: due(-24), updatedAt: due(-2) },
      { id: "item-2", title: "SQL-Abfrage üben", moduleId: "module-db", kind: "study", dueAt: due(26), durationMinutes: 60, priority: "normal", status: "open", notes: "", createdAt: due(-20), updatedAt: due(-1) },
      { id: "item-3", title: "Mit Jana essen", moduleId: null, kind: "dining", dueAt: due(50), durationMinutes: 45, priority: "normal", status: "open", notes: "", createdAt: due(-18), updatedAt: due(-1) },
    ],
    updatedAt: now.toISOString(),
  });
}

async function runSmoke({ app, mainWindow }) {
  const directory = process.env.UNIX_SMOKE_DIRECTORY;
  const reportPath = join(directory, "report.json");
  const timer = setTimeout(() => app.exit(2), 30_000);
  try {
    await waitForLoad(mainWindow.webContents);
    const startupMs = await waitForFlutter(mainWindow.webContents);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const state = await mainWindow.webContents.executeJavaScript(`({
      title: document.title,
      ready: document.readyState,
      bridge: Object.keys(window.unixDesktop || {}).sort(),
      text: document.body.innerText,
      canvasCount: document.querySelectorAll('canvas').length,
      flutterViewCount: document.querySelectorAll('flutter-view').length,
      bodyChildren: document.body.children.length
    })`);
    if (state.title !== "UniX" || state.ready !== "complete")
      throw new Error("Product window did not load");
    if (state.bridge.join(",") !== "exportBackup,getAppInfo,importBackup,quit,setDirty")
      throw new Error("Unexpected desktop bridge");
    if (
      !state.text.includes("UniX") &&
      state.canvasCount === 0 &&
      state.flutterViewCount === 0
    )
      throw new Error("Flutter UI is not visible");
    mainWindow.setSize(1440, 900);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await writeFile(join(directory, "onboarding.png"), (await mainWindow.capturePage()).toPNG());
    const payload = JSON.stringify(fixture());
    await mainWindow.webContents.executeJavaScript(
      `localStorage.setItem("app.unix.workspace.v1", JSON.stringify(${payload}))`,
    );
    mainWindow.reload();
    await waitForLoad(mainWindow.webContents);
    await waitForFlutter(mainWindow.webContents);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await writeFile(join(directory, "desktop.png"), (await mainWindow.capturePage()).toPNG());
    mainWindow.setMinimumSize(320, 600);
    mainWindow.setSize(900, 800);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await writeFile(join(directory, "tablet.png"), (await mainWindow.capturePage()).toPNG());
    mainWindow.setSize(390, 844);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await writeFile(join(directory, "mobile.png"), (await mainWindow.capturePage()).toPNG());
    mainWindow.setSize(1440, 900);
    mainWindow.webContents.setZoomFactor(2);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await writeFile(join(directory, "zoom-200.png"), (await mainWindow.capturePage()).toPNG());
    await writeFile(
      reportPath,
      `${JSON.stringify({ ok: true, title: state.title, bridge: state.bridge, flutterViewCount: state.flutterViewCount, startupMs, layouts: ["1440x900", "900x800", "390x844", "200%"] }, null, 2)}\n`,
    );
    clearTimeout(timer);
    app.exit(0);
  } catch (error) {
    await writeFile(reportPath, `${JSON.stringify({ ok: false, error: String(error) }, null, 2)}\n`);
    clearTimeout(timer);
    app.exit(1);
  }
}

module.exports = { runSmoke };
