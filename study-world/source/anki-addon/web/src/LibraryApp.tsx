import {
  bookOf,
  booksFor,
  collectible,
  EFFECT_MIN_MINUTES,
  effectUnlocked,
  itemsOfWorld,
  ownsItem,
  packShelf,
  SHOP_THEMES,
  TIMER_CHOICES,
  type FocusSettings,
} from '@karteikarten/core'
import { useEffect, useMemo, useRef, useState } from 'react'
// Bausteine der Web-App – dieselben Grafiken, Effekte und Regal-Logik
import { Coin } from '../../../apps/web/src/components/Coin.tsx'
import { PixelIcon } from '../../../apps/web/src/components/PixelIcon.tsx'
import { BookFxPreview, CollectibleArt, PixelBook, WorldScene } from '../../../apps/web/src/components/World.tsx'
import { fxSprite } from '../../../apps/web/src/lib/bookFx.ts'
import { worldUrl } from '../../../apps/web/src/lib/pixel.ts'
import { builtinImageUrl } from '../../../apps/web/src/lib/themeImages.ts'
import doorSheet from '../../../apps/web/src/assets/lernwelt/tuer/tuer-oeffnen.png'
import { LANGS, t, themeName } from './i18n/index.ts'
import { TILE_COLORS } from './shims/deckColors.ts'
import { send, useLw, type LwState } from './store.ts'
import { StreakBoard } from './StreakBoard.tsx'
import { Toasts } from './Toasts.tsx'

const DOOR_MS = 2700

function LibraryDoor(props: { onDone: () => void }) {
  const done = useRef(props.onDone)
  done.current = props.onDone
  useEffect(() => {
    const tm = setTimeout(() => done.current(), DOOR_MS)
    return () => clearTimeout(tm)
  }, [])
  return (
    <div className="lib-door" aria-hidden="true" onClick={props.onDone}>
      <div className="door-stage">
        <span className="door-frames" style={{ backgroundImage: `url(${doorSheet})` }} />
      </div>
    </div>
  )
}

