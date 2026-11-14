import { COLLECTIBLES } from '@karteikarten/core'
import { de, type Dict } from './de.ts'
import { en } from './en.ts'
import { es } from './es.ts'
import { fr } from './fr.ts'
import { pt } from './pt.ts'
import booksEn from './books/en.ts'
import booksEs from './books/es.ts'
import booksFr from './books/fr.ts'
import booksPt from './books/pt.ts'
import { THEME_NAMES } from './themes.ts'

/** Sprachen des Add-ons. Neue Sprache: Datei wie en.ts anlegen und hier eintragen. */
export type Lang = 'de' | 'en' | 'es' | 'fr' | 'pt'
export const LANGS: [Lang, string][] = [['de', 'Deutsch'], ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['pt', 'Português']]
const DICTS: Record<Lang, Dict> = { de, en, es, fr, pt }
const BOOKS: Partial<Record<Lang, string>> = { en: booksEn, es: booksEs, fr: booksFr, pt: booksPt }
export const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR' }

let lang: Lang = 'en'
export const getLang = () => lang

// deutsche Namen merken, damit man zurückschalten kann
const ORIGINAL = new Map(COLLECTIBLES.map((c) => [c.id, { name: c.name, tagline: c.book.tagline }]))

/** Sprache setzen: Texte und Buchnamen (die Buchliste kommt aus dem gemeinsamen Kern und ist deutsch) */
export function setLang(next: string | undefined) {
  const l = (LANGS.some(([k]) => k === next) ? next : 'en') as Lang
  if (l === lang && ORIGINAL.size && lang !== 'en') return
  lang = l
  const table = BOOKS[l]
  const rows = new Map((table ?? '').split('\n').map((row) => {
    const [id, name, tagline] = row.split('|')
    return [`tower:${id}`, { name: name ?? '', tagline: tagline ?? '' }] as const
  }))
  for (const c of COLLECTIBLES) {
    const tr = rows.get(c.id) ?? ORIGINAL.get(c.id)
    if (!tr) continue
    c.name = tr.name
    c.book.tagline = tr.tagline
  }
}
setLang('en')

/** Text holen; {platzhalter} werden ersetzt, bei Zahl n gibt es die Einzahl über „<key>_one“ */
export function t(key: keyof Dict | string, vars?: Record<string, string | number>): string {
  const d = DICTS[lang] as Record<string, string>
  const n = vars?.n
  const k = n === 1 && d[`${key}_one`] !== undefined ? `${key}_one` : key
  const s = d[k] ?? (de as Record<string, string>)[k] ?? key
  return vars ? s.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? '')) : s
}

export function themeName(id: string, german: string): string {
  const i = ['en', 'es', 'fr', 'pt'].indexOf(lang)
  return i >= 0 ? (THEME_NAMES[id]?.[i] ?? german) : german
}
