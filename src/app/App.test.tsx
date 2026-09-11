import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyData, type AppData, type Task } from "../domain/model";

let stored: AppData;
const profile = {
  firstName: "Mina",
  university: "TU Berlin",
  courseOfStudy: "Informatik",
  semester: "3. Semester",
};
const task: Task = {
  id: "task-1",
  title: "Statistik lernen",
  course: "Statistik",
  type: "study",
  dueDate: "2026-09-12",
  estimateMinutes: 90,
  priority: "high",
  status: "open",
  notes: "Kapitel 4",
  createdAt: "2026-09-01",
  updatedAt: "2026-09-01",
};
const ready = (tasks: Task[] = []) => ({
  ...emptyData(),
  setupCompleted: true,
  profile,
  tasks,
});

beforeEach(() => {
  vi.resetModules();
  stored = ready();
  window.confirm = vi.fn(() => true);
  window.unixApi = {
    load: vi.fn(async () => stored),
    save: vi.fn(async (data) => {
      stored = data;
      return data;
    }),
    reset: vi.fn(async () => {
      stored = emptyData();
      return stored;
    }),
    exportBackup: vi.fn(async () => ({ canceled: false })),
    importBackup: vi.fn(async () => ({ canceled: true })),
    getAppInfo: vi.fn(async () => ({
      version: "0.4.0",
      platform: "win32",
      recoveredFromBackup: false,
    })),
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function mount() {
  const { default: App } = await import("./App");
  render(<App />);
  return userEvent.setup();
}
async function openNew() {
  const user = await mount();
  await user.click(
    await screen.findByRole("button", { name: "Erste Aufgabe anlegen" }),
  );
  return user;
}

describe("UniX user experience", () => {
  it("starts with a concise setup and no fake tasks", async () => {
    stored = emptyData();
    await mount();
    expect(
      await screen.findByRole("heading", { name: "Richte UniX für dich ein." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Semester (optional)")).toBeInTheDocument();
    expect(screen.queryByText(/local|offline|konto/i)).not.toBeInTheDocument();
    expect(stored.tasks).toHaveLength(0);
  });
  it("validates setup fields and trims input", async () => {
    stored = emptyData();
    const user = await mount();
    await user.click(
      await screen.findByRole("button", { name: "UniX einrichten" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Bitte fülle");
    await user.type(screen.getByLabelText("Vorname"), " Mina ");
    await user.type(screen.getByLabelText("Hochschule"), " TU Berlin ");
    await user.type(screen.getByLabelText("Studiengang"), " Informatik ");
    await user.click(screen.getByRole("button", { name: "UniX einrichten" }));
    expect(
      await screen.findByRole("heading", { name: /Mina/ }),
    ).toBeInTheDocument();
    expect(stored.profile.firstName).toBe("Mina");
  });
  it("offers all requested task types", async () => {
    await openNew();
    const select = screen.getByLabelText("Art");
    for (const label of [
      "Prüfung",
      "Abgabe",
      "Lernblock",
      "Organisation",
      "Mensa/Cafétaria",
    ])
      expect(
        within(select).getByRole("option", { name: label }),
      ).toBeInTheDocument();
    expect(screen.getByLabelText("Notiz (optional)")).toBeInTheDocument();
  });
  it("creates a complete task", async () => {
    const user = await openNew();
    await user.type(screen.getByLabelText("Titel"), "Datenbanken lernen");
    await user.type(screen.getByLabelText("Modul oder Bereich"), "DBS");
    await user.selectOptions(screen.getByLabelText("Art"), "exam");
    await user.clear(screen.getByLabelText("Aufwand in Minuten"));
    await user.type(screen.getByLabelText("Aufwand in Minuten"), "120");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    expect(
      (await screen.findAllByText("Datenbanken lernen")).length,
    ).toBeGreaterThan(0);
    expect(stored.tasks[0]).toMatchObject({
      course: "DBS",
      type: "exam",
      estimateMinutes: 120,
    });
  });
  it("keeps the editor open after save failure", async () => {
    vi.mocked(window.unixApi!.save).mockRejectedValueOnce(new Error("full"));
    const user = await openNew();
    await user.type(screen.getByLabelText("Titel"), "Wichtige Abgabe");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "nicht funktioniert",
    );
    expect(screen.getByLabelText("Titel")).toHaveValue("Wichtige Abgabe");
  });
  it("edits and deletes a task", async () => {
    stored = ready([task]);
    const user = await mount();
    await user.click(
      (await screen.findAllByRole("button", { name: "Statistik lernen" }))[0],
    );
    await user.clear(screen.getByLabelText("Titel"));
    await user.type(screen.getByLabelText("Titel"), "Statistik wiederholen");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(stored.tasks[0].title).toBe("Statistik wiederholen");
    await user.click(
      screen.getAllByRole("button", { name: "Statistik wiederholen" })[0],
    );
    await user.click(screen.getByRole("button", { name: "Aufgabe löschen" }));
    expect(stored.tasks).toHaveLength(0);
  });
  it("completes and reopens a task", async () => {
    stored = ready([task]);
    const user = await mount();
    await user.click(
      (
        await screen.findAllByRole("button", {
          name: "Statistik lernen erledigen",
        })
      )[0],
    );
    expect(stored.tasks[0].status).toBe("done");
    await user.click(screen.getByRole("button", { name: "Aufgaben" }));
    await user.click(screen.getByRole("button", { name: /Erledigt/ }));
    await user.click(
      await screen.findByRole("button", {
        name: "Statistik lernen wieder öffnen",
      }),
    );
    expect(stored.tasks[0].status).toBe("open");
  });
  it("searches and resets an empty result", async () => {
    stored = ready([task]);
    const user = await mount();
    await user.click(await screen.findByRole("button", { name: "Aufgaben" }));
    await user.type(
      screen.getByPlaceholderText("Aufgaben durchsuchen"),
      "Chemie",
    );
    expect(
      await screen.findByRole("heading", { name: "Keine Treffer" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Suche zurücksetzen" }),
    );
    expect(await screen.findByText("Statistik lernen")).toBeInTheDocument();
  });
  it("protects a dirty editor from accidental close", async () => {
    window.confirm = vi.fn(() => false);
    const user = await openNew();
    await user.type(screen.getByLabelText("Titel"), "Entwurf");
    await user.click(screen.getByRole("button", { name: "Dialog schließen" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalled();
  });
  it("keeps duplicate save clicks from writing twice", async () => {
    let resolveSave!: (value: AppData) => void;
    vi.mocked(window.unixApi!.save).mockImplementationOnce(
      (data) =>
        new Promise((resolve) => {
          resolveSave = () => {
            stored = data;
            resolve(data);
          };
        }),
    );
    const user = await openNew();
    await user.type(screen.getByLabelText("Titel"), "Einmal speichern");
    const saveButton = screen.getByRole("button", { name: "Aufgabe anlegen" });
    await user.click(saveButton);
    saveButton.click();
    expect(window.unixApi!.save).toHaveBeenCalledTimes(1);
    resolveSave(stored);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
  it("exports, imports and resets through settings", async () => {
    const user = await mount();
    await user.click(
      await screen.findByRole("button", { name: "Einstellungen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Sicherung exportieren" }),
    );
    expect(window.unixApi!.exportBackup).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Wiederherstellen" }));
    expect(window.unixApi!.importBackup).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "UniX zurücksetzen" }));
    expect(
      await screen.findByRole("heading", { name: "Richte UniX für dich ein." }),
    ).toBeInTheDocument();
  });
});
