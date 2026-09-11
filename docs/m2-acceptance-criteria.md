# Abnahmekriterien für das Plattformfundament

Stand: 11. September 2026 · M2

Diese Matrix enthält genau 130 zusätzliche Kriterien in 13 Kategorien. `✅` bedeutet mit dem genannten Nachweis belegt. `⏳` bleibt bis zur Implementierung und Prüfung offen. M2 darf erst veröffentlicht werden, wenn alle 130 Kriterien belegt sind; die abgeschlossene M1-Matrix bleibt davon unabhängig.

## Produkt und Umfang

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| PF-01 | ✅ | M2 ist als gemeinsame Grundlage vor CampusGig abgegrenzt. | Plattformfundament |
| PF-02 | ✅ | CampusGig bleibt der erste soziale Fachbereich. | Roadmap |
| PF-03 | ✅ | Marketplace baut auf derselben Vertrauensbasis auf. | Roadmap |
| PF-04 | ✅ | StudyMatch baut auf derselben Identitätsbasis auf. | Roadmap |
| PF-05 | ✅ | Persönliche Planung bleibt bei Plattformfehlern nutzbar. | ADR-002 |
| PF-06 | ✅ | Nicht fertige Community-Funktionen erscheinen nicht in der Navigation. | ADR-002 |
| PF-07 | ✅ | M2 besitzt sechs einzeln prüfbare Teilmeilensteine. | Plattformfundament |
| PF-08 | ✅ | Erfolg wird durch abgeschlossene Abläufe statt Downloads gemessen. | Plattformfundament |
| PF-09 | ✅ | Integrierte Zahlung ist kein Bestandteil des CampusGig-Piloten. | ADR-003 |
| PF-10 | ✅ | Globale öffentliche Profile sind kein Bestandteil des Piloten. | ADR-003 |

## Stakeholder und Entscheidungen

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| SH-01 | ✅ | Produktverantwortung entscheidet Umfang und Pilot-Hochschule. | Stakeholderregister |
| SH-02 | ✅ | Auftraggebende und Auftragnehmende sind getrennte Rollen. | Stakeholderregister |
| SH-03 | ✅ | Trust & Safety besitzt ein Freigaberecht vor sozialen Funktionen. | Stakeholderregister |
| SH-04 | ✅ | Datenschutz besitzt ein Freigaberecht vor Konten und Verifikation. | Stakeholderregister |
| SH-05 | ✅ | Security prüft Anmeldung, Rechte und Missbrauchsgrenzen. | Stakeholderregister |
| SH-06 | ✅ | Support verantwortet den manuellen Verifikationsersatzweg. | Stakeholderregister |
| SH-07 | ✅ | Betrieb verantwortet Backup, Wiederherstellung und Vorfälle. | Stakeholderregister |
| SH-08 | ✅ | Hochschulen werden ohne Vereinbarung nicht als Partner dargestellt. | ADR-003 |
| SH-09 | ✅ | Accessibility-Testende sind in jedem sichtbaren Teilmeilenstein beteiligt. | Stakeholderregister |
| SH-10 | ✅ | Fachliche, rechtliche und technische Freigaben bleiben unterscheidbar. | Stakeholderregister |

## Identität und Verifikation

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| ID-01 | ✅ | Privates Studienprofil und Plattformkonto sind getrennte Modelle. | Domain-Test |
| ID-02 | ✅ | Konto, Mitgliedschaft, Institution und Community-Profil sind getrennt. | Domain-Test |
| ID-03 | ✅ | Domainverträge enthalten weder Passwort noch Sitzungstoken. | Domain-Test |
| ID-04 | ✅ | E-Mail-Adressen werden validiert und normalisiert. | Domain-Test |
| ID-05 | ✅ | Konto- und Institutionsreferenzen müssen übereinstimmen. | Domain-Test |
| ID-06 | ✅ | Community-Teilnahme benötigt aktives Konto, Institution und Verifikation. | Domain-Test |
| ID-07 | ⏳ | Anmeldung besitzt Erfolg, Fehler, Abbruch und Wiederaufnahme. | M2.2-Test |
| ID-08 | ⏳ | E-Mail-Bestätigung besitzt Ablauf und erneuten Versand mit Limit. | M2.2-Test |
| ID-09 | ⏳ | Verifikation besitzt ausstehend, bestätigt, abgelehnt und abgelaufen. | M2.2-Test |
| ID-10 | ⏳ | Abmeldung, Kontosperre und Kontolöschung wirken geräteübergreifend. | M2.2-Test |

