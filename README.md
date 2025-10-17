# Futurmapa

Eine interaktive, vollständig statische Weltkarte zum Visualisieren konzernweiter Kennzahlen.

[![Live Preview](https://img.shields.io/badge/Live-Preview-blue?style=for-the-badge&logo=github)](https://sebishepherd.github.io/Futurmapa/)

## Features

* Maßstabsgetreue Weltkarte auf Basis von D3 und TopoJSON, inklusive Zoom- und Pan-Interaktionen.
* Kontinent- und Länderfilter mit animierten Übergängen.
* Detail-Overlay mit Bereichsumschalter (Group, CVS, RVS, CVS vs RVS) und Zuständen für fehlende Daten.
* Vollständig statische Auslieferung – alle Daten und Bibliotheken liegen lokal vor.

## Projektstruktur

| Pfad | Beschreibung |
| --- | --- |
| `index.html` | Einstiegspunkt, lädt Map-Container, Sidebar, Detailpanel und Skripte. |
| `styles.css` | Globales Styling, Farbschema und Animationen (inkl. Map-Glow). |
| `vendor/d3.min.js` | Gebündelte D3-Version für Projektion, Zoom und Rendering. |
| `data/world-geojson.js` | Weltkarte als JavaScript-Konstante (`WORLD_GEOJSON`). |
| `scripts/data.js` | Beispieldaten, Kontinent- & Länder-Metadaten, Kategorien, Tooltips. |
| `scripts/app.js` | Anwendungslogik (Initialisierung, Zoom, Tooltip, Panel-Rendering). |

## Nutzung

1. Repository herunterladen oder als ZIP exportieren.
2. Archiv entpacken.
3. `index.html` im Browser (Chrome, Edge, Firefox, Safari) öffnen.

> 💡 Die Anwendung funktioniert komplett offline. Eine Backend-Infrastruktur oder Build-Pipeline ist nicht erforderlich.

## Datenpflege

Die Datei [`scripts/data.js`](scripts/data.js) ist der zentrale Dreh- und Angelpunkt für Inhalte.

### Kontinente & Länder

* `DATA_CONFIG.continents` definiert die Sidebar-Zusammenfassungen (Text, KPIs, Aktionsknöpfe).
* `DATA_CONFIG.countries` enthält pro ISO-Ländercode Metadaten (`name`, `continent`, `active`) und eine Liste `points`.
* Jeder `point` beschreibt einen Kartenmarker mit `category`, optionaler `description` sowie den organisationsspezifischen Datensätzen.

### Kennzahlen hinterlegen

* Für die Bereiche `Group`, `CVS`, `RVS` und `CVS_vs_RVS` können individuelle Inhalte (`title`, `metrics`, `visual`, `note`) gepflegt werden.
* Fehlende Angaben werden automatisch als „Kein Datensatz verfügbar" gekennzeichnet.
* Setze `comingSoon: true`, um Marker als in Vorbereitung zu markieren.

### Kategorien erweitern

* `DATA_CONFIG.categories` steuert Farben, Icons und erläuternde Texte der Legende.
* Neue Kategorien erscheinen automatisch in Legende, Tooltip und Detailansicht.

Nach jeder Änderung genügt ein Neuladen der geöffneten `index.html`.

## Entwicklung & Testing

* Für lokale Tests kann optional ein einfacher Webserver gestartet werden, z. B. `python -m http.server 8000`.
* Responsives Layout wurde für typische Breakpoints (Desktop, Tablet, Mobile) ausgelegt.
* Animationen und Interaktionen sind vollständig in Vanilla JS/D3 umgesetzt; es sind keine zusätzlichen Abhängigkeiten nötig.

## Deployment auf GitHub Pages

Die Bereitstellung erfolgt automatisch über GitHub Actions, sobald Änderungen auf `main` landen oder der Workflow manuell angestoßen wird.

1. Aktiviere in den Repository-Einstellungen unter **Settings → Pages** die Option **Build and deployment → Source → GitHub Actions**.
2. Nach erfolgreicher Ausführung des Workflows steht die Seite unter der in den Pages-Einstellungen angegebenen URL bereit.

> ℹ️ Der Workflow lädt das komplette Repository (inklusive `index.html`, `styles.css`, `scripts/`, `data/`, `vendor/`) als statisches Artefakt hoch. Zusätzliche Build-Schritte sind nicht nötig.

## Barrierefreiheit & Hinweise

* Tastaturbedienung: Kontinente, Länder und Organisationsauswahl sind per Tab erreichbar; Escape schließt das Detailpanel.
* WAI-ARIA: Tooltip, Radiobutton-Gruppe und Dialog verfügen über ARIA-Rollen und -Labels.
* Bekannte Grenzen: Die GeoJSON-Datei ist bewusst hochauflösend. Bei sehr alten Geräten kann dies zu längeren Ladezeiten führen.