/** Die Lernwelt im Anki-Fenster: Bibliothek, Bücherladen, Einstellungen, Start und Ergebnis einer Fokus-Sitzung */
export function LibraryApp() {
  const s = useLw()
  const [tab, setTab] = useState<'welt' | 'shop'>(s.tab)
  const [panel, setPanel] = useState<null | 'einstellungen' | 'streak'>(null)
  const [startFor, setStartFor] = useState<string | null | undefined>(undefined)
  const [door, setDoor] = useState(false)
  const lastVisit = useRef(-1)

  // Jedes Öffnen des Fensters: wieder durch die Tür (außer direkt zum Start/Ergebnis)
  useEffect(() => {
    if (!s.ready || s.visit === lastVisit.current) return
    lastVisit.current = s.visit
    setTab(s.tab)
    setPanel(null)
    const motion = !s.reduceMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches
    setDoor(motion && s.tab === 'welt' && !s.openStart && !s.result)
    setStartFor(s.openStart ? s.openStart : undefined)
  }, [s.ready, s.visit, s.tab, s.openStart, s.result, s.reduceMotion])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (startFor !== undefined) setStartFor(undefined)
      else if (panel) setPanel(null)
      else if (tab === 'shop') setTab('welt')
      else send('close')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [panel, startFor, tab])

  const f = s.focus
  const setFocus = (patch: Partial<FocusSettings>) => send('settings', { focus: { ...f, ...patch } })
  const sessions = s.sessions
  const purchased = useMemo(() => new Set(s.purchased), [s.purchased])
  const grown = sessions.filter((x) => x.status === 'grown')
  const minutes = grown.reduce((a, x) => a + x.minutes, 0)
  const grownBooks = grown.reduce((a, x) => a + (x.books ?? 1), 0)
  const layout = useMemo(() => packShelf(grown.flatMap((x) => Array(x.books ?? 1).fill(bookOf(x.itemId).book.w))), [grown])
  const frame = useRef<HTMLDivElement>(null)
  useEffect(() => {
    frame.current?.scrollTo({ top: 0 })
  }, [layout.floors])

  const shuffle = () => setFocus({ shelfSeed: (f.shelfSeed % 100000) + 1 + Math.floor(Math.random() * 1000) })
  const title = layout.floors > 1 ? t('title_tower', { n: layout.floors }) : t('title_shelf')
  const pile = sessions.length - grown.length
  const stats = [
    t('stat_books', { n: grownBooks }),
    minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`,
    pile ? t('stat_pile', { n: pile }) : '',
    grownBooks > 0 ? (layout.left === 0 ? t('stat_full') : t('stat_left', { n: layout.left, f: layout.floors + 1 })) : '',
  ].filter(Boolean).join(' · ')

  if (!s.ready) return <main className="lib-immersive" style={{ ['--room' as string]: `url(${worldUrl('bibliothek')})` }} />

  return (
    <main className={`lib-immersive${tab === 'shop' ? ' is-shop' : ''}${door ? ' entering' : ''}`} style={{ ['--room' as string]: `url(${worldUrl('bibliothek')})` }}>
      {door && <LibraryDoor onDone={() => setDoor(false)} />}
      <header className="lib-hud-top">
        <button className="pix-btn" onClick={() => (tab === 'shop' ? setTab('welt') : send('close'))} aria-label={tab === 'shop' ? t('back_aria') : t('close_aria')}>
          ← {tab === 'shop' ? t('back_library') : t('close')}
        </button>
        <h1 className="pix-sign">{tab === 'shop' ? <><PixelIcon name="shop" size={18} /> {t('bookshop')}</> : title}</h1>
        <span className="pix-plaque" title={t('plaque_title')}>
          <span className="pix-ico-text" title={t('days_row', { n: s.streak.days })}><PixelIcon name="serie" size={16} /> {s.streak.days}</span>
          <span className="coin-badge" title={t('coins_title')}><Coin /> {s.balance}</span>
        </span>
      </header>

      {tab === 'welt' ? (
        <>
          <div className="lib-scroll" ref={frame}>
            <WorldScene sessions={sessions} />
            {sessions.length === 0 && <p className="pix-note scene-empty">{t('empty_note')}</p>}
          </div>
          <StreakBoard k={s.streak} onOpen={() => setPanel(panel === 'streak' ? null : 'streak')} />
          <nav className="lib-hud-bottom" aria-label={t('menu_aria')}>
            <span className="pix-bar">
              {s.active ? (
                <>
                  <span className="pix-stat">{t('session_running')}{s.active.lock ? ` · ${t('apps_locked')}` : ''}</span>
                  <button className="pix-btn" onClick={() => send('study')}>{t('continue')}</button>
                  <button className="pix-btn" onClick={() => send('giveup')}>{t('giveup')}</button>
                </>
              ) : (
                <button className="pix-btn on lw-start" onClick={() => setStartFor(s.currentDeck)}><PixelIcon name="buch" /> {t('focus_session')}</button>
              )}
              <button className="pix-btn" onClick={() => setTab('shop')}><PixelIcon name="shop" /> {t('shop')}</button>
              {f.shelfMix && <button className="pix-btn" onClick={shuffle} title={t('shuffle_title')}><PixelIcon name="mischen" /> {t('shuffle')}</button>}
              <button className={`pix-btn${panel === 'streak' ? ' on' : ''}`} onClick={() => setPanel(panel === 'streak' ? null : 'streak')}><PixelIcon name="serie" /> {t('streak')}</button>
              <span className="pix-stat small">{stats}</span>
            </span>
            <button className={`settings-book${panel === 'einstellungen' ? ' on' : ''}`} onClick={() => setPanel(panel === 'einstellungen' ? null : 'einstellungen')} aria-label={t('settings_aria')} title={t('settings')}>
              <SettingsBook />
              <span className="settings-book-label">{t('settings')}</span>
            </button>
          </nav>

          {panel && (
            <div className="lib-panel-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
              <section className="pix-panel" role="dialog" aria-modal="true" aria-label={panel === 'einstellungen' ? t('settings') : t('streak_coins')}>
                <button className="pix-close" onClick={() => setPanel(null)} aria-label={t('close')}>×</button>
                {panel === 'einstellungen' ? <SettingsPanel s={s} setFocus={setFocus} /> : <StreakPanel s={s} />}
              </section>
            </div>
          )}
        </>
      ) : (
        <Shop s={s} purchased={purchased} />
      )}

      {startFor !== undefined && !s.active && <FocusSetup s={s} deckId={startFor} purchased={purchased} onClose={() => setStartFor(undefined)} onShop={() => { setStartFor(undefined); setTab('shop') }} />}
      {s.result && <FocusResult s={s} />}
      <Toasts />
    </main>
  )
}

/* ---------- Einstellungen ---------- */

function Seg<T extends string | number | boolean>(props: { label: string; value: T; options: [T, string][]; onPick: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="pix-seg" role="group" aria-label={props.label}>
      {props.options.map(([v, l]) => (
        <button key={String(v)} type="button" disabled={props.disabled} className={`pix-btn small${props.value === v ? ' on' : ''}`} aria-pressed={props.value === v} onClick={() => props.onPick(v)}>{l}</button>
      ))}
    </div>
  )
}

function SettingsPanel(props: { s: LwState; setFocus: (p: Partial<FocusSettings>) => void }) {
  const { s, setFocus } = props
  const f = s.focus
  const [allow, setAllow] = useState(s.lock.allow.join('\n'))
  useEffect(() => setAllow(s.lock.allow.join('\n')), [s.lock.allow])
  const tops = s.decks.filter((d) => d.depth === 0)
  const saveAllow = () => send('lock', { allow: allow.split('\n').map((x) => x.trim()).filter(Boolean) })
  return (
    <>
      <h2><PixelIcon name="einstellungen" size={22} /> {t('settings')}</h2>
      <div className="pix-rows">
        <div className="pix-row">
          <span>{t('language')}</span>
          <select className="lw-select" value={s.langSetting ?? 'auto'} onChange={(e) => send('lang', { lang: e.target.value })}>
            <option value="auto">{t('lang_auto')}</option>
            {LANGS.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
          </select>
        </div>
        <div className="pix-row">
          <span>{t('books_on_shelf')}</span>
          <Seg label={t('books_on_shelf')} value={f.shelfMix} options={[[true, t('mixed')], [false, t('by_session')]]} onPick={(v) => setFocus({ shelfMix: v })} />
        </div>
        <div className="pix-row">
          <span>{t('effects_on_shelf')}</span>
          <Seg label={t('effects_on_shelf')} value={f.shelfFx} options={[['all', t('all_books')], ['calm', t('calm')]]} onPick={(v) => setFocus({ shelfFx: v })} />
        </div>
        <div className="pix-row">
          <span>{t('grace_label')}</span>
          <Seg label={t('grace_label')} value={f.graceSeconds} options={[0, 5, 15, 30].map((g) => [g, g === 0 ? t('strict') : `${g} s`] as [number, string])} onPick={(v) => setFocus({ graceSeconds: v })} />
        </div>
        <div className="pix-row">
          <span>{t('lock_label')}</span>
          <Seg label={t('lock_label')} value={s.lock.enabled} disabled={!s.lock.available} options={[[true, t('on')], [false, t('off')]]} onPick={(v) => send('lock', { enabled: v })} />
          <span className="lw-hint">{s.lock.note}</span>
        </div>
        <div className="pix-row">
          <span>{t('allow_label')}</span>
          <textarea className="lw-allow" rows={4} value={allow} onChange={(e) => setAllow(e.target.value)} onBlur={saveAllow} spellCheck={false} placeholder={s.lock.platform === 'win' ? t('allow_ph_win') : t('allow_ph_mac')} />
          <span className="lw-hint">{t('allow_hint')}</span>
        </div>
        {tops.length > 0 && (
          <div className="pix-row">
            <span>{t('deck_colors')}</span>
            <div className="lw-colors">
              {tops.map((d) => (
                <div key={d.id} className="lw-color-row">
                  <span className="lw-deckname" title={d.name}>{d.name}</span>
                  <span className="lw-swatches">
                    {TILE_COLORS.map((c) => (
                      <button key={c} type="button" className={`lw-swatch${d.color === c ? ' on' : ''}`} style={{ background: c }} aria-label={c} onClick={() => send('deckcolor', { id: d.id, color: c })} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="small">{t('settings_note', { m: EFFECT_MIN_MINUTES })}</p>
    </>
  )
}

function StreakPanel(props: { s: LwState }) {
  const k = props.s.streak
  const left = k.threshold - k.todayReviews
  return (
    <>
      <h2><PixelIcon name="serie" size={22} /> {t('streak_coins')}</h2>
      <p>
        <strong>{t('days_row', { n: k.days })}</strong>
        {' · '}
        {k.todayGot ? t('today_got', { n: k.todayCoins }) : left <= 0 ? t('bonus_soon') : t('reviews_left', { n: left, c: k.todayCoins })} <Coin />
      </p>
      <p className="small">
        {t('streak_explain', { t: k.threshold })} {k.next ? t('next_milestone', { d: k.next.days, c: k.next.coins }) : ''} {t('streak_total', { c: k.streakCoins })}
      </p>
    </>
  )
}

/* ---------- Bücherladen ---------- */

function Shop(props: { s: LwState; purchased: Set<string> }) {
  const { s, purchased } = props
  const [ask, setAsk] = useState<{ id: string; name: string; price: number } | null>(null)
  return (
    <div className="lib-scroll lib-shop">
      <section className="pix-panel shop-panel">
        <h2><PixelIcon name="buch" size={22} /> {t('crazy_books')}</h2>
        <p className="muted small">{t('books_intro', { m: EFFECT_MIN_MINUTES })}</p>
        <div className="shop-grid">
          {[...itemsOfWorld()].sort((a, b) => a.price - b.price).map((i) => {
            const has = ownsItem(i.id, purchased)
            return (
              <div key={i.id} className={`shop-tile${has ? ' owned' : ''}`}>
                <span className="shop-book-row"><BookFxPreview item={i} size={104} /></span>
                <strong className="small">{i.name}</strong>
                {i.book.tagline && <span className="muted small shop-tagline">{i.book.tagline}</span>}
                {has ? (
                  <span className="muted small">{i.price === 0 ? t('from_start') : t('owned')}</span>
                ) : (
                  <button type="button" className={`btn small${s.balance >= i.price ? ' primary' : ''}`} onClick={() => setAsk({ id: i.id, name: i.name, price: i.price })} aria-label={t('buy_aria', { n: i.name, p: i.price })}>
                    <Coin /> {i.price}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section className="pix-panel shop-panel">
        <h2><PixelIcon name="designs" size={22} /> {t('designs_title')}</h2>
        <p className="muted small">{t('designs_intro')}</p>
        <div className="shop-grid wide">
          {SHOP_THEMES.filter((th) => th.background.kind === 'image').sort((a, b) => a.price - b.price).map((th) => {
            const id = `theme:${th.id}`
            const has = purchased.has(id)
            const active = s.theme === th.id
            const name = themeName(th.id, th.name)
            return (
              <div key={th.id} className={`shop-tile${has ? ' owned' : ''}${active ? ' lw-active' : ''}`}>
                <span className="lw-theme-swatch" style={{ backgroundImage: `url(${builtinImageUrl(th.background.image)})` }} />
                <strong className="small">{name}</strong>
                {has ? (
                  active ? (
                    <button type="button" className="btn small" onClick={() => send('theme', { id: null })}>{t('active_off')}</button>
                  ) : (
                    <button type="button" className="btn small primary" onClick={() => send('theme', { id: th.id, image: th.background.image.slice(4), dim: th.background.dim, name })}>{t('use')}</button>
                  )
                ) : (
                  <button type="button" className={`btn small${s.balance >= th.price ? ' primary' : ''}`} onClick={() => setAsk({ id, name: t('design_name', { n: name }), price: th.price })} aria-label={t('buy_aria', { n: name, p: th.price })}>
                    <Coin /> {th.price}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>
      <p className="muted small center">{t('coins_footer')}</p>
      {ask && (
        <div className="modal-backdrop" role="presentation" onClick={() => setAsk(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {s.balance >= ask.price ? (
              <>
                <h2>{t('buy_q', { n: ask.name })}</h2>
                <p>{t('buy_cost', { p: ask.price, r: s.balance - ask.price })}</p>
                <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn ghost" onClick={() => setAsk(null)}>{t('cancel')}</button>
                  <button className="btn primary" autoFocus onClick={() => { send('buy', { id: ask.id, price: ask.price, name: ask.name }); setAsk(null) }}>{t('buy')}</button>
                </div>
              </>
            ) : (
              <>
                <h2>{ask.name}</h2>
                <p>{t('missing', { n: ask.price - s.balance })}</p>
                <div className="btn-row" style={{ justifyContent: 'flex-end' }}><button className="btn primary" autoFocus onClick={() => setAsk(null)}>{t('ok')}</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Start einer Fokus-Sitzung ---------- */

function FocusSetup(props: { s: LwState; deckId: string | null; purchased: Set<string>; onClose: () => void; onShop: () => void }) {
  const { s, purchased } = props
  const f = s.focus
  const owned = itemsOfWorld().filter((i) => ownsItem(i.id, purchased))
  const [deckId, setDeckId] = useState<string>(props.deckId && s.decks.some((d) => d.id === props.deckId) ? props.deckId : '')
  const deck = s.decks.find((d) => d.id === deckId)
  const [itemId, setItemId] = useState(f.item.tower && ownsItem(f.item.tower, purchased) ? f.item.tower : owned[0]?.id ?? '')
  const [minutes, setMinutes] = useState(f.timerMinutes)
  const [lock, setLock] = useState(s.lock.enabled && s.lock.available)
  const color = deck?.color
  const it = collectible(itemId)
  const start = () => {
    if (!itemId) return
    send('start', { mode: 'timer', deckId: deckId || null, minutes, itemId, lock })
  }
  const n = booksFor('timer', minutes, 0)
  return (
    <div className="modal-backdrop" role="presentation" onClick={props.onClose}>
      <div className="modal focus-setup" role="dialog" aria-modal="true" aria-label={t('focus_session')} onClick={(e) => e.stopPropagation()}>
        <h2>{t('setup_title')}</h2>
        <label className="lw-field">
          <span className="muted small">{t('setup_deck')}</span>
          <select value={deckId} onChange={(e) => setDeckId(e.target.value)}>
            <option value="">{t('no_deck')}</option>
            {s.decks.map((d) => (
              <option key={d.id} value={d.id}>{' '.repeat(d.depth)}{d.name.split('::').pop()}{d.due ? ` · ${d.due}` : ''}</option>
            ))}
          </select>
        </label>
        <p className="muted small">{t('setup_intro')} {lock ? t('setup_lock_on') : t('setup_grace', { s: f.graceSeconds })}</p>

        <div className="item-picker" role="radiogroup" aria-label={t('which_book')}>
          {itemsOfWorld().map((i) => {
            const has = ownsItem(i.id, purchased)
            return (
              <button key={i.id} type="button" role="radio" aria-checked={itemId === i.id} className={`item-tile${itemId === i.id ? ' on' : ''}${has ? '' : ' locked'}`} onClick={() => (has ? setItemId(i.id) : props.onShop())} title={has ? i.name : t('in_shop_for', { n: i.name, p: i.price })}>
                <CollectibleArt item={i} size={62} color={color} />
                <span className="small">{i.name}</span>
                {!has && <span className="price small">🔒 {i.price}</span>}
              </button>
            )
          })}
        </div>

        <div className="seg wrap" role="group" aria-label={t('duration')}>
          <span className="muted small lw-seg-label">{t('duration')}</span>
          {TIMER_CHOICES.map((m) => (
            <button key={m} type="button" className={`btn small${minutes === m ? ' primary' : ''}`} aria-pressed={minutes === m} onClick={() => setMinutes(m)}>{m} {t('min')}</button>
          ))}
        </div>

        <label className={`lw-lock${s.lock.available ? '' : ' off'}`}>
          <input type="checkbox" checked={lock} disabled={!s.lock.available} onChange={(e) => setLock(e.target.checked)} />
          <span>
            <strong>{t('lock_label')}</strong>
            <span className="muted small"> {s.lock.available ? `${t('lock_desc')}${s.lock.allow.length ? ` (${t('allowed', { l: s.lock.allow.join(', ') })})` : ''}.` : s.lock.note}</span>
          </span>
        </label>

        <div className="row-between">
          <span className="muted small">
            {it ? <>{t('reward')}: {t('stat_books', { n })} · {lock ? <>{t('reward_coins', { m: minutes })} <Coin /></> : t('reward_nocoins')}{it.book.effect ? ` · ${minutes >= EFFECT_MIN_MINUTES ? t('with_effect') : t('effect_from', { m: EFFECT_MIN_MINUTES })}` : ''}</> : ''}
          </span>
          <span className="btn-row">
            <button type="button" className="btn ghost" onClick={props.onClose}>{t('cancel')}</button>
            <button type="button" className="btn primary" disabled={!itemId} onClick={start}>{t('start')}</button>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Ergebnis ---------- */

function FocusResult(props: { s: LwState }) {
  const result = props.s.result!
  const r = result.record
  const it = bookOf(r.itemId)
  const grown = r.status === 'grown'
  const color = props.s.decks.find((d) => d.id === r.deckId)?.color
  const books = r.books ?? 1
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`modal focus-result${grown ? ' grown' : ' lost'}`} role="dialog" aria-modal="true">
        <div className="result-art"><CollectibleArt item={it} size={110} lost={!grown} color={color} /></div>
        <h2>{grown ? (books > 1 ? t('res_many', { n: books, b: it.name }) : t('res_grown', { b: it.name })) : t('res_lost', { b: it.name })}{grown ? ' 🎉' : ''}</h2>
        {grown ? (
          <p>
            {r.minutes} {t('min')} · {t('res_cards', { n: r.cards })} · {r.coins > 0 ? <strong>+{r.coins} <Coin /></strong> : <span className="small">{t('res_nocoins')}</span>}
            {it.book.effect && <span className="small fx-note"> · {effectUnlocked(r) ? t('res_effect') : t('res_effect_later', { m: EFFECT_MIN_MINUTES })}</span>}
          </p>
        ) : (
          <p className="muted">{result.reason ? `${result.reason} ` : ''}{t('res_lost_text')}</p>
        )}
        <div className="btn-row center">
          <button type="button" className="btn" onClick={() => send('dismiss')}>{t('see_tower')}</button>
          <button type="button" className="btn primary" autoFocus onClick={() => send('dismiss', { close: true })}>{t('next')}</button>
        </div>
      </div>
    </div>
  )
}

function SettingsBook() {
  const item = bookOf('tower:lexikon')
  return (
    <span className="settings-book-art pl2">
      <span className="book-slot">
        <PixelBook item={item} color="#7a4a26" />
        <img className="settings-gear" src={fxSprite('zahnrad').url} alt="" draggable={false} />
      </span>
    </span>
  )
}
