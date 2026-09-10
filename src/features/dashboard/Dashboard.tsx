import { ArrowRight, CalendarDays, Check, Clock3, Plus } from "lucide-react";
import type { AppData, Task } from "../../domain/model";
import {
  dueThisWeek,
  formatDueLabel,
  openTasks,
  plannedMinutes,
  taskTypeLabels,
  todayKey,
} from "../../domain/tasks";
import { TaskRow } from "../../components/TaskRow";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} Std. ${rest} Min.` : `${hours} Std.`;
}

export function Dashboard({
  data,
  now,
  onAddTask,
  onEditTask,
  onToggleTask,
  onOpenSemester,
}: {
  data: AppData;
  now: Date;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task) => void;
  onOpenSemester: () => void;
}) {
  const open = openTasks(data.tasks);
  const next = open[0];
  const week = dueThisWeek(data.tasks, now);
  const overdue = open.filter((task) => task.dueDate < todayKey(now)).length;
  const done = data.tasks.filter((task) => task.status === "done").length;
  const firstName = data.profile.name.split(/\s+/)[0];
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const greeting =
    now.getHours() < 11
      ? "Guten Morgen"
      : now.getHours() < 18
        ? "Hallo"
        : "Guten Abend";

  return (
    <div className="page dashboard-page">
      <header className="page-title-row">
        <div>
          <p className="date-label">{dateLabel}</p>
          <h1>
            {greeting}, {firstName}.
          </h1>
          <p>Dein Tag, auf einen Blick.</p>
        </div>
        {data.tasks.length > 0 && (
          <button
            className="button button-primary"
            type="button"
            onClick={onAddTask}
          >
            <Plus size={17} /> Aufgabe
          </button>
        )}
      </header>

      {data.tasks.length > 0 && (
        <dl className="overview-strip" aria-label="Studienübersicht">
          <div>
            <dt>Offene Aufgaben</dt>
            <dd>{open.length}</dd>
            <span>{done} erledigt</span>
          </div>
          <div>
            <dt>Fristen bis Sonntag</dt>
            <dd>{week.length}</dd>
            <span className={overdue ? "overdue" : ""}>
              {overdue
                ? `${overdue} zusätzlich überfällig`
                : "Ab heute gerechnet"}
            </span>
          </div>
          <div>
            <dt>Geplanter Aufwand</dt>
            <dd>{formatMinutes(plannedMinutes(data.tasks))}</dd>
            <span>Für alle offenen Aufgaben</span>
          </div>
        </dl>
      )}

      <section
        className={`focus-card ${next ? "" : "focus-card-empty"}`}
        aria-label="Nächster Schritt"
      >
        {next ? (
          <>
            <div className="focus-content">
              <p className="eyebrow">Als Nächstes</p>
              <h2>
                <button
                  className="task-title-button"
                  type="button"
                  onClick={() => onEditTask(next)}
                >
                  {next.title}
                </button>
              </h2>
              <p className="focus-subject">
                {next.module || taskTypeLabels[next.type]}
              </p>
              <div className="focus-meta">
                <span className={next.dueDate < todayKey(now) ? "overdue" : ""}>
                  <CalendarDays size={15} /> {formatDueLabel(next.dueDate)}
                </span>
                <span>
                  <Clock3 size={15} />{" "}
                  {next.estimateMinutes
                    ? formatMinutes(next.estimateMinutes)
                    : "Aufwand offen"}
                </span>
              </div>
            </div>
            <button
              className="button button-quiet focus-action"
              type="button"
              onClick={() => onToggleTask(next)}
            >
              <Check size={17} /> Als erledigt markieren
            </button>
          </>
        ) : (
          <div className="focus-empty">
            <span className="empty-symbol" aria-hidden="true">
              {done ? <Check size={24} /> : <Plus size={24} />}
            </span>
            <h2>{done ? "Alles erledigt." : "Was steht bei dir an?"}</h2>
            <p>
              {done
                ? "Dein Plan ist auf dem aktuellen Stand. Zeit für eine Pause."
                : "Starte mit deiner nächsten Prüfung, Abgabe oder Lerneinheit."}
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={onAddTask}
            >
              {done ? "Neue Aufgabe anlegen" : "Erste Aufgabe anlegen"}
              <ArrowRight size={16} />
            </button>
            {done > 0 && (
              <button
                className="text-button"
                type="button"
                onClick={onOpenSemester}
              >
                Zur Aufgabenliste <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </section>

      {next && (
        <section className="tasks-panel" aria-labelledby="upcoming-title">
          <header className="panel-header">
            <div>
              <h2 id="upcoming-title">Deine Aufgaben</h2>
              <p>Nach Fälligkeit sortiert</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={onOpenSemester}
            >
              Zur Aufgabenliste <ArrowRight size={15} />
            </button>
          </header>
          <div className="task-list">
            {open.slice(0, 5).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task)}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </div>
        </section>
      )}

      <footer className="study-context">
        <span>{data.profile.university}</span>
        <span>{data.profile.studyProgram}</span>
        {data.profile.semester && <span>{data.profile.semester}</span>}
      </footer>
    </div>
  );
}
