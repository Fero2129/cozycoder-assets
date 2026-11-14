/**
 * Design & Hintergrund: fertige Themes (Vorlagen) und eigene Themes.
 * Ein Theme ist das komplette Aussehen: Farben, Hintergrund, Schrift, Ecken, Icons.
 * „Standard“ nutzt die eingebauten Farben und folgt der Einstellung Hell/Dunkel/System.
 */

export type ThemeMode = 'light' | 'dark'
export type FontChoice = 'system' | 'rounded' | 'serif' | 'mono'
export type CornerChoice = 'sharp' | 'normal' | 'round'
export type IconStyle = 'line' | 'bold' | 'emoji'
export type BackgroundKind = 'none' | 'gradient' | 'pattern' | 'image'
export type PatternKind = 'karo' | 'liniert' | 'punkte'

/** Icons der App, die sich durch eigene Bilder ersetzen lassen */
export type IconSlot = 'world' | 'search' | 'chart' | 'sliders' | 'gear' | 'dots'
export const ICON_SLOTS: { slot: IconSlot; label: string; where: string }[] = [
  { slot: 'world', label: 'Lernwelt', where: 'Startseite oben' },
  { slot: 'search', label: 'Durchsuchen', where: 'Startseite oben' },
  { slot: 'chart', label: 'Statistik', where: 'Startseite oben' },
  { slot: 'sliders', label: 'Einstellungen', where: 'Startseite oben' },
  { slot: 'gear', label: 'Lern-Optionen', where: 'neben jedem Stapel' },
  { slot: 'dots', label: 'Mehr', where: 'Menü neben jedem Stapel' },
]

export interface ThemeColors {
  accent: string
  bg: string
  surface: string
  text: string
  muted: string
  border: string
  /** Zähler: neu · lernen · wiederholen */
  new: string
  learn: string
  rev: string
}

export interface ThemeBackground {
  kind: BackgroundKind
  /** Verlauf */
  from: string
  to: string
  angle: number
  pattern: PatternKind
  /** eigenes Bild: Dateiname in der Medien-Tabelle */
  image: string
  /** Abdunkeln/Aufhellen über dem Bild in % (0–80), in Hintergrundfarbe */
  dim: number
  /** Weichzeichnen in px (0–20) */
  blur: number
}

export interface DesignTheme {
  id: string
  name: string
  /** nur „Standard“: Farben aus der App, Hell/Dunkel nach Einstellung */
  builtin?: boolean
  mode: ThemeMode
  colors: ThemeColors
  background: ThemeBackground
  /** Deckkraft der Flächen (Karten, Kästen) in % – unter 100 scheint der Hintergrund durch */
  surfaceOpacity: number
  font: FontChoice
  corners: CornerChoice
  icons: IconStyle
  /** eigene Icons: Dateinamen in der Medien-Tabelle je Icon (überschreiben den Icon-Stil) */
  customIcons: Partial<Record<IconSlot, string>>
}

export interface DesignSettings {
  /** aktives Theme (Vorlage oder eigenes) */
  themeId: string
  customThemes: DesignTheme[]
}

export const STANDARD_THEME_ID = 'standard'

const NO_BG: ThemeBackground = { kind: 'none', from: '#ffffff', to: '#ffffff', angle: 160, pattern: 'karo', image: '', dim: 0, blur: 0 }
const LIGHT_COUNTERS = { new: '#2563eb', learn: '#dc2626', rev: '#16a34a' }
const DARK_COUNTERS = { new: '#60a5fa', learn: '#f87171', rev: '#4ade80' }

function preset(
  id: string,
  name: string,
  mode: ThemeMode,
  c: Omit<ThemeColors, 'new' | 'learn' | 'rev'>,
  bg: Partial<ThemeBackground> = {},
  extra: Partial<Pick<DesignTheme, 'font' | 'corners' | 'icons' | 'surfaceOpacity'>> = {},
): DesignTheme {
  return {
    id,
    name,
    mode,
    colors: { ...c, ...(mode === 'dark' ? DARK_COUNTERS : LIGHT_COUNTERS) },
    background: { ...NO_BG, from: c.bg, to: c.bg, ...bg },
    surfaceOpacity: 100,
    font: 'system',
    corners: 'normal',
    icons: 'line',
    customIcons: {},
    ...extra,
  }
}

