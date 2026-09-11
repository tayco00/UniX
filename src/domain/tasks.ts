import type { Task, TaskType } from "./model";

export const taskTypeLabels: Record<TaskType, string> = {
  exam: "Prüfung",
  assignment: "Abgabe",
  study: "Lernblock",
  organization: "Organisation",
  dining: "Mensa/Cafétaria",
};

export const priorityLabels = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
} as const;

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    const priority = { high: 0, medium: 1, low: 2 };
    return (
      priority[a.priority] - priority[b.priority] ||
      a.createdAt.localeCompare(b.createdAt)
    );
  });
}

export function openTasks(tasks: Task[]) {
  return sortTasks(tasks.filter((task) => task.status === "open"));
}

export function dueLabel(dueDate: string, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${dueDate}T00:00:00`);
  const days = Math.round((target.getTime() - start.getTime()) / 86_400_000);
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days === -1) return "Seit gestern fällig";
  if (days < 0) return `Seit ${Math.abs(days)} Tagen fällig`;
  if (days <= 6) return `In ${days} Tagen`;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(target);
}

export function weekTasks(tasks: Task[], now = new Date()) {
  const today = localDateKey(now);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  const endKey = localDateKey(end);
  return openTasks(tasks).filter(
    (task) => task.dueDate >= today && task.dueDate < endKey,
  );
}

export function minutesLabel(minutes: number) {
  if (!minutes) return "Noch nicht geschätzt";
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} Std. ${rest} Min.` : `${hours} Std.`;
}
