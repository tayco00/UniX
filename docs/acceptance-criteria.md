# Interne Abnahmekriterien

Stand: 11. September 2026 · Scope: UniX 0.4.0, Meilenstein M1

Die Matrix enthält 120 konkrete Kriterien. `✅` wird erst nach einem automatisierten Lauf oder einer nachvollziehbaren Code-/Artefaktprüfung gesetzt. Der Checker prüft Anzahl, IDs und dass kein Kriterium offen bleibt; er ersetzt nicht die genannten Nachweise.

## Qualität

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| Q-01 | ✅ | Ein frischer Checkout hat genau einen dokumentierten Installationsbefehl. | Code- und Laufzeitprüfung |
| Q-02 | ✅ | Direkte Abhängigkeiten sind exakt versioniert. | Code- und Laufzeitprüfung |
| Q-03 | ✅ | Typfehler stoppen die Qualitätsprüfung. | Code- und Laufzeitprüfung |
| Q-04 | ✅ | Lintfehler stoppen die Qualitätsprüfung. | Code- und Laufzeitprüfung |
| Q-05 | ✅ | Fehlgeschlagene Tests stoppen den Build. | Code- und Laufzeitprüfung |
| Q-06 | ✅ | Generierte Artefakte und Laufzeitdaten sind ignoriert. | Code- und Laufzeitprüfung |
| Q-07 | ✅ | Keine Datei unter src überschreitet 500 Zeilen. | Code- und Laufzeitprüfung |
| Q-08 | ✅ | Keine sichtbare Funktion ist nur Attrappe. | Code- und Laufzeitprüfung |
| Q-09 | ✅ | Produktname erscheint ausschließlich als UniX. | Code- und Laufzeitprüfung |
| Q-10 | ✅ | Ruflo ist projektbezogen dokumentiert. | Code- und Laufzeitprüfung |
| Q-11 | ✅ | Ruflo ist keine Laufzeitabhängigkeit der App. | Code- und Laufzeitprüfung |
| Q-12 | ✅ | Der bisherige Git-Verlauf bleibt erhalten. | Code- und Laufzeitprüfung |

## Funktion

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| F-01 | ✅ | Ersteinrichtung erfasst Vorname, Hochschule und Studiengang. | Code- und Laufzeitprüfung |
| F-02 | ✅ | Semester ist als optional gekennzeichnet. | Code- und Laufzeitprüfung |
| F-03 | ✅ | Erster Start enthält keine Beispielaufgaben. | Code- und Laufzeitprüfung |
| F-04 | ✅ | Aufgaben können angelegt werden. | Code- und Laufzeitprüfung |
| F-05 | ✅ | Aufgaben können bearbeitet werden. | Code- und Laufzeitprüfung |
| F-06 | ✅ | Aufgaben können nach Bestätigung gelöscht werden. | Code- und Laufzeitprüfung |
| F-07 | ✅ | Aufgaben können erledigt und wieder geöffnet werden. | Code- und Laufzeitprüfung |
| F-08 | ✅ | Offen-, Alle- und Erledigt-Filter funktionieren. | Code- und Laufzeitprüfung |
| F-09 | ✅ | Suche erfasst Titel, Modul und Notiz. | Code- und Laufzeitprüfung |
| F-10 | ✅ | Mensa/Cafétaria ist eine Aufgabenart. | Code- und Laufzeitprüfung |
| F-11 | ✅ | Prüfung, Abgabe, Lernblock und Organisation bleiben verfügbar. | Code- und Laufzeitprüfung |
| F-12 | ✅ | Profil, Export, Import und Reset sind erreichbar. | Code- und Laufzeitprüfung |

