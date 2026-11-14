import { bookOf, BOARDS_PER_FLOOR, EFFECT_MIN_MINUTES, effectUnlocked, mixShelf, packShelf, BOARD_INNER, worldInfo, type Collectible, type FocusSessionRecord } from '@karteikarten/core'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useDeckColors } from '../lib/deckColors.ts'
import { useDecks, useSettings } from '../hooks.ts'
import { bookFxPlan, fxSprite } from '../lib/bookFx.ts'
import { worldText as T } from '../lib/worldText.ts'
import { bookUrl, libraryColor, lightsTile, loadTintedBook, plankTile, postTile, shelfBackTile, tintedBook, worldUrl } from '../lib/pixel.ts'

/** Bild eines Buches: einfache Bücher in Stapelfarbe umgefärbt, verrückte Bücher wie gezeichnet */
function useBookUrl(item: Collectible, color: string): string {
  const key = item.book.sprite
  const tint = !!item.book.tint
  const [url, setUrl] = useState(() => (tint ? tintedBook(key, color) : null) ?? bookUrl(key))
  useEffect(() => {
    if (!tint) return setUrl(bookUrl(key))
    const ready = tintedBook(key, color)
    if (ready) return setUrl(ready)
    let alive = true
    void loadTintedBook(key, color).then((u) => alive && setUrl(u))
    return () => {
      alive = false
    }
  }, [key, color, tint])
  return url
}

/** Ein Pixel-Buch (PixelLab). p = Pixelgröße; ohne p gilt die CSS-Variable --p der Szene */
export function PixelBook(props: { item: Collectible; color: string; p?: number; lost?: boolean; title?: string; className?: string }) {
  const url = useBookUrl(props.item, props.color)
  const unit = props.p ? `${props.p}px` : 'var(--p)'
  const { w, h } = props.item.book
  return (
    <img
      src={url}
      alt={props.title ?? props.item.name}
      title={props.title}
      draggable={false}
      className={`pix-book pb-${props.item.book.sprite}${props.lost ? ' lost' : ''}${props.className ? ' ' + props.className : ''}`}
      style={{ width: `calc(${w} * ${unit})`, height: `calc(${h} * ${unit})` }}
    />
  )
}

/** Für Auswahl, Shop und Ergebnis: Buch in fester Größe (Höhe in Pixeln) */
export function CollectibleArt(props: { item: Collectible | undefined; size?: number; lost?: boolean; color?: string; className?: string }) {
  if (!props.item) return null
  const size = props.size ?? 40
  const p = Math.max(1, Math.floor((size / 58) * 2) / 2)
  return (
    <span className="book-box" style={{ height: size, minWidth: size * 0.6 }}>
      <PixelBook item={props.item} color={props.color ?? '#7c4ddb'} p={p} lost={props.lost} className={props.className} />
    </span>
  )
}

