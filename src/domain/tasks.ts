import type { Priority, Task, TaskType } from "./model";

export const taskTypeLabels: Record<TaskType, string> = {
  exam: "Prüfung",
  assignment: "Abgabe",
  study: "Lernblock",
  admin: "Organisation",
};

export const priorityLabels: Record<Priority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

function localDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function todayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysUntil(date: string, now = new Date()) {
  const start = localDate(todayKey(now)).getTime();
  return Math.round((localDate(date).getTime() - start) / 86_400_000);
}

export function formatDueLabel(date: string, now = new Date()) {
  const difference = daysUntil(date, now);
  if (difference < 0) return `${Math.abs(difference)} Tg. überfällig`;
  if (difference === 0) return "Heute";
  if (difference === 1) return "Morgen";
  if (difference <= 7) return `In ${difference} Tagen`;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" }).format(localDate(date));
}

export function sortTasks(tasks: Task[]) {
  const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((left, right) => {
    if (left.status !== right.status) return left.status === "open" ? -1 : 1;
    const dateOrder = left.dueDate.localeCompare(right.dueDate);
    if (dateOrder !== 0) return dateOrder;
    return priorityWeight[left.priority] - priorityWeight[right.priority];
  });
}

export function openTasks(tasks: Task[]) {
  return sortTasks(tasks.filter((task) => task.status === "open"));
}

export function dueThisWeek(tasks: Task[], now = new Date()) {
  return openTasks(tasks).filter((task) => {
    const remaining = daysUntil(task.dueDate, now);
    return remaining >= 0 && remaining <= 7;
  });
}

export function plannedMinutes(tasks: Task[]) {
  return tasks.filter((task) => task.status === "open").reduce((sum, task) => sum + task.estimateMinutes, 0);
}

export function createDemoTasks(now = new Date()): Task[] {
  const dateIn = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return todayKey(date);
  };
  const createdAt = now.toISOString();
  return [
    {
      id: crypto.randomUUID(), title: "Übungsblatt 4 fertigstellen", module: "Statistik",
      type: "assignment", dueDate: dateIn(1), estimateMinutes: 90, priority: "high",
      status: "open", notes: "Aufgaben 2 und 5 gemeinsam prüfen.", createdAt, updatedAt: createdAt,
    },
    {
      id: crypto.randomUUID(), title: "Prüfungsvorbereitung: Kapitel 6", module: "Controlling",
      type: "study", dueDate: dateIn(4), estimateMinutes: 120, priority: "medium",
      status: "open", notes: "Zusammenfassung und 20 Karteikarten.", createdAt, updatedAt: createdAt,
    },
    {
      id: crypto.randomUUID(), title: "Rückmeldung prüfen", module: "Studienorganisation",
      type: "admin", dueDate: dateIn(8), estimateMinutes: 15, priority: "low",
      status: "open", notes: "Semesterbeitrag im Portal kontrollieren.", createdAt, updatedAt: createdAt,
    },
  ];
}
