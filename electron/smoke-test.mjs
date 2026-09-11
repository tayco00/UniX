import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function runSmokeTest(window, app, dialog) {
  const directory = app.getPath("userData");
  const reportPath = join(directory, "smoke-result.json");
  const failures = [];
  const timer = setTimeout(() => app.exit(1), 90000);
  const evaluate = (source) =>
    window.webContents.executeJavaScript(source, true);
  const waitFor = (expression) =>
    evaluate(
      `new Promise((resolve,reject)=>{const end=Date.now()+12000;const check=()=>{if(${expression})return resolve(true);if(Date.now()>end)return reject(new Error(${JSON.stringify(`Timed out: ${expression}`)}));setTimeout(check,35)};check()})`,
    );
  const click = (selector) =>
    evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const button = (label) =>
    evaluate(
      `Array.from(document.querySelectorAll('button')).find(button=>button.textContent.trim()===${JSON.stringify(label)}).click()`,
    );
  const fill = (selector, value) =>
    evaluate(
      `(()=>{const element=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element),'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('input',{bubbles:true}));element.dispatchEvent(new Event('change',{bubbles:true}))})()`,
    );
  const idle = () =>
    waitFor(
      "document.querySelector('.app-shell')?.getAttribute('aria-busy')==='false'",
    );
  const settle = () =>
    evaluate(
      "new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))",
    );
  const capture = async (name) => {
    await evaluate("document.fonts.ready.then(()=>true)");
    await settle();
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
      await evaluate("document.documentElement.scrollWidth<=innerWidth"),
      true,
      `${name}: horizontal overflow`,
    );
  };
  const contrast = async () => {
    const tokens = await evaluate(
      `(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['canvas','surface','sidebar','ink','muted','primary','on-primary','accent','danger','danger-soft','line-strong'].map(k=>[k,s.getPropertyValue('--'+k).trim()]))})()`,
    );
    const lum = (hex) => {
      if (hex.length === 4)
        hex = `#${hex
          .slice(1)
          .split("")
          .map((value) => value + value)
          .join("")}`;
      const c = hex
        .slice(1)
        .match(/../g)
        .map((v) => parseInt(v, 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
    };
    const pairs = [
      ["ink", "canvas", 4.5],
      ["muted", "canvas", 4.5],
      ["ink", "surface", 4.5],
      ["muted", "surface", 4.5],
      ["ink", "sidebar", 4.5],
      ["muted", "sidebar", 4.5],
      ["on-primary", "primary", 4.5],
      ["primary", "accent", 4.5],
      ["danger", "danger-soft", 4.5],
      ["line-strong", "surface", 3],
    ];
    return pairs.map(([fg, bg, min]) => {
      const a = lum(tokens[fg]),
        b = lum(tokens[bg]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= min, `${fg}/${bg} ${ratio}`);
      return {
        foreground: fg,
        background: bg,
        ratio: Number(ratio.toFixed(2)),
        minimum: min,
      };
    });
  };
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
      "(async()=>({data:await window.unixApi.load(),bridge:typeof window.unixApi.save,node:typeof window.require,body:document.body.textContent,title:document.title}))()",
    );
    assert.equal(initial.data.version, 2);
    assert.equal(initial.data.tasks.length, 0);
    assert.equal(initial.bridge, "function");
    assert.equal(initial.node, "undefined");
    assert.equal(initial.title, "UniX");
    assert.doesNotMatch(
      initial.body,
      /lokal|offline|ohne konto|bleiben bei dir/i,
    );
    const contrastResults = await contrast();
    await capture("onboarding-light");
    window.setSize(1040, 700);
    await capture("onboarding-minimum");
    window.setSize(1440, 920);
    await fill('.onboarding-fields input[maxlength="80"]', "Mina");
    await fill('.onboarding-fields input[maxlength="120"]', "TU Berlin");
    await fill(
      '.onboarding-fields input[placeholder*="Wirtschaftsinformatik"]',
      "Informatik",
    );
    await button("UniX einrichten");
    await waitFor("document.querySelector('.today-page')");
    await idle();
    assert.equal((await evaluate("window.unixApi.load()")).tasks.length, 0);
    await capture("today-empty");
    await button("Erste Aufgabe anlegen");
    await waitFor("document.querySelector('.task-form')");
    assert.equal(
      await evaluate(
        "document.activeElement===document.querySelector('.task-form input')",
      ),
      true,
    );
    await fill(
      '.task-form input[maxlength="140"]',
      "Mittagspause mit Lerngruppe",
    );
    await fill('.task-form input[maxlength="100"]', "Campus");
    await fill(".task-form select", "dining");
    await fill('.task-form input[type="number"]', "30");
    assert.equal(
      await evaluate(
        "document.querySelector('.task-form select').selectedOptions[0].textContent",
      ),
      "Mensa/Cafétaria",
    );
    await capture("task-editor");
    window.setSize(1040, 700);
    await capture("task-editor-minimum");
    window.setSize(1440, 920);
    await button("Aufgabe anlegen");
    await waitFor("!document.querySelector('.task-form')");
    await idle();
    const created = await evaluate("window.unixApi.load()");
    assert.equal(created.tasks.length, 1);
    assert.equal(created.tasks[0].type, "dining");
    await capture("today-one-task");
    const reloaded = once(window.webContents, "did-finish-load");
    window.webContents.reload();
    await reloaded;
    await waitFor("document.querySelector('.today-page')");
    assert.equal(
      (await evaluate("window.unixApi.load()")).tasks[0].id,
      created.tasks[0].id,
    );
    await button("Aufgaben");
    await waitFor("document.querySelector('.tasks-page')");
    await capture("tasks-one");
    await click(".task-check");
    await idle();
    await button("Erledigt1");
    await waitFor("document.querySelector('.task-row.done')");
    await click(".task-check");
    await idle();
    await button("Offen1");
    await click(".task-title");
    await waitFor("document.querySelector('.task-form')");
    await fill('.task-form input[maxlength="140"]', "Mittagspause im Innenhof");
    await button("Speichern");
    await idle();
    await button("Einstellungen");
    await waitFor("document.querySelector('.settings-page')");
    await capture("settings");
    const backupPath = join(directory, "roundtrip.json");
    dialog.showSaveDialog = async () => ({
      canceled: false,
      filePath: backupPath,
    });
    await button("Sicherung exportieren");
    await idle();
    assert.equal(
      JSON.parse(await readFile(backupPath, "utf8")).tasks.length,
      1,
    );
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [backupPath],
    });
    dialog.showMessageBox = async () => ({ response: 1 });
    await button("Wiederherstellen");
    await idle();
    await fill('.profile-form input[maxlength="80"]', "Ungespeichert");
    let closePrompt = false;
    dialog.showMessageBoxSync = () => {
      closePrompt = true;
      return 0;
    };
    const blocked = once(window.webContents, "will-prevent-unload");
    window.close();
    await blocked;
    assert.equal(closePrompt, true);
    assert.equal(window.isDestroyed(), false);
    await evaluate("window.confirm=()=>true;true");
    await button("Heute");
    await waitFor("document.querySelector('.today-page')");
    await evaluate(
      `(async()=>{const data=await window.unixApi.load();const date=n=>{const d=new Date();d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};const titles=['Literaturrecherche abschließen','Übungsblatt 04 abgeben','Prüfungsvorbereitung: Algorithmen und Datenstrukturen','Mittagspause in der Cafétaria','Rückmeldung zum Semester','Projektpräsentation vorbereiten und Ergebnisse der gemeinsamen Fallstudie abschließend besprechen'];data.tasks=titles.map((title,i)=>({id:crypto.randomUUID(),title,course:['Wissenschaftliches Arbeiten','Statistik','Informatik','Campus','Organisation','Projektseminar'][i],type:['study','assignment','exam','dining','organization','assignment'][i],dueDate:date(i-1),estimateMinutes:[45,90,120,30,15,60][i],priority:i===0?'high':'medium',status:'open',notes:i===5?'Mit Lerngruppe':'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));await window.unixApi.save(data)})()`,
    );
    const fixtureReload = once(window.webContents, "did-finish-load");
    window.webContents.reload();
    await fixtureReload;
    await waitFor("document.querySelectorAll('.task-row').length===5");
    await capture("today-populated");
    window.setSize(1040, 700);
    await capture("today-populated-minimum");
    await button("Aufgaben");
    await waitFor("document.querySelectorAll('.task-row').length===6");
    await capture("tasks-minimum");
    window.setSize(1440, 920);
    window.webContents.setZoomFactor(2);
    await capture("tasks-200-percent");
    await click(".task-title");
    await waitFor("document.querySelector('.task-form')");
    await evaluate(
      "document.querySelector('.modal-panel').scrollTop=document.querySelector('.modal-panel').scrollHeight",
    );
    await capture("editor-200-percent");
    assert.equal(
      await evaluate(
        "document.querySelector('.modal-actions button[type=submit]').getBoundingClientRect().bottom<innerHeight",
      ),
      true,
    );
    window.webContents.setZoomFactor(1);
    await button("Abbrechen");
    await button("Einstellungen");
    await waitFor("document.querySelector('.settings-page')");
    await evaluate("window.confirm=()=>true;true");
    await button("UniX zurücksetzen");
    await waitFor("document.querySelector('.onboarding-form')");
    assert.equal(
      (await evaluate("window.unixApi.load()")).setupCompleted,
      false,
    );
    assert.deepEqual(failures, []);
    const report = {
      passed: true,
      packaged: app.isPackaged,
      version: app.getVersion(),
      bridge: true,
      sandboxed: true,
      migrationCompatible: true,
      completeJourney: true,
      backupRoundtrip: true,
      unsavedProtection: true,
      contrastResults,
      layouts: ["1440x920", "1040x700", "200%"],
      failures,
    };
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    clearTimeout(timer);
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
    clearTimeout(timer);
    app.exit(1);
  }
}