/** Fertige Themes – Vorlagen, die man nutzen oder als Grundlage für eigene nehmen kann */
export const PRESET_THEMES: DesignTheme[] = [
  // Standard = UI-Richtung C „Kachel-Dashboard“: helles Lila, Violett als Akzent, runde Schrift (Nunito)
  { ...preset(STANDARD_THEME_ID, 'Standard', 'light', { accent: '#6d28d9', bg: '#f6f3ff', surface: '#ffffff', text: '#1e1433', muted: '#5a5370', border: '#e5def8' }, undefined, { font: 'rounded' }), builtin: true },
  preset('lavendel', 'Lavendel', 'light', { accent: '#7c3aed', bg: '#f5f1ff', surface: '#ffffff', text: '#241b3a', muted: '#6b6287', border: '#e4dbf8' }, { kind: 'gradient', from: '#f1e9ff', to: '#fdf0fa', angle: 160 }, { corners: 'round' }),
  preset('nachtviolett', 'Nachtviolett', 'dark', { accent: '#a78bfa', bg: '#15111f', surface: '#1f1930', text: '#ece8f7', muted: '#a39bbb', border: '#30284a' }, { kind: 'gradient', from: '#221737', to: '#100c18', angle: 165 }),
  preset('mint', 'Mint', 'light', { accent: '#059669', bg: '#eff9f4', surface: '#ffffff', text: '#12261d', muted: '#587064', border: '#d4eadf' }, { kind: 'gradient', from: '#e6f7ef', to: '#f4fbf7', angle: 180 }, { corners: 'round', font: 'rounded' }),
  preset('wald', 'Wald', 'dark', { accent: '#6fcf8f', bg: '#0f1a14', surface: '#16251c', text: '#e5efe7', muted: '#9bb2a3', border: '#26392d' }, { kind: 'gradient', from: '#1a3324', to: '#0a120d', angle: 170 }),
  preset('ozean', 'Ozean', 'light', { accent: '#0284c7', bg: '#eef6fb', surface: '#ffffff', text: '#0c2233', muted: '#55708a', border: '#d3e5f1' }, { kind: 'gradient', from: '#e0f0fb', to: '#f2f9fd', angle: 180 }),
  preset('tiefsee', 'Tiefsee', 'dark', { accent: '#38bdf8', bg: '#0a1520', surface: '#112131', text: '#e2edf6', muted: '#92a7ba', border: '#1e3347' }, { kind: 'gradient', from: '#0f2a40', to: '#070e16', angle: 175 }),
  preset('sonnenuntergang', 'Sonnenuntergang', 'light', { accent: '#ea580c', bg: '#fff6ef', surface: '#ffffff', text: '#2b1a10', muted: '#7a6254', border: '#f3dfcf' }, { kind: 'gradient', from: '#ffe7d1', to: '#ffe3ef', angle: 135 }),
  preset('kirschbluete', 'Kirschblüte', 'light', { accent: '#db2777', bg: '#fff4f8', surface: '#ffffff', text: '#2d1420', muted: '#7d5a69', border: '#f5d8e4' }, { kind: 'pattern', pattern: 'punkte' }, { corners: 'round', font: 'rounded' }),
  preset('papier', 'Papier', 'light', { accent: '#8b5e34', bg: '#f4eee2', surface: '#fbf7ee', text: '#2e261d', muted: '#73675a', border: '#e3d8c4' }, { kind: 'pattern', pattern: 'liniert' }, { font: 'serif', corners: 'sharp' }),
  preset('karo', 'Schulheft', 'light', { accent: '#2563eb', bg: '#fbfcff', surface: '#ffffff', text: '#1a2233', muted: '#5e6a80', border: '#dde3ee' }, { kind: 'pattern', pattern: 'karo' }, { font: 'rounded' }),
]

