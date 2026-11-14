
/**
 * Kleine Pixel-Art-Werkstatt für den Wissensturm (Schritt 43):
 * Bücher und Raum-Teile werden pixelgenau auf ein Canvas gezeichnet und als Bild (data-URL) zwischengespeichert.
 * Angezeigt werden sie vergrößert mit `image-rendering: pixelated` – so bleibt der Pixel-Look scharf.
 */

interface G {
  /** Rechteck (x, y, Breite, Höhe) in Pixeln */
  r: (x: number, y: number, w: number, h: number, c: string) => void
  /** einzelnes Pixel */
  p: (x: number, y: number, c: string) => void
}

const cache = new Map<string, string>()

function sprite(key: string, w: number, h: number, draw: (g: G) => void): string {
  const hit = cache.get(key)
  if (hit) return hit
  if (typeof document === 'undefined') return ''
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  if (!ctx) return ''
  const g: G = {
    r: (x, y, ww, hh, c) => {
      ctx.fillStyle = c
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh))
    },
    p: (x, y, c) => {
      ctx.fillStyle = c
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
    },
  }
  draw(g)
  const url = cv.toDataURL()
  cache.set(key, url)
  return url
}

/* ---------- Farben ---------- */

function rgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  const n = m ? parseInt(m[1]!, 16) : 0x8b5cf6
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
/** Mischen: t = 0 … 1 Richtung `to` */
export function mixHex(a: string, to: string, t: number): string {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(to)
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}
/** dunkler (warm-violettes Schwarz) oder heller (warmes Weiß) */


/** Gemütliche Buchfarben für Bücher ohne Stapel (z. B. „Alles lernen“) */
const LIBRARY = ['#8c2f39', '#2f5d8c', '#3f7a4a', '#8c6a2f', '#5b3f8c', '#2f7a7a', '#a1502a', '#38406b']
export function libraryColor(key: string): string {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return LIBRARY[h % LIBRARY.length]!
}

/* ---------- Bücher (PixelLab-Grafiken, Schritt 50); Effekte zeichnet lib/bookFx.ts (Schritt 55) ---------- */

const BOOKS = import.meta.glob('../assets/lernwelt/buecher/*.png', { eager: true, import: 'default' }) as Record<string, string>
const WORLD = import.meta.glob('../assets/lernwelt/welt/*.png', { eager: true, import: 'default' }) as Record<string, string>

export const bookUrl = (key: string) => BOOKS[`../assets/lernwelt/buecher/${key}.png`] ?? BOOKS['../assets/lernwelt/buecher/buch.png']!
export const worldUrl = (key: 'bibliothek' | 'fenster' | 'leseecke' | 'regal' | 'regal-wand' | 'regal-dach' | 'turmspitze') => WORLD[`../assets/lernwelt/welt/${key}.png`]!

function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}
function fromHsl(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}
const hueDist = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))

/**
 * Einfache Bücher in die Stapelfarbe umfärben: die Hauptfarbe des Einbands (häufigster, kräftiger Farbton)
 * bekommt Farbton und Sättigung der Stapelfarbe; Gold, Papier und Schatten bleiben.
 */
