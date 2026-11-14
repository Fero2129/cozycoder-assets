import { DEFAULT_FOCUS, type FocusSessionRecord, type FocusSettings } from '@karteikarten/core'
import { useSyncExternalStore } from 'react'
import { setLang } from './i18n/index.ts'

/**
 * Brücke zwischen Oberfläche und Python-Teil des Add-ons.
 * Python schickt den kompletten Zustand mit `window.lwSetState(…)`, die Oberfläche schickt Befehle mit `pycmd("lw:…")`.
 */

export interface DeckInfo {
  id: string
  name: string
  /** Stapelfarbe (eigene oder automatisch je Oberstapel) */
  color: string
  /** heute fällig + neu (für „Stapel schaffen“) */
  due: number
  depth: number
  /** eigene Farbe gewählt (nur Oberstapel) */
  custom?: boolean
}

export interface ActiveInfo {
  mode: 'timer' | 'deck'
  itemId: string
  deckId: string | null
  startedAt: number
  minutes: number
  target: number
  cards: number
  lock: boolean
  /** so oft wurde eine gesperrte App weggeschoben */
  blocked: number
  /** zuletzt abgewehrte App */
  blockedApp: string | null
  away: boolean
}

export interface LockInfo {
  enabled: boolean
  allow: string[]
  /** Sperre auf diesem System möglich (macOS, Windows, Linux mit xdotool) */
  available: boolean
  platform: string
  note: string
}

export interface StreakInfo {
  days: number
  todayReviews: number
  threshold: number
  todayGot: boolean
  todayCoins: number
  next: { days: number; coins: number } | null
  streakCoins: number
  /** die letzten 7 Lerntage (ältester zuerst, heute zuletzt) */
  week?: { label: string; done: boolean; today: boolean }[]
}

export interface LwState {
  ready: boolean
  sessions: FocusSessionRecord[]
  purchased: string[]
  balance: number
  focus: FocusSettings
  lock: LockInfo
  decks: DeckInfo[]
  currentDeck: string | null
  streak: StreakInfo
  active: ActiveInfo | null
  result: { record: Omit<FocusSessionRecord, 'id'>; reason?: string } | null
  night: boolean
  reduceMotion: boolean
  /** beim Öffnen gleich das Startfenster für diesen Stapel zeigen */
  openStart: string | null
  tab: 'welt' | 'shop'
  /** erhöht sich bei jedem Öffnen des Fensters (Tür-Animation erneut zeigen) */
  visit: number
  /** aktives Pixel-Design als Hintergrund in Anki (Id aus SHOP_THEMES) */
  theme?: string | null
  /** Sprache der Oberfläche (de, en, es, fr, pt) und die Einstellung dazu („auto“ = wie Anki) */
  lang?: string
  langSetting?: string
}

let state: LwState = {
  ready: false,
  sessions: [],
  purchased: [],
  balance: 0,
  focus: DEFAULT_FOCUS,
  lock: { enabled: false, allow: [], available: false, platform: '', note: '' },
  decks: [],
  currentDeck: null,
  streak: { days: 0, todayReviews: 0, threshold: 10, todayGot: false, todayCoins: 0, next: null, streakCoins: 0 },
  active: null,
  result: null,
  night: false,
  reduceMotion: false,
  openStart: null,
  tab: 'welt',
  visit: 0,
}
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useLw = () => useSyncExternalStore(subscribe, () => state)
export const getLw = () => state

/* ---------- Kleine Meldungen von Python ---------- */
export interface Toast { id: number; text: string }
let toasts: Toast[] = []
const toastListeners = new Set<() => void>()
export const useToasts = () => useSyncExternalStore((l) => (toastListeners.add(l), () => toastListeners.delete(l)), () => toasts)
export function showToast(text: string) {
  const t = { id: Date.now() + Math.random(), text }
  toasts = [...toasts, t]
  toastListeners.forEach((l) => l())
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    toastListeners.forEach((l) => l())
  }, 4200)
}

declare global {
  interface Window {
    pycmd?: (cmd: string, cb?: (r: unknown) => void) => void
    lwSetState?: (s: Partial<LwState>) => void
    lwToast?: (text: string) => void
  }
}

window.lwSetState = (s) => {
  if (s.lang) setLang(s.lang)
  state = { ...state, ...s, ready: true }
  document.documentElement.dataset.theme = state.night ? 'dark' : 'light'
  document.documentElement.classList.toggle('reduce-motion', state.reduceMotion)
  listeners.forEach((l) => l())
}
window.lwToast = showToast

/** Befehl an Python. pycmd wird von Anki erst nach dem Laden der Seite eingesetzt – so lange warten. */
export function send(cmd: string, payload?: unknown) {
  const msg = `lw:${cmd}:${payload === undefined ? '' : JSON.stringify(payload)}`
  const trySend = (n: number) => {
    if (typeof window.pycmd === 'function') window.pycmd(msg)
    else if (n < 200) setTimeout(() => trySend(n + 1), 50)
  }
  trySend(0)
}

/** Beim Start: Zustand anfordern, bis er da ist */
export function requestState() {
  let n = 0
  const ask = () => {
    if (state.ready || n++ > 40) return
    send('ready')
    setTimeout(ask, 500)
  }
  ask()
}
