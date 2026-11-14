import type { DesignTheme } from '@karteikarten/core'

/** Schritt 82: Pixel-Hintergründe der Shop-Designs (PixelLab), in der App mitgeliefert – Schlüssel „pix:<name>“ */
const IMAGES = import.meta.glob('../assets/themes/*.png', { eager: true, import: 'default' }) as Record<string, string>

export const isBuiltinImage = (key: string) => key.startsWith('pix:')
export const builtinImageUrl = (key: string): string | undefined => (isBuiltinImage(key) ? IMAGES[`../assets/themes/${key.slice(4)}.png`] : undefined)

/** Adresse des Hintergrundbildes, falls es mitgeliefert ist (eigene Bilder kommen aus der Datenbank) */
export function themeImageUrl(t: DesignTheme): string | undefined {
  return t.background.kind === 'image' ? builtinImageUrl(t.background.image) : undefined
}
