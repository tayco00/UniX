# Interne Abnahmekriterien

Stand: 10. September 2026 · Scope: M0/M1 Desktop-MVP

Legende: ✅ durch ausgeführte Tests oder konkrete Laufzeitprüfung belegt; 🔎 im Quellcode oder Dokument vorhanden, keine umfassende Laufzeitabnahme; ⏳ noch offen. Die Strukturprüfung zählt 108 eindeutige Kriterien in neun Kategorien. Sie ist kein Nachweis von 108 bestandenen Funktionstests. Konkrete Läufe und Grenzen: [Prüfprotokoll](verification.md).

## Qualität (Q)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| Q-01 | 🔎 | Ein frischer Checkout besitzt genau einen dokumentierten Installationsbefehl. | README / `npm ci` |
| Q-02 | ✅ | Typfehler lassen die Qualitätsprüfung fehlschlagen. | `npm run typecheck` |
| Q-03 | ✅ | Lintfehler lassen die Qualitätsprüfung fehlschlagen. | `npm run lint` |
| Q-04 | 🔎 | Fehlgeschlagene Tests stoppen Build und Packaging. | Script-Reihenfolge in package.json |
| Q-05 | ✅ | Produktions- und Entwicklungsstart verwenden dieselbe React-Anwendung. | Vite-Build + Electron main |
| Q-06 | 🔎 | Versionen aller direkten Abhängigkeiten sind exakt festgelegt. | package.json ohne `^`/`~` |
| Q-07 | 🔎 | Generierte Ordner, Laufzeitdaten und Backups werden nicht eingecheckt. | .gitignore |
| Q-08 | 🔎 | Der MVP zeigt keine funktionslosen Beispielzahlen für spätere Module. | Navigation und Feature-Review |
| Q-09 | 🔎 | Noch nicht verfügbare Module sind sichtbar als Meilenstein markiert und deaktiviert. | Sidebar M2/M3 |
| Q-10 | 🔎 | Alle sichtbaren Produkttexte sind auf Deutsch und verwenden konsistente Begriffe. | UI-Review |
| Q-11 | 🔎 | Das Projekt enthält eine explizite Architekturentscheidung. | docs/architecture.md |
| Q-12 | 🔎 | Roadmap und aktueller Lieferumfang sind getrennt dokumentiert. | docs/roadmap.md + README |

## Funktion (F)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| F-01 | ✅ | Beim ersten Start erscheint die Ersteinrichtung. | App-Integrationstest |
| F-02 | 🔎 | Name, Hochschule und Studiengang sind Pflichtangaben. | Onboarding-Formular |
| F-03 | 🔎 | Das Semester bleibt optional. | Onboarding-Formular |
| F-04 | 🔎 | Beispieldaten lassen sich vor Abschluss der Ersteinrichtung abwählen. | Demo-Umschalter |
| F-05 | ✅ | Die Heute-Ansicht begrüßt mit dem Vornamen. | App-Integrationstest |
| F-06 | 🔎 | Eine Aufgabe kann mit Titel, Bereich, Art, Datum, Aufwand, Priorität und Notiz angelegt werden. | TaskEditor |
| F-07 | 🔎 | Eine bestehende Aufgabe kann vollständig bearbeitet werden. | Editierdialog |
| F-08 | 🔎 | Eine offene Aufgabe kann erledigt und eine erledigte wieder geöffnet werden. | App-Ablauf + Domänentest |
| F-09 | 🔎 | Das Löschen einer Aufgabe verlangt eine Bestätigung. | App.tsx |
| F-10 | 🔎 | Aufgaben können nach offen, erledigt und alle gefiltert werden. | SemesterMate |
| F-11 | 🔎 | Aufgaben können über Titel, Modul und Notiz durchsucht werden. | SemesterMate |
| F-12 | 🔎 | Profil, Theme, Export, Import und Reset sind aus Einstellungen erreichbar. | Settings |

