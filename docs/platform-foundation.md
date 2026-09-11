# M2-Plattformfundament

Stand: 11. September 2026 · M2.1

## Ziel

M2 schafft einmalig die Voraussetzungen für CampusGig, Marketplace und StudyMatch. Der Meilenstein liefert keine leere Community-Navigation, sondern überprüfbare Verträge und danach jeweils vollständige vertikale Nutzerabläufe.

## Teilmeilensteine

| Teil | Ergebnis | Status | Gate |
| --- | --- | --- | --- |
| M2.1 Plattformvertrag | Architektur, Stakeholder, Datenhoheit, Identitäts- und Safety-Domain, Bedrohungsmodell, Kriterien | abgeschlossen | Domainregeln getestet; 130 M2-Kriterien erfasst |
| M2.2 Konto und Hochschule | Anmeldung, Sitzung, Verifikation, Kontolöschung, geschützter Speicher | geplant | Datenschutz-, Security- und Recovery-Abnahme |
| M2.3 Community-Profil | Vorschau, Sichtbarkeit, Skills, Sperren, Meldungen | geplant | kein privates Feld unbeabsichtigt sichtbar |
| M2.4 Postfach und Hinweise | Unterhaltungen, Zustellung, ungelesen, Blockwirkung | geplant | vollständige Zustände und Moderationszugriff |
| M2.5 Pilotbetrieb | Moderationsoberfläche, Support, Monitoring, geschlossener Pilot | geplant | keine kritischen offenen Probleme |
| M2.6 Plattformhüllen | nativer Windows-Build, Signierung, iOS/TestFlight, Hilfstechnologien | geplant | signierte und praktisch geprüfte Builds |

## Gemeinsame Fähigkeiten

- Konto- und Sitzungszustand
- Institution und bestätigte Hochschulzugehörigkeit
- bewusst veröffentlichtes Community-Profil
- Suche, Filter und Favoriten als wiederverwendbare UI-Muster
- Postfach und Benachrichtigungspräferenzen
- Blockieren, Melden und Moderieren
- versionierte Serververträge, Cache und Synchronisierung
- Feature-Schalter für Pilotgruppen und schrittweise Freigabe
- Diagnose, Support und nachvollziehbare Betriebsereignisse

Gemeinsam bedeutet nicht global veränderbar: Jedes Fachmodul besitzt weiterhin seine Entitäten und Statusregeln selbst.

## Verbindliche Nutzerabläufe für M2.2

1. Person erstellt ein Konto und bestätigt die Adresse.
2. Person wählt ihre Hochschule aus einer kontrollierten Liste.
3. UniX erklärt klar, welche Angabe sichtbar wird und wofür sie benötigt wird.
4. Verifikation wird bestätigt, bleibt ausstehend oder wird mit verständlichem nächsten Schritt abgelehnt.
5. Unterbrochene Anmeldung kann sicher fortgesetzt werden.
6. Abmeldung, Gerätewechsel, verlorene Sitzung und Kontolöschung besitzen vollständige Abläufe.
7. Die persönliche Planung bleibt bei Netzwerk- oder Kontofehlern erreichbar.

## Vor M2.2 zu entscheidende Produktfragen

| Entscheidung | Verantwortlich | Benötigte Eingabe |
| --- | --- | --- |
| erste Pilot-Hochschule | Produktverantwortlicher | Hochschule und gewünschte Pilotgröße |
| Verifikationsweg | Produkt, Datenschutz, Support | Domainprüfung und manueller Ersatzweg |
| Hosting und Region | Technik, Datenschutz, Betrieb | Anbieterprüfung, Kostenrahmen, Lösch- und Backupvertrag |
| Supportkanal | Produkt, Support | verantwortliche Person und Reaktionszeiten |
| Moderationsbesetzung | Trust & Safety | Bearbeiter, Eskalation und Erreichbarkeit |
| erlaubte CampusGig-Kategorien | Produkt, Legal, Trust & Safety | Positiv- und Verbotsliste |

## Messung

M2 misst abgeschlossene Verifikationen, Zeit bis zur Verifikation, Abbruchgründe, Wiederherstellung verlorener Sitzungen, Fehlerrate, Meldungsbearbeitung und erfolgreiche Kontolöschung. Downloads oder bloße Profilaufrufe gelten nicht als Erfolgsnachweis.

## Übergabe an CampusGig

CampusGig beginnt erst, wenn eine reale Pilotperson sich anmelden, ihre Hochschule bestätigen, ein kontrolliertes Profil veröffentlichen, eine andere Person blockieren und einen Inhalt melden kann. Das verhindert, dass Sicherheits- und Identitätsregeln nachträglich in einen bereits veröffentlichten Marktplatz eingebaut werden müssen.
