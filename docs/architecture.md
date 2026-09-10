# Architekturentscheidung: UniX Desktop MVP

Status: akzeptiert · Stand: 10. September 2026

## Entscheidung

UniX verwendet für den ersten Windows-MVP **Electron 44 + React 19 + TypeScript 6.0.3 + Vite 8**. Die Anwendung bleibt local-first: Das Electron-Hauptprogramm besitzt den Dateizugriff, der React-Teil erhält ausschließlich sechs eng begrenzte Methoden über eine isolierte Preload-Brücke. Nutzerdaten werden als versioniertes JSON im offiziellen App-Datenverzeichnis gespeichert. Vor dem Ersetzen eines gültigen Datensatzes entsteht eine rotierende Sicherungskopie.

## Warum dieser Stack

| Kriterium | Entscheidung und Begründung |
| --- | --- |
| Wartbarkeit | React/TypeScript ist breit etabliert. Feature-Komponenten, Domänenfunktionen und Infrastruktur sind getrennt. Die kleine API-Grenze verhindert, dass Desktop-Details in die UI durchsickern. |
| Packaging | Electron Builder erzeugt einen üblichen NSIS-Installer, Desktop- und Startmenü-Verknüpfungen. Auf dem Ziel-PC sind keine Laufzeit oder Entwicklerwerkzeuge nötig. |
| Offline / Local-first | UI, Schrift und Icons sind gebündelt. Es gibt keine Netzwerk-API. Schreiben, Import und Export laufen lokal über den Desktop-Prozess. |
| Skalierung | Für die MVP-Datenmenge ist ein validiertes, versioniertes JSON einfacher und besser testbar als eine vorschnelle Datenbank. Das `repository` bildet bereits die Austauschgrenze für SQLite oder Cloud-Sync. |
| Cloud-Erweiterung | Ein späterer Sync-Adapter kann dieselben validierten `AppData`-Verträge verwenden. Konfliktauflösung und Authentifizierung bleiben ein separates Infrastrukturmodul. |
| Mobile-Erweiterung | Domänenmodell, Selektoren, Validierung und React-Featuregrenzen sind wiederverwendbar. Die Desktop-Hülle wird für Mobile durch React Native/Expo oder Capacitor ersetzt; sie ist nicht Teil der Domäne. |
| Lokale Lieferbarkeit | Die vorhandene Maschine besitzt Node.js, aber keine Rust-/C++-Toolchain. Electron lässt sich deshalb jetzt vollständig entwickeln, testen und paketieren. |

Tauri 2 wurde geprüft. Es bietet kleinere Binärdateien und einen interessanten Desktop-/Mobile-Pfad, setzt unter Windows aber Rust und Microsoft C++ Build Tools voraus. Diese Voraussetzungen fehlen auf dem Ziel-PC. Für den aktuellen Auftrag würde Tauri daher die versprochene Start-/Stop-Erfahrung verschlechtern. Ein späterer Wechsel bleibt durch die kleine Desktop-Brücke möglich, ist aber nicht eingeplant, solange Installationsgröße kein belegtes Produktproblem ist.

## Modulgrenzen

```text
React UI
├── app/                 Navigation, Zustandskoordination
├── features/
│   ├── onboarding/      Ersteinrichtung
│   ├── dashboard/       Heute-Ansicht
│   ├── semester/        SemesterMate
│   └── settings/        Profil und Datenverwaltung
├── components/          Wiederverwendbare UI-Bausteine
├── domain/              Schema, Typen, Sortierung, Fristlogik
└── infrastructure/      Repository und Desktop-Vertrag
             │
             ▼ eingeschränkte IPC-Brücke
Electron
├── preload.cjs          sechs freigegebene Methoden (Sandbox-kompatibel)
├── main.mjs             Fenster, Dialoge, Lebenszyklus
└── data-store.mjs       Validierung, Schreiben, Rückfallebene
```

CampusGig, Marketplace und StudyMatch erhalten erst dann eigene Feature- und Datenmodule, wenn ihr jeweiliger Meilenstein beginnt. Im MVP sind sie nur als nicht anklickbare, ehrlich beschriftete Roadmap-Einträge sichtbar.

## Datenstrategie

- Aktuelles Schema: `AppData.version = 1`.
- Maximale Datensatzgröße: 5.000 Aufgaben; Einzeltexte besitzen feste Längenlimits.
- Validierung erfolgt an beiden Vertrauensgrenzen: im Renderer mit Zod und im Hauptprozess vor Dateizugriff.
- Schreibfolge: gültige vorhandene Datei sichern → temporäre Datei schreiben und synchronisieren → Zieldatei durch Umbenennen atomar ersetzen. Lese- und Schreiboperationen teilen eine Warteschlange.
- Lesefolge: Primärdatei → rotierende Sicherung → verständlicher Fehlerzustand.
- Wechsel zu SQLite: wenn Beziehungen, Volltextsuche, Datenmengen oder Sync-Protokoll dies messbar rechtfertigen. Das Repository bleibt dabei stabil.

## Bewusst nicht im MVP

- Kein Account und keine Authentifizierung
- Kein Cloud-Sync und keine Telemetrie
- Keine Chats, Zahlungen oder öffentlichen Profile
- Keine externen Campus-, Kalender- oder KI-APIs
- Keine Pseudo-Daten für noch nicht implementierte Module

Diese Grenzen reduzieren Datenschutz-, Moderations-, Marketplace- und Betriebsrisiken, bis reale Nutzung den Ausbau begründet.

## Desktop-Referenzen

Die Sandbox benötigt eine CommonJS-Preload-Datei ([Electron ESM-Dokumentation](https://www.electronjs.org/docs/latest/tutorial/esm)). Relative Assetpfade (`base: "./"`) unterstützen den lokalen Dateiaufruf des gebauten Renderers ([Vite Produktionsbuild](https://vite.dev/guide/build#relative-base)). Beide Eigenschaften werden zusätzlich in der gepackten EXE geprüft.
