# Prüfprotokoll zur Veröffentlichung 0.1.0

Stand: 10. September 2026. Geprüft auf dem lokalen Windows-11-x64-Entwicklungsgerät mit Node.js 24.14.1.

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Prüfung | bestanden |
| ESLint | bestanden |
| Vitest | 27 Tests in 4 Dateien bestanden |
| Produktions-Renderer | Vite-Build erfolgreich |
| Native Electron-Prüfung | Oberfläche, Preload-Brücke, Node-Isolation und Dateipersistenz nach Reload bestanden |
| Gepackte EXE | derselbe native Test mit `app.isPackaged = true` bestanden |
| Windows-Paket | NSIS-Installer und entpackte EXE erstellt |
| Start, Doppelstart, Stop | sichtbares natives Fenster, gleiche Instanz beim Doppelstart, reguläres Beenden und erneuter Stop bei beendeter App bestanden |
| Desktop-Verknüpfung | erstellt und Zielpfad auf die gebaute Projekt-EXE geprüft |
| Abhängigkeitsprüfung | npm meldet 0 bekannte Schwachstellen zum Prüfzeitpunkt |

Die 13 Dateispeichertests prüfen unter anderem fehlende oder beschädigte Hauptdateien, gültige und beschädigte Sicherungen, konkurrierende Zugriffe und ungültige Datensätze. Die 14 weiteren Tests prüfen Domäne, Datenverträge und ausgewählte Nutzerabläufe.

Der native Test verwendet ausschließlich eigene Daten unter `.runtime/desktop-smoke-*`; er ersetzt keine Nutzerdaten. Ein Screenshot der nativen Onboarding-Ansicht wurde auf Darstellung geprüft. Die Abnahmematrix unterscheidet diese Nachweise ausdrücklich von bloßen Quellcode-Prüfungen.

## Korrigierte Veröffentlichungsfehler

- Produktions-Assets hatten absolute Pfade und sind jetzt relativ zum gebauten Dokument.
- Die Preload-Brücke verwendet CommonJS, damit sie in Electrons Sandbox geladen wird.
- Primärdateien werden atomar ersetzt; gültige Sicherungen bleiben bei Wiederherstellung erhalten.
- Der Import fragt vor dem Ersetzen vorhandener Daten nach.
- IPC-Aufrufe werden auf Hauptfenster und vertrauenswürdige Dokumentquelle beschränkt.
- Start und Stop arbeiten mit der fertigen Projekt-EXE; der Stop fordert reguläres Beenden an.

## Noch offene Grenzen

Kein vollständiger Installer-Test auf einem frischen zweiten Windows-Gerät und kein Code-Signing-Zertifikat. Keine umfassende Accessibility-, Last- oder mobile Prüfung. Die Speicheranzeige im Renderer ist noch optimistisch; ein Fehler wird gemeldet, der Text „gespeichert“ wird aber noch nicht zuverlässig an die abgeschlossene Dateischreiboperation gekoppelt. Der Browser-Fallback ist eine Entwicklungsansicht. Die Erledigen-/Wiederöffnen-, Bearbeiten-, Löschen- und Dateidialog-Abläufe sind noch nicht alle als vollständige native Ende-zu-Ende-Tests abgedeckt.

Die frühere Pauschalaussage „108/108 verifiziert“ war daher nicht korrekt. Der Kriterien-Checker validiert nur die Struktur des Katalogs; der native Desktop-Test ist ein zusätzlicher, gesonderter Prüfschritt.
