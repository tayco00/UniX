# UniX Roadmap

## M0 — Produktfundament (implementiert; Abnahmen siehe Prüfkatalog)

- Audit des früheren Projekts
- Stack- und Architekturentscheidung
- 108 interne Abnahmekriterien
- Designsystem, Datenvertrag, Desktop-Brücke, Tests und Packaging

## M1 — Aufgabenverwaltung (jetzt lauffähig)

- Ersteinrichtung ohne Konto
- Persönliche Heute-Ansicht
- Aufgaben und Fristen anlegen, bearbeiten, erledigen, wieder öffnen, löschen
- Suche und Statusfilter
- Hell/Dunkel/System-Darstellung
- Local-first-Persistenz, Backup, Import und Reset
- Windows-Start/Stop-Skripte und NSIS-Build

Exit: 10–15 Studierende verwenden UniX vier Wochen; mindestens 50 % öffnen es an zwei Tagen pro Woche. Kritische Datenverluste: null.

## M1.1 — UX-Härtung (0.2.0 implementiert)

- Keine funktionslosen Navigationseinträge, keine Speicher-Werbetexte, keine automatischen Beispielaufgaben
- Bestätigte statt optimistischer Speicherung; fehlgeschlagene Versuche wiederholbar
- Schutz ungespeicherter Eingaben, Tastaturfokus im Dialog, lesbare Texte und kleine Fenster
- Korrekte Kalenderwoche, Tageszeitbegrüßung und Statusdarstellung erledigter Aufgaben
- Abgesicherter Sicherungsimport, Wiederherstellung aus Startfehlern und Rücksetzen beider Dateigenerationen
- Erweiterte Nutzerablauf- und native Desktop-Tests, einschließlich Fehler- und Abbruchpfaden

Vor breitem Rollout weiter offen: Installer/Upgrade/Deinstallation auf einem frischen zweiten Windows-Gerät, Code Signing, Screenreader-/Hochkontrastprüfung, reale Pilotnutzung. Die funktionale MVP-Prüfung ersetzt diese Freigaben nicht.

## M1.2 — Beschriftungen und Aufgabenart (0.2.1)

- „Mensa/Cafétaria“ als zusätzliche Aufgabenart, einschließlich Speichern, Bearbeiten und Sicherungen
- Einheitliche Feldhinweise „(optional)“ und entfernter Aufwand-Zusatz
- Sichtbarer Produktname „UniX“ ohne Namenszusätze; neutraler Menüpunkt „Aufgaben“

## M2 — CampusGig Pilot

- Verifizierter Hochschulkontext
- Gig erstellen, finden, merken und schließen
- Moderation, Melden, Sperren und Sicherheitsleitfaden vor Messaging
- Optionaler Cloud-Sync hinter dem bestehenden Repository

Exit: ein Campus, mindestens 50 veröffentlichte Gigs, 20 erfolgreiche Matches, dokumentierter Moderationsprozess.

## M3 — Marketplace und StudyMatch

- Marketplace zunächst ohne integrierte Zahlung
- StudyMatch nach Modul, Lernziel und Verfügbarkeit
- Gemeinsames Vertrauensprofil, getrennte Privatsphäreneinstellungen
- Suchindex und Sync-Konfliktlösung

Exit: Nutzung und Wiederkehr je Modul rechtfertigen die dauerhafte Produktpflege.

## M4 — Erweiterte Studienplanung und Mobile

- Kalenderimport mit expliziter Einwilligung
- wiederkehrende Aufgaben und Benachrichtigungen
- mobile Hülle mit wiederverwendeter Domäne
- Ende-zu-Ende getestete Synchronisierung

## Querschnitt pro Meilenstein

Jedes Modul beginnt mit Problemvalidierung, Daten- und Missbrauchsmodell, leerem Zustand und drei Ende-zu-Ende-Abläufen. Erst danach wird die Navigation erweitert. Kein Modul geht live, solange Löschung, Export, Fehlerzustände, Accessibility und Telemetrieentscheidung ungeklärt sind.
