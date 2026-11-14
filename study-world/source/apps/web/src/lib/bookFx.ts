import type { EffectStyle } from '@karteikarten/core'

/**
 * Effekte der besonderen Bücher (Schritt 55): Sie gehören zum Buch selbst.
 * Jeder Effekt besteht aus winzigen Pixel-Partikeln (eigene Mini-Sprites, gleicher Pixel-Stil wie die Bücher)
 * und optional einer Bewegung des Buches (Leuchten, Schweben, Flackern …).
 * Partikel bleiben über der Breite des Buches und in der kleinen Lücke darüber – das Regal bleibt dicht, ohne Lücken.
 */

/* ---------- Mini-Sprites ---------- */

const PAL: Record<string, string> = {
  w: '#fff6c8', W: '#ffffff', y: '#ffd95a', Y: '#f5b301', o: '#ff8a1c', O: '#e2420d', d: '#8a1e05',
  r: '#ff5a6e', R: '#c42a45', p: '#ffa8d2', P: '#e0569b', g: '#8ad470', G: '#3f8a3c',
  b: '#8fd3ff', B: '#3a8fd9', c: '#c8f4ff', C: '#5fd0f0', v: '#c39cff', V: '#8a55e6',
  s: '#d9d2e3', S: '#9d94aa', m: '#c8f06e', e: '#f4efe2', k: '#3a2a40',
  // Augenlid (Augenbuch) und Katzengesicht – aus den Farben der Buch-Grafiken
  L: '#7c488c', M: '#59336e', D: '#3e2209', F: '#f3cc7f', E: '#3e1005', u: '#9b5fc4', U: '#6a3a8f',
}

