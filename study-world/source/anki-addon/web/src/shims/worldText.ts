import { getLang, LOCALES, t } from '../i18n/index.ts'

/** Übersetzte Texte für das Regal (ersetzt apps/web/src/lib/worldText.ts im Add-on) */
export const worldText = {
  get locale() { return LOCALES[getLang()] },
  get deckDeleted() { return '—' },
  get timer() { return 'Timer' },
  get freeTimer() { return 'Timer' },
  sessionOf: (day: string) => day,
  timeRange: (from: string, to: string) => `${from} – ${to}`,
  cards: (n: number) => t('res_cards', { n }),
  get aborted() { return '✗' },
  books: (n: number) => t('stat_books', { n }),
  coins: (n: number) => `+${n} 🪙`,
  get effectOn() { return t('res_effect').replace('!', '').replace('¡', '') },
  effectFrom: (min: number) => t('effect_from', { m: min }),
  fallen: (n: number) => t('stat_pile', { n }),
  floor: (n: number) => `#${n}`,
  get shelf() { return t('title_shelf') },
}