## UX (UX)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| UX-01 | 🔎 | Der erste Start erklärt Nutzen und Datenschutz vor Dateneingabe. | Onboarding |
| UX-02 | 🔎 | Die Ersteinrichtung benötigt höchstens drei Pflichtfelder. | Onboarding |
| UX-03 | ⏳ | Die primäre Aktion jeder Ansicht ist eindeutig hervorgehoben. | UI-Review |
| UX-04 | 🔎 | Leere Aufgabenlisten zeigen Erklärung und direkte nächste Aktion. | Dashboard + SemesterMate |
| UX-05 | 🔎 | Suchergebnisse besitzen einen eigenen Nullzustand. | SemesterMate |
| UX-06 | ⏳ | Speichern, Erledigen, Löschen und Import geben sichtbares Feedback. | Toast-Status |
| UX-07 | 🔎 | Destruktive Aktionen sind farblich und räumlich von Primäraktionen getrennt. | Modal + Einstellungen |
| UX-08 | ✅ | Fälligkeitsdaten werden als Heute, Morgen, Resttage oder Kurzdatum dargestellt. | Domänentest |
| UX-09 | 🔎 | Überfällige Aufgaben erhalten einen semantischen Text statt nur einer Farbe. | `überfällig`-Label |
| UX-10 | ⏳ | Die Oberfläche nutzt keine Gradienten als dekorativen Seitenhintergrund oder generische Kartenflut. | CSS-Review |
| UX-11 | 🔎 | Navigation enthält maximal zwei aktive MVP-Module plus Einstellungen. | Sidebar |
| UX-12 | ⏳ | Fensterbreiten bis 1.040 px bleiben ohne horizontales Scrollen bedienbar. | CSS + Browser-Review |

## Architektur (A)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| A-01 | 🔎 | Anwendungskoordination, Features, Domäne und Infrastruktur liegen in getrennten Ordnern. | src-Struktur |
| A-02 | 🔎 | Frist- und Sortierlogik ist frei von React und Electron. | domain/tasks.ts |
| A-03 | 🔎 | Das Datenmodell ist ein zentraler, typisierter Vertrag. | domain/model.ts |
| A-04 | 🔎 | UI-Code greift nie direkt auf Node-Dateisystemfunktionen zu. | Import-Review |
| A-05 | 🔎 | Desktop-Zugriffe laufen ausschließlich über ein Repository. | infrastructure/repository.ts |
| A-06 | 🔎 | Der Browser-Fallback implementiert denselben Repository-Vertrag. | browserRepository |
| A-07 | 🔎 | Die Desktop-Brücke exportiert keine generische `invoke`-Methode. | preload.cjs |
| A-08 | 🔎 | Neue Produktmodule können als eigener Feature-Ordner ergänzt werden. | Architekturdiagramm |
| A-09 | 🔎 | Desktop-Hülle und Renderer werden getrennt gebaut. | electron/ + src/ |
| A-10 | 🔎 | Domänenfunktionen mutieren keine Eingabearrays. | sortTasks-Test |
| A-11 | ⏳ | Datenänderungen passieren über eine einzige Commit-Grenze. | App.tsx `commit` |
| A-12 | 🔎 | Stackentscheidung und verworfene Tauri-Option sind nachvollziehbar dokumentiert. | docs/architecture.md |

