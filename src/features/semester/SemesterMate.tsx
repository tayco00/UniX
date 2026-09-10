import { CheckCircle2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskRow } from "../../components/TaskRow";
import type { Task } from "../../domain/model";
import { sortTasks } from "../../domain/tasks";

type Filter = "open" | "all" | "done";

export function SemesterMate({ tasks, onAddTask, onEditTask, onToggleTask }: {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task) => void;
}) {
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => sortTasks(tasks).filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter;
    const haystack = `${task.title} ${task.module} ${task.notes}`.toLowerCase();
    return matchesFilter && haystack.includes(search.trim().toLowerCase());
  }), [filter, search, tasks]);

  return (
    <div className="page semester-page">
      <header className="page-title-row">
        <div><p className="eyebrow">SEMESTERMATE</p><h1>Semester im Griff.</h1><p>Fristen, Lernblöcke und Organisation in einer ruhigen Liste.</p></div>
        <button className="button button-primary" type="button" onClick={onAddTask}><Plus size={17} /> Neue Aufgabe</button>
      </header>
      <section className="panel workspace-panel">
        <header className="workspace-toolbar">
          <div className="filter-tabs" role="group" aria-label="Aufgaben filtern">
            {(["open", "all", "done"] as Filter[]).map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "open" ? "Offen" : value === "all" ? "Alle" : "Erledigt"}<span>{value === "all" ? tasks.length : tasks.filter((task) => task.status === value).length}</span></button>)}
          </div>
          <label className="search-field"><Search size={16} /><span className="sr-only">Aufgaben durchsuchen</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Aufgaben durchsuchen" /></label>
        </header>
        {visible.length ? <div className="task-list large-list">{visible.map((task) => <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task)} onEdit={() => onEditTask(task)} />)}</div> : (
          <div className="empty-panel large-empty"><span><CheckCircle2 size={25} /></span><h3>{search ? "Keine Treffer" : filter === "done" ? "Noch nichts erledigt" : "Dein Semester ist frei"}</h3><p>{search ? "Probiere einen anderen Suchbegriff." : "Lege deine nächste Prüfung, Abgabe oder Lerneinheit an."}</p>{!search && <button className="button button-primary" type="button" onClick={onAddTask}><Plus size={16} /> Aufgabe anlegen</button>}</div>
        )}
      </section>
    </div>
  );
}
