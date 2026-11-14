// Für das Add-on genügt die Lernwelt-Logik aus dem Kern (keine Datenbank, kein FSRS)
export * from '../../../../packages/core/src/focus.ts'
// Pixel-Designs aus dem Shop der App (Schritt 95d: im Add-on als Hintergrund für Anki)
export { SHOP_THEMES, type DesignTheme } from '../../../../packages/core/src/design.ts'
