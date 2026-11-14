import { Coin } from '../../../apps/web/src/components/Coin.tsx'
import tafel from '../../../apps/web/src/assets/lernwelt/welt/streak-tafel.png'
import flamme from '../../../apps/web/src/assets/lernwelt/welt/streak-flamme.png'
import kerze from '../../../apps/web/src/assets/lernwelt/welt/streak-kerze.png'
import type { StreakInfo } from './store.ts'
import { t } from './i18n/index.ts'

/**
 * Tägliche Streak-Tafel (PixelLab-Grafiken): hängt links in der Bibliothek.
 * Große Flamme mit den Tagen in Folge, darunter eine Kerze je Tag der letzten Woche –
 * brennt, wenn an dem Tag gelernt wurde. Klick öffnet die Streak-Münzen.
 */
export function StreakBoard(props: { k: StreakInfo; onOpen: () => void }) {
  const { k } = props
  const week = k.week ?? []
  const left = Math.max(0, k.threshold - k.todayReviews)
  const status = k.todayGot ? t('board_today', { n: k.todayCoins }) : left > 0 ? t('board_left', { n: left }) : t('board_soon', { n: k.todayCoins })
  return (
    <button type="button" className="lw-streak" onClick={props.onOpen} title={t('board_title')} style={{ backgroundImage: `url(${tafel})` }}>
      <span className="lw-streak-inner">
        <span className="lw-streak-head">
          <img src={flamme} alt="" className={`lw-streak-flame${k.days > 0 ? '' : ' out'}`} draggable={false} />
          <span className="lw-streak-num">{k.days}</span>
          <span className="lw-streak-unit">{t('board_unit', { n: k.days })}<br />{t('board_row')}</span>
        </span>
        <span className="lw-streak-week" aria-label={t('last7')}>
          {week.map((d, i) => (
            <span key={i} className={`lw-day${d.done ? ' done' : ''}${d.today ? ' today' : ''}`} title={`${d.label}: ${d.done ? t('learned') : t('not_learned')}`}>
              <img src={kerze} alt="" draggable={false} />
              <span>{d.label}</span>
            </span>
          ))}
        </span>
        <span className="lw-streak-status">
          {k.todayGot ? '✓ ' : ''}{status}{k.todayGot || left === 0 ? <> <Coin /></> : null}
          {k.next ? <span className="lw-streak-next"> · {t('board_ms', { d: k.next.days, c: k.next.coins })} <Coin /></span> : null}
        </span>
      </span>
    </button>
  )
}
