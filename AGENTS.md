# Richtlinien für Futurmapa

## Allgemeine Hinweise
- Dieses Projekt bleibt vollständig statisch (keine Build- oder Node-Tooling-Schritte, keine externen CDN-Abhängigkeiten).
- Neue Bibliotheken nur einbinden, wenn sie als lokale Dateien vorliegen und der Offline-Betrieb dadurch nicht gefährdet wird.
- JavaScript bitte im vorhandenen Stil (Vanilla JS + D3) halten und keine Frameworks einführen.
- Achte auf deutsche UI-Texte und konsistente Terminologie (Group, CVS, RVS, CVS vs RVS).

## Struktur & Datenpflege
- Änderungen an der Datenbasis immer über `scripts/data.js`; die Struktur der `DATA_CONFIG`-Objekte beibehalten.
- Zusätzliche Assets (Bilder, Icons) in Unterordnern wie `assets/` oder `data/` ablegen und in der README dokumentieren.

## Styling
- Globale Layout-Anpassungen zentral in `styles.css`; bitte keine Inline-Styles hinzufügen.
- Neue Farben an der Wurzel (`:root`) als CSS-Variablen definieren.

## Dokumentation
- Die README aktuell halten, wenn Datenstruktur, Interaktionen oder Build-Schritte angepasst werden.
