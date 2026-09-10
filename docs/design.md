# Gestaltung von UniX

Stand: Version 0.3.0. Ziel: eine moderne, schlichte Studienanwendung in dunklem, zurückhaltendem Grün. Keine Figma-Dateien, externen Schriftabrufe oder Bild-APIs.

## Gestaltungsentscheidungen

- Ein ruhiger Lesebereich neben einer schmalen Seitenleiste. Nur verfügbare Funktionen stehen in der Navigation.
- Tannengrüne Flächen und warme, helle Schrift; Salbei markiert die Hauptaktion und aktive Auswahl. Rötliche Warnfarben bleiben echten Fehlern und überfälligen Aufgaben vorbehalten.
- Keine Verläufe, bunten Statistik-Kacheln, dekorativen Fortschrittsringe oder unverbundenen Karten. Feine Trennlinien gliedern Informationen.
- Manrope wird mit der App ausgeliefert. Überschriften verwenden moderate Gewichte; Zahlen besitzen feste Ziffernbreiten. Lange Titel dürfen umbrechen.
- Einstellungen sind nach Profil, Darstellung, Sicherungen und Zurücksetzen gegliedert. Abschnittsbeschreibung und zugehörige Eingaben stehen nebeneinander, bei wenig Platz untereinander.
- Ein gemeinsamer Formularstil für Einrichtung, Profil und Aufgaben. Die bereits gewünschten Texte bleiben erhalten: „Mensa/Cafétaria“, „(optional)“, keine technischen Werbeaussagen und keine Produktnamenszusätze.
- Erfolgsmeldungen fangen keine Klicks ab und erscheinen nicht über einem neu geöffneten Aufgabenformular. Fehlermeldungen und Speichersperren bleiben erhalten.

## Gemeinsame Farbtokens

Alle Ansichten beziehen ihre Farben aus `src/styles.css`. Neue Komponenten verwenden die semantischen Tokens statt eigener Paletten.

| Rolle | Dunkel | Hell |
| --- | --- | --- |
| Hintergrund | `#101d18` | `#f5f6f0` |
| Oberfläche | `#16271f` | `#ffffff` |
| Seitenleiste | `#0c1712` | `#eaf0e7` |
| Haupttext | `#edf1e9` | `#1c3025` |
| Sekundärtext | `#aabbb0` | `#526657` |
| Akzent | `#c2d6b5` | `#2c5039` |
| Text auf Akzent | `#17291b` | `#ffffff` |

Neue Profile starten mit „Dunkel“. Explizit gespeicherte Einstellungen bleiben unverändert; „System“ folgt weiterhin der Windows-Einstellung. Datenschema, Dateipfad und App-ID ändern sich nicht.

## Verhalten und Prüfung

- Standardfenster 1.440 × 920, Mindestfenster 1.040 × 700; Inhalte dürfen vertikal scrollen, nicht horizontal überlaufen.
- Zusätzliche kompakte Layouts unterstützen auch vergrößerte Inhalte. Der Aufgaben-Dialog hat eine begrenzte Höhe und einen eigenen Scrollbereich.
- Sichtbare Tastaturfokusringe, abgeschirmter Modal-Hintergrund, Fokusbegrenzung, Escape und Schutz ungespeicherter Eingaben bleiben erhalten.
- Reduzierte Bewegung deaktiviert Übergänge. Für Windows-Kontrastmodi gibt es explizite Auswahl-Umrandungen; ein vollständiger Hochkontrasttest steht noch aus.
- Der native Probelauf prüft 28 Text-/Flächen- und Eingaberand-Kontraste anhand der tatsächlich ausgelieferten CSS-Tokens: mindestens 4,5:1 für die geprüften Textkombinationen, mindestens 3:1 für Eingaberänder.
- Screenshots entstehen aus echten Electron-Fenstern mit isolierten Testdaten: Einrichtung, leere Tagesübersicht, gefüllte Tagesübersicht, Aufgaben, Such-Leerzustand, Einstellungen und Dialoge. 200 % Renderer-Zoom ist keine Prüfung aller Windows-DPI-Konfigurationen.

Das Desktop-Symbol entsteht reproduzierbar aus `build/icon.svg` über `npm run icons`. Renderer und Installer verwenden dieselbe grüne Markenfamilie. Die Prüfgrenzen sind im [Prüfprotokoll](verification.md) dokumentiert.