## User Experience

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| UX-01 | ✅ | Die Ersteinrichtung erklärt den Nutzen in einem Bildschirm. | Code- und Laufzeitprüfung |
| UX-02 | ✅ | Die erste sinnvolle Aktion ist eindeutig. | Code- und Laufzeitprüfung |
| UX-03 | ✅ | Die Tagesansicht priorisiert genau eine nächste Aufgabe. | Code- und Laufzeitprüfung |
| UX-04 | ✅ | Leerer Plan und vollständig erledigter Plan haben passende Texte. | Code- und Laufzeitprüfung |
| UX-05 | ✅ | Keine Suchtreffer bieten Suche zurücksetzen. | Code- und Laufzeitprüfung |
| UX-06 | ✅ | Primär-, Sekundär- und Gefahrenaktionen sind unterscheidbar. | Code- und Laufzeitprüfung |
| UX-07 | ✅ | Fälligkeit wird relativ und verständlich beschrieben. | Code- und Laufzeitprüfung |
| UX-08 | ✅ | Überfälligkeit wird zusätzlich als Text angezeigt. | Code- und Laufzeitprüfung |
| UX-09 | ✅ | Ungespeicherte Formularinhalte sind geschützt. | Code- und Laufzeitprüfung |
| UX-10 | ✅ | Speicherfehler erhalten den eingegebenen Entwurf. | Code- und Laufzeitprüfung |
| UX-11 | ✅ | Erfolgsmeldungen blockieren keine Bedienung. | Code- und Laufzeitprüfung |
| UX-12 | ✅ | Lange Titel umbrechen ohne horizontales Scrollen. | Code- und Laufzeitprüfung |

## Architektur

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| A-01 | ✅ | Desktop-Prozess, UI, Domäne und Datenzugriff sind getrennt. | Code- und Laufzeitprüfung |
| A-02 | ✅ | Öffentliche App-Daten sind vollständig typisiert. | Code- und Laufzeitprüfung |
| A-03 | ✅ | Desktop-Brücke besitzt nur sechs eng begrenzte Methoden. | Code- und Laufzeitprüfung |
| A-04 | ✅ | Komponenten enthalten keine direkten Dateisystemzugriffe. | Code- und Laufzeitprüfung |
| A-05 | ✅ | Repository bildet die austauschbare Speichergrenze. | Code- und Laufzeitprüfung |
| A-06 | ✅ | Feature-Dateien sind nach Nutzerbereichen gegliedert. | Code- und Laufzeitprüfung |
| A-07 | ✅ | Datenformat besitzt eine explizite Version. | Code- und Laufzeitprüfung |
| A-08 | ✅ | Altdaten werden über eine Migration übernommen. | Code- und Laufzeitprüfung |
| A-09 | ✅ | Künftige Campus-Module bleiben aus der MVP-Navigation. | Code- und Laufzeitprüfung |
| A-10 | ✅ | Technikentscheidung ist dokumentiert. | Code- und Laufzeitprüfung |
| A-11 | ✅ | Meilensteine besitzen eigene Gates. | Code- und Laufzeitprüfung |
| A-12 | ✅ | Ruflo-Konfiguration ist vom Produktcode getrennt. | Code- und Laufzeitprüfung |

## Daten

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| D-01 | ✅ | Eingaben werden im Renderer validiert. | Code- und Laufzeitprüfung |
| D-02 | ✅ | Eingaben werden erneut im Desktop-Prozess validiert. | Code- und Laufzeitprüfung |
| D-03 | ✅ | Titel und Profilpflichtfelder akzeptieren keine Leerzeichenwerte. | Code- und Laufzeitprüfung |
| D-04 | ✅ | Textfelder besitzen Längenlimits. | Code- und Laufzeitprüfung |
| D-05 | ✅ | Aufwand akzeptiert nur 0 bis 1440 Minuten. | Code- und Laufzeitprüfung |
| D-06 | ✅ | Aufgabenanzahl ist auf 5000 begrenzt. | Code- und Laufzeitprüfung |
| D-07 | ✅ | Importdateien sind auf 64 MiB begrenzt. | Code- und Laufzeitprüfung |
| D-08 | ✅ | Schreiben erfolgt über temporäre Datei und Umbenennung. | Code- und Laufzeitprüfung |
| D-09 | ✅ | Vor gültigem Überschreiben entsteht eine Sicherung. | Code- und Laufzeitprüfung |
| D-10 | ✅ | Beschädigte Hauptdatei kann aus Sicherung gelesen werden. | Code- und Laufzeitprüfung |
| D-11 | ✅ | Beschädigte Daten ersetzen keinen gültigen Zustand. | Code- und Laufzeitprüfung |
| D-12 | ✅ | Reset entfernt auch die automatische Sicherung. | Code- und Laufzeitprüfung |

