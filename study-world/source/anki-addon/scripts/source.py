"""Legt den Quelltext der Oberfläche als source.zip ins Add-on (AGPL3: Quelltext muss mitgeliefert werden).
Aufruf: python3 scripts/source.py <ausgabe.zip>"""
import os, sys, zipfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FILES = [
    "anki-addon/package.json", "anki-addon/vite.config.mjs", "anki-addon/README.md", "anki-addon/LICENSE",
    "anki-addon/scripts/pack.py", "anki-addon/scripts/source.py",
    "apps/web/src/components/Coin.tsx", "apps/web/src/components/PixelIcon.tsx", "apps/web/src/components/World.tsx",
    "apps/web/src/lib/bookFx.ts", "apps/web/src/lib/pixel.ts", "apps/web/src/lib/themeImages.ts",
    "apps/web/src/lib/worldText.ts", "apps/web/src/styles.css",
    "packages/core/src/design.ts", "packages/core/src/focus.ts",
]
DIRS = ["anki-addon/web"]
out = sys.argv[1]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("README.txt", "Source code of the Study World add-on user interface (AGPL-3.0, see anki-addon/LICENSE).\n"
               "The Python part is in the add-on folder itself. Images are in the add-on's web/ folder.\n"
               "Build: cd anki-addon && npm install && npm run build\n")
    for f in FILES:
        z.write(os.path.join(ROOT, f), f)
    for d in DIRS:
        for base, dirs, names in os.walk(os.path.join(ROOT, d)):
            dirs[:] = [x for x in dirs if x not in ("node_modules", "dist")]
            for n in names:
                p = os.path.join(base, n)
                z.write(p, os.path.relpath(p, ROOT))
print("source.zip", os.path.getsize(out) // 1024, "KB")