/** Effekt eines Buches (Partikel + Bewegung), passend über das Buch gelegt */
export function BookFx(props: { item: Collectible; seed?: number }) {
  const fx = props.item.book.effect
  const plan = useMemo(() => (fx ? bookFxPlan(fx.style, props.item.book.w, props.item.book.h, props.seed ?? 1) : null), [fx, props.item.book.w, props.item.book.h, props.seed])
  if (!plan) return null
  return (
    <span className="book-fx" aria-hidden="true" style={{ width: u(props.item.book.w), height: u(props.item.book.h) }}>
      {plan.parts.map((pt, i) => {
        const sp = fxSprite(pt.sprite)
        const style = {
          left: u(pt.x - sp.w / 2),
          bottom: u(pt.y),
          width: u(sp.w),
          height: u(sp.h),
          animationDuration: `${pt.dur}s`,
          animationDelay: `${pt.delay}s`,
          '--dy': pt.dy ?? 0,
          '--dx': pt.dx ?? 0,
        } as CSSProperties
        return (
          <span key={i} className={`pt m-${pt.motion}`} style={style}>
            <img src={sp.url} alt="" draggable={false} />
          </span>
        )
      })}
      {plan.parts
        .filter((pt) => pt.thread !== undefined)
        .map((pt, i) => (
          // Spinnenfaden: oben fest an der Oberkante des Buches, wird länger, wenn die Spinne sich abseilt
          <i
            key={`th${i}`}
            className="pt-thread"
            style={{
              left: u(pt.x - 0.25),
              bottom: u(props.item.book.h - 1.5 - (pt.thread! + (pt.dy ?? 0))),
              height: u(pt.thread! + (pt.dy ?? 0)),
              animationDuration: `${pt.dur}s`,
              animationDelay: `${pt.delay}s`,
              ['--k0' as string]: pt.thread! / (pt.thread! + (pt.dy ?? 0)),
            } as CSSProperties}
          />
        ))}
      {plan.pieces?.map((pc, i) => (
        <span
          key={`pc${i}`}
          className={`pc m-${pc.motion}`}
          style={{
            left: u(pc.sx),
            bottom: u(props.item.book.h - pc.sy - pc.sh),
            width: u(pc.sw),
            height: u(pc.sh),
            backgroundImage: `url(${bookUrl(props.item.book.sprite)})`,
            backgroundSize: `${u(props.item.book.w)} ${u(props.item.book.h)}`,
            backgroundPosition: `${u(-pc.sx)} ${u(-pc.sy)}`,
            animationDuration: `${pc.dur}s`,
            animationDelay: `${pc.delay}s`,
          }}
        />
      ))}
    </span>
  )
}

/** Buch mit Effekt für Shop und Auswahl: zeigt, wie das Buch im Regal aussieht */
export function BookFxPreview(props: { item: Collectible; size?: number; color?: string }) {
  const size = props.size ?? 64
  // so groß, dass Buch + Lücke darüber in `size` passen
  const p = Math.max(1, Math.floor((size / (props.item.book.h + 12)) * 4) / 4)
  const motion = bookMotion(props.item)
  return (
    <span className="fx-preview pl2" style={{ '--p': `${p}px`, height: size } as CSSProperties}>
      <span className="book-slot">
        <PixelBook item={props.item} color={props.color ?? '#7c4ddb'} className={motion.className} />
        <BookFx item={props.item} />
      </span>
    </span>
  )
}

/** Klasse/Glühfarbe für die Bewegung des Buches selbst */
function bookMotion(item: Collectible): { className?: string; glow?: string } {
  const fx = item.book.effect
  if (!fx) return {}
  const plan = bookFxPlan(fx.style, item.book.w, item.book.h)
  return { className: plan.book ? `ba-${plan.book}` : undefined, glow: plan.glow }
}

/** Wachstum während der Sitzung: erst ein Blatt, dann wird das Buch immer größer */
export function GrowingArt(props: { itemId: string; stage: number; size?: number; color?: string }) {
  const size = props.size ?? 56
  if (props.stage <= 0)
    return (
      <span className="collectible growing" style={{ fontSize: size * 0.6 }} role="img" aria-label="Startet">
        {worldInfo().seed}
      </span>
    )
  const scale = [0, 0.45, 0.65, 0.85, 1][props.stage] ?? 1
  return (
    <span className={`growing stage-${props.stage}`} style={{ display: 'inline-grid', placeItems: 'end center', width: size, height: size }}>
      <span style={{ transform: `scaleY(${scale})`, transformOrigin: '50% 100%', transition: 'transform .6s ease', display: 'inline-block', lineHeight: 0 }}>
        <CollectibleArt item={bookOf(props.itemId)} size={size} color={props.color} />
      </span>
    </span>
  )
}

interface Slot {
  key: string
  s: FocusSessionRecord
}

const BOARD_W = 214
const BOARD_H = 60

const u = (v: number) => `calc(${v} * var(--p))`

/**
 * Welche Bücher eines Fachs zeigen ihren Effekt? Nur Bücher aus Sitzungen ab 30 Minuten.
 * „Alle“ (Standard, Schritt 69): jedes dieser Bücher – vorher hatte von mehreren Büchern einer Sitzung nur das erste
 * seine Animation. „Sparsam“: jede Sorte einmal je Fach, höchstens 4, die besondersten zuerst (schont ältere Handys).
 */
