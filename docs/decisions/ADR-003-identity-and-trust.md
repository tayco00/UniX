# ADR-003: Identität, Hochschulzugehörigkeit und Vertrauen

Status: angenommen für M2.1 am 11. September 2026.

## Entscheidung

UniX trennt vier Identitäten voneinander:

1. Das private Studienprofil personalisiert die Planung und bleibt Teil des persönlichen Workspace.
2. Das private Konto enthält Anmeldung, interne Kennung und Kontostatus.
3. Die Hochschulmitgliedschaft verbindet ein Konto mit genau einer Institution und einem überprüfbaren Status.
4. Das sichtbare Community-Profil enthält nur bewusst veröffentlichte Angaben.

Ein Community-Modul darf nur genutzt werden, wenn Konto, Institution und Hochschulmitgliedschaft aktiv beziehungsweise bestätigt sind. Die sichtbare Zielgruppe eines Profils ist anfangs auf die eigene Hochschule oder bestätigte Kontakte begrenzt. Globale öffentliche Profile sind kein Ziel des Piloten.

## Verifikation

Der erste Pilot verwendet Hochschul-E-Mail plus zeitlich begrenzte Bestätigung. Für Hochschulen ohne geeignete Domain wird ein manueller, vom Support verantworteter Ersatzweg benötigt. Ausweis- oder Immatrikulationsdokumente werden nicht standardmäßig erhoben. Die konkrete Pilot-Hochschule und der Ersatzweg müssen vor M2.2 feststehen.

## Anmeldung

Authentifizierungsgeheimnisse und Sitzungstoken gehören weder in Domainobjekte noch in Backups, Logs oder Analytics. Die Plattformintegration speichert Sitzungen ausschließlich im geschützten Speicher des jeweiligen Betriebssystems. Kontosperren müssen serverseitig sofort für alle Community-Aktionen gelten.

## Trust & Safety

Blockieren und Melden sind gemeinsame Plattformfähigkeiten. Blockierungen wirken wechselseitig auf Auffindbarkeit und Kontakt. Meldungen besitzen einen nachvollziehbaren Zustandsautomaten:

```text
eingegangen -> in Prüfung -> abgeschlossen
           \-> verworfen
```

Abgeschlossene oder verworfene Fälle werden nicht still wieder geöffnet. Eine neue Prüfung erzeugt einen neuen Vorgang. Moderationsentscheidungen benötigen Bearbeiter, Zeit, Grund und Revision; diese internen Angaben werden nicht in Nutzerbackups exportiert.

## Produktgrenzen

- Kontaktangaben sind nicht standardmäßig öffentlich.
- Bewertungen werden nicht vor einem belastbaren Streit- und Missbrauchskonzept eingeführt.
- Eine Hochschul-E-Mail beweist Zugehörigkeit, nicht Vertrauenswürdigkeit.
- Hochschulen werden ohne Vereinbarung weder als Partner noch als inhaltlich Verantwortliche dargestellt.
- Ein erfolgreicher automatisierter Test ersetzt keine Datenschutz-, Legal- oder Trust-&-Safety-Freigabe.
