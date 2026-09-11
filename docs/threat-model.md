# Bedrohungs- und Datenschutzmodell

Stand: 11. September 2026 · erste Prüfung vor M2.2 erforderlich

## Datenklassen

| Klasse | Beispiele | Voreinstellung | Export |
| --- | --- | --- | --- |
| privat auf dem Gerät | Planung, Notizen, persönliche Module | nur die Person | persönliches Backup |
| privat auf der Plattform | E-Mail, Sitzungen, Verifikationsstatus | Konto und berechtigte Systeme | nicht im Planungsbackup |
| campus-sichtbar | Anzeigename, Hochschule, freigegebener Studiengang und Skills | eigene Hochschule | nur bewusste Profilfreigabe |
| beziehungsbezogen | Bewerbung, Unterhaltung, Kontaktfreigabe | Beteiligte und Moderation nach Regel | kein Nutzerbackup fremder Daten |
| intern geschützt | Meldungen, Moderationsnotizen, Auditereignisse | autorisierte Rollen | kein Nutzerexport; geregelte Auskunft getrennt |

## Bedrohungen und Kontrollen

| Bedrohung | Mindestkontrolle | Owner | Release-Gate |
| --- | --- | --- | --- |
| Kontoübernahme | sichere Sitzung, Rate Limit, Widerruf, Recovery-Test | Security | M2.2 |
| falsche Hochschulzugehörigkeit | Bestätigung plus dokumentierter Ersatzweg | Identity, Support | M2.2 |
| Profil-Scraping | campusbegrenzte Sichtbarkeit, Pagination, Rate Limit | Security | M2.3 |
| Veröffentlichung privater Kontaktdaten | sichere Vorgaben, Warnung, serverseitige Prüfung | Produkt, Trust & Safety | M2.3 |
| Belästigung | Blockierung, Meldung, Kontaktabbruch, Moderation | Trust & Safety | M2.3 |
| Spam und Betrug | Limits, Meldeweg, Sperre, nachvollziehbare Entscheidungen | Trust & Safety | M2.5 |
| Umgehen einer Blockierung | serverseitige Filterung aller Such- und Kontaktwege | Backend | M2.4 |
| doppelte Vergabe | Transaktion, Revision, Idempotenz | Backend, Qualität | CampusGig |
| manipulierte Eingaben | Längen-, Typ-, Rechte- und Zustandsprüfung am Server | Security, Backend | jedes Modul |
| schädliche Uploads | Typprüfung, Größenlimit, Metadatenentfernung, Scan | Security, Betrieb | vor Medienupload |
| Datenverlust | getestete Backups, Wiederherstellung und Migration | Betrieb | M2.5 |
| zu weitgehender Mitarbeiterzugriff | minimale Rollen, Audit und regelmäßige Prüfung | Datenschutz, Betrieb | M2.5 |
| unvollständige Löschung | Löschplan für Primärdaten, Cache, Dateien und Backups | Datenschutz, Betrieb | M2.2 |
| Informationsleck in Logs | Positivliste erlaubter Felder, Redaktionsprüfung | Security, Qualität | M2.2 |

## Sicherheitsprinzipien

- Der Server prüft Identität, Rolle, Eigentum und Objektzustand bei jeder geschützten Aktion.
- Clientseitige Prüfungen dienen der Bedienung und sind niemals die einzige Schutzschicht.
- Neue Felder sind standardmäßig privat, bis eine konkrete Sichtbarkeitsregel beschlossen ist.
- Sperrung und Löschung haben Vorrang vor Cache und Offline-Warteschlangen.
- Geheimnisse werden weder fest eingebaut noch über Nutzerbackups transportiert.
- Sicherheitsrelevante Änderungen benötigen negative Tests und ein Rückfallverfahren.

## Offene Prüfung

Vor einem öffentlichen Pilot müssen Datenschutz und Rechtsberatung Zweck, Aufbewahrung, Löschung, Einwilligung, Plattformrolle, erlaubte Angebote und den Umgang mit Minderjährigen bewerten. Dieses Dokument trifft keine rechtliche Freigabe.
