import { useEffect, useState } from 'react'
import { useLw } from '../store.ts'

/** Ersatz für apps/web/src/hooks.ts: Einstellungen und Stapel kommen aus Anki (über Python) */
export function useSettings() {
  const s = useLw()
  return { settings: { focus: s.focus, reduceMotion: s.reduceMotion, dailyGoal: 10 }, isLoading: false }
}

export function useDecks() {
  const s = useLw()
  return { decks: s.decks.map((d) => ({ id: d.id, name: d.name })), isLoading: false }
}

export function useNow(ms = 15_000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