## Daten (D)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| D-01 | 🔎 | Jeder gespeicherte Datensatz besitzt eine Schema-Version. | `version: 1` |
| D-02 | 🔎 | Renderer validiert geladene und zu speichernde Daten. | Zod-Schema + commit |
| D-03 | 🔎 | Hauptprozess validiert importierte und zu speichernde Daten erneut. | data-store.mjs |
| D-04 | ✅ | Fehlen Primärdatei und Sicherung, wird ein definierter leerer Zustand erstellt; sonst wird die Sicherung geprüft. | DataStore-Regressionstests |
| D-05 | ✅ | Vor Überschreiben der Primärdatei entsteht eine Sicherung. | DataStore.save |
| D-06 | ✅ | Eine beschädigte Primärdatei fällt auf eine gültige Sicherung zurück. | DataStore.load |
| D-07 | ✅ | Auch eine beschädigte Sicherung führt zu einem verständlichen Fehler statt stiller Löschung. | DataStore.load + Fatal-State |
| D-08 | 🔎 | Import akzeptiert ausschließlich das aktuelle vollständige Schema. | IPC-Importvalidierung |
| D-09 | 🔎 | Export enthält sämtliche Profil-, Aufgaben- und Einstellungsdaten. | JSON-Export |
| D-10 | 🔎 | Reset erzeugt exakt den kanonischen Ersteinrichtungszustand. | createEmptyData / emptyAppData |
| D-11 | 🔎 | Titel, Notizen, Listenlänge und Aufwand besitzen feste Obergrenzen. | Datenverträge |
| D-12 | ✅ | Lokale Kalenderdaten werden ohne UTC-Tagesverschiebung ausgewertet. | daysUntil-Test |

## Security & Privacy (S)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| S-01 | ✅ | `nodeIntegration` ist im Renderer deaktiviert. | BrowserWindow-Konfiguration |
| S-02 | ✅ | `contextIsolation` ist aktiviert. | BrowserWindow-Konfiguration |
| S-03 | ✅ | Renderer läuft im Sandbox-Modus. | BrowserWindow-Konfiguration |
| S-04 | 🔎 | Web-Security bleibt aktiviert. | BrowserWindow-Konfiguration |
| S-05 | 🔎 | Neue Fenster werden grundsätzlich abgewiesen. | `setWindowOpenHandler` |
| S-06 | 🔎 | Unerwartete Navigation wird blockiert. | `will-navigate` |
| S-07 | 🔎 | Browser-Berechtigungsanfragen werden abgewiesen. | setPermissionRequestHandler + setPermissionCheckHandler |
| S-08 | 🔎 | Eine Content-Security-Policy blockiert fremde Skripte und Inhalte. | index.html |
| S-09 | 🔎 | Es existiert keine Telemetrie- oder Analytics-Abhängigkeit. | package.json + Import-Review |
| S-10 | 🔎 | Es existiert kein externer API-Endpunkt im Produktcode. | Code-Review |
| S-11 | 🔎 | IPC-Kanäle sind einzeln benannt und ihre Argumente werden validiert. | preload + data store |
| S-12 | 🔎 | Die Oberfläche erklärt Speicherort und Local-first-Verhalten. | Onboarding + Einstellungen |

## Tests (T)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| T-01 | ✅ | Ein Test prüft den kanonischen leeren Datensatz. | model.test.ts |
| T-02 | ✅ | Ein Test weist unbekannte Datenversionen ab. | model.test.ts |
| T-03 | ✅ | Ein Test weist unbekannte Themes ab. | model.test.ts |
| T-04 | ✅ | Ein Test weist leere Aufgabentitel ab. | model.test.ts |
| T-05 | ✅ | Ein Test weist unrealistische Aufgabendauer ab. | model.test.ts |
| T-06 | ✅ | Tests decken Heute-, Morgen- und Überfällig-Texte ab. | tasks.test.ts |
| T-07 | ✅ | Ein Test deckt die Sortierung offen vor erledigt ab. | tasks.test.ts |
| T-08 | ✅ | Ein Test deckt die Sieben-Tage-Auswahl ab. | tasks.test.ts |
| T-09 | ✅ | Ein Test deckt die Aufwandssumme ohne erledigte Aufgaben ab. | tasks.test.ts |
| T-10 | ✅ | Ein Integrationstest durchläuft die Ersteinrichtung. | App.test.tsx |
| T-11 | ✅ | Ein Integrationstest legt aus dem leeren Zustand eine Aufgabe an. | App.test.tsx |
| T-12 | ✅ | Ein Integrationstest erledigt eine Aufgabe und prüft den Repository-Aufruf; die Desktop-Prüfung ergänzt echte Dateipersistenz. | App.test.tsx + test:packaged |