const GRIDS: Record<string, string[]> = {
  funke: ['.y.', 'ywy', '.y.'],
  glanz: ['..w..', '..y..', 'wyYyw', '..y..', '..w..'],
  stern: ['..w..', '.wyw.', 'wyYyw', '.wyw.', '..w..'],
  punkt: ['w'],
  punktGelb: ['y'],
  herz: ['.r.r.', 'rrrrr', 'rRrrr', '.rrr.', '..r..'],
  note: ['..yy', '..y.', '..y.', 'yyy.', 'yyy.'],
  noteB: ['.yyy', '.y.y', '.y.y', 'yy.y', 'yy..'],
  A: ['.y.', 'y.y', 'yyy', 'y.y', 'y.y'],
  B: ['yy.', 'y.y', 'yy.', 'y.y', 'yy.'],
  C: ['.yy', 'y..', 'y..', 'y..', '.yy'],
  zettel: ['yyy', 'yYy', 'yyy'],
  zettelRosa: ['ppp', 'pPp', 'ppp'],
  dampf: ['s.', '.s', 's.', '.s'],
  blatt: ['gg.', '.gG'],
  blatt2: ['Gg', '.g'],
  bluete: ['.p.', 'pyp', '.p.'],
  spore: ['m'],
  spore2: ['m.', '.m'],
  blase: ['.c.', 'c.c', '.c.'],
  blaseKlein: ['c'],
  regen: ['c', 'B', 'B'],
  glut: ['o', 'y'],
  glut2: ['yo', 'oO'],
  schnee: ['.B.', 'BWB', '.B.'],
  flocke: ['W', 'B'],
  mondfunke: ['.c.', 'cWc', '.c.'],
  z: ['ccc', '..c', '.c.', 'ccc'],
  violett: ['.v.', 'vWv', '.v.'],
  blitz: ['..y', '.y.', 'yyy', '.y.', 'y..'],
  schleim: ['.k.', 'kvk', 'kvk', 'kVk', '.k.'],
  sabber: ['U', 'u', 'u', 'U'],
  sabberTropfen: ['.v.', 'vWv', 'vcv', 'vvv', '.v.'],
  lid: ['...MMMMM...', '..MLLLLLM..', '.MLLLLLLLM.', '.LLLLLLLLL.', '.LLLLLLLLL.', '.LLLLLLLLL.', '.MLLLLLLLM.', '.DMLLLLLMD.', '..DDMMMDD..', '...DDDDD...'],
  katzenlid: ['FF....FF', 'EE....EE'],
  spinne: ['s...s', '.sks.', 'skkks', '.s.s.'],
  geist: ['.cc.', 'cWWc', 'cccc', 'c.c.'],
  zahnrad: ['Y.Y.Y', '.YYY.', 'YY.YY', '.YYY.', 'Y.Y.Y'],
  lava: ['.d.', 'dod', 'dyd', 'dwd', '.d.'],
  pfuetze: ['.OoooO.', 'OOdddOO'],
  pfuetzeKlein: ['.VvvV.', 'VVVVVV'],
  muenze: ['.Y.', 'YyY', '.Y.'],
  rauch: ['.ss.', 'ssss', '.sS.'],
  rauchKlein: ['ss', 'sS'],
  rot: ['.r.', 'rwr', '.r.'],
  orange: ['.o.', 'owo', '.o.'],
  gelb: ['.y.', 'ywy', '.y.'],
  gruen: ['.g.', 'gwg', '.g.'],
  blau: ['.b.', 'bwb', '.b.'],
  lila: ['.v.', 'vwv', '.v.'],
  kristall: ['.C.', 'CcC', '.C.'],
  // Schritt 82
  gblase: ['.g.', 'g.g', '.g.'],
  gblaseKlein: ['m'],
  eins: ['.w.', 'ww.', '.w.', '.w.', 'www'],
  zwei: ['ww.', '..w', '.w.', 'w..', 'www'],
  pi: ['wwwww', '.w.w.', '.w.w.', '.w..w'],
  flieger: ['W....', 'WWW..', '.WWWW', '..WW.'],
  bluetenblatt: ['p.', 'pP'],
  bluetenblatt2: ['.p', 'p.'],
  laub: ['oO', '.o'],
  laub2: ['O.', 'rO'],
  biene: ['c.c', 'yky', '.y.'],
  muenzeKlein: ['Y'],
  pixelC: ['C'],
  staubkorn: ['S'],
  sandkorn: ['Y'],
  sandkorn2: ['y'],
  rosa: ['.p.', 'pWp', '.p.'],
  gluehwurm: ['.m.', 'mym', '.m.'],
  kreuz: ['.r.', 'rrr', '.r.'],
  fledermaus: ['k...k', 'kk.kk', '.kkk.'],
  fliege: ['c.c', '.k.'],
  tropfenRot: ['r', 'R'],
  tropfenBlau: ['b', 'B'],
  tropfenGelb: ['y', 'Y'],
  schachW: ['.W.', 'WWW', '.W.', 'WWW'],
  // Schritt 95c
  knochen: ['W.W', '.e.', '.e.', 'W.W'],
  zelle: ['.g.', 'gGg', '.g.'],
  bohne: ['.D.', 'DFD', '.D.'],
  nadel: ['.r.', '.r.', '.w.', '.S.', '.S.'],
  kranich: ['p...p', '.pPp.', '..p..'],
  feder: ['.s', 'sS', 'S.'],
  welle: ['.b.b', 'b.b.'],
  shuriken: ['s.s', '.k.', 's.s'],
  plus: ['.m.', 'mmm', '.m.'],
  fuss: ['kk', 'kk', '.k'],
  streuselR: ['r', 'r'],
  streuselB: ['b', 'b'],
  streuselG: ['m', 'm'],
  beere: ['.g.', 'rRr', '.r.'],
  bambusblatt: ['gG.', '.gg'],
  // Schritt 95d
  apfel: ['.G.', 'rRr', 'rrr', '.r.'],
  teeblatt: ['gG', 'G.'],
  kerzenflamme: ['.y.', 'yoy', '.o.'],
  moewe: ['W...W', '.W.W.'],
  blitzW: ['W.W', '.W.', 'W.W'],
  quadR: ['rr', 'rr'],
  quadB: ['bb', 'bb'],
  quadG: ['gg', 'gg'],
  quadY: ['yy', 'yy'],
  falter: ['vv.vv', '.vkv.', 'vv.vv'],
  eukaBlatt: ['cg', '.G'],
  nebelwolke: ['.vv.', 'vvvv'],
  eistropfen: ['p', 'P'],
  korn: ['F', 'D'],
  phoenixfeder: ['.o', 'oy', 'O.'],
}

