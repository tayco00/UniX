import assert from "node:assert/strict";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

// Runs only with --unix-smoke-test in a dedicated, disposable data directory.
export async function runSmokeTest(window, app) {
  const failures = [];
  const reportPath = join(app.getPath("userData"), "smoke-result.json");
  const timeout = setTimeout(() => { console.error("Desktop smoke test timed out"); app.exit(1); }, 25000);
  window.webContents.on("preload-error", (_event, _path, error) => failures.push(error.message));
  window.webContents.on("did-fail-load", (_event, code, description) => failures.push(`${code}: ${description}`));
  try {
    if (window.webContents.isLoadingMainFrame()) await once(window.webContents, "did-finish-load");
    await window.webContents.executeJavaScript(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const check = () => {
        if (document.querySelector('.onboarding-form')) return resolve(true);
        if (Date.now() > deadline) return reject(new Error('Onboarding was not rendered'));
        setTimeout(check, 50);
      }; check();
    })`);
    const initial = await window.webContents.executeJavaScript(`(async () => ({
      bridge: typeof window.unixApi?.load, nodeAccess: typeof window.require,
      heading: document.querySelector('h2')?.textContent,
      data: await window.unixApi.load(), info: await window.unixApi.getAppInfo()
    }))()`);
    assert.equal(initial.bridge, "function");
    assert.equal(initial.nodeAccess, "undefined");
    assert.equal(initial.info.platform, "win32");
    assert.equal(initial.data.onboardingCompleted, false);
    const roundTrip = await window.webContents.executeJavaScript(`(async () => {
      const data = await window.unixApi.load();
      data.profile.name = 'Desktop-Smoke-Test';
      await window.unixApi.save(data);
      return (await window.unixApi.load()).profile.name;
    })()`);
    assert.equal(roundTrip, "Desktop-Smoke-Test");
    const loaded = once(window.webContents, "did-finish-load");
    window.webContents.reload();
    await loaded;
    assert.equal(await window.webContents.executeJavaScript("window.unixApi.load().then(d => d.profile.name)"), "Desktop-Smoke-Test");
    assert.deepEqual(failures, []);
    await window.webContents.executeJavaScript(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    await writeFile(join(app.getPath("userData"), "desktop.png"), (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    const report = { passed: true, packaged: app.isPackaged, bridge: true, renderer: true, persistenceAfterReload: true, sandboxed: true, failures };
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
    clearTimeout(timeout);
    app.quit();
  } catch (error) {
    await writeFile(reportPath, JSON.stringify({ passed: false, error: error.message, failures }, null, 2));
    console.error(error);
    clearTimeout(timeout);
    app.exit(1);
  }
}