/** Besondere Designs aus dem Shop (mit Lern-Münzen freischalten) */
export const SHOP_THEMES: (DesignTheme & { price: number })[] = [
  // Einfache Farb-Themes (~15–20 Tage intensive Nutzung = ~900–1200 Münzen)
  { ...preset('herbst', 'Goldener Herbst', 'light', { accent: '#c2410c', bg: '#fdf6ec', surface: '#fffbf5', text: '#2f1d0e', muted: '#7b6450', border: '#efdcc4' }, { kind: 'gradient', from: '#fde7c8', to: '#f9d5c4', angle: 150 }, { font: 'serif' }), price: 900 },
  { ...preset('korallenriff', 'Korallenriff', 'light', { accent: '#e11d48', bg: '#f0fbfb', surface: '#ffffff', text: '#102a2e', muted: '#557276', border: '#cfe9ea' }, { kind: 'gradient', from: '#c9f2ef', to: '#ffe1d6', angle: 170 }, { corners: 'round', font: 'rounded' }), price: 1000 },
  { ...preset('dschungel', 'Dschungel', 'dark', { accent: '#a3e635', bg: '#0c1a10', surface: '#132717', text: '#e8f3e4', muted: '#9fb69c', border: '#223f27' }, { kind: 'gradient', from: '#1c4a26', to: '#081109', angle: 180 }, { corners: 'round' }), price: 1000 },
  { ...preset('polarlicht', 'Polarlicht', 'dark', { accent: '#5eead4', bg: '#0b1222', surface: '#121c31', text: '#e6f0f5', muted: '#98abc0', border: '#22314d' }, { kind: 'gradient', from: '#0f3b46', to: '#2a1450', angle: 200 }, { corners: 'round' }), price: 1200 },
  { ...preset('sternennacht', 'Sternennacht', 'dark', { accent: '#fbbf24', bg: '#0c0f24', surface: '#151a37', text: '#eef0fb', muted: '#a3a8c9', border: '#262c55' }, { kind: 'pattern', pattern: 'punkte' }), price: 1200 },
  // Schritt 82: neue Farb-Designs (~20–25 Tage = ~1200–1500 Münzen)
  { ...preset('pfirsich', 'Pfirsich', 'light', { accent: '#f97316', bg: '#fff7f0', surface: '#ffffff', text: '#2c1a0e', muted: '#7d6555', border: '#f6e1d1' }, { kind: 'gradient', from: '#ffe4d0', to: '#fff5e6', angle: 160 }, { corners: 'round', font: 'rounded' }), price: 1200 },
  { ...preset('gletscher', 'Gletscher', 'light', { accent: '#0891b2', bg: '#f0fbfd', surface: '#ffffff', text: '#0e2a33', muted: '#557984', border: '#d2ecf2' }, { kind: 'gradient', from: '#dff6fb', to: '#eef2ff', angle: 200 }), price: 1200 },
  { ...preset('pastelltraum', 'Pastelltraum', 'light', { accent: '#8b5cf6', bg: '#fbf7ff', surface: '#ffffff', text: '#251c3a', muted: '#6e6487', border: '#ece3fb' }, { kind: 'gradient', from: '#fde2f3', to: '#dbeafe', angle: 135 }, { corners: 'round', font: 'rounded' }), price: 1300 },
  { ...preset('espresso', 'Espresso', 'dark', { accent: '#d4a373', bg: '#1a120d', surface: '#251a13', text: '#f5ebe0', muted: '#bba795', border: '#3d2c20' }, { kind: 'gradient', from: '#2e1f15', to: '#120c08', angle: 165 }, { font: 'serif' }), price: 1300 },
  { ...preset('mitternachtsgold', 'Mitternachtsgold', 'dark', { accent: '#e8b84a', bg: '#0e0e10', surface: '#18181c', text: '#f3efe6', muted: '#a9a397', border: '#2c2a26' }, { kind: 'gradient', from: '#1c1a14', to: '#08080a', angle: 170 }, { font: 'serif' }), price: 1500 },
  { ...preset('neonlimette', 'Neon-Limette', 'dark', { accent: '#bef264', bg: '#0b0f0a', surface: '#141a12', text: '#effae6', muted: '#a3b399', border: '#26321f' }, { kind: 'pattern', pattern: 'karo' }, { font: 'mono' }), price: 1500 },
  // Schritt 82: Premium Pixel-Landschaften (PixelLab Pixel-Art Hintergründe – 1 Monat+ intensives Lernen: 1800–3000 Münzen)
  { ...preset('kirschgarten', 'Kirschgarten', 'light', { accent: '#db2777', bg: '#fff1f6', surface: '#ffffff', text: '#2d1420', muted: '#7d5a69', border: '#f3cfe0' }, { kind: 'image', image: 'pix:sakura', dim: 35 }, { corners: 'round', font: 'rounded', surfaceOpacity: 90 }), price: 2000 },
  { ...preset('unterwasserwelt', 'Unterwasserwelt', 'dark', { accent: '#22d3ee', bg: '#04263a', surface: '#0a3550', text: '#e6f6fb', muted: '#9cc5d6', border: '#15506e' }, { kind: 'image', image: 'pix:unterwasser', dim: 35 }, { corners: 'round', surfaceOpacity: 88 }), price: 2000 },
  { ...preset('herbstwald', 'Herbstwald', 'dark', { accent: '#fb923c', bg: '#2a160a', surface: '#3a2212', text: '#fdf0e3', muted: '#d4b49a', border: '#5a3a22' }, { kind: 'image', image: 'pix:herbstwald', dim: 40 }, { font: 'serif', surfaceOpacity: 90 }), price: 2200 },
  { ...preset('wuestenoase', 'Wüstenoase', 'dark', { accent: '#fbbf24', bg: '#2b1408', surface: '#3d1f0e', text: '#fff3e0', muted: '#e0b88f', border: '#6b3a1a' }, { kind: 'image', image: 'pix:wueste', dim: 35 }, { surfaceOpacity: 90 }), price: 2200 },
  { ...preset('bergsee', 'Bergsee', 'light', { accent: '#2563eb', bg: '#f2f7fb', surface: '#ffffff', text: '#13233a', muted: '#5a6f86', border: '#d6e3ef' }, { kind: 'image', image: 'pix:berge', dim: 40 }, { corners: 'round', surfaceOpacity: 90 }), price: 2400 },
  { ...preset('weltraum', 'Weltraum', 'dark', { accent: '#fbbf24', bg: '#0b0b1e', surface: '#15152e', text: '#ecebff', muted: '#a5a3c8', border: '#2a2a4f' }, { kind: 'image', image: 'pix:weltraum', dim: 30 }, { surfaceOpacity: 88 }), price: 2500 },
  { ...preset('winterdorf', 'Winterdorf', 'dark', { accent: '#7dd3fc', bg: '#0d1b2e', surface: '#14263f', text: '#eaf4ff', muted: '#9fb4cc', border: '#24405f' }, { kind: 'image', image: 'pix:winterdorf', dim: 30 }, { corners: 'round', surfaceOpacity: 88 }), price: 2500 },
  { ...preset('regenwald', 'Regenwald', 'dark', { accent: '#4ade80', bg: '#0b1f15', surface: '#10301f', text: '#e7f6ea', muted: '#9cc4a8', border: '#1f4a30' }, { kind: 'image', image: 'pix:dschungel', dim: 35 }, { corners: 'round', surfaceOpacity: 88 }), price: 2600 },
  { ...preset('synthwave', 'Synthwave', 'dark', { accent: '#f472b6', bg: '#14082b', surface: '#21103f', text: '#fbe8ff', muted: '#c4a6d9', border: '#3e1f66' }, { kind: 'image', image: 'pix:synthwave', dim: 25 }, { font: 'mono', surfaceOpacity: 88 }), price: 2800 },
  { ...preset('regenabend', 'Regenabend', 'dark', { accent: '#fbbf24', bg: '#141019', surface: '#1f1924', text: '#f3ece4', muted: '#b9ab9c', border: '#3a2f3d' }, { kind: 'image', image: 'pix:regenzimmer', dim: 25 }, { font: 'serif', surfaceOpacity: 88 }), price: 3000 },
  // Schritt 95d: sechs neue Pixel-Landschaften (PixelLab)
  { ...preset('lavendelfeld', 'Lavendelfeld', 'light', { accent: '#7c3aed', bg: '#f5f1ff', surface: '#ffffff', text: '#241b3a', muted: '#6b6287', border: '#e4dbf8' }, { kind: 'image', image: 'pix:lavendelfeld', dim: 35 }, { corners: 'round', font: 'rounded', surfaceOpacity: 90 }), price: 2000 },
  { ...preset('reisterrassen', 'Reisterrassen', 'light', { accent: '#059669', bg: '#eff9f4', surface: '#ffffff', text: '#12261d', muted: '#587064', border: '#d4eadf' }, { kind: 'image', image: 'pix:reisterrassen', dim: 35 }, { corners: 'round', surfaceOpacity: 90 }), price: 2200 },
  { ...preset('kueste', 'Leuchtturmküste', 'dark', { accent: '#fb923c', bg: '#2a160a', surface: '#3a2212', text: '#fdf0e3', muted: '#d4b49a', border: '#5a3a22' }, { kind: 'image', image: 'pix:kueste', dim: 35 }, { surfaceOpacity: 90 }), price: 2400 },
  { ...preset('polarnacht', 'Polarnacht', 'dark', { accent: '#5eead4', bg: '#0b1222', surface: '#121c31', text: '#e6f0f5', muted: '#98abc0', border: '#22314d' }, { kind: 'image', image: 'pix:polarnacht', dim: 30 }, { corners: 'round', surfaceOpacity: 88 }), price: 2600 },
  { ...preset('stadtnacht', 'Stadt bei Nacht', 'dark', { accent: '#f472b6', bg: '#14082b', surface: '#21103f', text: '#fbe8ff', muted: '#c4a6d9', border: '#3e1f66' }, { kind: 'image', image: 'pix:stadtnacht', dim: 25 }, { surfaceOpacity: 88 }), price: 2800 },
  { ...preset('zauberturm', 'Zauberturm', 'dark', { accent: '#fbbf24', bg: '#141019', surface: '#1f1924', text: '#f3ece4', muted: '#b9ab9c', border: '#3a2f3d' }, { kind: 'image', image: 'pix:zauberturm', dim: 25 }, { font: 'serif', surfaceOpacity: 88 }), price: 3000 },
]