## Trust & Safety

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| TS-01 | ✅ | Blockierungen sind eigenständige, validierte Beziehungen. | Domain-Test |
| TS-02 | ✅ | Ein Konto kann sich nicht selbst blockieren. | Domain-Test |
| TS-03 | ✅ | Meldungen unterscheiden Zieltyp und Grund. | Domain-Test |
| TS-04 | ✅ | Freier Meldegrund benötigt eine Beschreibung. | Domain-Test |
| TS-05 | ✅ | Meldungen besitzen einen begrenzten Zustandsautomaten. | Domain-Test |
| TS-06 | ✅ | Abgeschlossene Meldungen werden nicht still wieder geöffnet. | Domain-Test |
| TS-07 | ⏳ | Blockierungen wirken auf Suche, Profil, Bewerbung und Postfach. | Integrationstest |
| TS-08 | ⏳ | Moderation protokolliert Bearbeitung, Grund, Zeit und Revision. | M2.5-Test |
| TS-09 | ⏳ | Nutzer erhalten eine verständliche Eingangsbestätigung für Meldungen. | UX-Test |
| TS-10 | ⏳ | Eskalation und Reaktionszeiten sind vor dem Pilot besetzt. | Betriebsabnahme |

## User Experience

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| UX-01 | ✅ | Die vollständigen Konto- und Verifikationsabläufe sind beschrieben. | Plattformfundament |
| UX-02 | ✅ | Es werden keine Scheinprofile oder erfundenen Angebote angezeigt. | ADR-002 |
| UX-03 | ⏳ | Anmeldung erklärt Nutzen und benötigte Angaben vor der Eingabe. | Widgettest |
| UX-04 | ⏳ | Jeder Verifikationszustand bietet einen eindeutigen nächsten Schritt. | Widgettest |
| UX-05 | ⏳ | Private und sichtbare Profilfelder sind vor Veröffentlichung unterscheidbar. | UX-Test |
| UX-06 | ⏳ | Unterbrochene Eingaben bleiben ohne doppelte Übermittlung erhalten. | Integrationstest |
| UX-07 | ⏳ | Netzwerkfehler verdrängen nicht die persönliche Planung. | Integrationstest |
| UX-08 | ⏳ | Ausstehende Offline-Aktionen sind sichtbar und abbrechbar. | UX-Test |
| UX-09 | ⏳ | Sperren und Melden sind am relevanten Inhalt erreichbar. | UX-Test |
| UX-10 | ⏳ | Kontolöschung erklärt Folgen und bestätigt den Abschluss. | End-to-End-Test |

## Architektur

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| AR-01 | ✅ | Flutter bleibt die gemeinsame Windows- und iOS-Produktoberfläche. | ADR-002 |
| AR-02 | ✅ | Plattform und Fachmodule bilden einen modularen Monolithen. | ADR-002 |
| AR-03 | ✅ | Anbieter-SDKs sind auf Adapter begrenzt. | ADR-002 |
| AR-04 | ✅ | Widgets greifen nicht direkt auf Plattformtabellen zu. | ADR-002 |
| AR-05 | ✅ | Identität besitzt einen typisierten Repository-Vertrag. | Codeprüfung |
| AR-06 | ✅ | Trust & Safety besitzt einen typisierten Repository-Vertrag. | Codeprüfung |
| AR-07 | ✅ | Community-Daten werden nicht in den Planungs-Workspace eingebettet. | Codeprüfung |
| AR-08 | ✅ | Microservices sind bis zu belegter unabhängiger Skalierung ausgeschlossen. | ADR-002 |
| AR-09 | ⏳ | Die Serveranwendung erzwingt dieselben Statusregeln wie die Domain. | Integrationstest |
| AR-10 | ⏳ | Ein Anbieterwechsel erfordert keine Änderung der Fach-Widgets. | Adaptertest |

