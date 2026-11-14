import { useMemo } from 'react'
import { useLw } from '../store.ts'

/** Stapelfarben wie in der App (UI-Richtung C); Anki kennt keine Stapelfarben, sie werden im Add-on gespeichert */
export const TILE_COLORS = ['#4f46e5', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#ca8a04', '#65a30d']

export function useDeckColors(): Map<string, string> {
  const { decks } = useLw()
  return useMemo(() => new Map(decks.map((d) => [d.id, d.color])), [decks])
}
