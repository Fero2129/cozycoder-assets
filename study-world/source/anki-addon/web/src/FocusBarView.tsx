import { bookOf, growthStage } from '@karteikarten/core'
import { GrowingArt } from '../../../apps/web/src/components/World.tsx'
import { t } from './i18n/index.ts'
import { useNow } from './shims/hooks.ts'
import { send, useLw } from './store.ts'

/** Schmale Leiste oben im Anki-Hauptfenster während einer Fokus-Sitzung: wachsendes Buch, Zeit/Karten, Sperre, Aufgeben */
export function FocusBarView() {
  const s = useLw()
  const now = useNow(1000)
  const a = s.active
  if (!a) return <div className="lw-bar empty" />
  const left = Math.max(0, a.minutes * 60_000 - (now - a.startedAt))
  const progress = 1 - left / (a.minutes * 60_000)
  const stage = Math.min(3, growthStage(progress))
  const color = s.decks.find((d) => d.id === a.deckId)?.color
  const mm = Math.floor(left / 60_000)
  const ss = Math.floor((left % 60_000) / 1000)
  const deckName = a.deckId ? s.decks.find((d) => d.id === a.deckId)?.name.split('::').pop() : null
  const parts = [
    t('bar_left', { t: `${mm}:${String(ss).padStart(2, '0')}` }),
    t('bar_cards', { n: a.cards }),
    a.lock ? t('bar_card_coins', { n: Math.min(50, Math.floor(a.cards / 2)) }) : t('bar_nocoins'),
  ]
  if (a.lock) parts.push(`${t('apps_locked')}${a.blocked ? ` (${t('bar_blocked', { n: a.blocked })}${a.blockedApp ? `, ${t('bar_last', { a: a.blockedApp })}` : ''})` : ''}`)
  return (
    <div className={`lw-bar${a.away ? ' away' : ''}`} role="status">
      <span className="lw-bar-art"><GrowingArt itemId={a.itemId} stage={stage} size={40} color={color} /></span>
      <div className="lw-bar-info">
        <strong>{a.away ? t('bar_back') : t('bar_growing', { b: bookOf(a.itemId).name })}{deckName ? <span className="lw-bar-deck"> · {deckName}</span> : null}</strong>
        <span className="lw-bar-sub">{parts.join(' · ')}</span>
        <span className="lw-bar-progress"><i style={{ width: `${Math.round(progress * 100)}%` }} /></span>
      </div>
      <button type="button" className="pix-btn small" onClick={() => send('open')}>{t('lernwelt')}</button>
      <button type="button" className="pix-btn small" onClick={() => send('giveup')}>{t('giveup')}</button>
    </div>
  )
}