## Daten und Synchronisierung

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| DA-01 | ✅ | Für jede Datenklasse ist eine verbindliche Quelle festgelegt. | ADR-002 |
| DA-02 | ✅ | Persönliche Backups schließen fremde und interne Daten aus. | ADR-002 |
| DA-03 | ✅ | Plattformzeitpunkte werden ausschließlich als UTC akzeptiert. | Domain-Test |
| DA-04 | ✅ | Profiltexte und Skills besitzen feste Grenzen. | Domain-Test |
| DA-05 | ✅ | Serverobjekte erhalten Revisionen für konkurrierende Änderungen. | ADR-002 |
| DA-06 | ✅ | Schreibende Netzwerkanfragen benötigen Idempotenzschlüssel. | ADR-002 |
| DA-07 | ⏳ | Cache-Schema und Server-Schema besitzen versionierte Migrationen. | Migrationstest |
| DA-08 | ⏳ | Offline-Warteschlangen überleben einen Neustart ohne Duplikate. | Integrationstest |
| DA-09 | ⏳ | Sperrungen und Löschungen verdrängen veraltete Cache-Inhalte. | Integrationstest |
| DA-10 | ⏳ | Konflikte zeigen einen verständlichen Zustand statt still zu überschreiben. | UX- und Integrationstest |

## Security und Datenschutz

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| SE-01 | ✅ | Datenklassen und Sichtbarkeiten sind dokumentiert. | Bedrohungsmodell |
| SE-02 | ✅ | Jede geschützte Aktion benötigt serverseitige Rechteprüfung. | Bedrohungsmodell |
| SE-03 | ✅ | Neue Felder sind ohne Freigaberegel nicht öffentlich. | Bedrohungsmodell |
| SE-04 | ✅ | Kontaktdaten sind nicht standardmäßig sichtbar. | ADR-003 |
| SE-05 | ⏳ | Sitzungstoken liegen im geschützten Plattformspeicher. | Plattformtest |
| SE-06 | ⏳ | Anmeldung besitzt Rate Limits und widerrufbare Sitzungen. | Security-Test |
| SE-07 | ⏳ | Servereingaben werden nach Typ, Länge, Recht und Zustand geprüft. | Negativtest |
| SE-08 | ⏳ | Logs verwenden eine Positivliste und enthalten keine Geheimnisse. | Logprüfung |
| SE-09 | ⏳ | Kontolöschung umfasst Primärdaten, Cache, Dateien und Backups. | Löschtest |
| SE-10 | ⏳ | Vor dem Pilot liegt eine externe Datenschutz- und Legal-Freigabe vor. | Freigabeprotokoll |

## Tests und Qualität

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| TE-01 | ✅ | Identitätsnormalisierung besitzt Unit-Tests. | 76 Flutter-Tests |
| TE-02 | ✅ | Teilnahmeberechtigung besitzt positive und negative Tests. | 76 Flutter-Tests |
| TE-03 | ✅ | Referenzintegrität der Identität besitzt negative Tests. | 76 Flutter-Tests |
| TE-04 | ✅ | Blockierung besitzt positive und negative Tests. | 76 Flutter-Tests |
| TE-05 | ✅ | Meldezustände besitzen Übergangs- und Terminaltests. | 76 Flutter-Tests |
| TE-06 | ✅ | Serialisierung schließt bekannte Geheimnisfelder aus. | 76 Flutter-Tests |
| TE-07 | ⏳ | Authentifizierung besitzt Adapter- und Integrationstests. | M2.2-Test |
| TE-08 | ⏳ | Berechtigungen werden für fremde, gesperrte und suspendierte Konten geprüft. | Security-Test |
| TE-09 | ⏳ | Synchronisierung besitzt Neustart-, Duplikat- und Konflikttests. | Integrationstest |
| TE-10 | ⏳ | Kritische Kontoabläufe besitzen End-to-End-Tests auf Windows und iOS. | Plattformtest |

## Performance und Zuverlässigkeit

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| PE-01 | ⏳ | Anmeldung zeigt innerhalb von 300 ms einen laufenden Zustand. | Messung |
| PE-02 | ⏳ | Zwischengespeicherte Community-Ansichten öffnen innerhalb von 500 ms. | Messung |
| PE-03 | ⏳ | Suchergebnisse sind paginiert und pro Seite begrenzt. | Integrationstest |
| PE-04 | ⏳ | Wiederholte Übertragung erzeugt keine doppelten Objekte. | Last- und Integrationstest |
| PE-05 | ⏳ | Netzwerkabbrüche führen zu keinem Verlust bestätigter Daten. | Fehlertest |
| PE-06 | ⏳ | Ein Serverfehler blockiert keine private Planungsaktion. | Integrationstest |
| PE-07 | ⏳ | Zeitüberschreitungen besitzen begrenzte Wiederholungen mit Rückstau. | Adaptertest |
| PE-08 | ⏳ | Der Client begrenzt Cache, Anhänge und Offline-Warteschlange. | Grenzwerttest |
| PE-09 | ⏳ | Der Dienst besitzt definierte Verfügbarkeits- und Wiederherstellungsziele. | Betriebsabnahme |
| PE-10 | ⏳ | Pilotlast und zehnfache Pilotlast werden vor Freigabe gemessen. | Lasttest |

