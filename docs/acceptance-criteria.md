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
| Q-09 | ✅ | Noch nicht verfügbare Module sind nicht als funktionslose Menüpunkte sichtbar. | App-Integrationstest |
| Q-10 | 🔎 | Alle sichtbaren Produkttexte sind auf Deutsch und verwenden konsistente Begriffe. | UI-Review |
| Q-11 | 🔎 | Das Projekt enthält eine explizite Architekturentscheidung. | docs/architecture.md |
| Q-12 | 🔎 | Roadmap und aktueller Lieferumfang sind getrennt dokumentiert. | docs/roadmap.md + README |

## Funktion (F)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| F-01 | ✅ | Beim ersten Start erscheint die Ersteinrichtung. | App-Integrationstest |
| F-02 | 🔎 | Name, Hochschule und Studiengang sind Pflichtangaben. | Onboarding-Formular |
| F-03 | ✅ | Das Semester bleibt optional. | Ersteinrichtung in App- und Desktop-Test |
| F-04 | ✅ | Neue Nutzer starten ohne ungefragte Beispielaufgaben. | App-Integrationstest + Desktop-Test |
| F-05 | ✅ | Die Heute-Ansicht begrüßt mit dem Vornamen. | App-Integrationstest |
| F-06 | ✅ | Eine Aufgabe kann mit Titel, Bereich, Art (einschließlich Mensa/Cafétaria), Datum, Aufwand, Priorität und Notiz angelegt werden. | App-Integrationstest / TaskEditor |
| F-07 | ✅ | Bearbeiten erhält ID, Erledigungszustand, Notiz und frei gewählten gültigen Aufwand. | App-Integrationstest |
| F-08 | ✅ | Eine offene Aufgabe kann erledigt und eine erledigte wieder geöffnet werden. | App-Test + nativer Desktop-Ablauf |
| F-09 | ✅ | Löschen verlangt eine Bestätigung; Abbrechen erhält die Aufgabe. | App-Integrationstest |
| F-10 | ✅ | Aufgaben können nach offen, erledigt und alle gefiltert werden. | App-Integrationstest |
| F-11 | ✅ | Die Suche berücksichtigt Titel, Modul und Notiz aller Aufgaben, auch außerhalb der sichtbaren Seite. | App-Integrationstest / Aufgabenansicht |
| F-12 | ✅ | Profil, Theme, Export, Import und Reset sind erreichbar und Fehler werden verständlich gemeldet. | App-Integrationstests + nativer Desktop-Ablauf |

## UX (UX)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| UX-01 | ✅ | Der erste Start erklärt den Nutzen ohne Speicher-/Offline-Werbung und falsche Schrittanzeige. | App-Test + native Sichtprüfung |
| UX-02 | ✅ | Drei Pflichtfelder genügen; fehlende Angaben werden validiert. | Ersteinrichtung im App-/Desktop-Test |
| UX-03 | ✅ | Leerer Einstieg bietet eine klare erste Aktion statt einer Übersicht voller Nullzahlen. | Native Sichtprüfung + App-Test |
| UX-04 | ✅ | Leere Listen und ausschließlich erledigte Aufgaben besitzen unterschiedliche hilfreiche Zustände. | App-Integrationstest |
| UX-05 | ✅ | Keine Suchtreffer bieten eine direkte Aktion zum Zurücksetzen der Suche. | App-Integrationstest |
| UX-06 | ✅ | Erfolgsfeedback erscheint erst nach erfolgreichem Speichern; Fehler erhalten den Entwurf und ermöglichen einen erneuten Versuch. | App-Tests für Fehler und verzögertes Speichern |
| UX-07 | 🔎 | Destruktive Aktionen sind farblich und räumlich von Primäraktionen getrennt. | Modal + Einstellungen |
| UX-08 | ✅ | Fälligkeitsdaten werden als Heute, Morgen, Resttage oder Kurzdatum dargestellt. | Domänentest |
| UX-09 | 🔎 | Überfällige Aufgaben erhalten einen semantischen Text statt nur einer Farbe. | `überfällig`-Label |
| UX-10 | ⏳ | 10–15 Studierende können die Hauptabläufe ohne Anleitung abschließen. | Pilotnutzung noch offen |
| UX-11 | ✅ | Der Editor hält den Fokus; Escape und Ansichtswechsel schützen geänderte Entwürfe. | App-Test / Modal / native Fensterprüfung |
| UX-12 | ✅ | Bei 1.040 × 700 und 1.440 × 920 bleibt die Oberfläche ohne horizontales Scrollen erreichbar. | Native Screenshots + Layout-Assertions; vertikales Scrollen zulässig |

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
| A-11 | ✅ | Schreibaktionen teilen eine Sperre; UI-Daten werden erst nach Bestätigung des Repository übernommen. | run / commit, Fehler- und Doppelklicktests |
| A-12 | 🔎 | Stackentscheidung und verworfene Tauri-Option sind nachvollziehbar dokumentiert. | docs/architecture.md |