export const FONT_STACKS: Record<FontChoice, string> = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  rounded: '"Nunito Variable", "Nunito", ui-rounded, "SF Pro Rounded", "Varela Round", system-ui, sans-serif',
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  mono: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace',
}
export const CORNER_RADIUS: Record<CornerChoice, string> = { sharp: '6px', normal: '14px', round: '22px' }

/* ---------- Farben ---------- */

const HEX = /^#([0-9a-f]{6})$/i
export function isHex(v: unknown): v is string {
  return typeof v === 'string' && HEX.test(v)
}
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('')
}
/** Mischt a und b (t = Anteil von b, 0–1) */
export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  return rgbToHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t) as [number, number, number])
}
export function luminance(hex: string): number {
  const c = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
}
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}
/** Schrift auf dem Akzent: weiß oder fast schwarz – je nachdem, was besser lesbar ist */
export function accentTextFor(accent: string): string {
  return contrastRatio(accent, '#ffffff') >= contrastRatio(accent, '#111216') ? '#ffffff' : '#111216'
}

/** Lesbarkeits-Hinweise für ein eigenes Theme */
export function themeWarnings(t: DesignTheme): string[] {
  const w: string[] = []
  const c = t.colors
  if (contrastRatio(c.text, c.surface) < 4.5) w.push('Text auf den Karten ist schwer lesbar – Text- oder Flächenfarbe kontrastreicher wählen.')
  if (contrastRatio(c.text, c.bg) < 4.5) w.push('Text auf dem Hintergrund ist schwer lesbar.')
  if (contrastRatio(c.muted, c.surface) < 3) w.push('Gedämpfter Text (Hinweise, Zahlen) ist kaum zu sehen.')
  if (contrastRatio(c.accent, c.surface) < 2.2) w.push('Akzentfarbe hebt sich kaum von den Flächen ab.')
  return w
}

