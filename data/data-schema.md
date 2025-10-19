# Datenquellenschema

Dieses Dokument beschreibt die Struktur der Arbeitsmappe `data-source.xlsx`. Jede Tabelle entspricht direkt den Datenobjekten in `scripts/data.js` und kann für CSV- oder andere Exporte weiterverwendet werden.

## Tabellenübersicht

| Tabellenblatt | Zweck |
| --- | --- |
| `categories` | Stammdaten für Kategorien, Marker-Icons und Farben |
| `continents` | Kontinent-Cluster inklusive zugehöriger Länder |
| `countries` | Länderstammdaten mit Aktivierungsstatus und Kurzbeschreibung |
| `points` | Kartenpunkte/Marker pro Land |
| `org_metrics` | Kennzahlen der Organisationseinheiten (Group, CVS, RVS) pro Marker |
| `org_progress` | Fortschrittsindikatoren der Organisationseinheiten pro Marker |
| `org_compare` | Vergleichswerte für "CVS vs RVS" pro Marker |

## `categories`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `category_key` | ja | Primärschlüssel, muss mit den Schlüsseln in `scripts/data.js` und dem Tabellenblatt `points` übereinstimmen (z. B. `Finance`, `HR`). |
| `label` | ja | Ausgeschriebener Name für UI-Labels. |
| `icon_id` | ja | Referenz auf die Marker-ID (`poi-*`), wie sie in den Assets bereitstehen. |
| `color_hex` | ja | Hexadezimaler Farbwert (inkl. `#`). |
| `description` | nein | Freitextbeschreibung für Tooltips und Dokumentation. |

## `continents`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `continent_name` | ja | Anzeigename des Kontinents. |
| `country_iso_list` | ja | Kommagetrennte Liste der zugeordneten ISO-3-Codes (muss mit `countries.country_iso3` übereinstimmen). |
| `description` | nein | Langtext zur Charakteristik der Region. |

## `countries`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `country_iso3` | ja | ISO-3-Ländercode (z. B. `USA`, `DEU`). |
| `name` | ja | Anzeigename des Landes. |
| `continent_name` | ja | Referenz auf `continents.continent_name`. |
| `active_flag` | ja | Aktivierungsstatus als `TRUE`/`FALSE` (String), orientiert sich an `DATA_CONFIG.countries[ISO].active`. |
| `overview` | nein | Kurzbeschreibung bzw. Overview-Text. |

## `points`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `point_id` | ja | Eindeutige Marker-ID aus `scripts/data.js`. |
| `country_iso3` | ja | Referenz auf das zugehörige Land. |
| `title` | ja | Titel des Markers. |
| `category_key` | ja | Referenz auf `categories.category_key`. |
| `longitude` | ja | Längengrad (Dezimalgrad, entspricht dem ersten Wert im Koordinatenarray). |
| `latitude` | ja | Breitengrad (Dezimalgrad, entspricht dem zweiten Wert im Koordinatenarray). |
| `description` | nein | Tooltip-/Infotext. |
| `coming_soon_flag` | nein | `TRUE`/`FALSE` zur Kennzeichnung von Punkten ohne Detaildaten. Fehlende Angaben gelten als `FALSE`. |

## `org_metrics`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `point_id` | ja | Referenz auf `points.point_id`. |
| `country_iso3` | ja | Referenz auf `countries.country_iso3`. |
| `organization` | ja | Muss einer der Werte `Group`, `CVS`, `RVS` sein. |
| `summary` | nein | Kurzbeschreibung der Organisationssicht. Wiederholt sich für mehrere Kennzahlen, um die Zuordnung zu sichern. |
| `metric_label` | nein | Bezeichnung der Kennzahl (z. B. `Umsatz Q2`). |
| `metric_value` | nein | Wert der Kennzahl inkl. Einheit. |
| `metric_trend` | nein | Trendangabe oder Veränderungstext; kann leer bleiben, wenn nicht vorhanden. |

Leere Zeilen für eine Organisation signalisieren, dass im Quellbestand keine Kennzahlen hinterlegt sind (z. B. weil der Punkt nur als "coming soon" markiert wurde).

## `org_progress`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `point_id` | ja | Referenz auf `points.point_id`. |
| `country_iso3` | ja | Referenz auf `countries.country_iso3`. |
| `organization` | ja | Einer der Werte `Group`, `CVS`, `RVS`. |
| `summary` | nein | Wiederholte Kurzbeschreibung (identisch zu `org_metrics.summary`). Ermöglicht konsistente Dokumentation bei Exporten. |
| `progress_label` | nein | Name des Fortschrittsindikators. |
| `progress_value` | nein | Prozent-/Punktwert. |

Wenn keine Fortschrittswerte vorhanden sind, enthält die Tabelle einen Platzhaltereintrag mit leerem Label/Value, damit die Organisation weiterhin eindeutig zugeordnet werden kann.

## `org_compare`

| Spalte | Pflicht? | Beschreibung |
| --- | --- | --- |
| `point_id` | ja | Referenz auf `points.point_id`. |
| `country_iso3` | ja | Referenz auf `countries.country_iso3`. |
| `left_label` | ja | Bezeichnung der linken Vergleichsspalte (in der Regel `CVS`). |
| `right_label` | ja | Bezeichnung der rechten Vergleichsspalte (in der Regel `RVS`). |
| `summary` | nein | Kurztext zum Vergleich. |
| `metric_label` | nein | KPI-Bezeichnung. |
| `left_value` | nein | Wert für die linke Vergleichsseite. |
| `right_value` | nein | Wert für die rechte Vergleichsseite. |

## Hinweise zu CSV-Exporten

- Jede Tabelle kann 1:1 als CSV exportiert werden; die Spaltenüberschriften sollten unverändert übernommen werden, um Re-Imports zu erleichtern.
- Boolesche Felder (`*_flag`) sollten als Textwerte `TRUE`/`FALSE` geführt werden, damit sie beim Einlesen in JavaScript problemlos als Boolean interpretiert werden können.
- Listenfelder wie `country_iso_list` bleiben als kommagetrennter Text bestehen. Für maschinelle Verarbeitung kann die Liste per `split(',')` in Arrays überführt werden.
- Freitextspalten (`description`, `overview`, `summary`) dürfen Zeilenumbrüche enthalten. Beim CSV-Export ist darauf zu achten, dass Felder korrekt in Anführungszeichen gesetzt werden.
- Für optionale Felder (`metric_trend`, `progress_label`, `left_value` usw.) empfiehlt es sich, fehlende Werte leer zu lassen. Platzhalter wie `n/a` sollten nur verwendet werden, wenn downstream-Systeme dies erwarten.

