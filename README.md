# UniX

UniX ist ein Campus- und Studienplaner für Windows. Version 0.2.1 enthält eine persönliche Heute-Ansicht und Aufgabenverwaltung für Prüfungen, Abgaben, Lernblöcke, Organisation und Mensa/Cafétaria. CampusGig, Marketplace und StudyMatch sind geplante Erweiterungen; sie sind noch nicht nutzbar.

Version 0.2.1 ergänzt „Mensa/Cafétaria“ als Aufgabenart, entfernt den Zusatz unter „Aufwand in Minuten“ und schreibt optionale Feldhinweise einheitlich als „(optional)“. Die sichtbare Produktbenennung lautet ausschließlich „UniX“, der Aufgabenbereich heißt „Aufgaben“. Bestehende Daten bleiben erhalten; interne App-Kennungen werden für kompatible Updates beibehalten.

[Quellcode auf GitHub](https://github.com/tayco00/UniX) · [Windows-Download v0.2.1](https://github.com/tayco00/UniX/releases/tag/v0.2.1)

## Windows-App starten und beenden

1. Auf der Release-Seite `UniX-0.2.1-Setup.exe` herunterladen und ausführen.
2. Im Installer die Desktop-Verknüpfung auswählen.
3. UniX anschließend per Doppelklick auf das Desktop-Symbol oder über das Startmenü öffnen.
4. Zum Beenden das Fenster schließen. Es bleibt kein Entwicklungsserver im Hintergrund.

Der Installer ist für Windows 10/11 (x64) vorgesehen. Die installierte App benötigt weder Node.js noch Internet. Der MVP-Installer ist **nicht signiert**; Windows kann deshalb einen Hinweis zum unbekannten Herausgeber anzeigen. Eine Prüfung auf weiteren Windows-Geräten und Code Signing sind noch offen.

Wer das Projekt bereits einschließlich eines entpackten Builds lokal hat, kann `Start UniX.cmd` doppelklicken. Das Skript öffnet `release/win-unpacked/UniX.exe`; `Stop UniX.cmd` schließt diesen Projekt-Build regulär. Fehlt die EXE, zeigt das Startskript einen Hinweis zum Erstellen des Builds. Für eine separat installierte UniX-Version dient das Schließen ihres Fensters als Stop.

## Funktionsumfang

- Ersteinrichtung mit drei Pflichtfeldern und einer leeren Aufgabenliste
- Heute-Ansicht mit nächster Aufgabe, Fristen, Aufwand und Fortschritt
- Aufgaben anlegen, bearbeiten, erledigen, wieder öffnen und nach Bestätigung löschen
- Aufgabenart (Prüfung, Abgabe, Lernblock, Organisation, Mensa/Cafétaria), Modul, Frist, Aufwand, Priorität und Notiz
- Suche in Titel, Modul und Notiz; Statusfilter und schrittweise Anzeige großer Listen
- Hell-, Dunkel- und Systemdarstellung einschließlich Änderungen der Windows-Einstellung
- Speicherbestätigung erst nach erfolgreichem Schreiben; Entwürfe bleiben bei Fehlern erhalten
- Warnung vor dem Verwerfen ungespeicherter Eingaben und beim Schließen des Fensters
- Schema-Prüfung, atomare Datenspeicherung und automatische Wiederherstellung mit Hinweis
- JSON-Sicherungen exportieren/wiederherstellen, auch aus dem Startfehler-Bildschirm
- Zurücksetzen mit Bestätigung für Hauptdaten und automatische Wiederherstellungskopie

## Entwicklung einrichten

Voraussetzungen: Windows, Node.js ab Version 22 und npm. Die Installation von Abhängigkeiten und der erste Packaging-Lauf benötigen Internet, unter anderem für Electron und Build-Werkzeuge.

Im Projektordner:

```powershell
npm ci
```

Die Abhängigkeiten sind in `package-lock.json` fixiert. Für die Entwicklung:

```powershell
npm run dev
```

Das öffnet ein eigenes UniX-Fenster mit automatischer Aktualisierung bei Codeänderungen. `Ctrl+C` im zugehörigen Terminal beendet den Entwicklungsserver und Electron gemeinsam. Die CMD-Dateien bedienen den gebauten Desktop-Build, nicht diesen Entwicklungsmodus.

## Tests und Abnahme

```powershell
npm run quality
```

Dieser Befehl führt Typprüfung, Lint, Vitest und die Strukturprüfung der Abnahmematrix aus. Einzelbefehle sind `npm run typecheck`, `npm run lint`, `npm run test:run` und `npm run quality:criteria`.

Die [Abnahmematrix](docs/acceptance-criteria.md) enthält **108 Kriterien in neun Kategorien**. Sie unterscheidet ausgeführte Prüfungen, Quellcode-Nachweise und noch offene Abnahmen. Der Kriterien-Checker prüft Anzahl, eindeutige IDs, Kategorien und zulässige Statuswerte; er beweist keine Funktionalität und verlangt keine pauschale Vollabnahme.

Zusätzlich die echte Desktop-Laufzeit prüfen:

```powershell
npm run build:web
npm run test:desktop
npm run pack
npm run test:packaged
```

Die Desktop-Smoke-Tests verwenden separate temporäre Datenordner unter `.runtime/`. Sie durchlaufen Ersteinrichtung, Anlegen, Bearbeiten, Erledigen, Wiederöffnen, Löschen, Themenwechsel, Export/Import, ungültige Sicherung, Abbruch, Entwurfschutz beim Fensterschließen und Reset mit echten Dateien und der echten Desktop-Brücke. Datei- und Bestätigungsdialog-Antworten werden in diesen isolierten Tests simuliert. Sie ersetzen weder eine vollständige visuelle Abnahme noch einen Test des Installers auf einem frischen Windows-System.

## Build

Entpackten Windows-Build erstellen:

```powershell
npm run pack
```

Ergebnis: `release/win-unpacked/UniX.exe`. Diesen Build verwenden die lokalen Start-/Stop-Dateien.

Für eine Desktop-Verknüpfung direkt auf diesen Projekt-Build:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-desktop-shortcut.ps1
```

Installer erstellen:

```powershell
npm run build
```

Ergebnis: `release/UniX-0.2.1-Setup.exe`. Beide Befehle führen zuerst die Qualitätsprüfung aus. Generierte Builds und Installationspakete gehören in GitHub Releases, nicht in die Git-Historie. Abhängigkeiten, Laufzeitdaten und Backups werden ebenfalls nicht eingecheckt.

## Daten und Wiederherstellung

Die Desktop-App speichert `unix-data.json` im Windows-App-Datenordner. Unter Windows ist das standardmäßig `%APPDATA%/UniX` (im Explorer in die Adresszeile eingeben). Die Oberfläche enthält bewusst keine technischen Speicherort- oder Offline-Werbehinweise. Der Projektordner und der Nutzerdatenordner sind getrennt: Eine neue App-Version ersetzt dadurch nicht die persönlichen Aufgaben.

Gespeicherte Daten sind lokal, aber nicht verschlüsselt. Ein gültiger vorheriger Zustand wird als `unix-data.json.backup` vorgehalten; diese rotierende Sicherung ersetzt kein separat exportiertes Backup. Export und Import stehen in den Einstellungen bereit. Ein Import ersetzt nach Bestätigung die aktuellen Daten.

Kann die Hauptdatei nicht validiert werden, versucht UniX die Sicherung. Sind beide Dateien unbrauchbar, zeigt die App einen Fehler. In diesem Fall beide Dateien vor weiteren Schritten sichern und ein gültiges exportiertes Backup zur Wiederherstellung verwenden. Sind Hauptdatei und Sicherung beschädigt, bleiben sie beim Laden unangetastet. Nach erfolgreicher automatischer Wiederherstellung weist die App darauf hin, dass die jüngste Änderung fehlen könnte. **UniX zurücksetzen** leert auch die Wiederherstellungskopie; separat exportierte Dateien werden nicht entfernt.

Die optionale Browser-Vorschau (`npm run dev:web`) nutzt `localStorage` statt der Desktop-Dateien. Export und Import sind dort deaktiviert; sie dient nur der Oberflächenentwicklung.

## Architektur

Electron 44, React 19, **TypeScript 6.0.3** und Vite 8 bilden den Stack. Zod validiert die Datenverträge, Vitest und Testing Library prüfen Fachlogik und Nutzerabläufe, Electron Builder erzeugt den Installer. Die [Architekturentscheidung](docs/architecture.md) erläutert Wartbarkeit, Packaging, Local-first, Skalierung und den späteren Cloud-/Mobile-Pfad.

```text
UniX/
├── electron/           Desktop-Lebenszyklus, isolierte Brücke, lokale Speicherung
├── src/
│   ├── app/            Navigation und Zustandskoordination
│   ├── components/     gemeinsame UI-Bausteine
│   ├── domain/         Schema und Fachlogik
│   ├── features/       Onboarding, Heute, Aufgaben, Einstellungen
│   └── infrastructure/ Repository und Desktop-Vertrag
├── scripts/            Start, Stop, Desktop- und Kriterienprüfungen
├── docs/               Architektur, Abnahme und Roadmap
└── release/            generierte Windows-Artefakte; nicht in Git
```

## Fehlerhilfe

**Startdatei meldet einen fehlenden Build:** Nach `npm ci` einmal `npm run pack` ausführen oder den fertigen Installer von der Release-Seite verwenden.

**App öffnet sich nicht:** Den Build mit `npm run test:packaged` prüfen. Das Testprotokoll liegt im angegebenen Unterordner von `.runtime/`. Für Entwicklungsprobleme `npm run dev` im Terminal starten und die Ausgabe prüfen.

**Port 5173 ist belegt:** Nur der Entwicklungsmodus benötigt diesen Port. Den anderen Entwicklungsserver schließen oder den paketierten Desktop-Build starten.

**Datenfehler beim Start:** Im Fehlerbildschirm erneut versuchen oder eine exportierte Sicherung wiederherstellen. Die Dateien im App-Datenordner vorher separat sichern. Ein Fehler bei Hauptdatei und Sicherung wird bewusst angezeigt; ein Löschen der Dateien würde persönliche Daten entfernen.

## Roadmap und Prüfstand

M0 liefert das technische Fundament, M1 die hier enthaltene Aufgabenverwaltung. Es gibt aktuell keine automatische Erinnerung, Synchronisierung oder Zusammenarbeit mit anderen Nutzern; Fristen müssen selbst eingetragen werden. Aufgaben mit Aufwand 0 gelten als noch nicht geschätzt. Unterstützte Größe: bis zu 5.000 Aufgaben, bis zu 1.440 Minuten Aufwand je Aufgabe und 64 MiB je importierter Datei. Die Pilotvalidierung mit Studierenden sowie zusätzliche UX-, Accessibility- und Geräteprüfungen stehen noch aus. M2 plant CampusGig, M3 Marketplace und StudyMatch, M4 Kalender, Benachrichtigungen, Synchronisierung und Mobile. Die [Roadmap](docs/roadmap.md) enthält die jeweiligen Freigabekriterien.

Ein früheres lokales Referenzprojekt hat Feature-Grenzen, Datensicherheit und den eigenen Desktop-Lebenszyklus beeinflusst. Bei der Veröffentlichungsprüfung wurden zusätzlich relative Produktions-Assetpfade und die CommonJS-Preload-Datei für Electrons Sandbox korrigiert. Die frühere Aussage „108/108 verifiziert“ war zu weitgehend: Die Matrixzahl war eine Dokumentprüfung. [Abnahmematrix](docs/acceptance-criteria.md) und [Prüfprotokoll](docs/verification.md) beschreiben den tatsächlichen Nachweisumfang.

## Lizenz

Der Quellcode ist öffentlich einsehbar. Eine Open-Source-Lizenz wurde bisher nicht erteilt; alle Rechte am eigenen Projektcode bleiben vorbehalten. Die Lizenzen eingebundener Drittanbieter gelten unverändert.
