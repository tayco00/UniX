import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Real renderer + IPC + files in an isolated directory. Native picker choices are stubbed, never user data.
export async function runSmokeTest(window, app, dialog) {
  const failures = [];
  const directory = app.getPath("userData");
  const reportPath = join(directory, "smoke-result.json");
  const timeout = setTimeout(() => {
    console.error("Desktop smoke test timed out");
    app.exit(1);
  }, 60000);
  const evaluate = (source) =>
    window.webContents.executeJavaScript(source, true);
  const waitFor = (expression) =>
    evaluate(`new Promise((resolve, reject) => {
    const deadline = Date.now() + 10000;
    const check = () => { if (${expression}) return resolve(true); if (Date.now() > deadline) return reject(new Error(${JSON.stringify(`Timed out: ${expression}`)})); setTimeout(check, 30); }; check();
  })`);
  const click = (selector) =>
    evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const button = (text) =>
    evaluate(
      `Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`,
    );
  const fill = (selector, value) =>
    evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  const settle = () =>
    evaluate(
      "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    );
  const capture = async (name) => {
    await evaluate("document.fonts.ready.then(() => true)");
    await settle();
    await evaluate(
      "Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => undefined))).then(() => true)",
    );
    await writeFile(
      join(directory, `${name}.png`),
      (
        await window.webContents.capturePage(undefined, {
          stayHidden: true,
          stayAwake: true,
        })
      ).toPNG(),
    );
    assert.equal(
      await evaluate("document.documentElement.scrollWidth <= innerWidth"),
      true,
      `${name}: horizontal overflow`,
    );
  };
  const contrastResults = [];
  const checkContrast = async () => {
    const tokens = await evaluate(`(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(['canvas','surface','surface-soft','sidebar','ink','muted','accent','on-accent','accent-soft','danger','danger-soft','control-line'].map(key => [key, style.getPropertyValue('--' + key).trim()]));
    })()`);
    const luminance = (hex) => {
      if (hex.length === 4)
        hex = `#${hex
          .slice(1)
          .split("")
          .map((value) => value + value)
          .join("")}`;
      const channels = hex
        .slice(1)
        .match(/../g)
        .map((value) => parseInt(value, 16) / 255)
        .map((value) =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
        );
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const pairs = [
      ...["canvas", "surface", "surface-soft", "sidebar"].flatMap((bg) => [
        ["ink", bg, 4.5],
        ["muted", bg, 4.5],
      ]),
      ["on-accent", "accent", 4.5],
      ["accent", "accent-soft", 4.5],
      ["danger", "surface", 4.5],
      ["danger", "danger-soft", 4.5],
      ["control-line", "canvas", 3],
      ["control-line", "surface", 3],
    ];
    for (const [fg, bg, minimum] of pairs) {
      const a = luminance(tokens[fg]),
        b = luminance(tokens[bg]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(
        ratio >= minimum,
        `${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`,
      );
      contrastResults.push({
        theme: await evaluate("document.documentElement.dataset.theme"),
        foreground: fg,
        background: bg,
        ratio: Number(ratio.toFixed(2)),
        minimum,
      });
    }
  };
  const idle = () =>
    waitFor(
      "document.querySelector('.app-shell')?.getAttribute('aria-busy') === 'false'",
    );
  window.webContents.on("preload-error", (_event, _path, error) =>
    failures.push(error.message),
  );
  window.webContents.on("did-fail-load", (_event, code, description) =>
    failures.push(`${code}: ${description}`),
  );
  try {
    if (window.webContents.isLoadingMainFrame())
      await once(window.webContents, "did-finish-load");
    await waitFor("document.querySelector('.onboarding-form')");
    const initial = await evaluate(
      `(async () => ({ bridge: typeof window.unixApi?.load, nodeAccess: typeof window.require, data: await window.unixApi.load(), info: await window.unixApi.getAppInfo() }))()`,
    );
    assert.equal(initial.bridge, "function");
    assert.equal(initial.nodeAccess, "undefined");
    assert.equal(initial.info.platform, "win32");
    assert.equal(initial.data.onboardingCompleted, false);
    assert.equal(initial.data.settings.theme, "dark");
    await checkContrast();
    assert.equal(await evaluate("document.title"), "UniX");
    assert.equal(window.getTitle(), "UniX");
    assert.match(
      await evaluate("document.querySelector('.onboarding-grid').textContent"),
      /Semester\s*\(optional\)/,
    );
    await capture("onboarding");
    window.setSize(1040, 700);
    await capture("onboarding-1040");
    window.setSize(1440, 920);
    await fill('.onboarding-fields input[maxlength="80"]', "Mina");
    await fill(
      '.onboarding-fields > label input[maxlength="120"]',
      "TU Berlin",
    );
    await fill('.onboarding-grid input[maxlength="120"]', "Informatik");
    await evaluate(
      "document.querySelector('.onboarding-form').requestSubmit()",
    );
    await waitFor("document.querySelector('.dashboard-page')");
    await idle();
    assert.equal((await evaluate("window.unixApi.load()")).tasks.length, 0);
    await capture("dashboard-empty");
    await button("Erste Aufgabe anlegen");
    await waitFor("document.querySelector('.task-form')");
    assert.equal(
      await evaluate(
        "document.activeElement === document.querySelector('.task-form input')",
      ),
      true,
    );
    await fill(
      '.task-form input[maxlength="140"]',
      "Mittagspause in der Mensa",
    );
    await fill('.task-form input[maxlength="100"]', "Campus");
    await fill('.task-form input[type="date"]', "2026-09-14");
    await fill('.task-form input[type="number"]', "20");
    await fill(".task-form select", "dining");
    assert.equal(
      await evaluate(
        "document.querySelector('.task-form select').selectedOptions[0].textContent",
      ),
      "Mensa/Cafétaria",
    );
    assert.equal(
      await evaluate("document.querySelector('#estimate-hint') === null"),
      true,
    );
    await fill(".task-form textarea", "Treffpunkt vor dem Haupteingang.");
    await capture("task-editor");
    window.setSize(1040, 700);
    await capture("task-editor-1040");
    await evaluate(
      "document.querySelector('.modal-panel').scrollTop = document.querySelector('.modal-panel').scrollHeight",
    );
    await capture("task-editor-1040-bottom");
    assert.equal(
      await evaluate(
        "document.querySelector('.modal-actions button[type=submit]').getBoundingClientRect().bottom < innerHeight",
      ),
      true,
    );
    window.setSize(1440, 920);
    await evaluate("document.querySelector('.task-form').requestSubmit()");
    await waitFor("!document.querySelector('.task-form')");
    await idle();
    const created = await evaluate("window.unixApi.load()");
    assert.equal(created.tasks.length, 1);
    assert.equal(created.tasks[0].estimateMinutes, 20);
    assert.equal(created.tasks[0].type, "dining");
    await capture("dashboard");
    window.setSize(1040, 700);
    await capture("dashboard-1040");
    window.setSize(1440, 920);

    const loaded = once(window.webContents, "did-finish-load");
    window.webContents.reload();
    await loaded;
    await waitFor("document.querySelector('.dashboard-page')");
    assert.equal(
      (await evaluate("window.unixApi.load()")).tasks[0].id,
      created.tasks[0].id,
    );
    await button("Aufgaben");
    await waitFor("document.querySelector('.semester-page')");
    await click(".task-check");
    await idle();
    await click(".filter-tabs button:nth-child(3)");
    await waitFor("document.querySelector('.task-done')");
    assert.equal(
      await evaluate("document.querySelector('.due-label').textContent"),
      "Erledigt",
    );
    await click(".task-check");
    await idle();
    await click(".filter-tabs button:first-child");
    await waitFor("document.querySelector('.task-row')");
    await click(".task-title-button");
    await waitFor("document.querySelector('.task-form')");
    assert.equal(
      await evaluate("document.querySelector('.task-form select').value"),
      "dining",
    );
    await fill(
      '.task-form input[maxlength="140"]',
      "Mittagspause mit Lerngruppe",
    );
    await evaluate("document.querySelector('.task-form').requestSubmit()");
    await waitFor("!document.querySelector('.task-form')");
    await idle();
    assert.equal(
      (await evaluate("window.unixApi.load()")).tasks[0].title,
      "Mittagspause mit Lerngruppe",
    );

    await button("Einstellungen");
    await waitFor("document.querySelector('.settings-page')");
    await capture("settings");
    window.setSize(1040, 700);
    await capture("settings-1040");
    window.setSize(1440, 920);
    await button("Dunkel");
    await idle();
    await waitFor("document.documentElement.dataset.theme === 'dark'");
    await capture("settings-dark");
    await button("Hell");
    await idle();
    await capture("settings-light");
    await checkContrast();
    const backupPath = join(directory, "roundtrip-backup.json");
    dialog.showSaveDialog = async () => ({
      canceled: false,
      filePath: backupPath,
    });
    await button("Sicherung exportieren");
    await idle();
    const exported = JSON.parse(await readFile(backupPath, "utf8"));
    assert.equal(exported.tasks.length, 1);
    assert.equal(exported.tasks[0].type, "dining");
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [backupPath],
    });
    let confirmed = false;
    dialog.showMessageBox = async () => ({ response: confirmed ? 1 : 0 });
    await button("Wiederherstellen");
    await idle();
    assert.equal(
      (await evaluate("window.unixApi.load()")).tasks[0].title,
      exported.tasks[0].title,
    );
    const imported = {
      ...exported,
      profile: { ...exported.profile, name: "Alex" },
    };
    await writeFile(backupPath, JSON.stringify(imported));
    confirmed = true;
    await button("Wiederherstellen");
    await idle();
    await waitFor(
      "document.querySelector('.profile-form input').value === 'Alex'",
    );
    await writeFile(backupPath, "invalid JSON");
    await button("Wiederherstellen");
    await idle();
    await waitFor("document.querySelector('[role=alert]')");
    assert.equal(
      (await evaluate("window.unixApi.load()")).profile.name,
      "Alex",
    );

    await fill('.profile-form input[maxlength="80"]', "Unsaved draft");
    let closePrompted = false;
    dialog.showMessageBoxSync = () => {
      closePrompted = true;
      return 0;
    };
    const prevented = once(window.webContents, "will-prevent-unload");
    window.close();
    await prevented;
    assert.equal(closePrompted, true);
    assert.equal(window.isDestroyed(), false);
    assert.equal(
      await evaluate("document.querySelector('.profile-form input').value"),
      "Unsaved draft",
    );
    // Confirmation answers are simulated in this isolated renderer; persistence and UI handlers remain real.
    await evaluate("window.confirm = () => true; true");
    await button("Heute");
    await waitFor("document.querySelector('.dashboard-page')");
    await click(".row-menu");
    await waitFor("document.querySelector('.task-form')");
    await button("Aufgabe löschen");
    await waitFor("!document.querySelector('.task-form')");
    await idle();
    assert.equal((await evaluate("window.unixApi.load()")).tasks.length, 0);

    // Design fixtures stay inside the isolated smoke directory, never real user data.
    await evaluate(`(async () => {
      const data = await window.unixApi.load();
      const date = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'); };
      const titles = ['Literaturrecherche abschließen', 'Übungsblatt 04 abgeben', 'Prüfungsvorbereitung: Algorithmen und Datenstrukturen', 'Mittagspause mit der Lerngruppe', 'Rückmeldung für das Wintersemester', 'Projektpräsentation vorbereiten und die Ergebnisse der gemeinsamen Fallstudie mit der Lerngruppe abschließend besprechen'];
      data.profile = { name: 'Mina', university: 'Technische Universität Berlin', studyProgram: 'Wirtschaftsinformatik', semester: '3. Semester' };
      data.tasks = titles.map((title, i) => ({ id: crypto.randomUUID(), title, module: ['Wissenschaftliches Arbeiten', 'Statistik', 'Informatik', 'Campus', 'Studienorganisation', 'Projektseminar'][i], type: ['study','assignment','exam','dining','admin','assignment'][i], dueDate: date(i - 1), estimateMinutes: [45,90,120,30,15,60][i], priority: i === 0 ? 'high' : 'medium', status: 'open', notes: i === 5 ? 'Ergebnisse gemeinsam abgleichen.' : '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      data.settings.theme = 'dark';
      await window.unixApi.save(data);
    })()`);
    const designLoaded = once(window.webContents, "did-finish-load");
    window.webContents.reload();
    await designLoaded;
    await waitFor("document.querySelectorAll('.task-row').length === 5");
    await capture("dashboard-populated-dark");
    window.setSize(1040, 700);
    await capture("dashboard-populated-1040");
    await button("Aufgaben");
    await waitFor("document.querySelectorAll('.task-row').length === 6");
    await capture("tasks-1040");
    window.setSize(1440, 920);
    await capture("tasks-dark");
    window.webContents.setZoomFactor(2);
    await capture("tasks-200-percent");
    await click(".task-title-button");
    await waitFor("document.querySelector('.task-form')");
    await evaluate(
      "document.querySelector('.modal-panel').scrollTop = document.querySelector('.modal-panel').scrollHeight",
    );
    await capture("task-editor-200-percent");
    assert.equal(
      await evaluate(
        "document.querySelector('.modal-actions button[type=submit]').getBoundingClientRect().bottom < innerHeight",
      ),
      true,
    );
    await button("Abbrechen");
    await button("Einstellungen");
    await waitFor("document.querySelector('.settings-page')");
    await capture("settings-200-percent");
    window.webContents.setZoomFactor(1);
    await button("Hell");
    await idle();
    await button("Heute");
    await waitFor("document.querySelector('.dashboard-page')");
    await capture("dashboard-populated-light");
    await button("Aufgaben");
    await waitFor("document.querySelector('.semester-page')");
    await capture("tasks-light");
    await fill(".search-field input", "no-result-12345");
    await waitFor("document.querySelector('.empty-panel')");
    await capture("tasks-no-results");

    await button("Einstellungen");
    await waitFor("document.querySelector('.settings-page')");
    await evaluate("window.confirm = () => true; true");
    await button("UniX zurücksetzen");
    await waitFor("document.querySelector('.onboarding-form')");
    assert.equal(
      (await evaluate("window.unixApi.load()")).onboardingCompleted,
      false,
    );
    assert.doesNotMatch(
      await evaluate("document.body.textContent"),
      /lokal|local-first|ohne konto|vollständig offline|bleiben bei dir/i,
    );
    assert.deepEqual(failures, []);
    const report = {
      passed: true,
      packaged: app.isPackaged,
      bridge: true,
      sandboxed: true,
      onboarding: true,
      createEditCompleteReopenDelete: true,
      persistenceAfterReload: true,
      backupExportImportCancelInvalid: true,
      unsavedWindowClose: true,
      reset: true,
      themes: true,
      contrastResults,
      zoom200Percent: true,
      longTitlesAndEmptyStates: true,
      layouts: ["1440x920", "1040x700"],
      failures,
    };
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
    clearTimeout(timeout);
    app.quit();
  } catch (error) {
    await writeFile(
      reportPath,
      JSON.stringify(
        { passed: false, error: error.message, failures },
        null,
        2,
      ),
    );
    console.error(error);
    clearTimeout(timeout);
    app.exit(1);
  }
}