/** CSS-Variablen eines Themes (für :root) */
export function themeVars(t: DesignTheme): Record<string, string> {
  const c = t.colors
  const alpha = t.background.kind === 'none' ? 1 : Math.min(100, Math.max(40, t.surfaceOpacity)) / 100
  const [r, g, b] = hexToRgb(c.surface)
  const hmBase = mixHex(c.surface, c.text, t.mode === 'dark' ? 0.1 : 0.07)
  return {
    '--bg': c.bg,
    '--surface': alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : c.surface,
    '--surface-solid': c.surface,
    '--text': c.text,
    '--muted': c.muted,
    '--border': c.border,
    '--accent': c.accent,
    '--accent-text': accentTextFor(c.accent),
    '--new': c.new,
    '--learn': c.learn,
    '--rev': c.rev,
    '--hm0': hmBase,
    '--hm1': mixHex(hmBase, c.accent, 0.3),
    '--hm2': mixHex(hmBase, c.accent, 0.55),
    '--hm3': mixHex(hmBase, c.accent, 0.8),
    '--hm4': t.mode === 'dark' ? mixHex(c.accent, '#ffffff', 0.35) : mixHex(c.accent, '#000000', 0.25),
  }
}

/** CSS-Hintergrund (ohne Bild-Quelle – die setzt die App, weil Bilder lokal liegen) */
export function backgroundCss(t: DesignTheme, imageUrl?: string): string {
  const bg = t.background
  const line = mixHex(t.colors.bg, t.colors.text, t.mode === 'dark' ? 0.12 : 0.09)
  switch (bg.kind) {
    case 'gradient':
      return `linear-gradient(${Math.round(bg.angle)}deg, ${bg.from}, ${bg.to})`
    case 'pattern':
      if (bg.pattern === 'punkte') return `radial-gradient(${line} 1.3px, transparent 1.7px) 0 0 / 22px 22px, ${t.colors.bg}`
      if (bg.pattern === 'liniert')
        return `linear-gradient(90deg, transparent 56px, ${mixHex(t.colors.bg, '#e05a5a', 0.35)} 56px, ${mixHex(t.colors.bg, '#e05a5a', 0.35)} 58px, transparent 58px) 0 0 / 100% 100%, linear-gradient(${line} 1px, transparent 1px) 0 0 / 100% 30px, ${t.colors.bg}`
      return `linear-gradient(${line} 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, ${line} 1px, transparent 1px) 0 0 / 22px 22px, ${t.colors.bg}`
    case 'image':
      return imageUrl ? `url("${imageUrl}") center / cover no-repeat, ${t.colors.bg}` : t.colors.bg
    default:
      return t.colors.bg
  }
}

