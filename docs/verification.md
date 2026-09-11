# Prüfprotokoll

Stand: 11. September 2026 · UniX 0.4.0

Dieses Protokoll wird mit dem Release abgeschlossen. Es trennt schnelle Codeprüfungen von echten Desktop-Abläufen und dokumentiert bekannte Grenzen.

## Automatisierte Ebenen

| Ebene | Inhalt | Soll |
| --- | --- | --- |
| Typen | vollständige TypeScript-Prüfung ohne Ausgabe | bestanden |
| Code-Regeln | UI-, Test-, Desktop- und Skriptdateien | bestanden |
| Komponenten und Domäne | Ersteinrichtung, Aufgaben, Suche, Filter, Fehlerpfade, Migration, Speicherung | 47 Tests bestanden |
| Quell-Desktop | echter Electron-Prozess mit isoliertem Datenordner | bestanden |
| Paket-Desktop | identischer Ablauf mit der gebauten `UniX.exe` | bestanden |
| Abnahmematrix | Anzahl, eindeutige IDs, zehn Kategorien und kein offener Status | 120/120 bestanden |
| Abhängigkeiten | npm-Prüfung auf bekannte Schwachstellen | 0 bekannte Schwachstellen |

## Geprüfter Desktop-Ablauf

Der native Ablauf richtet ein Profil ein, prüft den leeren Zustand, legt eine Aufgabe der Art Mensa/Cafétaria an, startet neu, bearbeitet die Aufgabe, erledigt und öffnet sie wieder, verwendet Suche und Filter, exportiert und importiert eine Sicherung, prüft den Schutz ungespeicherter Eingaben, lädt einen größeren Beispieldatensatz und setzt UniX zurück.

Zusätzlich werden Mindestfenstergröße, lange Titel, Tastaturfokus, Kontrastpaare, 200-%-Zoom, blockierte Navigation, verweigerte Berechtigungen, Einzelinstanz, Persistenz und reguläres Beenden geprüft. Screenshots werden während des Laufs erzeugt und visuell kontrolliert.

## Testgrenzen

- Der Installer ist nicht digital signiert; dadurch ist ein Windows-SmartScreen-Hinweis möglich.
- Der automatisierte Lauf prüft Windows x64 auf dem Entwicklungs-PC. Andere Windows-Hardware und Hilfstechnologien benötigen zusätzlich reale Pilotnutzer.
- Backup-Dialoge werden im nativen Test kontrolliert simuliert, damit keine beliebigen Nutzerdateien ausgewählt oder überschrieben werden.
- CampusGig, Marketplace, StudyMatch und SemesterMate gehören nicht zu diesem Release und werden nicht vorgetäuscht.
- Cloud, Accounts, Benachrichtigungen und Mehrgeräte-Konflikte sind nicht Teil dieses Meilensteins.

## Release-Nachweise

- Version und Tag: `0.4.0` / `v0.4.0`
- Installer: `UniX-0.4.0-Setup.exe`
- SHA-256: `c8ab3581ab1dc6b15410613b6d9d40b7ba4d1a678c7f4f9bb685ae0fde82149d`
- Repository: <https://github.com/tayco00/UniX>
- Release: <https://github.com/tayco00/UniX/releases/tag/v0.4.0>
