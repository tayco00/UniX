import { useState, type FormEvent } from "react";
import type { Priority, Task, TaskType } from "../domain/model";
import { localDateKey, priorityLabels, taskTypeLabels } from "../domain/tasks";

export type TaskDraft = Omit<Task, "id" | "status" | "createdAt" | "updatedAt">;
const initialDraft = (): TaskDraft => ({
  title: "",
  course: "",
  type: "assignment",
  dueDate: localDateKey(),
  estimateMinutes: 60,
  priority: "medium",
  notes: "",
});

export function TaskEditor({
  task,
  onSave,
  onCancel,
  onDelete,
  onDirty,
}: {
  task?: Task;
  onSave: (draft: TaskDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(
    task
      ? {
          title: task.title,
          course: task.course,
          type: task.type,
          dueDate: task.dueDate,
          estimateMinutes: task.estimateMinutes,
          priority: task.priority,
          notes: task.notes,
        }
      : initialDraft(),
  );
  const [initial] = useState(draft);
  const [error, setError] = useState("");
  const update = (next: TaskDraft) => {
    setDraft(next);
    setError("");
    onDirty(JSON.stringify(next) !== JSON.stringify(initial));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Bitte gib der Aufgabe einen Titel.");
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      course: draft.course.trim(),
      notes: draft.notes.trim(),
    });
  };
  return (
    <form className="task-form" onSubmit={submit} noValidate>
      {error && (
        <p className="notice error field-wide" role="alert">
          {error}
        </p>
      )}
      <label className="field field-wide">
        <span>Titel</span>
        <input
          autoFocus
          maxLength={140}
          value={draft.title}
          onChange={(event) => update({ ...draft, title: event.target.value })}
          placeholder="Was steht an?"
          required
        />
      </label>
      <label className="field">
        <span>Modul oder Bereich</span>
        <input
          maxLength={100}
          value={draft.course}
          onChange={(event) => update({ ...draft, course: event.target.value })}
          placeholder="z. B. Statistik"
        />
      </label>
      <label className="field">
        <span>Art</span>
        <select
          value={draft.type}
          onChange={(event) =>
            update({ ...draft, type: event.target.value as TaskType })
          }
        >
          {Object.entries(taskTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Fällig am</span>
        <input
          type="date"
          min="0001-01-01"
          max="9999-12-31"
          value={draft.dueDate}
          onChange={(event) =>
            update({ ...draft, dueDate: event.target.value })
          }
          required
        />
      </label>
      <label className="field">
        <span>Aufwand in Minuten</span>
        <input
          type="number"
          min={0}
          max={1440}
          step={1}
          value={
            Number.isNaN(draft.estimateMinutes) ? "" : draft.estimateMinutes
          }
          onChange={(event) =>
            update({ ...draft, estimateMinutes: event.target.valueAsNumber })
          }
          required
        />
      </label>
      <fieldset className="field field-wide priority">
        <legend>Priorität</legend>
        <div>
          {(Object.keys(priorityLabels) as Priority[]).map((priority) => (
            <button
              key={priority}
              type="button"
              className={draft.priority === priority ? "active" : ""}
              aria-pressed={draft.priority === priority}
              onClick={() => update({ ...draft, priority })}
            >
              {priorityLabels[priority]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="field field-wide">
        <span>
          Notiz <small>(optional)</small>
        </span>
        <textarea
          maxLength={2000}
          rows={3}
          value={draft.notes}
          onChange={(event) => update({ ...draft, notes: event.target.value })}
          placeholder="Details, Links oder Teilaufgaben"
        />
      </label>
      <footer className="modal-actions">
        {onDelete && (
          <button type="button" className="danger-link" onClick={onDelete}>
            Aufgabe löschen
          </button>
        )}
        <span />
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button primary">
          {task ? "Speichern" : "Aufgabe anlegen"}
        </button>
      </footer>
    </form>
  );
}
