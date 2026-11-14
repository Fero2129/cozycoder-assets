# Lernwelt als Anki-Add-on

Die Lernwelt der App („Wissensturm“) zum Einbauen ins normale Anki (Desktop, ab Version 23.10).

## Was drin ist
- **Fokus-Sitzung nur mit Timer** (10–90 Min). **Münzen nur mit App-Sperre** (ohne Sperre wachsen nur Bücher): 1 Münze pro Minute plus 1 Münze für jede 2. Karte, die während der Sitzung in Anki beantwortet wird (bis 50). Der gewählte Stapel bestimmt die Buchfarbe und wird gleich zum Lernen geöffnet
- **Bücherregal / Wissensturm** mit denselben PixelLab-Grafiken, 56 Buchsorten und Effekten wie in der App, Bücherhaufen für abgebrochene Sitzungen, Sitzungs-Zettel beim Überfahren, Tür-Animation
- **Münzen & Bücherladen** (gleiche Preise und Regeln), **Streak-Münzen** aus Ankis eigenem Lernverlauf
- **🔒 App-Sperre** während der Sitzung (macOS und Windows, Linux mit xdotool): kurz in eine andere App wechseln ist erlaubt, wer länger als 10 Sekunden in einer nicht erlaubten App bleibt, verliert die Sitzung (Mitteilung als Warnung auf macOS/Linux). Erlaubte Apps (z. B. Finder, PDF-Reader) lassen sich eintragen und unbegrenzt nutzen. Ohne Sperre gilt wie in der App: länger als die Schonfrist weg → das Buch fällt herunter
- **Fokus-Leiste** über den Karten (wachsendes Buch, Restzeit/Karten, Sperre, Aufgeben)
- Einstiege: Knopf **„Lernwelt“** in der oberen Leiste, **Extras → Lernwelt** (Strg/⌘+Umschalt+L), **„📚 Fokus-Sitzung“** in der Stapelübersicht und im Zahnrad-Menü jedes Stapels
- Gespeichert in der Anki-Sammlung → wandert mit der AnkiWeb-Synchronisierung auf andere Computer

## Installieren
1. `dist/lernwelt.ankiaddon` doppelklicken **oder** in Anki: Extras → Erweiterungen → „Aus Datei installieren …“
2. Anki neu starten

## Selbst bauen
```bash
cd anki-addon
npm install
npm run pack        # baut die Oberfläche nach lernwelt/web und packt dist/lernwelt.ankiaddon
python3 -m lernwelt.test_logic   # Regeln (Münzen, Bücher, Serie) prüfen
```
Die Oberfläche wird **nicht kopiert**, sondern direkt aus `apps/web/src` gebaut (Regal, Bücher, Effekte, Grafiken)
und aus `packages/core/src/focus.ts` (Buchsorten, Preise, Regal-Logik). Nur die Datenbank-Hooks sind durch eine
Brücke zu Python ersetzt (`web/src/shims`). Änderungen an der Lernwelt der App kommen so mit dem nächsten Build auch ins Add-on.

## Aufbau
| Datei | Aufgabe |
|---|---|
| `lernwelt/main.py` | Fenster, Fokus-Leiste, Sitzungen, Münzen, Serie, Anki-Hooks |
| `lernwelt/applock.py` | App-Sperre (macOS: AppKit per ctypes · Windows: user32 · Linux: xdotool) |
| `lernwelt/logic.py` | Regeln wie in `focus.ts` (Münzen, Bücher, Streak-Belohnungen) |
| `web/src/LibraryApp.tsx` | Bibliothek, Bücherladen, Einstellungen, Start- und Ergebnisfenster |
| `web/src/FocusBarView.tsx` | Leiste während der Sitzung |
| `web/src/store.ts` | Brücke: `pycmd("lw:…")` → Python, `window.lwSetState(…)` ← Python |

## Grenzen
- macOS: Die Sperre blendet andere Apps aus (wie „Ausblenden“ im Menü) und holt Anki zurück – ohne Bedienungshilfen-Freigabe. Falls Anki nicht nach vorn kommt, fragt macOS ggf. einmal, ob Anki „System Events“ steuern darf
- Windows: andere Programme werden minimiert; der Task-Manager, die Taskleiste und Windows-Anmeldefenster bleiben immer erlaubt
- Webseiten im Browser lassen sich nicht einzeln sperren – nur der Browser als ganze App (nicht auf die Erlaubt-Liste setzen)
- „Aufgeben“ geht immer (das Buch fällt dann herunter) – es gibt keinen Zwang wie bei Forest
- Anki kennt keine Stapelfarben: das Add-on vergibt sie automatisch je Oberstapel, änderbar in den Einstellungen der Lernwelt
- Lernwelt-Daten der App und des Add-ons sind (noch) getrennt
