import { useState, type FormEvent } from "react";
import type { Priority, Task, TaskType } from "../domain/model";
import { priorityLabels, taskTypeLabels, todayKey } from "../domain/tasks";

export type TaskDraft = Omit<Task, "id" | "status" | "createdAt" | "updatedAt">;

const emptyDraft = (): TaskDraft => ({
  title: "",
  module: "",
  type: "assignment",
  dueDate: todayKey(),
  estimateMinutes: 60,
  priority: "medium",
  notes: "",
});

export function TaskEditor({
  task,
  onCancel,
  onSave,
  onDirty,
}: {
  task?: Task;
  onCancel: () => void;
  onSave: (draft: TaskDraft) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(
    task
      ? {
          title: task.title,
          module: task.module,
          type: task.type,
          dueDate: task.dueDate,
          estimateMinutes: task.estimateMinutes,
          priority: task.priority,
          notes: task.notes,
        }
      : emptyDraft(),
  );
  const [initial] = useState(draft);
  const [validation, setValidation] = useState("");
  function update(next: TaskDraft) {
    setDraft(next);
    onDirty(JSON.stringify(next) !== JSON.stringify(initial));
    setValidation("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setValidation(
        "Bitte gib der Aufgabe einen Titel. Leerzeichen allein genügen nicht.",
      );
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      module: draft.module.trim(),
      notes: draft.notes.trim(),
    });
  }

  return (
    <form className="task-form" onSubmit={submit}>
      {validation && (
        <p className="error-notice field-wide" role="alert">
          {validation}
        </p>
      )}
      <label className="field field-wide">
        <span>Aufgabe</span>
        <input
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
          value={draft.module}
          onChange={(event) => update({ ...draft, module: event.target.value })}
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
      <div className="field">
        <label htmlFor="task-estimate">Aufwand in Minuten</label>
        <input
          id="task-estimate"
          type="number"
          min={0}
          max={1440}
          step={1}
          required
          value={
            Number.isNaN(draft.estimateMinutes) ? "" : draft.estimateMinutes
          }
          onChange={(event) =>
            update({ ...draft, estimateMinutes: event.target.valueAsNumber })
          }
        />
      </div>
      <fieldset className="field field-wide priority-field">
        <legend>Priorität</legend>
        <div className="segmented-control">
          {(Object.keys(priorityLabels) as Priority[]).map((priority) => (
            <button
              type="button"
              key={priority}
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
          rows={4}
          value={draft.notes}
          onChange={(event) => update({ ...draft, notes: event.target.value })}
          placeholder="Links, Teilaufgaben oder eine kurze Erinnerung"
        />
      </label>
      <footer className="modal-actions">
        <button
          type="button"
          className="button button-quiet"
          onClick={onCancel}
        >
          Abbrechen
        </button>
        <button type="submit" className="button button-primary">
          {task ? "Änderungen speichern" : "Aufgabe anlegen"}
        </button>
      </footer>
    </form>
  );
}