/* ---------- Einlesen & Prüfen ---------- */

const num = (v: unknown, min: number, max: number, def: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def)
const pick = <T extends string>(v: unknown, allowed: readonly T[], def: T): T => (allowed.includes(v as T) ? (v as T) : def)

export function normalizeTheme(raw: unknown, fallback: DesignTheme = PRESET_THEMES[0]!): DesignTheme {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const mode = pick(r.mode, ['light', 'dark'] as const, fallback.mode)
  const rc = (r.colors && typeof r.colors === 'object' ? r.colors : {}) as Record<string, unknown>
  const colors = Object.fromEntries(
    (Object.keys(fallback.colors) as (keyof ThemeColors)[]).map((k) => [k, isHex(rc[k]) ? (rc[k] as string).toLowerCase() : fallback.colors[k]]),
  ) as unknown as ThemeColors
  const rb = (r.background && typeof r.background === 'object' ? r.background : {}) as Record<string, unknown>
  const fb = fallback.background
  return {
    id: typeof r.id === 'string' && r.id ? r.id : fallback.id,
    name: typeof r.name === 'string' && r.name.trim() ? r.name.slice(0, 40) : fallback.name,
    mode,
    colors,
    background: {
      kind: pick(rb.kind, ['none', 'gradient', 'pattern', 'image'] as const, fb.kind),
      from: isHex(rb.from) ? rb.from : fb.from,
      to: isHex(rb.to) ? rb.to : fb.to,
      angle: num(rb.angle, 0, 360, fb.angle),
      pattern: pick(rb.pattern, ['karo', 'liniert', 'punkte'] as const, fb.pattern),
      image: typeof rb.image === 'string' ? rb.image : '',
      dim: num(rb.dim, 0, 80, fb.dim),
      blur: num(rb.blur, 0, 20, fb.blur),
    },
    surfaceOpacity: num(r.surfaceOpacity, 40, 100, fallback.surfaceOpacity),
    font: pick(r.font, ['system', 'rounded', 'serif', 'mono'] as const, fallback.font),
    corners: pick(r.corners, ['sharp', 'normal', 'round'] as const, fallback.corners),
    icons: pick(r.icons, ['line', 'bold', 'emoji'] as const, fallback.icons),
    customIcons: Object.fromEntries(
      ICON_SLOTS.map(({ slot }) => [slot, (r.customIcons as Record<string, unknown> | undefined)?.[slot]]).filter(
        (e): e is [IconSlot, string] => typeof e[1] === 'string' && !!e[1] && e[1].length < 200,
      ),
    ),
  }
}