const cache = new Map<string, { url: string; w: number; h: number }>()

/** Mini-Sprite als Bild (wird einmal gezeichnet und zwischengespeichert) */
export function fxSprite(key: string): { url: string; w: number; h: number } {
  const hit = cache.get(key)
  if (hit) return hit
  const grid = GRIDS[key] ?? GRIDS.funke!
  const h = grid.length
  const w = Math.max(...grid.map((r) => r.length))
  let url = ''
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const ctx = cv.getContext('2d')
    if (ctx) {
      grid.forEach((row, y) =>
        [...row].forEach((ch, x) => {
          const c = PAL[ch]
          if (!c) return
          ctx.fillStyle = c
          ctx.fillRect(x, y, 1, 1)
        }),
      )
      url = cv.toDataURL()
    }
  }
  const out = { url, w, h }
  cache.set(key, out)
  return out
}

/* ---------- Bewegungen ---------- */

/** rise = steigt auf und verblasst · fall = fällt vor dem Buch herunter · twinkle = blinkt an seinem Platz
 *  drip = sammelt sich oben, läuft dann ganz herunter · spin = dreht sich · bob = wippt auf und ab · pool = Pfütze pulsiert */
export type Motion = 'rise' | 'fall' | 'twinkle' | 'drip' | 'spin' | 'bob' | 'pool' | 'puff' | 'dangle' | 'blink'
/** Bewegung des Buches selbst */
export type BookMotion = 'glow' | 'float' | 'flicker' | 'rumble' | 'wobble'

export interface Particle {
  sprite: string
  /** Mitte, in Pixeln ab der linken Kante des Buches */
  x: number
  /** Unterkante, in Pixeln über dem Brett */
  y: number
  motion: Motion
  /** Sekunden */
  dur: number
  delay: number
  /** Weg nach oben/unten bzw. zur Seite (Pixel) */
  dy?: number
  dx?: number
  /** Faden der Spinne bis zum Brett darüber */
  thread?: number
}

/** Ein Stück der Buch-Grafik selbst, das sich bewegt (Herz schlägt, Flamme flackert, Geist lugt) */
export interface SpritePart {
  /** Ausschnitt in der Buch-Grafik (Pixel, von oben links) */
  sx: number
  sy: number
  sw: number
  sh: number
  motion: 'beat' | 'flame' | 'flameUp' | 'peek'
  dur: number
  delay: number
}

export interface BookFxPlan {
  parts: Particle[]
  /** bewegte Stücke der Buch-Grafik */
  pieces?: SpritePart[]
  book?: BookMotion
  glow?: string
}

