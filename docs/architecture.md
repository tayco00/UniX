# Architekturentscheidung

## Entscheidung

UniX 0.4.0 verwendet Electron, React, TypeScript, Vite und Zod. Ruflo 3.41.2 unterstützt ausschließlich den Entwicklungsprozess; es ist weder Produktlaufzeit noch Voraussetzung auf dem PC eines Nutzers.

## Warum dieser Stack

| Ziel | Begründung |
| --- | --- |
| Wartbarkeit | Striktes TypeScript, kleine Feature-Komponenten, getrennte Domänenlogik und eine einzige Repository-Grenze. |
| Windows-Paket | Electron Builder erzeugt eine eigenständige EXE und einen NSIS-Installer. Auf dem Zielgerät werden Node.js und Ruflo nicht benötigt. |
| Daten | Ein versioniertes JSON genügt für maximal 5.000 MVP-Aufgaben. Zod prüft Renderer-Daten; der Hauptprozess prüft unabhängig erneut. |
| Ausfallsicherheit | Serialisierte, atomare Schreibfolge mit rotierender Sicherung. Import, Reset und Schreibfehler behalten verständliche Zustände. |
| Erweiterbarkeit | Das Repository kann später durch SQLite oder einen Sync-Adapter ersetzt werden. Die Domäne kennt Electron nicht. |
| Mobile | Profile, Aufgabenmodell, Validierung und Sortierung sind wiederverwendbar. Die Desktop-Hülle wird nicht in mobile Clients übernommen. |

## Grenzen

Der MVP ist ein einzelner Studienplaner ohne Account, öffentliche Profile, Chat, Zahlung, Campus-Marktplatz oder Cloud-Synchronisierung. Diese Module benötigen andere Sicherheits-, Moderations- und Datenschutzentscheidungen und beginnen erst in späteren Meilensteinen.

Das aktuelle Datenformat ist `version: 2`. Daten aus UniX `version: 1` werden beim Lesen übernommen: Profilnamen werden auf den Vornamen reduziert, `studyProgram` wird `courseOfStudy`, `module` wird `course` und `admin` wird `organization`. App-ID und Windows-Datenverzeichnis bleiben unverändert.

## Ruflo

Ruflo wurde nach der offiziellen Windows-/Codex-Anleitung mit minimalem, rein projektbezogenem Profil initialisiert. Versionierte Dateien liegen in `.agents/` und `AGENTS.md`; Laufzeitdaten in `.claude-flow/`, `.swarm/` und `.claude/` sind ignoriert. Die Feedbackmuster wurden im Namespace `patterns` unter `unix-v2/product-feedback` gespeichert und erfolgreich semantisch wiedergefunden. Ruflo darf weder veröffentlichen noch Produktcode zur Laufzeit beeinflussen.
