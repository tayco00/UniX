# Architektur

## ADR-001: Flutter als Produktplattform

Status: angenommen am 11. September 2026.

UniX wird als Flutter-/Dart-Anwendung neu entwickelt. Domänenmodell, Zustandslogik, UI-Komponenten, responsive Regeln und Tests sind dadurch für Windows und iOS gemeinsam nutzbar. Das Repository enthält von Beginn an getrennte `windows/`- und `ios/`-Runner.

Der aktuelle Windows-Rechner besitzt keine Visual-Studio-C++-Toolchain; die systemweite Installation wurde von Windows abgebrochen. Release 0.5.0 liefert den Flutter-Web-Build deshalb in einem eng begrenzten Electron-Host aus. Der Host enthält keine Fachlogik. Sobald die C++-Toolchain verfügbar ist, ersetzt der bereits angelegte native Flutter-Windows-Runner diesen Adapter. Die iOS-Implementierung wird später auf macOS mit Xcode gebaut und signiert.

## Schichten

| Schicht | Verantwortung | Darf nicht enthalten |
| --- | --- | --- |
| Domain | Profile, Module, Verpflichtungen, Regeln, Serialisierung | Flutter-Widgets, Dateidialoge, Electron |
| Application | Lade-, Speicher- und Nutzeraktionen, Fehlerzustände | konkrete Plattform-APIs |
| Data | versionierte Speicherung hinter Repository-Vertrag | UI-Entscheidungen |
| Presentation | adaptive Screens, Komponenten, Texte, Eingabevalidierung | direkte Speicherzugriffe |
| Platform | Windows-Host, iOS-/Windows-Runner, Export-/Import-Brücke | Produktregeln |

## Modulgrenzen

```text
planning/        aktiver Produktkern: Module, Verpflichtungen, Tagesfokus
identity/        derzeit nur privates Profil; später Verifikation und Account
campus_gig/      späterer eigener Kontext mit Moderation und Haftung
marketplace/     späterer eigener Kontext mit Angebot, Suche und Meldung
study_match/     späterer eigener Kontext mit Matching und Sicherheit
semester_mate/   späterer eigener Kontext für Fristen und Integrationen
sync/            spätere Synchronisierung mit Konfliktregeln
```

Nur `planning/` und das private Profil werden jetzt implementiert. Spätere Kontexte dürfen das Planungsmodell nicht ungeprüft erweitern.

## Datenvertrag

Das neue Datenformat beginnt bewusst bei Schema `1` und verwendet den Schlüssel `app.unix.workspace.v1`. Frühere App-Daten werden weder gelesen noch verändert. Ein `WorkspaceRepository` kapselt den Datenspeicher. JSON-Importe werden vollständig validiert, bevor sie den aktuellen Zustand ersetzen.

Grenzen: maximal 100 aktive/archivierte Module und 5.000 Verpflichtungen; eindeutige IDs; gültige Referenzen; begrenzte Textlängen; echte Kalenderdaten; keine stillen Teilimporte.

## Sicherheitsmodell

Der Windows-Host aktiviert Kontextisolation und Sandbox, deaktiviert Node-Integration, verweigert Navigation, Fensteröffnung und Berechtigungsanfragen und bietet der UI nur Export, Import, Dirty-State, App-Info und Beenden. Keine Netzwerk-API ist für den Produktbetrieb erforderlich.

## Entwicklungsharness

Ruflo 3.41.2 ist projektbezogen in `.agents/` und `AGENTS.md` eingerichtet. Es steuert Arbeits- und Qualitätsregeln, ist aber weder Produktabhängigkeit noch Teil eines Releases. Laufzeitdaten bleiben ignoriert.