const tintCache = new Map<string, string>()
const tintWait = new Map<string, Promise<string>>()
export function tintedBook(key: string, color: string): string | null {
  return tintCache.get(`${key}|${color}`) ?? null
}
export function loadTintedBook(key: string, color: string): Promise<string> {
  const id = `${key}|${color}`
  const hit = tintCache.get(id)
  if (hit) return Promise.resolve(hit)
  let p = tintWait.get(id)
  if (p) return p
  p = new Promise<string>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const cv = document.createElement('canvas')
      cv.width = img.naturalWidth
      cv.height = img.naturalHeight
      const ctx = cv.getContext('2d')
      if (!ctx) return resolve(img.src)
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, cv.width, cv.height)
      const px = data.data
      // Hauptfarbton bestimmen (nach Sättigung gewichtet, in 10°-Schritten)
      const bins = new Array(36).fill(0)
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3]! < 128) continue
        const [h, s, l] = toHsl(px[i]!, px[i + 1]!, px[i + 2]!)
        if (s > 0.3 && l > 0.15 && l < 0.85) bins[Math.floor(h / 10) % 36] += s
      }
      const base = bins.indexOf(Math.max(...bins)) * 10 + 5
      const [tr, tg, tb] = rgb(color)
      const [th, ts, tl] = toHsl(tr, tg, tb)
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3]! === 0) continue
        const [h, s, l] = toHsl(px[i]!, px[i + 1]!, px[i + 2]!)
        if (s < 0.25 || hueDist(h, base) > 28) continue
        const nl = Math.min(0.9, Math.max(0.08, l + (tl - 0.45) * 0.5))
        const [r, g, b] = fromHsl(th, Math.min(1, s * Math.max(0.35, ts) * 1.1), nl)
        px[i] = r
        px[i + 1] = g
        px[i + 2] = b
      }
      ctx.putImageData(data, 0, 0)
      const url = cv.toDataURL()
      tintCache.set(id, url)
      resolve(url)
    }
    img.onerror = () => resolve(img.src)
    img.src = bookUrl(key)
  })
  tintWait.set(id, p)
  return p
}

/* ---------- Tür zur Bibliothek (Schritt 59) ---------- */


/* ---------- Raum ---------- */

/** Holzvertäfelung der Wand (16×16, wird gekachelt) */
export function wallTile(): string {
  return sprite('wall', 16, 16, (g) => {
    g.r(0, 0, 16, 16, '#2b1d2c')
    g.r(0, 0, 1, 16, '#211522')
    g.r(8, 0, 1, 16, '#211522')
    g.r(1, 0, 1, 16, '#352538')
    g.r(9, 0, 1, 16, '#352538')
    g.p(4, 5, '#251926')
    g.p(12, 11, '#251926')
    g.p(5, 13, '#30212f')
  })
}
/** Rückwand im Regal (dunkel) */
export function shelfBackTile(): string {
  return sprite('shelfback', 8, 8, (g) => {
    g.r(0, 0, 8, 8, '#1b1018')
    g.r(3, 0, 1, 8, '#160c14')
    g.p(6, 4, '#20131d')
  })
}
/** Regalbrett (Vorderkante, 16×5) */
export function plankTile(): string {
  return sprite('plank', 16, 5, (g) => {
    g.r(0, 0, 16, 5, '#8a5630')
    g.r(0, 0, 16, 1, '#c08a52')
    g.r(0, 1, 16, 1, '#a46c3c')
    g.r(0, 4, 16, 1, '#4f2c14')
    g.p(3, 2, '#7a4a28')
    g.p(11, 3, '#7a4a28')
    g.p(7, 2, '#9c6438')
  })
}
/** Seitenteil des Regals (6×16) */
export function postTile(): string {
  return sprite('post', 6, 16, (g) => {
    g.r(0, 0, 6, 16, '#7a4826')
    g.r(0, 0, 1, 16, '#4f2c14')
    g.r(5, 0, 1, 16, '#4f2c14')
    g.r(1, 0, 1, 16, '#a46c3c')
    g.p(3, 6, '#6a3c1e')
    g.p(2, 12, '#8a5630')
  })
}
/** Lichterkette (24×7, zwei Bilder zum Funkeln) */
export function lightsTile(): string {
  return sprite('lights', 48, 7, (g) => {
    for (let f = 0; f < 2; f++) {
      const o = f * 24
      for (let x = 0; x < 24; x++) g.p(o + x, Math.round(1 + Math.sin((x / 24) * Math.PI) * 2), '#3a2a20')
      ;[4, 12, 20].forEach((bx, i) => {
        const by = Math.round(1 + Math.sin((bx / 24) * Math.PI) * 2) + 1
        const on = (i + f) % 2 === 0
        g.r(o + bx, by, 2, 2, on ? '#ffd37a' : '#c98a3a')
        if (on) g.p(o + bx, by, '#fff3c4')
      })
    }
  })
}
