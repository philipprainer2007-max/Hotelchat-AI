# HotelChat – Verwaltung für mehrere Hotels

Ein Kontrollzentrum für den Betreiber, getrennte Hotelkonten und ein individuell gestaltbares Chatwidget je Hotel. Auf einer Hotelwebsite erscheint zunächst nur der kleine Chatbutton unten rechts. Das Chatfenster öffnet sich auf derselben Website. Jedes Hotel verwendet ausschließlich seine gespeicherten Informationen und seine eigenen eingelesenen Quellen. Kein Hotel besitzt Sonderrechte; genannte Hotels in der Dokumentation sind Beispiele.

Die neue Serverversion liegt in `HotelChat-Online.zip`. Die bestehenden Node-Dateien im Repository gehören zur älteren Version. Für die neue Version Python 3.12 verwenden.

## Status

- 63 automatisierte Prüfungen bestanden: Hoteltrennung, Rollen, Sitzungen, Quellen, Kostenlimits, Cache, Sicherung und Wiederherstellung.
- Verschlüsselter Sicherungsdownload ausschließlich für den Betreiber. Aufbewahrung in einem externen Speicher erfolgt durch den Betreiber; es gibt noch keinen verbundenen automatischen Cloud-Upload.
- KI-Antworten verwenden Quellen. Fehlende Angaben, Live-Verfügbarkeiten und verbindliche Buchungen werden nicht erfunden. Vollständige Richtigkeit jeder denkbaren Antwort wird nicht zugesagt.
- Veröffentlichung noch nicht ausgeführt. Die Hostingbuchung wartet ausdrücklich auf die Bestätigung des Betreibers.
- Vor dem Gästebetrieb: tatsächliche Betreiberangaben und Datenschutzinformationen ergänzen, Dienstleisterverträge und Hotelangaben prüfen, gewünschte Websites pro Hotel freigeben und die echte Einbettung testen.

## Render: neue Serverversion

Branch: `hotelchat-online-release`, Runtime: Python 3, Region: Frankfurt.

Build:

```sh
python -m zipfile -e HotelChat-Online.zip . && pip install -r hotelchat-online/requirements.txt
```

Start:

```sh
gunicorn --chdir hotelchat-online --workers 1 --threads 8 --timeout 180 --bind 0.0.0.0:$PORT wsgi:app
```

Healthcheck: `/health`. Einen persistenten Datenträger unter `/var/data/hotelchat` anhängen. Nur ein Dienst mit einem Worker; keine unabhängig skalierenden Instanzen für dieselbe SQLite-Datenbank. Die Render-Konfiguration im Archiv ist eine Alternative, wenn der entpackte Verzeichnisinhalt als eigenes Repository bereitgestellt wird.

Umgebungsvariablen:

| Name | Wert |
| --- | --- |
| `PYTHON_VERSION` | `3.12.14` |
| `HOTELCHAT_DATA_DIR` | `/var/data/hotelchat` |
| `PUBLIC_URL` | die tatsächlich zugewiesene HTTPS-Adresse |
| `ANTHROPIC_MODEL` | `claude-haiku-5-5` |
| `HOTELCHAT_TRUST_PROXY` | `1`, nur hinter dem vertrauenswürdigen Render-Proxy |
| `HOTELCHAT_MASTER_KEY` | zufällig und geheim erzeugen; unabhängig sicher aufbewahren |
| `HOTELCHAT_BOOTSTRAP_TOKEN` | zufällig und geheim erzeugen; nur zur ersten Betreiber-Einrichtung |

Das Archiv enthält keine Kunden-Datenbank, lokalen Einstellungen, Passwörter oder tatsächlichen API-Schlüssel. Betreiberzugang über den geschützten Einrichtungslink anlegen und den API-Schlüssel direkt in der Verwaltung hinterlegen. Den Hauptschlüssel und den API-Schlüssel nicht im Chat oder Repository veröffentlichen.

Ausführliche Einrichtungs-, Sicherungs- und Wiederherstellungsanleitung: `hotelchat-online/ONLINE-START.md` im Archiv. Prüfprotokoll: `hotelchat-online/TESTERGEBNIS.md`.
