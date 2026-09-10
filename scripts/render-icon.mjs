// Render the repository-owned vector with the same Chromium shipped in UniX.
// A PNG-backed ICO avoids an extra image toolchain dependency.
import { app, BrowserWindow } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

app.whenReady().then(async () => {
  const window = new BrowserWindow({
    width: 256,
    height: 256,
    useContentSize: true,
    frame: false,
    show: false,
    transparent: true,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  try {
    const svg = await readFile(resolve("build/icon.svg"), "utf8");
    await window.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`<body style="margin:0;background:transparent">${svg}</body>`)}`,
    );
    await window.webContents.executeJavaScript(
      "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    );
    const png = (
      await window.webContents.capturePage(undefined, {
        stayHidden: true,
        stayAwake: true,
      })
    )
      .resize({ width: 256, height: 256 })
      .toPNG();
    const header = Buffer.alloc(22);
    header.writeUInt16LE(1, 2); // ICO format
    header.writeUInt16LE(1, 4); // One image; zero dimensions encode 256 px
    header.writeUInt16LE(1, 10);
    header.writeUInt16LE(32, 12);
    header.writeUInt32LE(png.length, 14);
    header.writeUInt32LE(22, 18);
    await writeFile(resolve("build/icon.png"), png);
    await writeFile(resolve("build/icon.ico"), Buffer.concat([header, png]));
    console.log("UniX icons generated from build/icon.svg");
    app.quit();
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
