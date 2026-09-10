import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAppData, type AppData } from "../domain/model";

let stored: AppData;
const save = vi.fn(async (data: AppData) => { stored = data; return data; });

beforeEach(() => {
  vi.resetModules();
  stored = emptyAppData();
  save.mockClear();
  window.unixApi = {
    load: vi.fn(async () => stored),
    save,
    reset: vi.fn(async () => emptyAppData()),
    exportBackup: vi.fn(async () => ({ canceled: true })),
    importBackup: vi.fn(async () => ({ canceled: true })),
    getAppInfo: vi.fn(async () => ({ version: "0.1.0", dataPath: "C:\\Test\\UniX", platform: "win32" })),
  };
});

afterEach(() => cleanup());

describe("UniX user journey", () => {
  it("finishes onboarding and reaches the personalized dashboard", async () => {
    const { default: App } = await import("./App");
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText("Vorname"), "Alex");
    await user.type(screen.getByLabelText("Hochschule"), "HTW Dresden");
    await user.type(screen.getByLabelText("Studiengang"), "Wirtschaftsinformatik");
    await user.click(screen.getByRole("button", { name: /UniX einrichten/i }));
    expect(await screen.findByText("Guten Morgen, Alex.")).toBeInTheDocument();
    expect(screen.getAllByText("Übungsblatt 4 fertigstellen")).toHaveLength(2);
    await waitFor(() => expect(save).toHaveBeenCalled());
  });

  it("shows the honest empty state and creates a task", async () => {
    stored = { ...emptyAppData(), onboardingCompleted: true, profile: { name: "Mina", university: "TU Berlin", studyProgram: "Informatik", semester: "2. Semester" } };
    const { default: App } = await import("./App");
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText("Deine Liste ist frei.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Erste Aufgabe anlegen" }));
    await user.type(screen.getByLabelText("Aufgabe"), "Datenbanken lernen");
    await user.type(screen.getByLabelText("Modul oder Bereich"), "DBS");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Aufgabe anlegen" }));
    expect(await screen.findAllByText("Datenbanken lernen")).toHaveLength(2);
    expect(stored.tasks).toHaveLength(1);
  });

  it("completes and reopens a task", async () => {
    stored = {
      ...emptyAppData(), onboardingCompleted: true,
      profile: { name: "Mina", university: "TU Berlin", studyProgram: "Informatik", semester: "" },
      tasks: [{ id: "task-1", title: "Essay abgeben", module: "Ethik", type: "assignment", dueDate: "2026-09-11", estimateMinutes: 45, priority: "high", status: "open", notes: "", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z" }],
    };
    const { default: App } = await import("./App");
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Essay abgeben erledigen" }));
    expect(stored.tasks[0].status).toBe("done");
    expect(await screen.findByText("Deine Liste ist frei.")).toBeInTheDocument();
  });
});