## Security

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| S-01 | ✅ | Node-Integration ist deaktiviert. | Code- und Laufzeitprüfung |
| S-02 | ✅ | Kontextisolation ist aktiviert. | Code- und Laufzeitprüfung |
| S-03 | ✅ | Electron-Sandbox ist aktiviert. | Code- und Laufzeitprüfung |
| S-04 | ✅ | Externe Navigation wird blockiert. | Code- und Laufzeitprüfung |
| S-05 | ✅ | Neue Fenster werden blockiert. | Code- und Laufzeitprüfung |
| S-06 | ✅ | Berechtigungsanfragen werden abgelehnt. | Code- und Laufzeitprüfung |
| S-07 | ✅ | IPC akzeptiert nur das Hauptfenster. | Code- und Laufzeitprüfung |
| S-08 | ✅ | Import wird vor dem Speichern validiert. | Code- und Laufzeitprüfung |
| S-09 | ✅ | Keine Zugangsdaten werden eingecheckt. | Code- und Laufzeitprüfung |
| S-10 | ✅ | Umgebungsdateien werden ignoriert. | Code- und Laufzeitprüfung |
| S-11 | ✅ | Abhängigkeiten werden auf bekannte Schwachstellen geprüft. | Code- und Laufzeitprüfung |
| S-12 | ✅ | CSP beschränkt ausführbare Quellen. | Code- und Laufzeitprüfung |

## Tests

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| T-01 | ✅ | Domänenschema besitzt automatisierte Tests. | automatisierter Test |
| T-02 | ✅ | Alle Aufgabenarten besitzen Tests. | automatisierter Test |
| T-03 | ✅ | Migration alter Daten besitzt einen Test. | automatisierter Test |
| T-04 | ✅ | Sortierung nach Status, Datum und Priorität ist getestet. | automatisierter Test |
| T-05 | ✅ | Relative Fälligkeitstexte sind getestet. | automatisierter Test |
| T-06 | ✅ | Wochenfilter und Aufwandsformatierung sind getestet. | automatisierter Test |
| T-07 | ✅ | Ersteinrichtung wird als Nutzerablauf getestet. | automatisierter Test |
| T-08 | ✅ | Anlegen, Bearbeiten und Löschen werden getestet. | automatisierter Test |
| T-09 | ✅ | Erledigen, Wiederöffnen, Filter und Suche werden getestet. | automatisierter Test |
| T-10 | ✅ | Fehler-, Entwurfs- und Doppelklickpfade werden getestet. | automatisierter Test |
| T-11 | ✅ | Desktop-Brücke und echte Dateien werden nativ getestet. | automatisierter Test |
| T-12 | ✅ | Gepackte EXE durchläuft denselben nativen Ablauf. | automatisierter Test |

