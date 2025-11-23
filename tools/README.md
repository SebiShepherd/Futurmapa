# Werkzeuge

Dieses Verzeichnis bündelt Hilfsskripte für die Datenpflege. Vor der Nutzung die Python-Abhängigkeiten installieren:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
```

## `xlsx_to_datajs.py`

Konvertiert die gepflegten Tabellenblätter (XLSX oder CSV) in die für die Anwendung benötigte `scripts/data.js`.

### Lokale Nutzung

```bash
# XLSX-Datei validieren und ausgeben
python tools/xlsx_to_datajs.py --xlsx data/data-source.xlsx --output scripts/data.js

# CSV-Exports nur validieren
python tools/xlsx_to_datajs.py --csv-dir data/csv-export --check-only
```

### GitHub Actions Beispiel

```yaml
name: Build data.js
on:
  workflow_dispatch:
  push:
    paths:
      - data/**
      - tools/**

jobs:
  generate-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r tools/requirements.txt
      - run: python tools/xlsx_to_datajs.py --xlsx data/data-source.xlsx --output scripts/data.js
      - name: Commit generated data
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git commit -am "Update data.js" || echo "Keine Änderungen"
```

### Cronjob / Automatisierung auf eigenem Server

```bash
0 6 * * 1  cd /opt/futurmapa && \
  . .venv/bin/activate && \
  python tools/xlsx_to_datajs.py --xlsx data/data-source.xlsx --output scripts/data.js && \
  git commit scripts/data.js -m "Automatisches Update" && \
  git push
```

Der `--check-only`-Modus eignet sich für Validierungen ohne Dateischreibzugriff, etwa in Pull-Request-Checks oder vor Deployments.
