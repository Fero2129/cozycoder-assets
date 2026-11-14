"""Packt das Add-on als .ankiaddon (zip mit dem Inhalt von lernwelt/, ohne Cache und Nutzerdaten).

Aufruf (aus anki-addon/):  python3 scripts/pack.py [Quellordner] [Zieldatei]
"""

import os
import sys
import zipfile

here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "..", "lernwelt")
dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, "..", "dist", "lernwelt.ankiaddon")
if not os.path.exists(os.path.join(src, "web", "index.html")):
    sys.exit("Die Oberfläche fehlt – erst `npm run build` ausführen.")
os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
skip_dirs = {"__pycache__", "user_files"}
skip_files = {"meta.json", ".DS_Store"}
n = 0
with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for f in files:
            if f in skip_files or f.endswith(".pyc"):
                continue
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, src))
            n += 1
print(f"{dst}: {n} Dateien, {os.path.getsize(dst) // 1024} KB")
