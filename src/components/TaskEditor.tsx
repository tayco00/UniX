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

export function TaskEditor({ task, onCancel, onSave }: {
  task?: Task;
  onCancel: () => void;
  onSave: (draft: TaskDraft) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(task ? {
    title: task.title,
    module: task.module,
    type: task.type,
    dueDate: task.dueDate,
    estimateMinutes: task.estimateMinutes,
    priority: task.priority,
    notes: task.notes,
  } : emptyDraft());

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, title: draft.title.trim(), module: draft.module.trim(), notes: draft.notes.trim() });
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <label className="field field-wide">
        <span>Aufgabe</span>
        <input autoFocus maxLength={140} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Was steht an?" required />
      </label>
      <label className="field">
        <span>Modul oder Bereich</span>
        <input maxLength={100} value={draft.module} onChange={(event) => setDraft({ ...draft, module: event.target.value })} placeholder="z. B. Statistik" />
      </label>
      <label className="field">
        <span>Art</span>
        <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as TaskType })}>
          {Object.entries(taskTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Fällig am</span>
        <input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} required />
      </label>
      <label className="field">
        <span>Aufwand</span>
        <select value={draft.estimateMinutes} onChange={(event) => setDraft({ ...draft, estimateMinutes: Number(event.target.value) })}>
          {[15, 30, 45, 60, 90, 120, 180, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes < 60 ? `${minutes} Min.` : `${minutes / 60} Std.`}</option>)}
        </select>
      </label>
      <fieldset className="field field-wide priority-field">
        <legend>Priorität</legend>
        <div className="segmented-control">
          {(Object.keys(priorityLabels) as Priority[]).map((priority) => (
            <button type="button" key={priority} className={draft.priority === priority ? "active" : ""} aria-pressed={draft.priority === priority} onClick={() => setDraft({ ...draft, priority })}>
              {priorityLabels[priority]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="field field-wide">
        <span>Notiz <small>optional</small></span>
        <textarea maxLength={2000} rows={4} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Links, Teilaufgaben oder eine kurze Erinnerung" />
      </label>
      <footer className="modal-actions">
        <button type="button" className="button button-quiet" onClick={onCancel}>Abbrechen</button>
        <button type="submit" className="button button-primary">{task ? "Änderungen speichern" : "Aufgabe anlegen"}</button>
      </footer>
    </form>
  );
}
