# Designsystem

## Charakter

UniX wirkt hell, präzise, ruhig und menschlich. Die Anwendung orientiert sich an echten Arbeitsoberflächen: klare Hierarchie, erkennbare Zustände, wenig Dekoration und kurze Wege. Sie verwendet keine Verläufe, Glaseffekte, Neonflächen, austauschbaren Marketingkarten oder bedeutungslose Kennzahlen.

## Farbrollen

| Rolle | Wert | Verwendung |
| --- | --- | --- |
| Canvas | `#F6F7F9` | App-Hintergrund |
| Surface | `#FFFFFF` | Arbeitsflächen und Dialoge |
| Ink | `#17202A` | Haupttext |
| Muted | `#5C6673` | Sekundärtext |
| Line | `#DDE2E8` | Trennung und Eingabekanten |
| Brand | `#3157E5` | Hauptaktionen und Fokus |
| Brand soft | `#E8EDFF` | Auswahl und Fokusfläche |
| Mint | `#DDF5E7` | positive Zustände |
| Butter | `#FFF1BD` | zeitnahe Hinweise |
| Coral | `#F36F5D` | überfällig und Gefahr |

## Typografie und Rhythmus

- Systemschrift mit nativen Fallbacks; keine externe Schriftabfrage.
- 12, 14, 16, 20, 28 und 40 px bilden die feste Skala.
- 4 px ist die Basiseinheit; Hauptabstände verwenden 8, 12, 16, 24, 32 und 48 px.
- Bedienelemente sind mindestens 44 px hoch.
- Radien bleiben bei 10, 14, 18 oder 24 px; Pillen werden nur für echte Filter verwendet.

## Layout

- Desktop ab 1.080 px: feste Navigation links, begrenzte Inhaltsbreite, Editor rechts als Dialogfläche.
- Tablet zwischen 700 und 1.079 px: kompakte Navigation und einspaltige Inhalte.
- Mobil unter 700 px: untere Navigation, Vollbildeditor und sichere Innenabstände.
- Keine horizontale Scrollleiste bei 320 px Breite oder 200 % Zoom.

## Interaktionsregeln

- Jede Ansicht besitzt genau eine primäre Aktion.
- Listen zeigen Zustand, Inhalt, Kontext und Zeitpunkt ohne Öffnen.
- Löschen, Zurücksetzen und Import benötigen explizite Bestätigung.
- Ungespeicherte Eingaben werden beim Verlassen geschützt.
- Leere, ladende, fehlerhafte, speichernde, gespeicherte und wiederhergestellte Zustände sind eigenständig formuliert.
- Nicht verpflichtende Eingaben stehen als `(optional)` in der Beschriftung.
- Sichtbare Produktbezeichnung ist ausschließlich `UniX`.
