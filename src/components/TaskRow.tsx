import { Check, Circle, MoreHorizontal } from "lucide-react";
import type { Task } from "../domain/model";
import { formatDueLabel, taskTypeLabels } from "../domain/tasks";

export function TaskRow({
  task,
  onToggle,
  onEdit,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const isOverdue =
    task.status === "open" &&
    formatDueLabel(task.dueDate).includes("überfällig");
  return (
    <article
      className={`task-row ${task.status === "done" ? "task-done" : ""}`}
    >
      <button
        className="task-check"
        type="button"
        onClick={onToggle}
        aria-label={
          task.status === "done"
            ? `${task.title} wieder öffnen`
            : `${task.title} erledigen`
        }
      >
        {task.status === "done" ? <Check size={16} /> : <Circle size={16} />}
      </button>
      <div className={`type-mark type-${task.type}`} aria-hidden="true" />
      <div className="task-main">
        <h3>
          <button
            className="task-title-button"
            type="button"
            onClick={onEdit}
            title={task.title}
          >
            {task.title}
          </button>
        </h3>
        <p>
          {task.module ? `${task.module} · ` : ""}
          {taskTypeLabels[task.type]} ·{" "}
          {task.estimateMinutes
            ? `${task.estimateMinutes} Min.`
            : "Aufwand offen"}
          {task.priority === "high" ? " · Hohe Priorität" : ""}
          {task.notes ? " · Mit Notiz" : ""}
        </p>
      </div>
      <span
        title={`Fällig am ${task.dueDate.split("-").reverse().join(".")}`}
        className={`due-label ${isOverdue ? "overdue" : ""}`}
      >
        {task.status === "done" ? "Erledigt" : formatDueLabel(task.dueDate)}
      </span>
      <button
        className="icon-button row-menu"
        type="button"
        onClick={onEdit}
        aria-label={`${task.title} bearbeiten`}
      >
        <MoreHorizontal size={18} />
      </button>
    </article>
  );
}