## Daten (D)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| D-01 | 🔎 | Jeder gespeicherte Datensatz besitzt eine Schema-Version. | `version: 1` |
| D-02 | 🔎 | Renderer validiert geladene und zu speichernde Daten. | Zod-Schema + commit |
| D-03 | 🔎 | Hauptprozess validiert importierte und zu speichernde Daten erneut. | data-store.mjs |
| D-04 | ✅ | Fehlen Primärdatei und Sicherung, wird ein definierter leerer Zustand erstellt; sonst wird die Sicherung geprüft. | DataStore-Regressionstests |
| D-05 | ✅ | Vor normalen Änderungen wird der vorherige gültige Zustand gesichert; Reset leert bewusst beide Generationen. | DataStore-Tests |
| D-06 | ✅ | Eine beschädigte Primärdatei fällt auf eine gültige Sicherung zurück. | DataStore.load |
| D-07 | ✅ | Auch eine beschädigte Sicherung führt zu einem verständlichen Fehler statt stiller Löschung. | DataStore.load + Fatal-State |
| D-08 | ✅ | Import prüft Dateigröße vor dem Lesen und vollständiges Schema vor Übernahme. | readValidated-Test + ungültiger nativer Import |
| D-09 | ✅ | Export enthält Profil, Aufgaben und Einstellungen und kann wiederhergestellt werden. | Nativer Export-/Import-Rundlauf |
| D-10 | ✅ | Reset leert Hauptdatei und Wiederherstellungskopie; gelöschte Daten kehren nicht durch Recovery zurück. | DataStore-Regressionstest |
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
| S-12 | ✅ | Automatische Wiederherstellung weist auf möglicherweise fehlende Änderungen hin. | App-Recovery-Test + DataStore |

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
| T-08 | ✅ | Die Wochenfrist-Auswahl umfasst heute bis Sonntag, nicht die folgende Woche. | tasks.test.ts, einschließlich Sonntagsgrenze |
| T-09 | ✅ | Ein Test deckt die Aufwandssumme ohne erledigte Aufgaben ab. | tasks.test.ts |
| T-10 | ✅ | Ein Integrationstest durchläuft die Ersteinrichtung. | App.test.tsx |
| T-11 | ✅ | Ein Integrationstest legt aus dem leeren Zustand eine Aufgabe an. | App.test.tsx |
| T-12 | ✅ | Tests decken Erledigen und Wiederöffnen, Bearbeiten, Löschen, Fehler/Abbruch, Entwurfschutz und Neustartpersistenz ab. | App.test.tsx + test:packaged |

## Performance (P)

| ID | Status | Abnahmekriterium | Nachweis |
| --- | --- | --- | --- |
| P-01 | 🔎 | Renderer lädt keine entfernten Schriften, Bilder oder Skripte. | gebündelte Fontsource-Dateien + CSP |
| P-02 | ✅ | Produktion verwendet einen statischen Vite-Build. | `npm run build:web` |
| P-03 | ✅ | Große Listen starten mit 50 Zeilen; Filter und Suche erfassen alle gespeicherten Aufgaben. | App-Test mit 125 Aufgaben |
| P-04 | 🔎 | Die Heute-Ansicht zeigt höchstens vier Aufgabenzeilen. | Dashboard `slice(0, 4)` |
| P-05 | 🔎 | Das Datenmodell begrenzt eine lokale Liste auf 5.000 Aufgaben. | Schemas |
| P-06 | 🔎 | Änderungen schreiben nur einen kompakten JSON-Datensatz ohne Binärdaten. | DataStore + Schema |
| P-07 | 🔎 | Fenster wird erst nach `ready-to-show` eingeblendet. | main.mjs |
| P-08 | 🔎 | Produktions-Build erzeugt keine serverseitige Laufzeit. | Vite-Konfiguration |
| P-09 | 🔎 | Die Oberfläche aktualisiert Datum höchstens einmal pro Minute und zusätzlich bei Fensterfokus; kein Netzwerk-Polling. | App.tsx Timer und Fokus-Listener |
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
