import { ArrowRight, BookOpen, CalendarDays, Check, Clock3, Plus, Sparkles } from "lucide-react";
import type { AppData, Task } from "../../domain/model";
import { dueThisWeek, formatDueLabel, openTasks, plannedMinutes, taskTypeLabels } from "../../domain/tasks";
import { TaskRow } from "../../components/TaskRow";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} Std. ${rest} Min.` : `${hours} Std.`;
}

export function Dashboard({ data, onAddTask, onEditTask, onToggleTask, onOpenSemester }: {
  data: AppData;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task) => void;
  onOpenSemester: () => void;
}) {
  const open = openTasks(data.tasks);
  const next = open[0];
  const week = dueThisWeek(data.tasks);
  const done = data.tasks.filter((task) => task.status === "done").length;
  const progress = data.tasks.length ? Math.round((done / data.tasks.length) * 100) : 0;
  const firstName = data.profile.name.split(/\s+/)[0];
  const dateLabel = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());

  return (
    <div className="page dashboard-page">
      <header className="page-title-row">
        <div>
          <p className="date-label">{dateLabel}</p>
          <h1>Guten Morgen, {firstName}.</h1>
          <p>Hier ist, was heute wirklich zählt.</p>
        </div>
        <button className="button button-primary" type="button" onClick={onAddTask}><Plus size={17} /> Aufgabe</button>
      </header>

      <section className="focus-card">
        <div className="focus-kicker"><Sparkles size={15} /><span>NÄCHSTER SCHRITT</span></div>
        {next ? (
          <>
            <div className="focus-content">
              <div>
                <p>{next.module || taskTypeLabels[next.type]}</p>
                <h2>{next.title}</h2>
              </div>
              <div className="focus-meta">
                <span><CalendarDays size={16} /> {formatDueLabel(next.dueDate)}</span>
                <span><Clock3 size={16} /> {formatMinutes(next.estimateMinutes)}</span>
              </div>
            </div>
            <button className="focus-action" type="button" onClick={() => onToggleTask(next)}><Check size={17} /> Als erledigt markieren</button>
          </>
        ) : (
          <div className="focus-empty">
            <div><p>Alles im Blick</p><h2>Deine Liste ist frei.</h2></div>
            <button className="button button-inverse" type="button" onClick={onAddTask}>Erste Aufgabe anlegen</button>
          </div>
        )}
      </section>

      <section className="metric-grid" aria-label="Studienübersicht">
        <article className="metric-card"><div className="metric-icon coral"><CalendarDays size={19} /></div><div><strong>{week.length}</strong><span>Fristen diese Woche</span></div><small>{week.length ? "Rechtzeitig einplanen" : "Keine akuten Fristen"}</small></article>
        <article className="metric-card"><div className="metric-icon blue"><BookOpen size={19} /></div><div><strong>{open.length}</strong><span>Offene Aufgaben</span></div><small>{open.length ? `${open.filter((task) => task.priority === "high").length} mit hoher Priorität` : "Alles erledigt"}</small></article>
        <article className="metric-card"><div className="metric-icon sand"><Clock3 size={19} /></div><div><strong>{formatMinutes(plannedMinutes(data.tasks))}</strong><span>Geplanter Aufwand</span></div><small>Über alle offenen Aufgaben</small></article>
        <article className="metric-card progress-card"><div className="metric-progress"><span style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><b>{progress}%</b></span></div><div><span>Fortschritt</span><small>{done} von {data.tasks.length} erledigt</small></div></article>
      </section>

      <section className="content-grid">
        <div className="panel tasks-panel">
          <header className="panel-header"><div><p className="eyebrow">DEINE WOCHE</p><h2>Als Nächstes</h2></div><button className="text-button" type="button" onClick={onOpenSemester}>Alle Aufgaben <ArrowRight size={15} /></button></header>
          {open.length ? <div className="task-list">{open.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task)} onEdit={() => onEditTask(task)} />)}</div> : <div className="empty-panel"><span><Check size={22} /></span><h3>Nichts offen</h3><p>Plane eine Aufgabe, wenn etwas Neues ansteht.</p><button className="text-button" type="button" onClick={onAddTask}>Aufgabe anlegen</button></div>}
        </div>
        <aside className="panel semester-card">
          <div className="semester-top"><p className="eyebrow">DEIN KONTEXT</p><span>{data.profile.semester || "Semester"}</span></div>
          <h2>{data.profile.studyProgram}</h2>
          <p>{data.profile.university}</p>
          <div className="semester-rule" />
          <div className="semester-stats"><div><strong>{new Set(open.map((task) => task.module).filter(Boolean)).size}</strong><span>aktive Module</span></div><div><strong>{done}</strong><span>erledigt</span></div></div>
          <button className="button button-quiet wide-button" type="button" onClick={onOpenSemester}>Semester öffnen <ArrowRight size={15} /></button>
        </aside>
      </section>
    </div>
  );
}
