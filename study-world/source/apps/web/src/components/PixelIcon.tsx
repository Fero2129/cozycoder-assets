/**
 * Pixel-Symbole für die Lernwelt (Schritt 58): im gleichen Stil wie Bücher, Münze und Holz-Schilder,
 * statt bunter Emojis. Jedes Symbol ist ein kleines Pixel-Raster, gezeichnet als SVG (scharf in jeder Größe).
 */
const PAL: Record<string, string> = {
  k: '#2a160a', // dunkle Kontur
  b: '#a0622d', B: '#6b3f22', l: '#d9954e', // Holz/Leder
  y: '#ffd95a', Y: '#e0a21a', w: '#fff6c8', // Gold, Glanz
  o: '#ff7a1c', O: '#d9430d', // Flamme
  e: '#f1e2c0', E: '#cdb88a', // Pergament
  i: '#4aa3e8', I: '#24609c', // Iris
  m: '#d7d0e2', M: '#8d8499', // Metall
  r: '#d8384e', R: '#8c2f39', g: '#5fb85a', v: '#9b6be0', // Farbtupfer, roter Einband
}

const ICONS: Record<string, string[]> = {
  // Bücherregal (Zugang zur Lernwelt auf der Startseite)
  regal: [
    'kkkkkkkkkkkk',
    'kbbbbbbbbbbk',
    'kbkrkkykkkbk',
    'kbgrkiykvkbk',
    'kbgrkiyrvgbk',
    'kbBBBBBBBBbk',
    'kbkkekkkgkbk',
    'kbrkeviygkbk',
    'kbrievkygrbk',
    'kbBBBBBBBBbk',
    'kbbbbbbbbbbk',
    'kk........kk',
  ],
  // Einkaufsbeutel mit Münze
  shop: [
    '....kkk....',
    '...k...k...',
    '...k...k...',
    '.kkkkkkkkk.',
    'kllllllllBk',
    'klbbbbbbbBk',
    'klbbyyybbBk',
    'klbbyYybbBk',
    'klbbyyybbBk',
    'klbbbbbbbBk',
    '.kkkkkkkkk.',
  ],
  // zwei gekreuzte Pfeile (Mischen)
  mischen: [
    '...........k..',
    '.kkk....kkkyk.',
    'kyyyk..kyyyyyk',
    '.kkkykkykkkyk.',
    '....kyyk...k..',
    '....kyyk...k..',
    '.kkkykkykkkyk.',
    'kyyyk..kyyyyyk',
    '.kkk....kkkyk.',
    '...........k..',
  ],
  // Auge
  vorschau: [
    '...kkkkk...',
    '.kkwwwwwkk.',
    'kwwwiiiwwwk',
    'kwwiIkIiwwk',
    'kwwiIkIiwwk',
    'kwwwiiiwwwk',
    '.kkwwwwwkk.',
    '...kkkkk...',
  ],
  // Flamme
  serie: [
    '....k....',
    '...kok...',
    '...koOk..',
    '..koyok.k',
    '.koyyyokk',
    '.koywyyok',
    'koyywwyok',
    'koywwwyok',
    'kooywwyok',
    '.kooyyok.',
    '..kkkkk..',
  ],
  // Zahnrad
  einstellungen: [
    '....kkk....',
    '.kk.kmk.kk.',
    '.kmkkmkkmk.',
    '..kmmmmmk..',
    'kkkmMkMmkkk',
    'kmmmk.kmmmk',
    'kkkmMkMmkkk',
    '..kmmmmmk..',
    '.kmkkmkkmk.',
    '.kk.kmk.kk.',
    '....kkk....',
  ],
  // Buch mit Goldprägung
  buch: [
    '.kkkkkkkk..',
    'kRRRRRRRRk.',
    'kRyyyyyyRke',
    'kRRRRRRRRke',
    'kRRyyyyRRke',
    'kRRRRRRRRke',
    'kRRRRRRRRke',
    'kRyyyyyyRke',
    'kRRRRRRRRke',
    '.kkkkkkkkke',
    '..eeeeeeee.',
  ],
  // Farbpalette
  designs: [
    '..kkkkkk...',
    '.keeeeeekk.',
    'keerekeebek',
    'keeeeeeeeek',
    'keyekkeegek',
    'keeek.keeek',
    '.keeekkeevk',
    '..kkeeeeek.',
    '....kkkkk..',
  ],
}

export type PixelIconName = keyof typeof ICONS

export function PixelIcon(props: { name: PixelIconName; size?: number; title?: string; className?: string }) {
  const grid = ICONS[props.name]!
  const h = grid.length
  const w = Math.max(...grid.map((r) => r.length))
  const scale = (props.size ?? 22) / Math.max(w, h)
  return (
    <svg
      className={`pixel-icon${props.className ? ' ' + props.className : ''}`}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={props.title ? 'img' : undefined}
      aria-label={props.title}
      aria-hidden={props.title ? undefined : true}
    >
      {props.title && <title>{props.title}</title>}
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) => (PAL[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PAL[ch]} /> : null)),
      )}
    </svg>
  )
}