const CALM_PER_BOARD = 4
function effectSlots(board: Slot[], mode: 'all' | 'calm'): Set<string> {
  const unlocked = board.filter((x) => effectUnlocked(x.s) && bookOf(x.s.itemId).book.effect)
  if (mode === 'all') return new Set(unlocked.map((x) => x.key))
  const out = new Set<string>()
  const seen = new Set<string>()
  for (const sl of unlocked.sort((a, b) => bookOf(b.s.itemId).price - bookOf(a.s.itemId).price)) {
    if (out.size >= CALM_PER_BOARD) break
    if (seen.has(sl.s.itemId)) continue
    seen.add(sl.s.itemId)
    out.add(sl.key)
  }
  return out
}

/** Schritt 62: Zettel beim Überfahren eines Buches – aus welcher Sitzung es stammt */
const fmtDay = (t: number) => new Date(t).toLocaleDateString(T.locale, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtTime = (t: number) => new Date(t).toLocaleTimeString(T.locale, { hour: '2-digit', minute: '2-digit' })

interface TipState { sid: string; x: number; y: number; below: boolean }

function SessionTip(props: { s: FocusSessionRecord; deckName: string | null; tip: TipState }) {
  const { s, tip } = props
  const item = bookOf(s.itemId)
  const lost = s.status === 'lost'
  const books = lost ? 1 : Math.max(1, s.books ?? 1)
  const where = s.mode === 'deck' ? (props.deckName ?? T.deckDeleted) : props.deckName ? `${T.timer} · ${props.deckName}` : T.freeTimer
  return createPortal(
    <div className={`session-tip${tip.below ? ' below' : ''}`} role="tooltip" style={{ left: tip.x, top: tip.y }}>
      <b className="st-title">{T.sessionOf(fmtDay(s.endedAt))}</b>
      <span className="st-line">{T.timeRange(fmtTime(s.startedAt), fmtTime(s.endedAt))} · {where}</span>
      <span className="st-line">{s.minutes} min · {T.cards(s.cards)}{lost ? ` · ${T.aborted}` : ` · ${T.books(books)}`}{s.coins ? ` · ${T.coins(s.coins)}` : ''}</span>
      <span className="st-book">{item.name}{item.book.effect ? (effectUnlocked(s) ? ` · ${T.effectOn}` : ` · ${T.effectFrom(EFFECT_MIN_MINUTES)}`) : ''}</span>
    </div>,
    document.body,
  )
}

/** Haufen der heruntergefallenen Bücher am Boden: liegend gestapelt, wächst nach oben und zur Seite */
function LostPile(props: { slots: Slot[] }) {
  const n = props.slots.length
  if (!n) return null
  const S = 0.85 // Bücher im Haufen etwas kleiner
  const base = Math.max(1, Math.ceil((Math.sqrt(8 * n + 1) - 1) / 2)) // so viele liegen in der untersten Reihe
  const L = 54 * S
  const T = 17 * S
  const placed: { sl: Slot; x: number; y: number; rot: number }[] = []
  let k = 0
  for (let row = 0; k < n; row++) {
    const cap = Math.max(1, base - row)
    const inRow = Math.min(cap, n - k)
    const rowW = inRow * (L - 4)
    for (let c = 0; c < inRow; c++, k++) {
      const jitter = ((k * 37) % 7) - 3
      placed.push({ sl: props.slots[k]!, x: (base * (L - 4) - rowW) / 2 + c * (L - 4) + jitter, y: row * (T - 1), rot: ((k * 53) % 5) - 2 })
    }
  }
  const width = base * (L - 4) + 8
  const height = (placed[placed.length - 1]!.y + T + 2)
  return (
    <div className="lib-pile" style={{ width: u(width), height: u(height) }} aria-label={T.fallen(n)}>
      {placed.map(({ sl, x, y, rot }) => {
        const item = bookOf(sl.s.itemId)
        return (
          <span key={sl.key} className="pile-book" data-sid={sl.s.id} style={{ left: u(x), bottom: u(y), width: u(item.book.h * S), height: u(item.book.w * S), rotate: `${rot}deg` }}>
            <img className="lying" src={bookUrl(item.book.sprite)} alt="" draggable={false} style={{ width: u(item.book.w * S), height: u(item.book.h * S) }} />
          </span>
        )
      })}
    </div>
  )
}

/**
 * Bibliothek als Hintergrund der App (Schritt 58): nur der Raum (PixelLab-Bibliothek), ohne Regal –
 * das Regal selbst gibt es nur in der Lernwelt.
 */
export function LibraryBackdrop() {
  return (
    <div className="world-scene pixel-lib pl2 as-bg lib-backdrop" aria-hidden="true" style={{ '--room': `url(${worldUrl('bibliothek')})` } as CSSProperties}>
      <div className="lib-room" />
    </div>
  )
}

/**
 * Der Wissensturm im gemütlichen Pixel-Look (Grafiken: PixelLab): Bibliothek im Hintergrund, Regal mit Büchern,
 * Leseecke unten, ab dem 2. Regal Turmspitze und Turmfenster. Bücher verändern ihr Fach mit kleinen Effekten.
 * Jede Sitzung bringt 1–10 Bücher; ist ein Regal (30 Bücher) voll, wächst darüber das nächste.
 */
export function WorldScene(props: { sessions: FocusSessionRecord[]; variant?: 'card' | 'background' }) {
  const colors = useDeckColors()
  const { settings } = useSettings()
  const { shelfMix, shelfSeed } = settings.focus
  const bg = props.variant === 'background'
  const { decks } = useDecks()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<TipState | null>(null)
  const byId = useMemo(() => new Map(props.sessions.map((s) => [s.id, s])), [props.sessions])
  const showTip = (el: Element | null) => {
    const slot = el?.closest<HTMLElement>('[data-sid]')
    if (!slot) return setTip(null)
    const r = (slot.querySelector('img') ?? slot).getBoundingClientRect()
    const below = r.top < 150
    const half = Math.min(150, window.innerWidth / 2)
    const cx = Math.min(Math.max(r.left + r.width / 2, half), window.innerWidth - half)
    setTip((t) => (t && t.sid === slot.dataset.sid && t.x === cx ? t : { sid: slot.dataset.sid!, x: cx, y: below ? r.bottom + 8 : r.top - 8, below }))
  }
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !tip) return
    const els = wrap.querySelectorAll(`[data-sid="${CSS.escape(tip.sid)}"]`)
    els.forEach((e) => e.classList.add('same-session'))
    wrap.classList.add('hovering')
    return () => {
      els.forEach((e) => e.classList.remove('same-session'))
      wrap.classList.remove('hovering')
    }
  }, [tip?.sid])
  useEffect(() => {
    if (!tip) return
    const close = () => setTip(null)
    const outside = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.('[data-sid]')) close() }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('pointerdown', outside)
    }
  }, [tip])
  const onOver = (e: RPointerEvent) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') showTip(e.target as Element) }
  const { floors, layout, lost } = useMemo(() => {
    const ordered: Slot[] = []
    const lost: Slot[] = []
    for (const s of [...props.sessions].sort((a, b) => a.endedAt - b.endedAt)) {
      // Abgebrochene Sitzungen kommen nicht ins Regal, sondern auf den Bücherhaufen am Boden
      if (s.status === 'lost') {
        lost.push({ key: `${s.id}:0`, s })
        continue
      }
      const n = Math.max(1, s.books ?? 1)
      for (let k = 0; k < n; k++) ordered.push({ key: `${s.id}:${k}`, s })
    }
    // Mischen: gleiche Bücher (Sorte + Farbe) sollen nicht als Block nebeneinander stehen
    const slots = shelfMix
      ? mixShelf(ordered, (sl) => `${sl.s.itemId}|${sl.s.status}|${bookOf(sl.s.itemId).book.tint ? (sl.s.deckId && colors.get(sl.s.deckId)) || libraryColor(sl.s.id) : ''}`, shelfSeed)
      : ordered
    // Bretter nach Breite füllen (Schritt 58): so viele Bücher, wie aufs Brett passen – keine großen Lücken rechts
    const pack = packShelf(slots.map((sl) => bookOf(sl.s.itemId).book.w))
    const floors: Slot[][][] = Array.from({ length: pack.floors }, () => Array.from({ length: BOARDS_PER_FLOOR }, () => []))
    pack.boards.forEach((idx, b) => {
      floors[Math.floor(b / BOARDS_PER_FLOOR)]![b % BOARDS_PER_FLOOR] = idx.map((i) => slots[i]!)
    })
    const current = pack.boards.length - 1
    const lastUsed = pack.boards[current]!.reduce((a, i) => a + bookOf(slots[i]!.s.itemId).book.w + 1, 0)
    return { floors, layout: { floors: pack.floors, current, roomForGap: BOARD_INNER - lastUsed >= 15 }, lost }
  }, [props.sessions, shelfMix, shelfSeed, colors])
  const tower = layout.floors > 1
  const order = floors.map((f, i) => ({ f, i })).reverse()
  const shown = bg ? order.slice(0, 2) : order
  const vars = {
    '--room': `url(${worldUrl('bibliothek')})`,
    '--regal': `url(${worldUrl('regal-wand')})`,
    '--regal-dach': `url(${worldUrl('regal-dach')})`,
    '--shelfback': `url(${shelfBackTile()})`,
    '--plank': `url(${plankTile()})`,
    '--post': `url(${postTile()})`,
    '--lights': `url(${lightsTile()})`,
    '--bw': BOARD_W,
    '--bh': BOARD_H,
  } as CSSProperties
  return (
    <div className={`world-scene pixel-lib pl2 ${bg ? 'as-bg' : 'as-card'}${tower ? ' is-tower' : ' only-shelf'}`} aria-hidden={bg ? true : undefined} style={vars}>
      <div className="lib-room" />
      <div className="lib-dust" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ left: `${8 + ((i * 37) % 84)}%`, animationDelay: `${-i * 2.3}s`, animationDuration: `${11 + (i % 4) * 3}s` }} />
        ))}
      </div>
      <div className="lib-wrap" ref={wrapRef} onPointerOver={bg ? undefined : onOver} onPointerLeave={bg ? undefined : () => setTip(null)} onClick={bg ? undefined : (e) => showTip(e.target as Element)}>
        {shown.map(({ f, i }) => (
          <section key={i} className={`lib-floor${i === layout.floors - 1 ? ' top' : ''}`} aria-label={tower ? T.floor(i + 1) : T.shelf}>
            <div className="lib-shelf">
              {f.map((board, bi) => (
                <div key={bi} className="lib-board">
                  <div className={`lib-books${i * BOARDS_PER_FLOOR + bi < layout.current ? ' full' : ''}`}>
                    {(() => {
                      const fx = effectSlots(board, settings.focus.shelfFx)
                      return board.map(({ key, s }, bi2) => {
                        const item = bookOf(s.itemId)
                        const color = (s.deckId && colors.get(s.deckId)) || libraryColor(s.id)
                        const on = fx.has(key) && !bg
                        const m = on ? bookMotion(item) : {}
                        return (
                          <span key={key} className="book-slot" data-sid={bg ? undefined : s.id} style={m.glow ? ({ '--glow': m.glow } as CSSProperties) : undefined}>
                            <PixelBook item={item} color={color} title={undefined} className={`on-shelf${m.className ? ' ' + m.className : ''}`} />
                            {on && <BookFx item={item} seed={bi2 + 7 * bi + 31 * i} />}
                          </span>
                        )
                      })
                    })()}
                  </div>
                </div>
              ))}
            </div>
            {tower && !bg && <span className="floor-no">{i + 1}</span>}
          </section>
        ))}
        {!bg && (
          <div className="lib-ground">
            <LostPile slots={lost} />
            <img className="lib-nook" src={worldUrl('leseecke')} alt="" draggable={false} />
          </div>
        )}
      </div>
      <div className="lib-glow" aria-hidden="true" />
      {tip && byId.get(tip.sid) && <SessionTip s={byId.get(tip.sid)!} tip={tip} deckName={(() => { const id = byId.get(tip.sid)!.deckId; return id ? (decks.find((d) => d.id === id)?.name ?? null) : null })()} />}
    </div>
  )
}
