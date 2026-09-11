# Verifikationsbericht

Stand: 11. September 2026 · UniX 0.5.0

## Ergebnis

Der Release-Kandidat erfüllt den abgegrenzten Planungskern: Einrichtung, Module, Einträge, Priorisierung, Suche, Statuswechsel, Profil, Sicherung, Wiederherstellung und Neustart. Nicht implementierte Zukunftsmodule erscheinen nicht in der Oberfläche.

## Automatisierte Nachweise

| Prüfung | Ergebnis |
| --- | --- |
| Dart-Format | ohne Abweichung |
| Flutter-Analyse | ohne Befund |
| Flutter Unit-, Daten- und Widgettests | 55 bestanden |
| Desktop-Host-Tests | 5 bestanden |
| Produkt-, Text-, Kontrast- und Dateigrößenregeln | bestanden |
| npm-Sicherheitsaudit | 0 bekannte Schwachstellen |
| Flutter-Web-Produktionsbuild | bestanden |
| Quell-Smoke | bestanden; sichtbarer Flutter-Start nach 170 ms |
| Paket-Smoke | bestanden; sichtbarer Flutter-Start nach 170 ms |

Die Startmessung beginnt nach dem Laden des Hauptdokuments und endet, sobald die Flutter-Oberfläche im Fenster vorhanden ist. Sie ist ein reproduzierbarer Smoke-Messwert dieses PCs, kein allgemeines Leistungsversprechen.

## Sichtprüfung

Die automatisch aufgenommenen Zustände wurden einzeln geprüft:

- [Ersteinrichtung](screenshots/onboarding.png): klare Hierarchie, leere echte Eingaben, eindeutige Hauptaktion
- [Desktop](screenshots/today-desktop.png): 1.440 × 900 px, vollständige Navigation und Fokusansicht
- [Tablet](screenshots/today-tablet.png): 900 × 800 px, kompakte Navigation ohne abgeschnittene Aktionen
- [Mobil](screenshots/today-mobile.png): 390 × 844 px, untere Navigation und einspaltige Bedienung
- [200 Prozent](screenshots/zoom-200.png): weiterhin lesbar und vertikal bedienbar

Während der Widget- und Sichtprüfung wurden zwei reale Layoutprobleme gefunden und vor der Abnahme korrigiert: ein überlaufender Onboarding-Hinweis sowie verdeckte Ink-/Fokuseffekte der Modulliste.

## Start und Stop

Der entpackte Release wurde zweimal nacheinander gestartet. Die Zahl der vier zugehörigen Electron-Prozesse blieb beim zweiten Start unverändert; es entstand somit kein zweites App-Fenster. Anschließend beendete das Stopskript alle zugehörigen Prozesse. Ein zweiter Stop endete erwartungsgemäß erfolgreich. Die Desktop-Verknüpfung `C:\Users\tayla\Desktop\UniX.lnk` wurde separat gestartet und geprüft.

## Artefakte

| Artefakt | Größe |
| --- | ---: |
| Flutter-Web-Build | 42.199.401 Byte |
| entpackte Windows-App | 427.502.792 Byte |
| Windows-Installer | 122.193.857 Byte |

SHA-256 des Installers:

```text
F03DEEDDE587EC84DDEC58A04E2BE0085B0F654C7F1EE872C8092991A1689C78  UniX-0.5.0-Setup.exe
```

## Reproduzierbarkeit

- Flutter 3.47.3 stable
- Dart 3.13.3
- Node.js 24.14.1
- npm 11.11.0
- Windows 10.0.26200, x64
- gesperrte Dart- und npm-Abhängigkeiten über `pubspec.lock` und `package-lock.json`

## Bewusste Grenzen nach M1

- Der Windows-Installer ist technisch geprüft, aber noch nicht mit einem kostenpflichtigen Herausgeberzertifikat signiert.
- Der native Flutter-Windows-Runner benötigt die Visual-Studio-C++-Toolchain; bis dahin dient Electron als schmale Auslieferungshülle.
- Der iOS-Runner und die App-Icons sind vorbereitet. Build, Signing und TestFlight benötigen macOS, Xcode und ein Apple-Entwicklerkonto.
- Ein echter Pilot mit Studierenden und Hilfstechnologien ist Teil von M2 und wird nicht durch automatisierte Tests ersetzt.

Diese Punkte verhindern nicht die Nutzung des aktuellen Windows-Planungskerns; sie sind die expliziten Gates der nächsten Etappe.
