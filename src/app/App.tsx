import {
  CalendarCheck,
  Check,
  Home,
  LoaderCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "../components/Logo";
import { Modal } from "../components/Modal";
import { TaskEditor, type TaskDraft } from "../components/TaskEditor";
import {
  appDataSchema,
  type AppData,
  type Profile,
  type Task,
  type Theme,
} from "../domain/model";
import { Dashboard } from "../features/dashboard/Dashboard";
import { Onboarding } from "../features/onboarding/Onboarding";
import { SemesterMate } from "../features/semester/SemesterMate";
import { Settings } from "../features/settings/Settings";
import { repository } from "../infrastructure/repository";

type View = "dashboard" | "semester" | "settings";
type EditorState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const latest = useRef<AppData | null>(null);
  const busyRef = useRef(false);
  const dirtyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [editor, setEditor] = useState<EditorState>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [settingsRevision, setSettingsRevision] = useState(0);
  const [recoveryNotice, setRecoveryNotice] = useState(false);
  const onDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);
  const accept = useCallback((value: AppData) => {
    const parsed = appDataSchema.parse(value);
    latest.current = parsed;
    setData(parsed);
  }, []);
  const load = useCallback(
    () =>
      repository
        .load()
        .then((loaded) => {
          accept(loaded);
          setLoadError("");
          void repository
            .getAppInfo()
            .then((info) => setRecoveryNotice(!!info.recoveredFromBackup))
            .catch(() => undefined);
        })
        .catch(() =>
          setLoadError(
            "Deine Daten konnten nicht geöffnet werden. Sie wurden nicht verändert. Versuche es erneut oder stelle eine Sicherung wieder her.",
          ),
        ),
    [accept],
  );
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    const protectDraft = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current || busyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protectDraft);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("beforeunload", protectDraft);
    };
  }, []);
  const theme = data?.settings.theme ?? "system";
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Guard synchronously against duplicate submissions; acknowledge only durable writes.
  async function run(operation: () => Promise<void>, failure: string) {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setToast("");
    try {
      await operation();
      return true;
    } catch {
      setError(failure);
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function commit(
    update: (current: AppData) => AppData,
    message: string,
  ) {
    return run(async () => {
      if (!latest.current) throw new Error("Data unavailable");
      const next = appDataSchema.parse({
        ...update(latest.current),
        updatedAt: new Date().toISOString(),
      });
      accept(await repository.save(next));
      setToast(message);
    }, "Speichern fehlgeschlagen. Deine Änderung wurde nicht übernommen. Dein Entwurf bleibt erhalten; bitte versuche es erneut. Prüfe bei wiederholten Fehlern den freien Speicherplatz.");
  }
  function canLeave() {
    if (busyRef.current) return false;
    if (
      dirtyRef.current &&
      !window.confirm("Ungespeicherte Änderungen verwerfen?")
    )
      return false;
    dirtyRef.current = false;
    setError("");
    return true;
  }
  function navigate(next: View) {
    if (next !== view && canLeave()) setView(next);
  }
  function closeEditor() {
    if (canLeave()) setEditor(null);
  }
  async function completeOnboarding(profile: Profile) {
    if (
      await commit(
        (current) => ({ ...current, onboardingCompleted: true, profile }),
        "UniX ist bereit",
      )
    )
      onDirty(false);
  }
  async function saveTask(draft: TaskDraft) {
    const timestamp = new Date().toISOString();
    const editingId = editor?.mode === "edit" ? editor.task.id : undefined;
    const saved = await commit(
      (current) => ({
        ...current,
        tasks: editingId
          ? current.tasks.map((task) =>
              task.id === editingId
                ? { ...task, ...draft, updatedAt: timestamp }
                : task,
            )
          : [
              ...current.tasks,
              {
                ...draft,
                id: crypto.randomUUID(),
                status: "open",
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            ],
      }),
      editingId ? "Aufgabe aktualisiert" : "Aufgabe angelegt",
    );
    if (saved) {
      onDirty(false);
      setEditor(null);
    }
  }
  async function toggleTask(task: Task) {
    await commit(
      (current) => ({
        ...current,
        tasks: current.tasks.map((entry) =>
          entry.id === task.id
            ? {
                ...entry,
                status: entry.status === "done" ? "open" : "done",
                updatedAt: new Date().toISOString(),
              }
            : entry,
        ),
      }),
      task.status === "done"
        ? "Aufgabe wieder geöffnet"
        : "Aufgabe erledigt. Unter „Erledigt“ kannst du sie wieder öffnen.",
    );
  }
  async function deleteTask(task: Task) {
    if (
      busyRef.current ||
      !window.confirm(
        `„${task.title}“ löschen? Diese Aufgabe wird dauerhaft aus deiner Liste entfernt.`,
      )
    )
      return;
    if (
      await commit(
        (current) => ({
          ...current,
          tasks: current.tasks.filter((entry) => entry.id !== task.id),
        }),
        "Aufgabe gelöscht",
      )
    ) {
      onDirty(false);
      setEditor(null);
    }
  }
  async function updateProfile(profile: Profile) {
    const saved = await commit(
      (current) => ({ ...current, profile }),
      "Profil gespeichert",
    );
    if (saved) onDirty(false);
    return saved;
  }
  async function updateTheme(theme: Theme) {
    await commit(
      (current) => ({ ...current, settings: { ...current.settings, theme } }),
      "Darstellung aktualisiert",
    );
  }
  async function importBackup() {
    if (
      busyRef.current ||
      (dirtyRef.current &&
        !window.confirm(
          "Ungespeicherte Profiländerungen verwerfen und eine Sicherung auswählen?",
        ))
    )
      return;
    await run(async () => {
      const result = await repository.importBackup();
      if (result.data) {
        accept(result.data);
        onDirty(false);
        setRecoveryNotice(false);
        setSettingsRevision((revision) => revision + 1);
        setLoadError("");
        setToast("Sicherung wiederhergestellt");
      }
    }, "Die Sicherung konnte nicht wiederhergestellt werden. Wähle eine gültige UniX-JSON-Datei. Deine bisherigen Daten bleiben erhalten.");
  }
  async function exportBackup() {
    await run(async () => {
      const result = await repository.exportBackup();
      if (!result.canceled) setToast("Sicherung gespeichert");
    }, "Die Sicherung konnte nicht gespeichert werden. Bitte wähle einen beschreibbaren Ordner und versuche es erneut.");
  }
  async function resetData() {
    if (
      busyRef.current ||
      !window.confirm(
        "Profil und alle Aufgaben zurücksetzen? Exportiere vorher eine Sicherung, wenn du sie behalten möchtest. Auch die automatische Wiederherstellungskopie wird zurückgesetzt.",
      )
    )
      return;
    await run(async () => {
      accept(await repository.reset());
      onDirty(false);
      setRecoveryNotice(false);
      setView("dashboard");
    }, "Zurücksetzen fehlgeschlagen. Bitte versuche es erneut.");
  }
  const errorNotice = error && (
    <p className="error-notice" role="alert">
      {error}
    </p>
  );
  if (loadError)
    return (
      <main className="fatal-state">
        <Logo />
        <h1>Daten nicht verfügbar</h1>
        <p>{loadError}</p>
        {errorNotice}
        <div className="data-buttons">
          <button
            disabled={busy}
            className="button button-inverse"
            onClick={() => void load()}
          >
            Erneut versuchen
          </button>
          <button
            disabled={busy}
            className="button button-inverse"
            onClick={() => void importBackup()}
          >
            Sicherung wiederherstellen
          </button>
        </div>
      </main>
    );
  if (!data)
    return (
      <main className="loading-state">
        <Logo />
        <LoaderCircle className="spinner" />
        <p>UniX wird geöffnet …</p>
      </main>
    );
  if (!data.onboardingCompleted)
    return (
      <Onboarding
        onComplete={completeOnboarding}
        onDirty={onDirty}
        busy={busy}
        error={error}
      />
    );
  function addTask() {
    if (data!.tasks.length >= 5000) {
      setError(
        "Deine Liste enthält 5.000 Aufgaben. Exportiere eine Sicherung und entferne nicht mehr benötigte Aufgaben, bevor du weitere anlegst.",
      );
      return;
    }
    onDirty(false);
    setError("");
    setEditor({ mode: "create" });
  }
  const editTask = (task: Task) => {
    onDirty(false);
    setError("");
    setEditor({ mode: "edit", task });
  };
  return (
    <div className="app-shell" aria-busy={busy}>
      <div
        inert={editor ? true : undefined}
        aria-hidden={editor ? true : undefined}
      >
        <aside className="sidebar">
          <Logo />
          <nav aria-label="Hauptnavigation">
            <p className="nav-label">DEIN STUDIUM</p>
            <button
              disabled={busy}
              aria-current={view === "dashboard" ? "page" : undefined}
              className={view === "dashboard" ? "active" : ""}
              type="button"
              onClick={() => navigate("dashboard")}
            >
              <Home size={18} /> Heute
            </button>
            <button
              disabled={busy}
              aria-current={view === "semester" ? "page" : undefined}
              className={view === "semester" ? "active" : ""}
              type="button"
              onClick={() => navigate("semester")}
            >
              <CalendarCheck size={18} /> SemesterMate
            </button>
          </nav>
          <div className="sidebar-bottom">
            <button
              disabled={busy}
              aria-current={view === "settings" ? "page" : undefined}
              className={view === "settings" ? "active" : ""}
              type="button"
              onClick={() => navigate("settings")}
            >
              <SettingsIcon size={18} /> Einstellungen
            </button>
            <div className="profile-chip">
              <span>{data.profile.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{data.profile.name}</strong>
                <small>{data.profile.studyProgram}</small>
              </div>
            </div>
          </div>
        </aside>
        <main className="main-area">
          {!editor && errorNotice}
          {recoveryNotice && (
            <div className="recovery-notice" role="alert">
              <p>
                Eine automatische Sicherung wurde geladen, weil die letzte
                Datendatei nicht lesbar war. Prüfe deine Aufgaben: Die jüngste
                Änderung könnte fehlen.
              </p>
              <button
                className="button button-quiet"
                onClick={() => setRecoveryNotice(false)}
              >
                Verstanden
              </button>
            </div>
          )}
          <fieldset className="interaction-group" disabled={busy}>
            {view === "dashboard" && (
              <Dashboard
                data={data}
                now={now}
                onAddTask={addTask}
                onEditTask={editTask}
                onToggleTask={toggleTask}
                onOpenSemester={() => navigate("semester")}
              />
            )}
            {view === "semester" && (
              <SemesterMate
                tasks={data.tasks}
                onAddTask={addTask}
                onEditTask={editTask}
                onToggleTask={toggleTask}
              />
            )}
            {view === "settings" && (
              <Settings
                key={settingsRevision}
                data={data}
                onUpdateProfile={updateProfile}
                onUpdateTheme={updateTheme}
                onReset={resetData}
                onImport={importBackup}
                onExport={exportBackup}
                onDirty={onDirty}
              />
            )}
          </fieldset>
        </main>
      </div>
      {editor && (
        <Modal
          eyebrow="SEMESTERMATE"
          title={editor.mode === "edit" ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
          onClose={closeEditor}
          busy={busy}
        >
          {errorNotice}
          <fieldset className="interaction-group" disabled={busy}>
            <TaskEditor
              task={editor.mode === "edit" ? editor.task : undefined}
              onCancel={closeEditor}
              onSave={saveTask}
              onDirty={onDirty}
            />
            {editor.mode === "edit" && (
              <button
                className="delete-task-button"
                type="button"
                onClick={() => void deleteTask(editor.task)}
              >
                Aufgabe löschen
              </button>
            )}
          </fieldset>
        </Modal>
      )}
      {busy ? (
        <div className="toast" role="status">
          <LoaderCircle className="spinner" size={16} /> Bitte warten …
        </div>
      ) : (
        toast && (
          <div className="toast" role="status">
            <Check size={16} /> {toast}
          </div>
        )
      )}
    </div>
  );
}
