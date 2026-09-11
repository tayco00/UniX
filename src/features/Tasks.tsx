import { CheckCircle2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskRow } from "../components/TaskRow";
import type { Task } from "../domain/model";
import { sortTasks } from "../domain/tasks";

type Filter = "open" | "all" | "done";

export function Tasks({
  tasks,
  now,
  onAdd,
  onEdit,
  onToggle,
}: {
  tasks: Task[];
  now: Date;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
}) {
  const [filter, setFilter] = useState<Filter>("open");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const visible = useMemo(
    () =>
      sortTasks(tasks).filter(
        (task) =>
          (filter === "all" || task.status === filter) &&
          `${task.title} ${task.course} ${task.notes}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [filter, query, tasks],
  );
  const count = (value: Filter) =>
    value === "all"
      ? tasks.length
      : tasks.filter((task) => task.status === value).length;
  return (
    <div className="page tasks-page">
      <header className="page-heading">
        <div>
          <p className="section-label">Planung</p>
          <h1>Aufgaben</h1>
          <p>Alles, was im Studium ansteht.</p>
        </div>
        <button className="button primary" onClick={onAdd}>
          <Plus size={17} /> Neue Aufgabe
        </button>
      </header>
      <section className="task-workspace">
        <header className="task-toolbar">
          <div className="filters" role="group" aria-label="Aufgaben filtern">
            {(["open", "all", "done"] as Filter[]).map((value) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                aria-pressed={filter === value}
                onClick={() => {
                  setFilter(value);
                  setLimit(50);
                }}
              >
                {value === "open"
                  ? "Offen"
                  : value === "all"
                    ? "Alle"
                    : "Erledigt"}
                <span>{count(value)}</span>
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={17} />
            <span className="sr-only">Aufgaben durchsuchen</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(50);
              }}
              placeholder="Aufgaben durchsuchen"
            />
          </label>
        </header>
        {visible.length ? (
          <>
            <div className="task-list">
              {visible.slice(0, limit).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  now={now}
                  onEdit={() => onEdit(task)}
                  onToggle={() => onToggle(task)}
                />
              ))}
            </div>
            <footer className="list-footer">
              <span>
                {Math.min(limit, visible.length)} von {visible.length}
              </span>
              {visible.length > limit && (
                <button
                  className="button secondary"
                  onClick={() => setLimit((value) => value + 50)}
                >
                  Weitere anzeigen
                </button>
              )}
            </footer>
          </>
        ) : (
          <div className="empty-list">
            <CheckCircle2 size={28} />
            <h2>
              {query
                ? "Keine Treffer"
                : filter === "done"
                  ? "Noch nichts erledigt"
                  : tasks.length
                    ? "Alles geschafft"
                    : "Noch keine Aufgaben"}
            </h2>
            <p>
              {query
                ? "Versuche einen anderen Suchbegriff."
                : "Lege eine Aufgabe an, sobald etwas ansteht."}
            </p>
            {query ? (
              <button className="button secondary" onClick={() => setQuery("")}>
                Suche zurücksetzen
              </button>
            ) : (
              filter !== "done" && (
                <button className="button primary" onClick={onAdd}>
                  <Plus size={16} /> Aufgabe anlegen
                </button>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
