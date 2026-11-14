/**
 * Pixel-Münze (12×12, Schritt 52) – ersetzt das 🪙-Emoji, das je nach Gerät wie ein Planet aussieht.
 * o = Rand, l = hell, d = dunkel, g = Gold, w = Glanz
 */
const GRID = [
  '....oooo....',
  '..oolllloo..',
  '.olwddddldo.',
  '.owdggggldo.',
  'oldggldggldo',
  'oldggldggldo',
  'oldggldggldo',
  'oldggldggldo',
  '.ollggggldo.',
  '.oddllllddo.',
  '..ooddddoo..',
  '....oooo....',
]
const COLORS: Record<string, string> = { o: '#7a4a12', l: '#ffd95a', d: '#c98a00', g: '#f5b301', w: '#fff6c8' }

const RECTS = GRID.flatMap((row, y) =>
  [...row].flatMap((ch, x) => (COLORS[ch] ? [{ x, y, c: COLORS[ch]! }] : [])),
)

export function Coin(props: { size?: number | string; className?: string; title?: string }) {
  const size = props.size ?? '1em'
  return (
    <svg
      className={`pixel-coin${props.className ? ' ' + props.className : ''}`}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      role={props.title ? 'img' : undefined}
      aria-label={props.title}
      aria-hidden={props.title ? undefined : true}
    >
      {props.title && <title>{props.title}</title>}
      {RECTS.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width="1" height="1" fill={r.c} />
      ))}
    </svg>
  )
}