## Betrieb und Support

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| OP-01 | ✅ | Hosting, Support und Moderation sind explizite Freigabeentscheidungen. | Plattformfundament |
| OP-02 | ⏳ | Entwicklungs-, Test- und Produktionsumgebung sind getrennt. | Betriebsprüfung |
| OP-03 | ⏳ | Geheimnisse werden außerhalb Repository und Build verwaltet. | Security-Prüfung |
| OP-04 | ⏳ | Datenbankbackups werden automatisch erstellt und testweise eingespielt. | Recovery-Test |
| OP-05 | ⏳ | Migrationen besitzen Vorwärts-, Rückfall- und Datenprüfung. | Migrationstest |
| OP-06 | ⏳ | Support kann Verifikationsfälle ohne Datenbankzugriff bearbeiten. | Support-Abnahme |
| OP-07 | ⏳ | Moderation kann Meldungen und Sperren rollenbegrenzt bearbeiten. | Rollen-Abnahme |
| OP-08 | ⏳ | Sicherheits- und Betriebsalarme besitzen verantwortliche Empfänger. | Bereitschaftsplan |
| OP-09 | ⏳ | Ein Vorfall besitzt Kommunikations-, Eindämmungs- und Lernablauf. | Übung |
| OP-10 | ⏳ | Feature-Schalter können Community-Funktionen ohne App-Update stoppen. | Betriebsmitteltest |

## Accessibility

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| AC-01 | ✅ | Hilfstechnologie-Nutzende sind als prüfende Stakeholder festgelegt. | Stakeholderregister |
| AC-02 | ⏳ | Konto und Verifikation sind vollständig per Tastatur bedienbar. | Plattformtest |
| AC-03 | ⏳ | Status und Fehler werden für Screenreader eindeutig angekündigt. | Screenreader-Test |
| AC-04 | ⏳ | Formulare bleiben bei 200 Prozent Textskalierung bedienbar. | Sichtprüfung |
| AC-05 | ⏳ | Kleine iPhone-Breiten benötigen kein horizontales Scrollen. | Widget- und Sichtprüfung |
| AC-06 | ⏳ | Fokus kehrt nach Dialogen an die auslösende Aktion zurück. | Tastaturtest |
| AC-07 | ⏳ | Zeitbegrenzte Bestätigungen lassen sich verlängern oder erneut senden. | UX-Test |
| AC-08 | ⏳ | Sicherheitszustände werden nicht ausschließlich farblich vermittelt. | Sichtprüfung |
| AC-09 | ⏳ | Blockieren und Melden besitzen verständliche semantische Beschriftungen. | Semantiktest |
| AC-10 | ⏳ | Reduzierte Bewegung wird in allen neuen Übergängen respektiert. | Plattformtest |

## Pilot und Freigabe

| ID | Status | Kriterium | Nachweis |
| --- | --- | --- | --- |
| PI-01 | ✅ | Der erste Pilot ist auf eine Hochschule und feste Größe begrenzt. | Plattformfundament |
| PI-02 | ✅ | M2 besitzt ein Gate vor CampusGig. | Roadmap |
| PI-03 | ⏳ | Pilot-Hochschule und Teilnehmerzahl sind benannt. | Produktentscheidung |
| PI-04 | ⏳ | Testpersonen bilden beide CampusGig-Seiten ab. | Pilotplan |
| PI-05 | ⏳ | Mindestens eine Person nutzt Tastatur oder Hilfstechnologie im Pilot. | Pilotprotokoll |
| PI-06 | ⏳ | Kritische und hohe Befunde sind vor Freigabe geschlossen. | Fehlerregister |
| PI-07 | ⏳ | Verifikations-, Abbruch- und Recovery-Kennzahlen sind ausgewertet. | Pilotbericht |
| PI-08 | ⏳ | Trust & Safety bestätigt Besetzung und Eskalationsweg. | Freigabeprotokoll |
| PI-09 | ⏳ | Datenschutz, Security, Qualität und Produkt geben getrennt frei. | Freigabeprotokoll |
| PI-10 | ⏳ | Veröffentlichung bindet Commit, Migrationen und Artefakte an einen Nachweis. | Releasebeleg |