## Performance

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| P-01 | ✅ | Produktions-JavaScript bleibt unter 500 kB gzip. | Code- und Laufzeitprüfung |
| P-02 | ✅ | Erster Renderer-Build benötigt keine Netzwerkabfragen. | Code- und Laufzeitprüfung |
| P-03 | ✅ | Tagesansicht begrenzt Vorschau auf fünf Aufgaben. | Code- und Laufzeitprüfung |
| P-04 | ✅ | Aufgabenliste rendert zunächst höchstens 50 Treffer. | Code- und Laufzeitprüfung |
| P-05 | ✅ | Weitere Treffer werden schrittweise geladen. | Code- und Laufzeitprüfung |
| P-06 | ✅ | Suche arbeitet weiterhin über alle Aufgaben. | Code- und Laufzeitprüfung |
| P-07 | ✅ | Zeitaktualisierung läuft höchstens einmal pro Minute. | Code- und Laufzeitprüfung |
| P-08 | ✅ | Speichern wird gegen parallele Klicks gesperrt. | Code- und Laufzeitprüfung |
| P-09 | ✅ | Dateioperationen werden serialisiert. | Code- und Laufzeitprüfung |
| P-10 | ✅ | App startet ohne Entwicklungsserver. | Code- und Laufzeitprüfung |
| P-11 | ✅ | Doppelstart öffnet keine zweite Instanz. | Code- und Laufzeitprüfung |
| P-12 | ✅ | App beendet sich nach ausstehenden Schreibvorgängen. | Code- und Laufzeitprüfung |

## Betrieb

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| O-01 | ✅ | Windows-Build startet per Doppelklick. | Code- und Laufzeitprüfung |
| O-02 | ✅ | Desktop-Verknüpfung zeigt nur UniX. | Code- und Laufzeitprüfung |
| O-03 | ✅ | Startskript meldet einen fehlenden Build verständlich. | Code- und Laufzeitprüfung |
| O-04 | ✅ | Stopskript beendet nur den Projekt-Build. | Code- und Laufzeitprüfung |
| O-05 | ✅ | Stop verwendet den regulären App-Lebenszyklus. | Code- und Laufzeitprüfung |
| O-06 | ✅ | Erneuter Stop ist erfolgreich. | Code- und Laufzeitprüfung |
| O-07 | ✅ | Fensterschließen warnt bei ungespeicherten Eingaben. | Code- und Laufzeitprüfung |
| O-08 | ✅ | Fenster besitzt eine Mindestgröße. | Code- und Laufzeitprüfung |
| O-09 | ✅ | Formulare bleiben bei Mindestgröße erreichbar. | Code- und Laufzeitprüfung |
| O-10 | ✅ | Sicherungsexport verwendet einen Dateidialog. | Code- und Laufzeitprüfung |
| O-11 | ✅ | Wiederherstellung verlangt eine Bestätigung. | Code- und Laufzeitprüfung |
| O-12 | ✅ | Nutzerdaten liegen außerhalb des Projektverzeichnisses. | Code- und Laufzeitprüfung |

## Release

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| R-01 | ✅ | README beschreibt Setup, Start, Stop, Tests und Build. | Release-Prüfung |
| R-02 | ✅ | README beschreibt Funktionen ohne Zukunftsmodule vorzutäuschen. | Release-Prüfung |
| R-03 | ✅ | Roadmap trennt aktuelle und spätere Meilensteine. | Release-Prüfung |
| R-04 | ✅ | Prüfprotokoll nennt Testgrenzen. | Release-Prüfung |
| R-05 | ✅ | Designgrundlagen dokumentieren Palette und UI-Regeln. | Release-Prüfung |
| R-06 | ✅ | Ruflo-Version und Integrationsart sind dokumentiert. | Release-Prüfung |
| R-07 | ✅ | Installer trägt Version 0.4.0. | Release-Prüfung |
| R-08 | ✅ | Installer-Prüfsumme wird veröffentlicht. | Release-Prüfung |
| R-09 | ✅ | Quellstand ist im bestehenden öffentlichen Repo. | Release-Prüfung |
| R-10 | ✅ | Release-Tag verweist auf denselben Commit. | Release-Prüfung |
| R-11 | ✅ | Arbeitsverzeichnis ist nach Push sauber. | Release-Prüfung |
| R-12 | ✅ | Nicht signierter Installer wird offen ausgewiesen. | Release-Prüfung |
