import { BriefcaseBusiness, CalendarCheck, Check, Home, LoaderCircle, Settings as SettingsIcon, ShoppingBag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "../components/Logo";
import { Modal } from "../components/Modal";
import { TaskEditor, type TaskDraft } from "../components/TaskEditor";
import { appDataSchema, type AppData, type Profile, type Task, type Theme } from "../domain/model";
import { createDemoTasks } from "../domain/tasks";
import { Dashboard } from "../features/dashboard/Dashboard";
import { Onboarding } from "../features/onboarding/Onboarding";
import { SemesterMate } from "../features/semester/SemesterMate";
import { Settings } from "../features/settings/Settings";
import { repository } from "../infrastructure/repository";

type View = "dashboard" | "semester" | "settings";
type EditorState = { mode: "create" } | { mode: "edit"; task: Task } | null;

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = resolved;
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [editor, setEditor] = useState<EditorState>(null);
  const [toast, setToast] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    repository.load().then((loaded) => {
      const parsed = appDataSchema.parse(loaded);
      setData(parsed);
      applyTheme(parsed.settings.theme);
    }).catch(() => setLoadError("UniX konnte die lokalen Daten nicht öffnen."));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const commit = (next: AppData, message?: string) => {
    const parsed = appDataSchema.parse({ ...next, updatedAt: new Date().toISOString() });
    setData(parsed);
    void repository.save(parsed).catch(() => setToast("Änderung konnte nicht lokal gespeichert werden"));
    if (message) setToast(message);
  };

  const actions = useMemo(() => data ? {
    completeOnboarding(profile: Profile, withDemo: boolean) {
      commit({ ...data, onboardingCompleted: true, profile, tasks: withDemo ? createDemoTasks() : [] }, "UniX ist bereit");
    },
    saveTask(draft: TaskDraft) {
      const now = new Date().toISOString();
      if (editor?.mode === "edit") {
        commit({ ...data, tasks: data.tasks.map((task) => task.id === editor.task.id ? { ...task, ...draft, updatedAt: now } : task) }, "Aufgabe aktualisiert");
      } else {
        const task: Task = { ...draft, id: crypto.randomUUID(), status: "open", createdAt: now, updatedAt: now };
        commit({ ...data, tasks: [...data.tasks, task] }, "Aufgabe angelegt");
      }
      setEditor(null);
    },
    toggleTask(task: Task) {
      commit({ ...data, tasks: data.tasks.map((entry) => entry.id === task.id ? { ...entry, status: entry.status === "done" ? "open" : "done", updatedAt: new Date().toISOString() } : entry) }, task.status === "done" ? "Aufgabe wieder geöffnet" : "Gut gemacht — Aufgabe erledigt");
    },
    deleteTask(task: Task) {
      if (!window.confirm(`„${task.title}“ wirklich löschen?`)) return;
      commit({ ...data, tasks: data.tasks.filter((entry) => entry.id !== task.id) }, "Aufgabe gelöscht");
      setEditor(null);
    },
    updateProfile(profile: Profile) { commit({ ...data, profile }, "Profil gespeichert"); },
    updateTheme(theme: Theme) { applyTheme(theme); commit({ ...data, settings: { ...data.settings, theme } }, "Darstellung aktualisiert"); },
  } : null, [data, editor]);

  if (loadError) return <main className="fatal-state"><Logo /><h1>Lokale Daten nicht verfügbar</h1><p>{loadError}</p><button className="button button-primary" onClick={() => window.location.reload()}>Erneut versuchen</button></main>;
  if (!data || !actions) return <main className="loading-state"><Logo /><LoaderCircle className="spinner" /><p>Dein UniX wird geöffnet …</p></main>;
  if (!data.onboardingCompleted) return <Onboarding onComplete={actions.completeOnboarding} />;

  const editTask = (task: Task) => setEditor({ mode: "edit", task });
  const resetData = async () => {
    if (!window.confirm("Alle lokalen UniX-Daten wirklich zurücksetzen? Exportiere vorher ein Backup, wenn du sie behalten möchtest.")) return;
    const reset = await repository.reset();
    applyTheme(reset.settings.theme);
    setData(reset);
    setView("dashboard");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Hauptnavigation">
          <p className="nav-label">DEIN UNIX</p>
          <button className={view === "dashboard" ? "active" : ""} type="button" onClick={() => setView("dashboard")}><Home size={18} /> Heute</button>
          <button className={view === "semester" ? "active" : ""} type="button" onClick={() => setView("semester")}><CalendarCheck size={18} /> SemesterMate</button>
          <p className="nav-label later-label">SPÄTER</p>
          <button className="planned" type="button" disabled><BriefcaseBusiness size={18} /> CampusGig <span>M2</span></button>
          <button className="planned" type="button" disabled><ShoppingBag size={18} /> Marketplace <span>M3</span></button>
          <button className="planned" type="button" disabled><Users size={18} /> StudyMatch <span>M3</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button className={view === "settings" ? "active" : ""} type="button" onClick={() => setView("settings")}><SettingsIcon size={18} /> Einstellungen</button>
          <div className="local-status"><span /><div><strong>Nur auf diesem PC</strong><small>Zuletzt lokal gespeichert</small></div></div>
          <div className="profile-chip"><span>{data.profile.name.slice(0, 1).toUpperCase()}</span><div><strong>{data.profile.name}</strong><small>{data.profile.studyProgram}</small></div></div>
        </div>
      </aside>
      <main className="main-area">
        {view === "dashboard" && <Dashboard data={data} onAddTask={() => setEditor({ mode: "create" })} onEditTask={editTask} onToggleTask={actions.toggleTask} onOpenSemester={() => setView("semester")} />}
        {view === "semester" && <SemesterMate tasks={data.tasks} onAddTask={() => setEditor({ mode: "create" })} onEditTask={editTask} onToggleTask={actions.toggleTask} />}
        {view === "settings" && <Settings data={data} onUpdateProfile={actions.updateProfile} onUpdateTheme={actions.updateTheme} onReset={() => void resetData()} onImported={(imported) => { setData(imported); applyTheme(imported.settings.theme); }} notify={setToast} />}
      </main>
      {editor && <Modal eyebrow="SEMESTERMATE" title={editor.mode === "edit" ? "Aufgabe bearbeiten" : "Neue Aufgabe"} onClose={() => setEditor(null)}>
        <TaskEditor task={editor.mode === "edit" ? editor.task : undefined} onCancel={() => setEditor(null)} onSave={actions.saveTask} />
        {editor.mode === "edit" && <button className="delete-task-button" type="button" onClick={() => actions.deleteTask(editor.task)}>Aufgabe löschen</button>}
      </Modal>}
      {toast && <div className="toast" role="status"><Check size={15} /> {toast}</div>}
    </div>
  );
}