export const DEFAULT_DESIGN: DesignSettings = { themeId: STANDARD_THEME_ID, customThemes: [] }

export function normalizeDesign(raw: unknown): DesignSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const customThemes = (Array.isArray(r.customThemes) ? r.customThemes : [])
    .slice(0, 50)
    .map((t) => normalizeTheme(t, PRESET_THEMES[1]))
    .filter((t, i, all) => t.id !== STANDARD_THEME_ID && !isPresetTheme(t.id) && all.findIndex((x) => x.id === t.id) === i)
  const themeId = typeof r.themeId === 'string' ? r.themeId : STANDARD_THEME_ID
  const exists = isPresetTheme(themeId) || customThemes.some((t) => t.id === themeId)
  return { themeId: exists ? themeId : STANDARD_THEME_ID, customThemes }
}

export function findTheme(d: DesignSettings, id = d.themeId): DesignTheme {
  return PRESET_THEMES.find((p) => p.id === id) ?? SHOP_THEMES.find((p) => p.id === id) ?? d.customThemes.find((t) => t.id === id) ?? PRESET_THEMES[0]!
}

export function isPresetTheme(id: string): boolean {
  return PRESET_THEMES.some((p) => p.id === id) || SHOP_THEMES.some((p) => p.id === id)
}

/** Eigenes Theme als Kopie anlegen (eindeutiger Name) */
export function copyTheme(d: DesignSettings, base: DesignTheme, id: string): DesignTheme {
  const names = new Set([...PRESET_THEMES, ...d.customThemes].map((t) => t.name))
  let name = base.builtin ? 'Mein Theme' : `${base.name} (eigenes)`
  for (let i = 2; names.has(name); i++) name = `${base.builtin ? 'Mein Theme' : `${base.name} (eigenes)`} ${i}`
  const { builtin: _b, ...rest } = base
  return normalizeTheme({ ...rest, id, name }, base)
}
