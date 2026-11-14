/**
 * Texte des Regals (World.tsx). Die App ist (noch) deutsch; das Anki-Add-on ersetzt dieses Modul
 * durch eine übersetzte Fassung (anki-addon/web/src/shims/worldText.ts).
 */
export const worldText = {
  locale: 'de-DE',
  deckDeleted: 'Stapel gelöscht',
  timer: 'Timer',
  freeTimer: 'Freier Timer',
  sessionOf: (day: string) => `Sitzung vom ${day}`,
  timeRange: (from: string, to: string) => `${from} – ${to} Uhr`,
  cards: (n: number) => `${n} ${n === 1 ? 'Karte' : 'Karten'}`,
  aborted: 'abgebrochen',
  books: (n: number) => `${n} ${n === 1 ? 'Buch' : 'Bücher'}`,
  coins: (n: number) => `+${n} Münzen`,
  effectOn: 'Effekt freigeschaltet',
  effectFrom: (min: number) => `Effekt ab ${min} min`,
  fallen: (n: number) => `${n} heruntergefallene Bücher`,
  floor: (n: number) => `Stockwerk ${n}`,
  shelf: 'Bücherregal',
}
