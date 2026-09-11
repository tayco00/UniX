import { Check, MoreHorizontal } from "lucide-react";
import type { Task } from "../domain/model";
import { dueLabel, minutesLabel, taskTypeLabels } from "../domain/tasks";

export function TaskRow({
  task,
  onToggle,
  onEdit,
  now = new Date(),
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  now?: Date;
}) {
  const overdue =
    task.status === "open" &&
    task.dueDate <
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return (
    <article className={`task-row ${task.status === "done" ? "done" : ""}`}>
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
        {task.status === "done" && <Check size={15} />}
      </button>
      <div className="task-copy">
        <button className="task-title" type="button" onClick={onEdit}>
          {task.title}
        </button>
        <p>
          {task.course || taskTypeLabels[task.type]}
          <span>·</span>
          {taskTypeLabels[task.type]}
          <span>·</span>
          {minutesLabel(task.estimateMinutes)}
        </p>
      </div>
      <span className={`task-due ${overdue ? "overdue" : ""}`}>
        {task.status === "done" ? "Erledigt" : dueLabel(task.dueDate, now)}
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
