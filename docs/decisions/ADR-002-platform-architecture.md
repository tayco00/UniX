# ADR-002: Architektur der gemeinsamen Plattform

Status: angenommen für M2.1 am 11. September 2026.

## Kontext

CampusGig, Marketplace und StudyMatch sind Mehrnutzerfunktionen. Ihre Daten können nicht wie die persönliche Studienplanung ausschließlich im privaten Workspace einer Person geführt werden. Gleichzeitig sollen Windows und iOS dieselbe Fachlogik und dieselben Bedienregeln verwenden.

## Entscheidung

UniX bleibt eine Flutter-Anwendung und wird als modularer Monolith gegliedert. Die Module besitzen eigene Fachmodelle, Anwendungsfälle und Repository-Verträge. Gemeinsame Plattformfähigkeiten werden nur für Identität, Hochschulzugehörigkeit, Postfach, Benachrichtigungen, Trust & Safety und Synchronisierung bereitgestellt.

Die spätere Serveranwendung startet ebenfalls als modularer Monolith hinter einer versionierten HTTPS-Schnittstelle. PostgreSQL ist die verbindliche Datenbank für Community-Daten. Binärdateien liegen in einem getrennten Objektspeicher. Der konkrete Hosting-Anbieter wird erst in M2.2 nach Datenschutz-, Betriebs- und Kostenprüfung ausgewählt.

Es werden keine Microservices eingeführt. Die Flutter-Oberfläche greift nie direkt auf Datenbanktabellen zu. Anbieter-SDKs dürfen nur in Adaptern vorkommen.

## Datenhoheit

| Datenart | Verbindliche Quelle | Verhalten ohne Verbindung |
| --- | --- | --- |
| persönliche Planung | Gerät der Person | vollständig bearbeitbar |
| Konto und Verifikation | Server | letzter bestätigter Zustand sichtbar |
| öffentliches Profil | Server | lesbarer Cache; Änderungen als ausstehend markiert |
| Gig, Bewerbung und Vergabe | Server | Cache lesbar; konfliktträchtige Übergänge benötigen Bestätigung |
| Blockierung und Meldung | Server | Blockierung wirkt sofort im Client und wird zuverlässig übertragen |
| Nachrichten | Server | gelesene Inhalte im Cache; Versand erhält eindeutigen Zustand |

Persönliche Sicherungen enthalten ausschließlich eigene Planungsdaten. Fremde Profile, Unterhaltungen, Moderationsdaten und Zugangsdaten werden niemals in dieses Dateiformat aufgenommen.

## Konsistenzregeln

- Jede schreibende Netzwerkanfrage erhält einen Idempotenzschlüssel.
- Veränderliche Serverobjekte besitzen eine Revisionsnummer.
- Statuswechsel werden serverseitig als Zustandsautomaten geprüft.
- Vergabe, Reservierung und Abschluss erfolgen transaktional.
- Löschungen und Sperren verdrängen veraltete Cache-Inhalte.
- Clientzeit ist niemals Autorität für Fristen, Vergaben oder Moderationsentscheidungen.

## Konsequenzen

Die vorhandene Planung bleibt während M2 unverändert nutzbar. Community-Funktionen erscheinen erst in der Navigation, sobald ein kompletter vertikaler Ablauf einschließlich Fehler-, Sperr- und Moderationszuständen abgenommen wurde. Ein späterer Anbieterwechsel bleibt möglich, weil Fachlogik und UI nur Repository-Verträge kennen.

## Verworfene Alternativen

- Eine gemeinsame JSON-Datei für private und öffentliche Daten verletzt Eigentums- und Sicherheitsgrenzen.
- Direkte Datenbankzugriffe aus Widgets verteilen Berechtigungs- und Fachregeln über die Oberfläche.
- Microservices erhöhen Betrieb und Fehlerflächen, bevor unabhängige Skalierungsanforderungen belegt sind.
- Lokale Scheinprofile und erfundene Angebote erzeugen keine belastbare Mehrnutzerfunktion.