## Performance (P)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| P-01 | 🔎 | Renderer lädt keine entfernten Schriften, Bilder oder Skripte. | gebündelte Fontsource-Dateien + CSP |
| P-02 | ✅ | Produktion verwendet einen statischen Vite-Build. | `npm run build:web` |
| P-03 | 🔎 | Aufgaben werden nur bei Änderung von Aufgaben, Filter oder Suche neu gefiltert. | `useMemo` in SemesterMate |
| P-04 | 🔎 | Die Heute-Ansicht zeigt höchstens vier Aufgabenzeilen. | Dashboard `slice(0, 4)` |
| P-05 | 🔎 | Das Datenmodell begrenzt eine lokale Liste auf 5.000 Aufgaben. | Schemas |
| P-06 | 🔎 | Änderungen schreiben nur einen kompakten JSON-Datensatz ohne Binärdaten. | DataStore + Schema |
| P-07 | 🔎 | Fenster wird erst nach `ready-to-show` eingeblendet. | main.mjs |
| P-08 | 🔎 | Produktions-Build erzeugt keine serverseitige Laufzeit. | Vite-Konfiguration |
| P-09 | 🔎 | Die Produktfunktionen nutzen keine dauerhaften Polling-Schleifen. | Code-Review; befristetes Polling nur in smoke-test.mjs |
| P-10 | 🔎 | Animationen sind auf Transform/Farbe begrenzt und respektieren reduzierte Bewegung. | CSS |
| P-11 | 🔎 | UI-Berechnungen verwenden einmal abgeleitete offene Aufgaben je Renderpfad. | Dashboard |
| P-12 | 🔎 | Der Build erzeugt Sourcemaps für nachvollziehbare lokale Fehleranalyse. | Vite-Konfiguration |

## Betrieb & Desktop (O)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| O-01 | 🔎 | `Start UniX.cmd` startet aus jedem aktuellen Ordner heraus. | `%~dp0` im Startskript |
| O-02 | 🔎 | Das Startskript erklärt einen fehlenden Build, ohne versteckte Installationen auszuführen. | scripts/start.ps1 |
| O-03 | 🔎 | Doppeltes Starten des gebauten Projekts zeigt dieselbe einzelne Instanz. | Native Start-/Stop-Prüfung |
| O-04 | 🔎 | Auch Electron selbst erzwingt eine einzelne App-Instanz. | `requestSingleInstanceLock` |
| O-05 | 🔎 | Das Stoppskript adressiert die konkrete Projekt-EXE und fordert reguläres Beenden an. | scripts/stop.ps1 + --unix-quit |
| O-06 | 🔎 | Das Stoppskript meldet eine bereits beendete Anwendung ohne Fehler. | scripts/stop.ps1 |
| O-07 | 🔎 | Desktop-Testdaten und Prüfprotokolle liegen in einem ignorierten Laufzeitordner. | .runtime + .gitignore |
| O-08 | 🔎 | Beenden eines Entwicklungsprozesses beendet die zusammen gestarteten Prozesse. | concurrently --kill-others |
| O-09 | 🔎 | Ein Befehl führt alle Qualitätsprüfungen in fester Reihenfolge aus. | `npm run quality` |
| O-10 | ✅ | Ein Befehl erzeugt einen entpackten Windows-Testbuild. | `npm run pack` |
| O-11 | ✅ | Ein Befehl erzeugt einen benannten NSIS-Installer mit eigenem UniX-Icon und Verknüpfungen. | `npm run build` + build/icon.svg |
| O-12 | 🔎 | README dokumentiert Setup, Start, Stop, Test, Build, Datenort und Fehlerhilfe. | README.md |
