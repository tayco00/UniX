# Prüfprotokoll 0.2.1

Stand: 10. September 2026. Windows 11 x64, Node.js 24.14.1. Der Prüfstand gilt für die verfügbare Aufgabenverwaltung, nicht für eine breite Produktionsfreigabe oder künftige Campus-Module.

| Prüfung | Ergebnis |
| --- | --- |
| Typprüfung und ESLint | bestanden |
| Vitest | 52 Tests in 4 Dateien bestanden |
| Produktions-Renderer | Vite-Build erfolgreich; JavaScript ca. 346 kB, gzip ca. 105 kB |
| Nativer Entwicklungs-Build | vollständiger unten beschriebener Ablauf bestanden |
| Gepackte Windows-EXE | Ablauf mit `app.isPackaged = true` bestanden |
| Windows-Paket | `UniX-0.2.1-Setup.exe` erstellt |
| Desktop-Verknüpfung | auf aktualisierte Projekt-EXE eingerichtet |
| Start / Doppelstart / Stop | sichtbares Fenster, dieselbe Instanz beim Doppelstart, vollständiges reguläres Beenden und erneuter Stop bei beendeter App bestanden |
| Abhängigkeiten | npm meldet 0 bekannte Schwachstellen zum Prüfzeitpunkt |
| Abnahmematrix | 108 Kriterien: 53 durch ausgeführte Prüfungen, 54 durch Code-/Dokumentprüfung, 1 Pilot-Abnahme offen |

## Ergänzungen in 0.2.1

- Neue Art „Mensa/Cafétaria“ (`dining`) in Auswahl, Speicherung, Bearbeitung und Sicherungen geprüft; die bisherigen vier Arten bleiben gültig.
- Native Fenster- und Dokumenttitel lauten exakt „UniX“; die Verknüpfung zeigt „UniX“ ohne Namenszusatz. Die tatsächliche EXE meldet Version 0.2.1.0.
- Alle drei optionalen Feldhinweise in Einrichtung, Aufgabenformular und Profil stehen in Klammern.
- Zusatz unter „Aufwand in Minuten“ und zugehöriger Accessibility-Verweis entfernt. Die bestehenden Eingabegrenzen bleiben unverändert.
- Visuelle Prüfung des Aufgabenformulars mit ausgewählter neuer Art. Der native Probelauf verwendet `dining` auch über Neuladen, Bearbeiten und Sicherungs-Rundlauf hinweg.

## Geprobte Nutzerabläufe

- Ersteinrichtung mit persönlichen Angaben, ohne automatisch angelegte Aufgaben.
- Aufgabe mit Titel, Bereich, Datum, Aufwand und Notiz anlegen; über die Desktop-Brücke in echte Dateien schreiben.
- Neuladen der App und Wiederfinden derselben Aufgabe mit unveränderter ID.
- Erledigen, im Erledigt-Filter finden, wieder öffnen, bearbeiten und löschen.
- Hell-/Dunkel-Darstellung sowie Profilansicht.
- Sicherung exportieren und einlesen, Import abbrechen, anderen Profilnamen wiederherstellen und fehlerhaftes JSON ohne Änderung am gültigen Datenbestand zurückweisen.
- Fensterschließen mit ungespeichertem Profil: Warnung auslösen, Abbruch wählen, Fenster und Eingaben bleiben erhalten.
- Reset zurück zur Ersteinrichtung.
- Native Screenshots bei 1.440 × 920 und 1.040 × 700 einschließlich Prüfung auf horizontales Überlaufen; vertikales Scrollen ist zulässig.

Der native Test läuft vollständig in eigenen Verzeichnissen `.runtime/desktop-smoke-*`. Fenster, Renderer, Sandbox, IPC und Dateien sind echt. **Antworten der Datei- und Bestätigungsdialoge werden simuliert.** Das testet die Verarbeitung dieser Entscheidungen, nicht die manuelle Bedienung jedes Windows-Dateidialogs. Eine absichtlich ungültige Importdatei erzeugt eine erwartete Fehlermeldung im Testlog; geprüft wird dabei, dass das Produkt einen verständlichen Fehler anzeigt und die gültigen Daten nicht ersetzt.

Die App-Integrationstests ergänzen abgelehnte und verzögerte Schreiboperationen, Doppelklickschutz, erneutes Speichern eines erhaltenen Entwurfs, Tastaturfokus und Escape, Navigation mit Entwurf, Importabbruch und Profilaktualisierung, Exportfehler, Resetfehler, Pflichtfeldvalidierung und Suche/Paginierung mit 125 Aufgaben. Dateispeichertests prüfen unter anderem atomare Schreibfolgen, konkurrierende Zugriffe, beschädigte Haupt-/Sicherungsdateien, die 64-MiB-Importgrenze und das Verhindern einer Wiederkehr zurückgesetzter Daten.

## Gefundene und korrigierte Probleme

- Erfolgsanzeige vor Abschluss des Speicherns; Editor schloss auch bei Speicherfehlern.
- Risiko doppelter Eingaben und irreführende Erfolgsmeldungen bei fehlgeschlagenen Dateioperationen.
- Entwurfsverlust bei Dialog-, Ansichts- oder Fensterschließen; instabiler Fokus und fehlende Fokusbegrenzung.
- Ungefragte Beispielaufgaben, falsche Zwei-Schritte-Anzeige, funktionslose Zukunftsmodule und technische Werbetexte.
- Rollierendes Acht-Tage-Fenster als „diese Woche“, unpassende Tageszeitbegrüßung und überfällige Beschriftung erledigter Aufgaben.
- Aufwand-Auswahl konnte gültige Werte aus Sicherungen nicht korrekt bearbeiten.
- Profilfelder wurden nach Import nicht zuverlässig erneuert.
- Unbemerkter Rückfall auf eine ältere Sicherung; Reset ließ alte Daten in der Wiederherstellungskopie zurück.
- Zu kleine Hilfstexte, abgeschnittene Inhalte und unbeschränkte gleichzeitige Darstellung langer Aufgabenlisten.

## Verbleibende Freigaben vor breitem Rollout

Noch nicht nachgewiesen: Installation, Upgrade und Deinstallation auf einem frischen zweiten Windows-Gerät; vollständige Screenreader-, Hochkontrast-, DPI- und Lastprüfung; echte Pilotnutzung mit Studierenden. Der Installer ist nicht signiert. Es gibt keine Garantie für problemfreien Betrieb auf beliebiger Hardware und keinen Nachweis einer vollständigen Barrierefreiheit.

CampusGig, Marketplace, StudyMatch, automatische Erinnerungen und Synchronisierung sind nicht Bestandteil dieses MVP. 108 Kriterien bedeuten weiterhin **nicht** 108 bestandene Funktionstests. Die Matrix ist ein nachvollziehbarer Prüfkatalog; weitere Geräte- und Nutzerprüfungen bleiben Voraussetzung für eine breite Freigabe.
