# Futurmapa

Eine interaktive, vollständig statische Weltkarte zum Visualisieren konzernweiter Kennzahlen.

## Inhalt

* **`index.html`** – Einstiegspunkt, der die Karte, Sidebar und das Daten-Overlay lädt.
* **`styles.css`** – Layout, Farben und Animationen (inklusive Glow-Effekt der Karte).
* **`vendor/d3.min.js`** – Eingebettete D3-Version für Projektion, Zoom und Geometrie.
* **`data/world-geojson.js`** – GeoJSON-Datengrundlage (als JavaScript-Konstante eingebettet).
* **`scripts/data.js`** – Beispieldaten, Kategorien, Kontinente sowie Länder-spezifische Kennzahlen.
* **`scripts/app.js`** – Steuerung der Interaktionen (Zoom, Tooltips, Modalfenster, Filter).

## Nutzung

1. Repository herunterladen oder als ZIP exportieren.
2. Archiv entpacken.
3. `index.html` doppelklicken oder per Drag & Drop im Browser öffnen.

Eine Backend-Infrastruktur wird nicht benötigt – sämtliche Daten liegen lokal im Projekt und können direkt im Browser verwendet werden.

## Daten anpassen

* **Kontinente & Länder**: In `scripts/data.js` unter `DATA_CONFIG.continents` und `DATA_CONFIG.countries` pflegen. Jedes Land kann beliebig viele `points` (Daten-Hotspots) erhalten. Nicht aktive Länder (`active: false`) werden automatisch grau dargestellt.
* **Kennzahlen**: Pro Punkt lassen sich Datensätze für `Group`, `CVS`, `RVS` sowie ein Vergleich `CVS vs RVS` hinterlegen. Fehlende Werte werden im Overlay als „Kein Datensatz verfügbar" markiert.
* **Coming Soon**: Für Punkte, die vorbereitet werden, `comingSoon: true` setzen. Die Karte zeigt dann einen deaktivierten Marker samt Hinweis.
* **Kategorien**: Farben, Icons und Beschreibungen im Objekt `DATA_CONFIG.categories` anpassen, um neue Themen aufzunehmen.

Nach Änderungen an `scripts/data.js` oder den Styles genügt ein Neuladen der `index.html` im Browser.

## Tests

Da die Anwendung komplett statisch ist, sind keine Build-Schritte nötig. Manuelles Testing erfolgt über einen Browser (Chrome, Edge, Firefox, Safari). Für mobile Breakpoints stehen responsive Styles zur Verfügung.
