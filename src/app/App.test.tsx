import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAppData, type AppData, type Task } from "../domain/model";

let stored: AppData;
const save = vi.fn(async (data: AppData) => {
  stored = data;
  return data;
});
const profile = {
  name: "Mina",
  university: "TU Berlin",
  studyProgram: "Informatik",
  semester: "",
};
const task: Task = {
  id: "task-1",
  title: "Essay abgeben",
  module: "Ethik",
  type: "assignment",
  dueDate: "2026-01-01",
  estimateMinutes: 20,
  priority: "high",
  status: "open",
  notes: "Quellen prüfen",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};
const ready = (tasks: Task[] = []): AppData => ({
  ...emptyAppData(),
  onboardingCompleted: true,
  profile,
  tasks,
});

beforeEach(() => {
  vi.resetModules();
  stored = ready();
  save.mockReset().mockImplementation(async (data) => {
    stored = data;
    return data;
  });
  window.unixApi = {
    load: vi.fn(async () => stored),
    save,
    reset: vi.fn(async () => {
      stored = emptyAppData();
      return stored;
    }),
    exportBackup: vi.fn(async () => ({ canceled: true })),
    importBackup: vi.fn(async () => ({ canceled: true })),
    getAppInfo: vi.fn(async () => ({
      version: "0.2.1",
      dataPath: "C:\\Test\\UniX",
      platform: "win32",
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
async function openEditor() {
  const user = await mount();
  await user.click(
    await screen.findByRole("button", { name: "Erste Aufgabe anlegen" }),
  );
  return user;
}
async function settings() {
  const user = await mount();
  await user.click(
    await screen.findByRole("button", { name: "Einstellungen" }),
  );
  return user;
}

describe("UniX user journeys", () => {
  it("offers Mensa/Cafétaria, persists it after restart and keeps the requested labels", async () => {
    const user = await openEditor();
    expect(
      screen.getByRole("option", { name: "Mensa/Cafétaria" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Notiz (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Aufwand in Minuten")).not.toHaveAttribute(
      "aria-describedby",
    );
    expect(
      screen.queryByText(/0 = noch nicht geschätzt/),
    ).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("SemesterMate");
    await user.type(screen.getByLabelText("Aufgabe"), "Mittagspause");
    await user.selectOptions(screen.getByLabelText("Art"), "dining");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(stored.tasks[0].type).toBe("dining");
    cleanup();
    const restarted = await mount();
    await restarted.click(
      await screen.findByRole("button", { name: "Mittagspause bearbeiten" }),
    );
    expect(screen.getByLabelText("Art")).toHaveValue("dining");
    await restarted.click(screen.getByRole("button", { name: "Abbrechen" }));
    await restarted.click(
      screen.getByRole("button", { name: "Einstellungen" }),
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "UniX" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Semester (optional)")).toBeInTheDocument();
  });
  it("tells the user when an automatic recovery may have lost the latest change", async () => {
    vi.mocked(window.unixApi!.getAppInfo).mockResolvedValue({
      version: "0.2.1",
      dataPath: "test",
      platform: "win32",
      recoveredFromBackup: true,
    });
    const user = await mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "jüngste Änderung könnte fehlen",
    );
    await user.click(screen.getByRole("button", { name: "Verstanden" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("onboards without unsolicited examples or storage marketing", async () => {
    stored = emptyAppData();
    const user = await mount();
    await user.type(await screen.findByLabelText("Vorname"), "Alex");
    expect(screen.getByLabelText("Semester (optional)")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Hochschule"), "HTW Dresden");
    await user.type(
      screen.getByLabelText("Studiengang"),
      "Wirtschaftsinformatik",
    );
    expect(document.body.textContent).not.toMatch(
      /lokal|local-first|ohne konto|vollständig offline|bleiben bei dir/i,
    );
    await user.click(screen.getByRole("button", { name: /UniX einrichten/i }));
    expect(
      await screen.findByRole("heading", { name: /Alex\./ }),
    ).toBeInTheDocument();
    expect(stored.tasks).toHaveLength(0);
    expect(
      screen.queryByRole("button", {
        name: /CampusGig|Marketplace|StudyMatch/,
      }),
    ).not.toBeInTheDocument();
  });

  it("creates one task with a complete draft and keeps focus while typing", async () => {
    const user = await openEditor();
    expect(screen.getByLabelText("Aufgabe")).toHaveFocus();
    await user.type(screen.getByLabelText("Aufgabe"), "Datenbanken lernen");
    expect(screen.getByLabelText("Aufgabe")).toHaveFocus();
    await user.type(screen.getByLabelText("Modul oder Bereich"), "DBS");
    await user.clear(screen.getByLabelText("Aufwand in Minuten"));
    await user.type(screen.getByLabelText("Aufwand in Minuten"), "20");
    await user.type(screen.getByLabelText(/Notiz/), "Kapitel 4");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(stored.tasks).toHaveLength(1);
    expect(stored.tasks[0]).toMatchObject({
      title: "Datenbanken lernen",
      module: "DBS",
      estimateMinutes: 20,
      notes: "Kapitel 4",
    });
  });

  it("retains the draft on write failure and permits a successful retry", async () => {
    save.mockRejectedValueOnce(new Error("disk full"));
    const user = await openEditor();
    await user.type(screen.getByLabelText("Aufgabe"), "Wichtige Abgabe");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Speichern fehlgeschlagen",
    );
    expect(screen.getByLabelText("Aufgabe")).toHaveValue("Wichtige Abgabe");
    expect(stored.tasks).toHaveLength(0);
    expect(screen.queryByText("Aufgabe angelegt")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(stored.tasks).toHaveLength(1);
  });

  it("does not acknowledge pending writes or accept double submissions", async () => {
    let finish!: (data: AppData) => void;
    save.mockImplementationOnce(
      (data) =>
        new Promise((resolve) => {
          finish = () => {
            stored = data;
            resolve(data);
          };
        }),
    );
    const user = await openEditor();
    await user.type(screen.getByLabelText("Aufgabe"), "Nur einmal");
    const submit = screen.getByRole("button", { name: "Aufgabe anlegen" });
    await user.dblClick(submit);
    expect(save).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();
    expect(stored.tasks).toHaveLength(0);
    expect(screen.queryByText("Aufgabe angelegt")).not.toBeInTheDocument();
    await act(async () => finish(save.mock.calls[0][0]));
    expect(stored.tasks).toHaveLength(1);
  });

  it("actually completes AND reopens an overdue task", async () => {
    stored = ready([task]);
    const user = await mount();
    await user.click(
      await screen.findByRole("button", { name: "Essay abgeben erledigen" }),
    );
    expect(await screen.findByText("Alles erledigt.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aufgaben" }));
    await user.click(screen.getByRole("button", { name: /^Erledigt/ }));
    expect(document.querySelector(".task-row")).not.toHaveTextContent(
      "überfällig",
    );
    await user.click(
      screen.getByRole("button", { name: "Essay abgeben wieder öffnen" }),
    );
    expect(stored.tasks[0].status).toBe("open");
    await user.click(screen.getByRole("button", { name: /^Offen/ }));
    expect(
      screen.getByRole("button", { name: "Essay abgeben erledigen" }),
    ).toBeInTheDocument();
  });

  it("edits arbitrary supported durations without changing status or identity", async () => {
    stored = ready([{ ...task, status: "done" }]);
    const user = await mount();
    await user.click(await screen.findByRole("button", { name: "Aufgaben" }));
    await user.click(screen.getByRole("button", { name: /^Erledigt/ }));
    await user.click(screen.getByRole("button", { name: "Essay abgeben" }));
    expect(screen.getByLabelText("Aufwand in Minuten")).toHaveValue(20);
    await user.clear(screen.getByLabelText("Aufgabe"));
    await user.type(screen.getByLabelText("Aufgabe"), "Essay überarbeitet");
    await user.click(
      screen.getByRole("button", { name: "Änderungen speichern" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(stored.tasks[0]).toMatchObject({
      id: task.id,
      status: "done",
      estimateMinutes: 20,
      title: "Essay überarbeitet",
      notes: task.notes,
      createdAt: task.createdAt,
    });
  });

  it("requires confirmation before deleting and leaves canceled deletion intact", async () => {
    stored = ready([task]);
    const confirm = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const user = await mount();
    await user.click(
      await screen.findByRole("button", { name: "Essay abgeben bearbeiten" }),
    );
    await user.click(screen.getByRole("button", { name: "Aufgabe löschen" }));
    expect(stored.tasks).toHaveLength(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aufgabe löschen" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(stored.tasks).toHaveLength(0);
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it("guards dirty drafts on Escape and window close", async () => {
    const confirm = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const user = await openEditor();
    await user.type(screen.getByLabelText("Aufgabe"), "Nicht verlieren");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.getByLabelText("Aufgabe")).toHaveValue("Nicht verlieren");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it("traps keyboard focus and restores it when an unchanged dialog closes", async () => {
    const confirm = vi.spyOn(window, "confirm");
    const user = await openEditor();
    const close = screen.getByRole("button", { name: "Dialog schließen" });
    close.focus();
    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "Aufgabe anlegen" }),
    ).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(confirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Erste Aufgabe anlegen" }),
    ).toHaveFocus();
  });

  it("explains whitespace validation instead of silently doing nothing", async () => {
    const user = await openEditor();
    await user.type(screen.getByLabelText("Aufgabe"), "   ");
    await user.click(screen.getByRole("button", { name: "Aufgabe anlegen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Leerzeichen");
    expect(save).not.toHaveBeenCalled();
  });

  it("can retry a failed initial load", async () => {
    vi.mocked(window.unixApi!.load).mockRejectedValueOnce(new Error("locked"));
    const user = await mount();
    expect(
      await screen.findByText("Daten nicht verfügbar"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    expect(
      await screen.findByRole("heading", { name: /Mina\./ }),
    ).toBeInTheDocument();
  });

  it("can recover from a startup error by importing a valid backup", async () => {
    vi.mocked(window.unixApi!.load).mockRejectedValue(new Error("corrupt"));
    vi.mocked(window.unixApi!.importBackup).mockResolvedValue({
      canceled: false,
      data: ready([task]),
    });
    const user = await mount();
    await user.click(
      await screen.findByRole("button", { name: "Sicherung wiederherstellen" }),
    );
    expect(
      await screen.findByRole("heading", { name: /Mina\./ }),
    ).toBeInTheDocument();
  });

  it("protects an edited profile when navigating away", async () => {
    vi.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const user = await settings();
    await user.type(screen.getByLabelText("Name"), " Entwurf");
    await user.click(screen.getByRole("button", { name: "Heute" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Mina Entwurf");
    await user.click(screen.getByRole("button", { name: "Heute" }));
    expect(
      await screen.findByRole("heading", { name: /Mina\./ }),
    ).toBeInTheDocument();
    expect(stored.profile.name).toBe("Mina");
  });

  it("updates imported profile fields even after unsaved edits", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(window.unixApi!.importBackup).mockResolvedValue({
      canceled: false,
      data: ready([task]),
    });
    const user = await settings();
    await user.type(screen.getByLabelText("Name"), " Entwurf");
    await user.click(screen.getByRole("button", { name: "Wiederherstellen" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Name")).toHaveValue("Mina"),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sicherung wiederhergestellt",
    );
  });

  it("keeps profile edits when a backup picker is canceled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = await settings();
    await user.type(screen.getByLabelText("Name"), " Entwurf");
    await user.click(screen.getByRole("button", { name: "Wiederherstellen" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Mina Entwurf");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  });

  it("reports export and import errors without success styling or lost data", async () => {
    vi.mocked(window.unixApi!.exportBackup).mockRejectedValue(
      new Error("disk full"),
    );
    vi.mocked(window.unixApi!.importBackup).mockRejectedValue(
      new Error("bad schema"),
    );
    const user = await settings();
    await user.click(
      screen.getByRole("button", { name: "Sicherung exportieren" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "konnte nicht gespeichert",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Wiederherstellen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "konnte nicht wiederhergestellt",
    );
    expect(stored.profile).toEqual(profile);
  });

  it("does not apply a theme until it has been saved, nor lose profile edits", async () => {
    const user = await settings();
    await user.type(screen.getByLabelText("Name"), " Entwurf");
    save.mockRejectedValueOnce(new Error("locked"));
    await user.click(screen.getByRole("button", { name: "Dunkel" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    await user.click(screen.getByRole("button", { name: "Dunkel" }));
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("dark"),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Mina Entwurf");
  });

  it("saves a trimmed profile and rejects whitespace-only names", async () => {
    const user = await settings();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "   ");
    await user.click(screen.getByRole("button", { name: "Profil speichern" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Leerzeichen");
    expect(save).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Name"), "Alex   ");
    await user.click(screen.getByRole("button", { name: "Profil speichern" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Name")).toHaveValue("Alex"),
    );
    expect(stored.profile.name).toBe("Alex");
    expect(document.body.textContent).not.toMatch(
      /lokal|local-first|ohne konto|vollständig offline|bleiben bei dir/i,
    );
  });

  it("handles reset cancellation, failure and success", async () => {
    vi.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    const user = await settings();
    await user.click(screen.getByRole("button", { name: "UniX zurücksetzen" }));
    expect(window.unixApi!.reset).not.toHaveBeenCalled();
    vi.mocked(window.unixApi!.reset).mockRejectedValueOnce(new Error("locked"));
    await user.click(screen.getByRole("button", { name: "UniX zurücksetzen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Zurücksetzen fehlgeschlagen",
    );
    await user.click(screen.getByRole("button", { name: "UniX zurücksetzen" }));
    expect(await screen.findByLabelText("Vorname")).toHaveValue("");
  });

  it("paginates a large list and searches all records including notes", async () => {
    stored = ready(
      Array.from({ length: 125 }, (_, index) => ({
        ...task,
        id: `task-${index}`,
        title: `Aufgabe ${index}`,
        notes: index === 124 ? "Nadel" : "",
      })),
    );
    const user = await mount();
    await user.click(await screen.findByRole("button", { name: "Aufgaben" }));
    expect(document.querySelectorAll(".task-row")).toHaveLength(50);
    await user.click(
      screen.getByRole("button", { name: "Weitere 50 anzeigen" }),
    );
    expect(document.querySelectorAll(".task-row")).toHaveLength(100);
    await user.type(
      screen.getByRole("searchbox", { name: "Aufgaben durchsuchen" }),
      "Nadel",
    );
    expect(document.querySelectorAll(".task-row")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Aufgabe 124" }),
    ).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "x");
    await user.click(
      screen.getByRole("button", { name: "Suche zurücksetzen" }),
    );
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(
      within(screen.getByRole("group", { name: "Aufgaben filtern" })).getByRole(
        "button",
        { name: /^Offen/ },
      ),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