/** kleiner fester Zufall, damit gleiche Bücher gleich aussehen, aber nicht im Gleichschritt */
function rng(seed: number) {
  let s = (seed * 2654435761 + 7) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

/** Höhe der Lücke zwischen Buchoberkante und dem Brett darüber (Fach 64, Brett unten 5) */
export const SHELF_INNER = 60

/**
 * Plan für den Effekt eines Buches (bw × bh Pixel). `seed` verschiebt Zeiten und Plätze leicht,
 * damit zwei gleiche Bücher nicht synchron blinken.
 */
export function bookFxPlan(style: EffectStyle, bw: number, bh: number, seed = 1): BookFxPlan {
  const r = rng(seed)
  const top = bh
  const gap = Math.max(4, SHELF_INNER - bh)
  const xs = (n: number, pad = 2) => Array.from({ length: n }, (_, i) => pad + ((bw - 2 * pad) * (i + 0.5)) / n + (r() - 0.5) * 2)
  const rise = (sprites: string[], n: number, dur: number, dy = gap + 4, from = top - 4): Particle[] =>
    xs(n).map((x, i) => ({ sprite: sprites[i % sprites.length]!, x, y: from + r() * 3, motion: 'rise', dur: dur * (0.85 + r() * 0.3), delay: -(dur * i) / n - r(), dy, dx: (r() - 0.5) * 4 }))
  const fall = (sprites: string[], n: number, dur: number): Particle[] =>
    xs(n).map((x, i) => ({ sprite: sprites[i % sprites.length]!, x, y: top + 2, motion: 'fall', dur: dur * (0.85 + r() * 0.3), delay: -(dur * i) / n - r(), dy: top + 1, dx: (r() - 0.5) * 3 }))
  const twinkle = (sprites: string[], n: number, dur: number, yMin = 8, yMax = top - 4): Particle[] =>
    Array.from({ length: n }, (_, i) => ({ sprite: sprites[i % sprites.length]!, x: 2 + r() * (bw - 4), y: yMin + ((yMax - yMin) * (i + r())) / n, motion: 'twinkle' as Motion, dur: dur * (0.8 + r() * 0.4), delay: -r() * dur }))

  switch (style) {
    case 'lesezeichen':
      return { parts: twinkle(['punktGelb', 'funke'], 2, 3.2, top - 14, top - 2) }
    case 'zettel':
      return { parts: rise(['zettel', 'zettelRosa'], 2, 5) }
    case 'buchstaben':
      return { parts: rise(['A', 'B', 'C'], 3, 4.6) }
    case 'dampf':
      return { parts: rise(['dampf'], 2, 3.6, gap + 2) }
    case 'staub':
      return { parts: [...twinkle(['punkt'], 4, 2.6), ...rise(['punkt'], 2, 5)] }
    case 'blaetter':
      return { parts: fall(['blatt', 'blatt2'], 3, 5.5), book: 'wobble' }
    case 'herzen':
      // das große Herz auf dem Buch schlägt, kleine Herzen steigen auf
      return { parts: rise(['herz'], 2, 4.2), pieces: [{ sx: 4, sy: 20, sw: 11, sh: 11, motion: 'beat', dur: 1.4, delay: 0 }], glow: '#ff6e9c', book: 'glow' }
    case 'bluete':
      return { parts: twinkle(['bluete'], 2, 3.4, top - 20, top - 4) }
    case 'sporen':
      return { parts: [...rise(['spore', 'spore2'], 4, 5.2), ...twinkle(['spore'], 2, 2.4)], glow: '#c8f06e', book: 'glow' }
    case 'sterne':
      return { parts: twinkle(['stern', 'funke', 'punkt'], 4, 2.8, 4, top + gap - 3) }
    case 'blasen':
      return { parts: rise(['blase', 'blaseKlein'], 4, 3.8, gap + 6, top - 16) }
    case 'regen':
      return { parts: fall(['regen'], 4, 1.4) }
    case 'noten':
      return { parts: rise(['note', 'noteB'], 2, 4.4) }
    case 'glut':
      return { parts: rise(['glut', 'glut2'], 4, 2.6, gap + 4), pieces: [{ sx: 0, sy: 0, sw: bw, sh: 10, motion: 'flameUp', dur: 0.9, delay: -r() }], glow: '#ff8a1c', book: 'flicker' }
    case 'schnee':
      return { parts: fall(['schnee', 'flocke', 'flocke'], 4, 4.6), glow: '#c8f4ff', book: 'glow' }
    case 'mondlicht':
      return { parts: twinkle(['mondfunke', 'punkt'], 3, 3.6, 6, top + gap - 3), glow: '#9fc4ff', book: 'glow' }
    case 'zzz':
      // die Katze döst: Augen fallen zu, Zz steigen auf
      return { parts: [{ sprite: 'katzenlid', x: 4 + 4, y: bh - 19, motion: 'blink', dur: 6, delay: -r() * 6 }, ...rise(['z'], 2, 4.8, gap + 3)] }
    case 'blinzeln':
      // das große Auge blinzelt ab und zu (Lid über dem Auge, Pixel 3–13 / 18–27)
      return { parts: [{ sprite: 'lid', x: 3 + 5.5, y: bh - 28, motion: 'blink', dur: 4.6 + r() * 1.5, delay: -r() * 4 }, ...twinkle(['violett'], 2, 3.4)], glow: '#b48cff', book: 'glow' }
    case 'blitz':
      return { parts: twinkle(['blitz', 'funke'], 2, 1.6, top - 18, top + 2), glow: '#ffe066', book: 'flicker' }
    case 'schleim':
      // das Monster sabbert: Speichel zieht sich aus dem Mund (Unterkante bei Pixel 21) und tropft herunter
      return {
        parts: [
          { sprite: 'sabberTropfen', x: 6.5, y: bh - 24, motion: 'drip', dur: 3.8, delay: -r() * 3.8, dy: bh - 24 },
          { sprite: 'sabberTropfen', x: 11.5, y: bh - 24, motion: 'drip', dur: 5.2, delay: -r() * 5.2, dy: bh - 24 },
          { sprite: 'pfuetzeKlein', x: bw * 0.5, y: 0, motion: 'pool', dur: 2.8, delay: 0 },
        ],
      }
    case 'spinne':
      // seilt sich an einem Faden von der Oberkante des Buches ab und klettert wieder hoch
      return { parts: [{ sprite: 'spinne', x: bw * 0.62, y: top - 5, motion: 'dangle', dur: 5, delay: -r() * 5, dy: 14, thread: 1 }] }
    case 'spuk':
      return { parts: rise(['geist'], 1, 5, gap + 6), pieces: [{ sx: 4, sy: 0, sw: 10, sh: 11, motion: 'peek', dur: 3.2, delay: -r() * 3 }], glow: '#7ff0e0', book: 'float' }
    case 'zahnrad':
      return { parts: [{ sprite: 'zahnrad', x: bw / 2, y: top, motion: 'spin', dur: 3, delay: 0 }] }
    case 'lava':
      return {
        parts: [
          { sprite: 'lava', x: bw * 0.28, y: top - 3, motion: 'drip', dur: 3.6, delay: -r() * 3.6, dy: top - 4 },
          { sprite: 'lava', x: bw * 0.7, y: top - 3, motion: 'drip', dur: 4.8, delay: -r() * 4.8, dy: top - 4 },
          { sprite: 'pfuetze', x: bw * 0.5, y: 0, motion: 'pool', dur: 2.2, delay: 0 },
          ...rise(['glut'], 2, 2.8, gap + 2),
        ],
        glow: '#ff6a1c',
        book: 'glow',
      }
    case 'goldglanz':
      return { parts: twinkle(['glanz', 'funke'], 3, 3.2, 6, top + 2), glow: '#ffd95a', book: 'glow' }
    case 'muenzen':
      return { parts: [...rise(['muenze'], 2, 4), ...twinkle(['funke'], 2, 2.4, top - 18, top)] }
    case 'rauch':
      return { parts: rise(['rauch', 'rauchKlein'], 2, 4.4, gap + 3), book: 'wobble' }
    case 'start':
      // Triebwerk flackert, Rauchwölkchen quellen am Boden hervor
      return {
        parts: Array.from({ length: 4 }, (_, i) => ({ sprite: i % 2 ? 'rauchKlein' : 'rauch', x: bw / 2 + (i % 2 ? 1 : -1) * 3, y: 0, motion: 'puff' as Motion, dur: 2.4, delay: -i * 0.6, dy: 8, dx: (i % 2 ? 1 : -1) * 6 })),
        pieces: [{ sx: 5, sy: 45, sw: 11, sh: bh - 45, motion: 'flame', dur: 0.5, delay: 0 }],
        book: 'rumble',
      }
    case 'regenbogen':
      return { parts: [...twinkle(['rot', 'orange', 'gelb', 'gruen', 'blau', 'lila'], 6, 2.6, 4, top + gap - 4)] }
    case 'kristall':
      return { parts: twinkle(['kristall', 'funke', 'punkt'], 4, 2.6, 4, top + 2), glow: '#7fe8ff', book: 'glow' }
    // ---- Schritt 82: neue Bücher ----
    case 'chemie':
      return { parts: rise(['gblase', 'gblaseKlein'], 4, 3.4, gap + 6, top - 18), glow: '#8ad470', book: 'glow' }
    case 'zahlen':
      return { parts: rise(['eins', 'pi', 'zwei'], 3, 4.8) }
    case 'flieger':
      return { parts: rise(['flieger'], 1, 6, gap + 6) }
    case 'kirschblueten':
      return { parts: fall(['bluetenblatt', 'bluetenblatt2'], 4, 5.8) }
    case 'herbstlaub':
      return { parts: fall(['laub', 'laub2'], 3, 5.2), book: 'wobble' }
    case 'bienen':
      return { parts: [...twinkle(['biene'], 2, 2.2, top - 6, top + gap - 6), ...rise(['muenzeKlein'], 1, 5)] }
    case 'galaxie':
      return { parts: twinkle(['stern', 'violett', 'punkt', 'funke'], 5, 2.6, 4, top + gap - 3), glow: '#c084fc', book: 'glow' }
    case 'piratengold':
      return { parts: [...rise(['muenze', 'muenzeKlein'], 3, 3.8), ...twinkle(['glanz'], 1, 2.4, top - 14, top)] }
    case 'magie':
      return { parts: rise(['violett', 'funke', 'stern'], 4, 3.6), glow: '#a78bfa', book: 'float' }
    case 'signal':
      return { parts: twinkle(['pixelC', 'pixelC', 'blau'], 4, 1.4, 6, top - 4), glow: '#22d3ee', book: 'flicker' }
    case 'stampf':
      return { parts: twinkle(['staubkorn', 'punkt'], 3, 1.8, 0, 6), book: 'rumble' }
    case 'sand':
      return { parts: fall(['sandkorn', 'sandkorn2'], 5, 2.6), glow: '#f5c26b', book: 'glow' }
    case 'neuronen':
      return { parts: twinkle(['blitz', 'funke', 'punktGelb'], 3, 1.5, top - 20, top + 4), glow: '#ff9fc6', book: 'glow' }
    case 'dna':
      return { parts: rise(['rot', 'blau', 'gruen', 'gelb'], 4, 4.6) }
    case 'leuchtfeuer':
      return { parts: twinkle(['glanz', 'funke'], 2, 3, top - 6, top + gap - 6), glow: '#ffd95a', book: 'glow' }
    case 'gluehwuermchen':
      return { parts: twinkle(['gluehwurm', 'gluehwurm', 'spore'], 5, 2.4, 4, top + gap - 3), glow: '#c8f06e' }
    case 'glitzer':
      return { parts: twinkle(['rosa', 'stern', 'lila', 'funke'], 5, 2.2, 4, top + gap - 3), glow: '#f9a8d4', book: 'glow' }
    case 'sonnenstrahlen':
      return { parts: twinkle(['glanz', 'funke', 'punktGelb'], 4, 2.8, top - 10, top + gap - 3), glow: '#ffb300', book: 'glow' }
    case 'umlauf':
      return { parts: twinkle(['stern', 'mondfunke', 'punkt'], 4, 3, 4, top + gap - 3), glow: '#ffb86b' }
    case 'schach':
      return { parts: twinkle(['schachW', 'punkt'], 2, 3.4, top - 10, top + 2), book: 'wobble' }
    case 'pizzaduft':
      return { parts: rise(['dampf', 'rauchKlein'], 2, 3.8, gap + 2), glow: '#ffb35c' }
    case 'schneemann':
      return { parts: [...fall(['flocke', 'flocke'], 3, 4.2), ...twinkle(['schnee'], 2, 3, top - 8, top + gap - 4)], glow: '#e0f4ff' }
    case 'fledermaus':
      return { parts: rise(['fledermaus'], 2, 5.4, gap + 6), glow: '#ff4d6d' }
    case 'quaken':
      return { parts: [...twinkle(['fliege'], 1, 2, top + 2, top + gap - 6), ...rise(['blase', 'blaseKlein'], 2, 3.6, gap + 4, top - 10)] }
    case 'puls':
      return { parts: [...twinkle(['kreuz'], 2, 2.4, top - 14, top + 2), ...rise(['herz'], 1, 4.4)], glow: '#ff6e6e' }
    case 'farben':
      return { parts: fall(['tropfenRot', 'tropfenBlau', 'tropfenGelb'], 3, 3.2) }
    // ---- Schritt 95c: 25 neue Bücher ----
    case 'knochen':
      return { parts: rise(['knochen'], 2, 4.6), book: 'rumble' }
    case 'zellen':
      return { parts: rise(['zelle', 'gblaseKlein'], 3, 4.2, gap + 4, top - 14), glow: '#5fd0f0', book: 'glow' }
    case 'kaffeebohnen':
      return { parts: [...rise(['dampf'], 1, 3.4, gap + 2), ...fall(['bohne'], 2, 5)] }
    case 'kompassnadel':
      return { parts: [{ sprite: 'nadel', x: bw / 2, y: top, motion: 'spin', dur: 4.5, delay: 0 }, ...twinkle(['funke'], 1, 2.8, top - 16, top)] }
    case 'kranich':
      return { parts: rise(['kranich'], 1, 6.5, gap + 6), book: 'float' }
    case 'watscheln':
      return { parts: fall(['flocke', 'schnee'], 3, 5.2), book: 'wobble' }
    case 'fuchsfeuer':
      return { parts: twinkle(['orange', 'funke', 'laub2'], 3, 2.8, top - 12, top + gap - 4), book: 'wobble' }
    case 'federn':
      return { parts: fall(['feder'], 2, 6.4), glow: '#c39cff', book: 'glow' }
    case 'ausbruch':
      return { parts: rise(['glut', 'rauch', 'glut2'], 4, 2.2, gap + 6), glow: '#ff6a1c', book: 'rumble' }
    case 'flosse':
      return { parts: [...twinkle(['welle'], 2, 1.8, 0, 6), ...rise(['blase'], 2, 4)] }
    case 'tiefsee':
      return { parts: rise(['rosa', 'punkt', 'blaseKlein'], 4, 5), glow: '#f472b6', book: 'float' }
    case 'traktorstrahl':
      return { parts: twinkle(['gruen', 'pixelC', 'punkt'], 5, 1.2, top - 4, top + gap - 3), glow: '#8ad470', book: 'float' }
    case 'schwertglanz':
      return { parts: twinkle(['glanz', 'punkt'], 2, 2.6, top - 30, top), glow: '#d9d2e3', book: 'glow' }
    case 'juwelen':
      return { parts: twinkle(['rot', 'blau', 'gruen', 'glanz'], 4, 2.4, top - 20, top + gap - 3), glow: '#ffd95a', book: 'glow' }
    case 'shuriken':
      return { parts: [{ sprite: 'shuriken', x: bw / 2, y: top, motion: 'spin', dur: 1.2, delay: 0 }, ...rise(['rauchKlein'], 1, 3.6, gap + 2)] }
    case 'levelup':
      return { parts: rise(['plus', 'muenzeKlein'], 3, 3.4), glow: '#a3e635', book: 'flicker' }
    case 'bass':
      return { parts: twinkle(['noteB', 'note', 'punkt'], 3, 1.2, top - 4, top + gap - 4), book: 'rumble' }
    case 'spuren':
      return { parts: [...twinkle(['fuss'], 3, 3.2, 0, 4), ...twinkle(['glanz'], 1, 2.6, top - 18, top)] }
    case 'rieseln':
      return { parts: twinkle(['sandkorn2', 'glanz', 'sandkorn'], 4, 2.2, 6, top), glow: '#e0a21a', book: 'glow' }
    case 'streusel':
      return { parts: twinkle(['streuselR', 'streuselB', 'streuselG', 'punktGelb'], 6, 2.4, 4, top + gap - 4) }
    case 'beeren':
      return { parts: fall(['beere'], 2, 5.4), book: 'wobble' }
    case 'bambus':
      return { parts: fall(['bambusblatt', 'blatt2'], 3, 6) }
    case 'kiemen':
      return { parts: rise(['blaseKlein', 'rosa'], 3, 4.2), glow: '#ffa8d2', book: 'float' }
    case 'zen':
      return { parts: [...fall(['bluetenblatt'], 2, 7.5), ...twinkle(['gruen'], 1, 4, top - 10, top)], book: 'float' }
    case 'herzschlag':
      return { parts: [...twinkle(['rot', 'kreuz'], 2, 1, top - 20, top), ...rise(['herz'], 1, 3.6)], glow: '#ff4d6d', book: 'glow' }
    // ---- Schritt 95d: 20 neue Bücher ----
    case 'apfelfall':
      return { parts: fall(['apfel'], 1, 6), book: 'wobble' }
    case 'teeduft':
      return { parts: [...rise(['dampf'], 2, 4), ...twinkle(['teeblatt'], 1, 3.6, top - 8, top + 4)] }
    case 'nieselregen':
      return { parts: fall(['tropfenBlau', 'regen'], 5, 1.8) }
    case 'kerzenschein':
      return { parts: twinkle(['kerzenflamme', 'funke'], 2, 1.4, top - 4, top + 8), glow: '#ffb347', book: 'flicker' }
    case 'strahlen':
      return { parts: twinkle(['glanz', 'stern'], 3, 2, top - 30, top + 4), glow: '#c8f4ff', book: 'glow' }
    case 'saiten':
      return { parts: rise(['note', 'noteB', 'punktGelb'], 3, 3.8), book: 'wobble' }
    case 'koerner':
      return { parts: fall(['korn'], 3, 4.4), book: 'wobble' }
    case 'blitzlicht':
      return { parts: twinkle(['blitzW', 'punkt'], 2, 1.1, top - 10, top + 6), glow: '#ffffff', book: 'flicker' }
    case 'falter':
      return { parts: rise(['falter'], 2, 5.6, gap + 6) }
    case 'moewen':
      return { parts: [...rise(['moewe'], 2, 6, gap + 6), ...twinkle(['welle'], 1, 2, 0, 5)] }
    case 'wuerfelspiel':
      return { parts: twinkle(['quadR', 'quadB', 'quadG', 'quadY'], 4, 1.8, top - 6, top + gap - 4), book: 'rumble' }
    case 'eukalyptus':
      return { parts: [...fall(['eukaBlatt'], 2, 6.5), ...rise(['z'], 1, 5, gap + 3)] }
    case 'schmelzen':
      return { parts: [{ sprite: 'eistropfen', x: bw * 0.4, y: top - 3, motion: 'drip', dur: 4.2, delay: -r() * 4.2, dy: top - 4 }, { sprite: 'pfuetzeKlein', x: bw * 0.5, y: 0, motion: 'pool', dur: 3, delay: 0 }] }
    case 'gemaechlich':
      return { parts: twinkle(['gruen', 'punkt'], 2, 4.4, top - 6, top + 6), book: 'float' }
    case 'fontaene':
      return { parts: rise(['tropfenBlau', 'blaseKlein', 'blase'], 4, 2.4, gap + 4), glow: '#3a8fd9' }
    case 'farbwechsel':
      return { parts: twinkle(['gruen', 'gelb', 'rot', 'blau'], 4, 2.6, top - 16, top + gap - 4), book: 'glow', glow: '#8ad470' }
    case 'goldstaub':
      return { parts: [...twinkle(['sandkorn', 'glanz', 'muenzeKlein'], 4, 2.6, 4, top + 2), ...rise(['funke'], 1, 4)], glow: '#ffd95a', book: 'glow' }
    case 'nebel':
      return { parts: rise(['nebelwolke', 'violett'], 3, 5.4, gap + 3), glow: '#c39cff', book: 'float' }
    case 'lebenslicht':
      return { parts: [...rise(['gruen', 'funke', 'gluehwurm'], 4, 4.6), ...fall(['blatt'], 1, 6)], glow: '#c8f06e', book: 'glow' }
    case 'phoenixfeuer':
      return { parts: rise(['phoenixfeder', 'glut', 'glut2', 'funke'], 5, 2.8, gap + 6), pieces: [{ sx: 0, sy: 0, sw: bw, sh: 10, motion: 'flameUp', dur: 0.8, delay: -r() }], glow: '#ff6a1c', book: 'flicker' }
  }
}
