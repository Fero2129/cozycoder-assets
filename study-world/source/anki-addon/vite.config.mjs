import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { cpSync, mkdirSync } from 'node:fs'

/**
 * Oberfläche des Anki-Add-ons „Lernwelt“.
 * Nutzt die echten Bausteine der Web-App (Regal, Bücher, Effekte, Pixel-Grafiken aus apps/web/src) –
 * nur Datenbank-Hooks werden durch eine Brücke zu Python ersetzt (web/src/shims).
 * Ergebnis landet in lernwelt/web/ und wird von Anki über /_addons/<add-on>/web/ ausgeliefert.
 */
const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const outDir = process.env.LW_OUT || here('./lernwelt/web')

/** Pixel-Hintergründe der Designs unter festem Namen mitliefern: Python setzt sie als Hintergrund in Anki ein (web/themes/<name>.png) */
const copyThemes = () => ({
  name: 'lernwelt-themes',
  closeBundle() {
    mkdirSync(`${outDir}/themes`, { recursive: true })
    cpSync(here('../apps/web/src/assets/themes'), `${outDir}/themes`, { recursive: true })
  },
})

export default defineConfig({
  root: here('./web'),
  base: './',
  plugins: [react(), copyThemes()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: '@karteikarten/core', replacement: here('./web/src/shims/core.ts') },
      { find: /^\.\.\/hooks\.ts$/, replacement: here('./web/src/shims/hooks.ts') },
      { find: /^\.\.\/lib\/deckColors\.ts$/, replacement: here('./web/src/shims/deckColors.ts') },
      { find: /^\.\.\/lib\/worldText\.ts$/, replacement: here('./web/src/shims/worldText.ts') },
    ],
  },
  build: {
    // LW_OUT: anderer Zielordner (z. B. beim Bauen außerhalb des Repos)
    outDir,
    emptyOutDir: true,
    // Qt WebEngine in Anki 23.10+ (Chromium 112+)
    target: 'chrome112',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 2000,
  },
})
