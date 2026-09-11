# Stakeholder und Verantwortung

## Stakeholderregister

| Stakeholder | Interesse | Einfluss | Einbindung im ersten Release |
| --- | --- | --- | --- |
| Produktverantwortlicher | Vision, Prioritäten, Abnahme, Markenwirkung | sehr hoch | entscheidet Scope und nimmt Meilensteine ab |
| Studierende | schnelle, fehlerfreie Alltagsplanung | sehr hoch | Primärnutzer und Pilotgruppe |
| CampusGig-Auftraggebende | verlässliche Hilfe, klare Vergabe und Abschluss | hoch ab CampusGig | eigene Interviews und Pilottests |
| CampusGig-Auftragnehmende | passende Aufträge, faire Angaben und sicherer Kontakt | hoch ab CampusGig | getrennte Interviews und Pilottests |
| Käufer und Verkäufer | verständliche Angebote und sichere Kontaktaufnahme | hoch ab Marketplace | Pilot erst nach CampusGig-Vertrauensbasis |
| Lernsuchende und Gruppenorganisatoren | passende, kontrollierbare Lerngruppen | hoch ab StudyMatch | eigener Matching- und Sicherheitstest |
| Studierende mit Hilfstechnologien | Tastatur-, Zoom-, Kontrast- und Screenreader-Nutzung | hoch | Accessibility-Gates und Pilotprüfung |
| Entwicklung | wartbare Architektur, reproduzierbare Builds | hoch | implementiert und belegt Kriterien |
| Qualitätssicherung | reproduzierbare Abläufe und Fehlerpfade | hoch | automatisierte und manuelle Abnahme |
| Support | Kontozugang, Verifikationsfälle, Konflikte und verständliche Hilfe | hoch ab M2 | benötigt eigenes Werkzeug ohne Datenbankzugriff |
| Betrieb | Bereitstellung, Diagnose, Wiederherstellung und Vorfälle | hoch ab M2 | besitzt Betriebs- und Recovery-Gates |
| Security | sichere Anmeldung, Rechte, Eingaben und Vorfallreaktion | hoch ab M2 | prüft Bedrohungsmodell und Negativtests |
| Datenschutz/Legal | Datenminimierung, Transparenz, spätere Plattformregeln | hoch | Gate vor Accounts, Matching und Handel |
| Trust & Safety | Moderation, Meldung, Blockierung und Missbrauchsschutz | sehr hoch ab M2 | besitzt Gate für soziale Module und Pilotbetrieb |
| Hochschulen | mögliche Verifikation und Campusdaten | mittel ab Partnerschaften | derzeit keine Integration und kein Branding |
| Anbieter/Arbeitgeber | mögliche spätere professionelle Aufträge | mittel | nicht Teil des studentischen CampusGig-Piloten |
| Apple | iOS-Richtlinien, Signing und Distribution | hoch für iOS | iOS-Runner und mobile UX werden vorbereitet |
| Microsoft | Windows-Verteilung und Signierung | hoch für Desktop | Installer, SmartScreen- und Signatur-Roadmap |

## Entscheidungsmodell

| Entscheidung | Verantwortlich | Entscheidet | Wird konsultiert | Wird informiert |
| --- | --- | --- | --- | --- |
| Produktumfang | Produktentwicklung | Produktverantwortlicher | beide Nutzerseiten, Qualität, Trust & Safety | Support, Betrieb |
| Informationsarchitektur | Produktdesign | Produktverantwortlicher | Accessibility, Pilotnutzer, Support | Qualität |
| technische Architektur | Technikleitung | Produktverantwortlicher | Security, Qualität, Betrieb | Support |
| Identität und Verifikation | Identity-Team | Produktverantwortlicher | Datenschutz, Security, Support | Pilotnutzer |
| Moderationsregeln | Trust & Safety | Produktverantwortlicher | Legal, Support, beide Nutzerseiten | Betrieb |
| Datenschutzfreigabe | Datenschutz/Legal | Produktverantwortlicher | Security, Technik, Trust & Safety | Qualität |
| technische Releasefreigabe | Qualität | Produktverantwortlicher | Entwicklung, Security, Betrieb | Pilotnutzer |
| Pilotstopp bei Sicherheitsrisiko | Trust & Safety oder Security | Produktverantwortlicher | Betrieb, Legal, Entwicklung | Pilotnutzer |

## Abnahmezuständigkeit

Die technische Abnahme belegt reproduzierbare Kriterien. Die fachliche Endabnahme bleibt beim Produktverantwortlichen. Datenschutz, Security und Trust & Safety geben ihre Bereiche getrennt frei und können einen Pilot bei kritischen offenen Risiken stoppen. Ein bestandenes Testpaket ersetzt kein reales Nutzerfeedback; ein positiver optischer Eindruck ersetzt keine technische Abnahme.
