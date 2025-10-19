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
* Über das Feld `iconId` verweist jede Kategorie (oder optional ein einzelner `point`) auf ein `<symbol>` innerhalb von [`assets/icons.svg`](assets/icons.svg).

#### Eigene POI-Icons hinterlegen

Die Marker nutzen ein lokal gebündeltes SVG-Sprite (`assets/icons.svg`), damit die Anwendung offline funktioniert. Jeder Eintrag besitzt eine eindeutige `id`, z. B. `poi-finance`.

So fügst du neue Symbole hinzu:

1. Öffne `assets/icons.svg` und ergänze ein neues `<symbol>`-Element mit `viewBox="0 0 24 24"`. Als Basis kannst du Open-Source-Bibliotheken wie [Heroicons](https://github.com/tailwindlabs/heroicons) oder [Material Symbols](https://github.com/google/material-design-icons) verwenden. Die Pfade werden direkt als `<path>`-Elemente eingefügt.
2. Vergib eine eindeutige `id`, zum Beispiel `poi-supply-chain`.
3. Hinterlege diese `id` in `scripts/data.js`:
   * entweder als Standard pro Kategorie (`iconId: "poi-supply-chain"`),
   * oder spezifisch pro Datenpunkt (`{ ..., iconId: "poi-supply-chain" }`).
4. Lade die Seite neu – Marker und Legende ziehen das Symbol automatisch aus dem Sprite. Icons werden innerhalb der Marker weiß eingefärbt; passe bei Bedarf die Größe über das `transform="scale(...)"` im Marker-Rendering (`scripts/app.js`) an.

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

## Runtime-Konfiguration & Branding (Logo, Favicon, Titel)

Dieses Projekt unterstützt eine einfache, git-ignorierte Laufzeitkonfiguration, mit der du Logo, Favicon, Site-Title und Dokumententitel ohne Codeänderung anpassen kannst.

Wichtiges Konzept:

- `config.example.json` ist im Repository enthalten und zeigt die erwarteten Keys.
- `config.json` kann lokal im Projekt-Root liegen und hat Vorrang vor `config.example.json`. Diese Datei ist in `.gitignore` eingetragen und wird nicht versioniert.

Verfügbare Keys (kurz):

- `companyName` – optional, wird verwendet, um den Tab-Titel (document.title) zu bilden, falls `documentTitle` fehlt.
- `documentTitle` – vollständiger Titel für den Browser-Tab.
- `favicon` – Pfad zur Favicon-Datei (z. B. `assets/favicon.ico`).
- `logo` – Pfad zur Logo-Datei, die in der Sidebar angezeigt wird (z. B. `assets/logo.png`).
- `siteTitle` – Überschrift im Sidebar-Header (ersetzt Standardtext).
- `subtitle` – Untertitel/Short-Description unter dem Site-Title.

Beispiel (kurz):

```json
{
  "companyName": "Musterkonzern AG",
  "documentTitle": "Musterkonzern · Interaktive Konzern-Weltkarte",
  "favicon": "assets/favicon.ico",
  "logo": "assets/logo-example.png",
  "siteTitle": "Globale Präsenz",
  "subtitle": "Kurztext zur Anwendung oder Firmenbeschreibung."
}
```

Wie die Anwendung die Konfiguration lädt

- Beim Laden versucht `scripts/app.js` zuerst `config.json` per fetch zu lesen; falls nicht vorhanden oder fehlerhaft, fällt die Anwendung auf `config.example.json` zurück.
- `config.json` darf (versehentlich) Kommentare enthalten — der Loader versucht, solche Kommentare zu entfernen und die Datei trotzdem zu parsen.
- Nach dem Laden setzt das Script document.title, ersetzt vorhandene `<link rel="icon">`-Tags (es erstellt neue Links mit einem Cache-Buster), setzt das Sidebar-Logo (`#brand-logo`) und ersetzt `#site-title` / `#site-subtitle`.

Lokale Erstellung von `config.json`

1. Lege im Projekt-Root eine Datei `config.json` an (diese Datei wird nicht committed):

```json
{
  "companyName": "Mein Konzern GmbH",
  "documentTitle": "Mein Konzern · Interaktive Konzern-Weltkarte",
  "favicon": "assets/my-favicon.ico",
  "logo": "assets/my-logo.png",
  "siteTitle": "Globale Präsenz — Mein Konzern",
  "subtitle": "Regionale Kennzahlen und Standorte des Konzerns"
}
```

2. Lege die referenzierten Assets unter `assets/` ab (z. B. `assets/my-logo.png`, `assets/my-favicon.ico`).

3. Lade die Seite neu. In den Developer-Tools (Konsole) sollte unmittelbar beim Laden eine Meldung erscheinen, z. B.: `Loaded runtime config from: config.json {...}`.

Hinweise zum Favicon

- Das Script entfernt vorhandene `<link rel="icon">` / `<link rel="shortcut icon">`-Tags und fügt neue Links hinzu (inkl. `?v=<timestamp>`), damit der Browser das neue Icon lädt.
- Browser oder Webserver können trotzdem ein Root-`/favicon.ico` bevorzugen oder cachen. Wenn du Probleme hast, empfehle ich:
  - Hard-Reload (Strg+F5) oder Inkognito-Fenster.
  - Lokalen Server verwenden (siehe unten) statt Datei-Öffnen per file://.
  - Falls im Projekt-Root eine `favicon.ico` liegt und du ausschließlich `assets/`-Favicon verwenden willst, entferne die Root-`favicon.ico`.

Troubleshooting / Häufige Probleme

- SyntaxError: "Identifier 'RUNTIME_CONFIG' has already been declared" — trat auf, wenn das runtime-config-Block versehentlich doppelt in `scripts/app.js` war; das ist jetzt behoben. Falls du noch einen ähnlichen Fehler siehst, prüfe, ob mehrere Kopien desselben Scripts geladen werden.
- config.json wird nicht geladen / es fällt auf `config.example.json` zurück:
  - Mögliche Ursachen: Seite über `file://` geöffnet (fetch blockiert), Tippfehler im Dateinamen, JSON-Syntaxfehler (Kommentare sind toleriert, aber nicht jede Abweichung).
  - Lösung: Seite über lokalen HTTP-Server ausliefern (s. unten) und Konsole prüfen.
- Favicon ändert sich nicht:
  - Browsercache; Root `/favicon.ico` im Webserver; hard-reload/Inkognito oder Entfernen der Root-Favicon-Datei.

Testing / Lokaler Server (empfohlen)

- Viele Browser blockieren fetch in `file://`-Kontexten oder verhalten sich inkonsistent. Starte daher einen einfachen lokalen Server im Projekt-Root:

Wenn Python installiert ist (Windows cmd.exe):

```cmd
python -m http.server 8000
```

Dann im Browser öffnen: `http://localhost:8000/`.

Konsole prüfen

- Öffne DevTools (F12) → Konsole und suche nach der Info-Zeile:
  `Loaded runtime config from: config.json {...}`
- Oder liste die gesetzten Favicons:

```javascript
document.querySelectorAll('link[rel~="icon"], link[rel~="shortcut icon"]')
```

Sicherheit & Best Practices

- `config.json` ist absichtlich in `.gitignore` (lokale, nicht-committete Anpassungen).
- Speichere keine sensiblen Zugangsdaten oder Geheimnisse in `config.json`. Diese Konfiguration ist für statische Branding-Werte gedacht (Name, Logo, Favicon, Titel, Texte).

Next steps / Optionen

- Wenn du möchtest, baue ich eine kleine Admin-UI (ein einfaches HTML-Formular), die `config.json` lokal erzeugt und zum Download anbietet.
- Alternativ kann ich ein Node-/npm-Skript bereitstellen, das aus Umgebungsvariablen eine `config.json` generiert (nützlich für CI/CD).

Wenn du willst, übernehme ich das Löschen/Anpassen der Root-`favicon.ico` direkt im Repo (nur nach deiner Bestätigung).
