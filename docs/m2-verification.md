# Verifikationsbericht M2.1

Stand: 11. September 2026

## Ergebnis

Der Plattformvertrag vor CampusGig ist implementiert. Er trennt private Planung, privates Konto, Hochschulmitgliedschaft, sichtbares Community-Profil und Trust-&-Safety-Daten. Es wurde bewusst keine neue Navigation oder Attrappe in die veröffentlichte Oberfläche aufgenommen.

## Nachweise

| Prüfung | Ergebnis |
| --- | --- |
| unveränderter Ausgangsstand | 55 Flutter- und 5 Desktop-Tests bestanden |
| Identitäts- und Verifikationsregeln | 12 neue Unit-Tests bestanden |
| Blockierungs- und Melderegeln | 9 neue Unit-Tests bestanden |
| Flutter-Analyse | ohne Befund |
| Dart-Format | ohne Abweichung |
| M1-Abnahmematrix | weiterhin 156/156 erfüllt |
| vollständiger Flutter-Testlauf | 76 Tests bestanden |
| M2-Abnahmematrix | 130 Kriterien strukturell geprüft; 62 belegt, 68 geplant |
| Dateigrenze | keine Quellcodedatei über 500 Zeilen |

## Sicherheitsbelege

- Community-Teilnahme ist nur für aktives Konto, aktive Institution und bestätigte Mitgliedschaft zulässig.
- Konto-, Institutions- und Profilreferenzen müssen konsistent sein.
- E-Mail, Profilfelder, Skills, IDs und UTC-Zeitpunkte werden an der Domain-Grenze validiert.
- Passwort-, Token- oder Geheimnisfelder sind nicht Teil des serialisierten Identitätsvertrags.
- Selbstblockierung ist ausgeschlossen.
- Meldungen können weder die Prüfung überspringen noch aus einem Terminalzustand still wieder geöffnet werden.

## Bewusste Grenze

M2.1 stellt Verträge und Gates bereit, aber noch keinen Kontodienst. Anmeldung, reale Hochschulverifikation, Cloud-Speicherung, Community-Profil, Postfach und Moderationsbetrieb bleiben offen und werden deshalb nicht in der Produktoberfläche gezeigt. Die vorhandene Windows-App verändert ihr sichtbares Verhalten in diesem Teilmeilenstein nicht.

## Nächster Gate-Entscheid

Für M2.2 werden Pilot-Hochschule, Verifikationsersatzweg, Hostingregion, Kostenrahmen, Supportverantwortung und Moderationsbesetzung benötigt. Erst danach wird eine echte Kontooberfläche gegen eine betreibbare Serverumgebung gebaut.
