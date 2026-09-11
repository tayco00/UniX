# Stakeholder und Verantwortung

## Stakeholderregister

| Stakeholder | Interesse | Einfluss | Einbindung im ersten Release |
| --- | --- | --- | --- |
| Produktverantwortlicher | Vision, Prioritäten, Abnahme, Markenwirkung | sehr hoch | entscheidet Scope und nimmt Meilensteine ab |
| Studierende | schnelle, fehlerfreie Alltagsplanung | sehr hoch | Primärnutzer und Pilotgruppe |
| Studierende mit Hilfstechnologien | Tastatur-, Zoom-, Kontrast- und Screenreader-Nutzung | hoch | Accessibility-Gates und Pilotprüfung |
| Entwicklung | wartbare Architektur, reproduzierbare Builds | hoch | implementiert und belegt Kriterien |
| Qualitätssicherung | reproduzierbare Abläufe und Fehlerpfade | hoch | automatisierte und manuelle Abnahme |
| Support/Betrieb | verständliche Installation, Diagnose und Wiederherstellung | mittel | Betriebs- und Recovery-Anforderungen |
| Datenschutz/Legal | Datenminimierung, Transparenz, spätere Plattformregeln | hoch | Gate vor Accounts, Matching und Handel |
| Trust & Safety | Moderation, Identität, Missbrauchsschutz | hoch ab CampusGig | besitzt Gate für soziale Module |
| Hochschulen | mögliche Verifikation und Campusdaten | mittel ab Partnerschaften | derzeit keine Integration und kein Branding |
| Anbieter/Arbeitgeber | spätere Aufträge und Angebote | mittel ab CampusGig | erst nach Pilot- und Haftungskonzept |
| Apple | iOS-Richtlinien, Signing und Distribution | hoch für iOS | iOS-Runner und mobile UX werden vorbereitet |
| Microsoft | Windows-Verteilung und Signierung | hoch für Desktop | Installer, SmartScreen- und Signatur-Roadmap |

## Entscheidungsmodell

| Entscheidung | Verantwortlich | Entscheidet | Wird konsultiert | Wird informiert |
| --- | --- | --- | --- | --- |
| Produktumfang | Entwicklung | Produktverantwortlicher | Pilotnutzer, Qualität | Support |
| Informationsarchitektur | Entwicklung | Produktverantwortlicher | Accessibility, Pilotnutzer | Qualität |
| technische Architektur | Entwicklung | Produktverantwortlicher | Qualität, Betrieb | Support |
| Releasefreigabe | Qualität | Produktverantwortlicher | Entwicklung, Betrieb | Pilotnutzer |
| Datenschutzänderung | Datenschutz/Legal | Produktverantwortlicher | Entwicklung, Trust & Safety | Nutzer |
| soziale oder kommerzielle Module | Trust & Safety | Produktverantwortlicher | Legal, Pilotnutzer, Partner | Nutzer |

## Abnahmezuständigkeit

Die technische Abnahme belegt reproduzierbare Kriterien. Die fachliche Endabnahme bleibt beim Produktverantwortlichen. Ein bestandenes Testpaket ersetzt kein reales Nutzerfeedback; ein positiver optischer Eindruck ersetzt keine technische Abnahme.
