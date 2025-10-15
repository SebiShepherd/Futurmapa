# Futurmapa

Futurmapa ist eine vollständig statische, interaktive Weltkarte, die als Informations-Hub für globale Unternehmensdaten dient. Die Anwendung läuft ohne Server- oder Datenbank-Anbindung und kann lokal im Browser geöffnet werden.

## Features

- Maßstabsgetreue Weltkarte mit eingefärbten Fokus-Ländern
- Klickbarer Zoom von der Welt- über die Kontinental- bis zur Länderebene
- Themenbezogene, farbcodierte Datenpunkte mit animierten Tooltips
- Detail-Panel mit Business-Unit-Auswahl (Group, CVS, RVS, Vergleich)
- Sanfte Übergänge (Zoom, Fade, Panels) für eine hochwertige User Experience
- Inhalte werden aus leicht editierbaren JSON-Dateien geladen

## Nutzung

1. Repository herunterladen oder als Archiv entpacken.
2. `index.html` im Browser öffnen – es ist keine zusätzliche Installation nötig.

Optional kann während der Entwicklung ein lokaler Webserver gestartet werden, z. B.:

```bash
python -m http.server 8000
```

Anschließend ist die Anwendung unter `http://localhost:8000/index.html` erreichbar.

## Inhalte anpassen

- **Kartendaten:** `data/world-110m.json` (TopoJSON, Natural Earth 1:110m). In der Regel muss diese Datei nicht angepasst werden.
- **Regionen, Länder & Marker:** `data/sample-data.json`. Die Datei enthält Regionen mit ISO-Codes, Länderbeschreibungen und Datenpunkten inklusive Business-Unit-Daten.
- **Stile:** `assets/css/styles.css`
- **Logik & Animationen:** `assets/js/app.js`

Neue Datensätze können hinzugefügt werden, indem weitere Marker in der JSON-Datei angelegt werden. Nicht verfügbare Datensätze werden automatisch mit einem Hinweis „Kein Datensatz verfügbar“ markiert.

## Lizenz

Die Weltkarten-Daten basieren auf [Natural Earth](https://www.naturalearthdata.com/) (Public Domain). Alle Beispielinhalte dienen ausschließlich der Demonstration.
