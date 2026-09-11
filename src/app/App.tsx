import {
  CalendarCheck,
  Check,
  Home,
  LoaderCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../components/Logo";
import { Modal } from "../components/Modal";
import { TaskEditor, type TaskDraft } from "../components/TaskEditor";
import {
  parseData,
  type AppData,
  type Profile,
  type Task,
} from "../domain/model";
import { Onboarding } from "../features/Onboarding";
import { Settings } from "../features/Settings";
import { Tasks } from "../features/Tasks";
import { Today } from "../features/Today";
import { repository } from "../infrastructure/repository";

type View = "today" | "tasks" | "settings";
type Editor = { mode: "new" } | { mode: "edit"; task: Task };

export default function App() {
  const [data, setData] = useState<AppData>();
  const [view, setView] = useState<View>("today");
  const [editor, setEditor] = useState<Editor>();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [recovered, setRecovered] = useState(false);
  const [now, setNow] = useState(new Date());
  const latest = useRef<AppData | undefined>(undefined);
  const busyRef = useRef(false);

  useEffect(() => {
    void Promise.all([repository.load(), repository.info()])
      .then(([loaded, info]) => {
        latest.current = loaded;
        setData(loaded);
        setRecovered(info.recoveredFromBackup);
      })
      .catch(() =>
        setError(
          "UniX konnte deine Daten nicht öffnen. Versuche es erneut oder stelle eine Sicherung wieder her.",
        ),
      );
  }, []);
  useEffect(() => {
    latest.current = data;
  }, [data]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const focus = () => setNow(new Date());
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, []);
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => {
      if (dirty || busyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);

  const confirmDiscard = () =>
    !dirty || window.confirm("Ungespeicherte Eingaben verwerfen?");
  const navigate = (next: View) => {
    if (!confirmDiscard()) return;
    setDirty(false);
    setView(next);
  };
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch {
      setError(
        "Das hat nicht funktioniert. Deine bisherigen Daten wurden nicht verändert.",
      );
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const commit = async (
    change: (current: AppData) => AppData,
    success: string,
  ) =>
    run(async () => {
      if (!latest.current) throw new Error("Noch nicht bereit");
      const candidate = parseData({
        ...change(latest.current),
        updatedAt: new Date().toISOString(),
      });
      const saved = await repository.save(candidate);
      latest.current = saved;
      setData(saved);
      setNotice(success);
      window.setTimeout(() => setNotice(""), 2500);
    });
  const completeSetup = async (profile: Profile) => {
    const success = await commit(
      (current) => ({ ...current, setupCompleted: true, profile }),
      "UniX ist bereit",
    );
    if (success) setDirty(false);
  };
  const saveTask = async (draft: TaskDraft) => {
    const timestamp = new Date().toISOString();
    const success = await commit(
      (current) =>
        editor?.mode === "edit"
          ? {
              ...current,
              tasks: current.tasks.map((task) =>
                task.id === editor.task.id
                  ? { ...task, ...draft, updatedAt: timestamp }
                  : task,
              ),
            }
          : {
              ...current,
              tasks: [
                ...current.tasks,
                {
                  ...draft,
                  id: crypto.randomUUID(),
                  status: "open",
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
              ],
            },
      editor?.mode === "edit" ? "Aufgabe gespeichert" : "Aufgabe angelegt",
    );
    if (success) {
      setEditor(undefined);
      setDirty(false);
    }
  };
  const toggle = (task: Task) =>
    void commit(
      (current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: item.status === "open" ? "done" : "open",
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      }),
      task.status === "open" ? "Aufgabe erledigt" : "Aufgabe wieder geöffnet",
    );
  const remove = async (task: Task) => {
    if (!window.confirm(`„${task.title}“ wirklich löschen?`)) return;
    const success = await commit(
      (current) => ({
        ...current,
        tasks: current.tasks.filter((item) => item.id !== task.id),
      }),
      "Aufgabe gelöscht",
    );
    if (success) {
      setEditor(undefined);
      setDirty(false);
    }
  };
  const saveProfile = async (profile: Profile) => {
    const success = await commit(
      (current) => ({ ...current, profile }),
      "Profil gespeichert",
    );
    if (success) setDirty(false);
    return success;
  };
  const exportBackup = async () => {
    await run(async () => {
      const result = await repository.exportBackup();
      if (!result.canceled) setNotice("Sicherung gespeichert");
    });
  };
  const importBackup = async () => {
    if (!confirmDiscard()) return;
    await run(async () => {
      const result = await repository.importBackup();
      if (result.canceled || !result.data) return;
      const loaded = parseData(result.data);
      latest.current = loaded;
      setData(loaded);
      setDirty(false);
      setNotice("Sicherung wiederhergestellt");
    });
  };
  const reset = async () => {
    if (
      !window.confirm(
        "UniX wirklich zurücksetzen? Profil und Aufgaben werden entfernt.",
      )
    )
      return;
    await run(async () => {
      const fresh = await repository.reset();
      latest.current = fresh;
      setData(fresh);
      setDirty(false);
      setView("today");
      setNotice("");
    });
  };

  if (!data && !error)
    return (
      <main className="center-state">
        <LoaderCircle className="spin" />
        <p>UniX wird geöffnet …</p>
      </main>
    );
  if (!data)
    return (
      <main className="center-state">
        <Logo />
        <h1>UniX konnte nicht starten.</h1>
        <p>{error}</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Erneut versuchen
        </button>
        <button
          className="button secondary"
          disabled={!window.unixApi}
          onClick={() => void importBackup()}
        >
          Sicherung wiederherstellen
        </button>
      </main>
    );
  if (!data.setupCompleted)
    return (
      <Onboarding
        busy={busy}
        error={error}
        onComplete={completeSetup}
        onDirty={setDirty}
      />
    );

  return (
    <div className="app-shell" aria-busy={busy}>
      <div
        className="app-content"
        inert={editor ? true : undefined}
        aria-hidden={editor ? true : undefined}
      >
        <aside className="sidebar">
          <Logo />
          <nav aria-label="Hauptnavigation">
            <button
              className={view === "today" ? "active" : ""}
              aria-current={view === "today" ? "page" : undefined}
              onClick={() => navigate("today")}
            >
              <Home size={18} />
              Heute
            </button>
            <button
              className={view === "tasks" ? "active" : ""}
              aria-current={view === "tasks" ? "page" : undefined}
              onClick={() => navigate("tasks")}
            >
              <CalendarCheck size={18} />
              Aufgaben
            </button>
          </nav>
          <div className="sidebar-bottom">
            <button
              className={view === "settings" ? "active" : ""}
              aria-current={view === "settings" ? "page" : undefined}
              onClick={() => navigate("settings")}
            >
              <SettingsIcon size={18} />
              Einstellungen
            </button>
            <div className="profile">
              <span>{data.profile.firstName.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{data.profile.firstName}</strong>
                <small>{data.profile.courseOfStudy}</small>
              </div>
            </div>
          </div>
        </aside>
        <main className="main-area">
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          {recovered && (
            <div className="notice recovery" role="alert">
              <p>
                Eine automatische Sicherung wurde geladen. Prüfe bitte deine
                jüngsten Aufgaben.
              </p>
              <button
                className="text-button"
                onClick={() => setRecovered(false)}
              >
                Verstanden
              </button>
            </div>
          )}
          <fieldset className="interaction-layer" disabled={busy}>
            {view === "today" && (
              <Today
                data={data}
                now={now}
                onAdd={() => {
                  setNotice("");
                  setEditor({ mode: "new" });
                }}
                onEdit={(task) => {
                  setNotice("");
                  setEditor({ mode: "edit", task });
                }}
                onToggle={toggle}
                onAll={() => navigate("tasks")}
              />
            )}
            {view === "tasks" && (
              <Tasks
                tasks={data.tasks}
                now={now}
                onAdd={() => {
                  setNotice("");
                  setEditor({ mode: "new" });
                }}
                onEdit={(task) => {
                  setNotice("");
                  setEditor({ mode: "edit", task });
                }}
                onToggle={toggle}
              />
            )}
            {view === "settings" && (
              <Settings
                key={JSON.stringify(data.profile)}
                saved={data.profile}
                onSave={saveProfile}
                onExport={exportBackup}
                onImport={importBackup}
                onReset={reset}
                onDirty={setDirty}
              />
            )}
          </fieldset>
        </main>
      </div>
      {editor && (
        <Modal
          title={editor.mode === "edit" ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
          busy={busy}
          onClose={() => {
            if (confirmDiscard()) {
              setEditor(undefined);
              setDirty(false);
            }
          }}
        >
          {error && (
            <p className="notice error modal-error" role="alert">
              {error}
            </p>
          )}
          <fieldset className="interaction-layer" disabled={busy}>
            <TaskEditor
              task={editor.mode === "edit" ? editor.task : undefined}
              onSave={(draft) => void saveTask(draft)}
              onCancel={() => {
                if (confirmDiscard()) {
                  setEditor(undefined);
                  setDirty(false);
                }
              }}
              onDelete={
                editor.mode === "edit"
                  ? () => void remove(editor.task)
                  : undefined
              }
              onDirty={setDirty}
            />
          </fieldset>
        </Modal>
      )}
      {busy && (
        <div className="toast" role="status">
          <LoaderCircle className="spin" size={17} />
          Bitte warten …
        </div>
      )}
      {notice && !busy && !editor && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
    </div>
  );
}
