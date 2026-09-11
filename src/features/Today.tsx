import { ArrowRight, CalendarDays, Check, Clock3, Plus } from "lucide-react";
import type { AppData, Task } from "../domain/model";
import { dueLabel, minutesLabel, openTasks, weekTasks } from "../domain/tasks";
import { TaskRow } from "../components/TaskRow";

export function Today({
  data,
  now,
  onAdd,
  onEdit,
  onToggle,
  onAll,
}: {
  data: AppData;
  now: Date;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onAll: () => void;
}) {
  const open = openTasks(data.tasks);
  const next = open[0];
  const week = weekTasks(data.tasks, now);
  const done = data.tasks.filter((task) => task.status === "done").length;
  const greeting =
    now.getHours() < 11
      ? "Guten Morgen"
      : now.getHours() < 18
        ? "Hallo"
        : "Guten Abend";
  const date = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return (
    <div className="page today-page">
      <header className="page-heading">
        <div>
          <p className="section-label">{date}</p>
          <h1>
            {greeting}, {data.profile.firstName}.
          </h1>
          <p>Was heute wichtig ist.</p>
        </div>
        {data.tasks.length > 0 && (
          <button className="button primary" onClick={onAdd}>
            <Plus size={17} /> Aufgabe
          </button>
        )}
      </header>
      {!next ? (
        <section className="empty-home">
          <span>
            <Check size={24} />
          </span>
          <h2>
            {done
              ? "Für heute ist alles geschafft."
              : "Dein Plan beginnt hier."}
          </h2>
          <p>
            {done
              ? "Nimm dir Zeit für eine Pause oder plane den nächsten Schritt."
              : "Lege deine erste Aufgabe an – UniX sortiert den Rest."}
          </p>
          <button className="button primary" onClick={onAdd}>
            {done ? "Neue Aufgabe" : "Erste Aufgabe anlegen"}
            <ArrowRight size={16} />
          </button>
        </section>
      ) : (
        <>
          <section className="focus-layout">
            <article className="focus-card">
              <div className="focus-top">
                <span className="soft-badge">Nächster Schritt</span>
                <button
                  className="icon-button focus-check"
                  onClick={() => onToggle(next)}
                  aria-label={`${next.title} erledigen`}
                >
                  <Check size={18} />
                </button>
              </div>
              <button className="focus-title" onClick={() => onEdit(next)}>
                {next.title}
              </button>
              <p>{next.course || "Ohne Modul"}</p>
              <footer>
                <span className={next.dueDate < todayKey(now) ? "overdue" : ""}>
                  <CalendarDays size={16} />
                  {dueLabel(next.dueDate, now)}
                </span>
                <span>
                  <Clock3 size={16} />
                  {minutesLabel(next.estimateMinutes)}
                </span>
              </footer>
            </article>
            <aside className="week-card">
              <p className="section-label">Die nächsten 7 Tage</p>
              <strong>{week.length}</strong>
              <span>
                {week.length === 1 ? "Aufgabe steht an" : "Aufgaben stehen an"}
              </span>
              <div className="week-line">
                <i style={{ width: `${Math.min(100, week.length * 18)}%` }} />
              </div>
              <button className="text-button" onClick={onAll}>
                Alle Aufgaben <ArrowRight size={15} />
              </button>
            </aside>
          </section>
          <section className="upcoming">
            <header>
              <div>
                <p className="section-label">Dein Plan</p>
                <h2>Als Nächstes</h2>
              </div>
              <button className="text-button" onClick={onAll}>
                Alle anzeigen <ArrowRight size={15} />
              </button>
            </header>
            <div>
              {open.slice(0, 5).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  now={now}
                  onEdit={() => onEdit(task)}
                  onToggle={() => onToggle(task)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function todayKey(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
