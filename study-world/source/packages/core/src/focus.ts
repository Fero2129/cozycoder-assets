/**
 * Lernwelt „Wissensturm“ (Fokus-Sitzungen nach dem Vorbild der App „Forest“):
 * Jede geschaffte Fokus-Sitzung stellt Bücher ins Regal (je länger, desto mehr) – in der Farbe des gelernten Stapels.
 * Ist ein Regal voll, wird darüber ein neues Stockwerk gebaut: ein ewiger Turm, der immer höher wächst.
 * Wer die App während der Sitzung verlässt, verliert das Buch (es bleibt grau im Regal).
 * Erfolgreiche Sitzungen bringen Münzen für den Shop (101 Buchsorten mit Effekten, Designs). Grafiken: PixelLab (Schritt 50).
 *
 * Zwei Arten zu lernen:
 * - Timer: eine feste Zeit konzentriert lernen
 * - Stapel: alle heute fälligen und neuen Karten eines Stapels schaffen (mindestens 25 Karten)
 */

export type WorldId = 'tower'
export type FocusMode = 'timer' | 'deck'

/**
 * Effekt eines besonderen Buches (Schritt 55): Er gehört zum Buch selbst – kleine Pixel-Partikel
 * (Funken, Noten, Regen, Tropfen …) und eine Bewegung des Buches (Leuchten, Schweben, Flackern).
 * Alles bleibt im Platz des Buches und in der Lücke darüber, damit das Regal dicht bleibt.
 */
export type EffectStyle =
  | 'lesezeichen' | 'zettel' | 'buchstaben' | 'dampf' | 'staub' | 'blaetter' | 'herzen' | 'bluete' | 'sporen' | 'sterne'
  | 'blasen' | 'regen' | 'noten' | 'glut' | 'schnee' | 'mondlicht' | 'zzz' | 'blinzeln' | 'blitz' | 'schleim'
  | 'spinne' | 'spuk' | 'zahnrad' | 'lava' | 'goldglanz' | 'muenzen' | 'rauch' | 'start' | 'regenbogen' | 'kristall'
  // Schritt 82: 26 neue Bücher
  | 'chemie' | 'zahlen' | 'flieger' | 'kirschblueten' | 'herbstlaub' | 'bienen' | 'galaxie' | 'piratengold' | 'magie'
  | 'signal' | 'stampf' | 'sand' | 'neuronen' | 'dna' | 'leuchtfeuer' | 'gluehwuermchen' | 'glitzer' | 'sonnenstrahlen'
  | 'umlauf' | 'schach' | 'pizzaduft' | 'schneemann' | 'fledermaus' | 'quaken' | 'puls' | 'farben'
  // Schritt 95c: 25 neue Bücher
  | 'knochen' | 'zellen' | 'kaffeebohnen' | 'kompassnadel' | 'kranich' | 'watscheln' | 'fuchsfeuer' | 'federn'
  | 'ausbruch' | 'flosse' | 'tiefsee' | 'traktorstrahl' | 'schwertglanz' | 'juwelen' | 'shuriken' | 'levelup'
  | 'bass' | 'spuren' | 'rieseln' | 'streusel' | 'beeren' | 'bambus' | 'kiemen' | 'zen' | 'herzschlag'
  // Schritt 95d: 20 neue Bücher
  | 'apfelfall' | 'nieselregen' | 'teeduft' | 'kerzenschein' | 'moewen' | 'blitzlicht' | 'wuerfelspiel' | 'saiten'
  | 'falter' | 'eukalyptus' | 'fontaene' | 'gemaechlich' | 'phoenixfeuer' | 'nebel' | 'goldstaub' | 'lebenslicht'
  | 'schmelzen' | 'farbwechsel' | 'koerner' | 'strahlen'

export interface BookEffect {
  style: EffectStyle
}

/** Aussehen einer Buchsorte: PixelLab-Bild (Schlüssel der Grafik), Größe in Pixeln, Effekt im Regal */
export interface BookArt {
  /** Grafik-Schlüssel (apps/web/src/assets/lernwelt/buecher/<sprite>.png) */
  sprite: string
  w: number
  h: number
  /** einfache Bücher nehmen die Farbe des Stapels an */
  tint?: boolean
  /** Effekt, mit dem das Buch sein Regalfach verändert (effekte/<sprite>.png) */
  effect?: BookEffect
  /** kurze Beschreibung für den Shop */
  tagline?: string
}

export interface Collectible {
  id: string
  world: WorldId
  name: string
  book: BookArt
  /** 0 = von Anfang an da */
  price: number
}

export interface WorldInfo {
  id: WorldId
  name: string
  /** „Mein Wissensturm“ */
  mine: string
  icon: string
  /** wie ein neues Stück entsteht (Startstufe) */
  seed: string
  verbGrow: string
  verbLost: string
}

export const WORLDS: WorldInfo[] = [
  { id: 'tower', name: 'Wissensturm', mine: 'Mein Wissensturm', icon: '📚', seed: '📄', verbGrow: 'steht jetzt im Regal', verbLost: 'ist heruntergefallen' },
]

const b = (id: string, name: string, book: BookArt, price: number): Collectible => ({ id: `tower:${id}`, world: 'tower', name, book, price })

export const COLLECTIBLES: Collectible[] = [
  b('buch', 'Buch', { sprite: 'buch', w: 16, h: 51, tint: true, effect: { style: 'lesezeichen' }, tagline: 'Der Klassiker – mit Lesebändchen' }, 0),
  b('heft', 'Heft', { sprite: 'heft', w: 13, h: 54, tint: true, effect: { style: 'zettel' }, tagline: 'Lose Zettel fliegen auf' }, 0),
  b('lexikon', 'Lexikon', { sprite: 'lexikon', w: 16, h: 51, tint: true, effect: { style: 'buchstaben' }, tagline: 'Buchstaben steigen auf' }, 0),
  // Einfache Bücher mit Farbe (Tinte) – günstig, nach 1-2 Tagen
  b('taschenbuch', 'Taschenbuch', { sprite: 'taschenbuch', w: 12, h: 48, tint: true, effect: { style: 'dampf' }, tagline: 'Duftet nach frischem Kaffee' }, 100),
  b('rolle', 'Schriftrolle', { sprite: 'rolle', w: 15, h: 55, effect: { style: 'staub' }, tagline: 'Uraltes Wissen' }, 150),
  // Bücher mit kleinen Effekten – nach 3-4 Tagen
  b('pflanze', 'Rankenbuch', { sprite: 'pflanze', w: 21, h: 48, effect: { style: 'blaetter' }, tagline: 'Lässt Blätter rieseln' }, 250),
  b('herz', 'Herzbuch', { sprite: 'herz', w: 16, h: 56, effect: { style: 'herzen' }, tagline: 'Lernen mit Herz' }, 250),
  b('kaktus', 'Kaktusbuch', { sprite: 'kaktus', w: 18, h: 54, effect: { style: 'bluete' }, tagline: 'Stachelig, aber lieb' }, 250),
  b('pilz', 'Pilzbuch', { sprite: 'pilz', w: 25, h: 57, effect: { style: 'sporen' }, tagline: 'Verstreut leuchtende Sporen' }, 250),
  // Standard-Bücher – nach 5-6 Tagen intensives Lernen (~300-350 Münzen)
  b('sterne', 'Sternenbuch', { sprite: 'sterne', w: 16, h: 51, effect: { style: 'sterne' }, tagline: 'Ein ganzer Nachthimmel' }, 320),
  b('ozean', 'Ozeanbuch', { sprite: 'ozean', w: 16, h: 51, effect: { style: 'blasen' }, tagline: 'Blubbert vor sich hin' }, 320),
  b('wolke', 'Wolkenbuch', { sprite: 'wolke', w: 18, h: 57, effect: { style: 'regen' }, tagline: 'Lässt es sanft regnen' }, 320),
  b('musik', 'Musikbuch', { sprite: 'musik', w: 16, h: 57, effect: { style: 'noten' }, tagline: 'Noten steigen auf' }, 320),
  // Besondere Bücher – 7-9 Tage
  b('feuer', 'Feuerbuch', { sprite: 'feuer', w: 16, h: 55, effect: { style: 'glut' }, tagline: 'Brennt für dein Thema' }, 400),
  b('eis', 'Eisbuch', { sprite: 'eis', w: 16, h: 51, effect: { style: 'schnee' }, tagline: 'Lässt Schnee rieseln' }, 400),
  b('mond', 'Mondbuch', { sprite: 'mond', w: 16, h: 51, effect: { style: 'mondlicht' }, tagline: 'Mondlicht fürs Regal' }, 400),
  b('katze', 'Katzenbuch', { sprite: 'katze', w: 21, h: 52, effect: { style: 'zzz' }, tagline: 'Macht ein Nickerchen' }, 400),
  // Premium-Bücher – 10-12 Tage
  b('augen', 'Augenbuch', { sprite: 'augen', w: 16, h: 51, effect: { style: 'blinzeln' }, tagline: 'Es beobachtet dich beim Lernen' }, 500),
  b('blitz', 'Blitzbuch', { sprite: 'blitz', w: 16, h: 51, effect: { style: 'blitz' }, tagline: 'Geistesblitze garantiert' }, 500),
  b('monster', 'Monsterbuch', { sprite: 'monster', w: 18, h: 51, effect: { style: 'schleim' }, tagline: 'Tropft ein bisschen' }, 500),
  b('spinne', 'Spinnennetzbuch', { sprite: 'spinne', w: 16, h: 51, effect: { style: 'spinne' }, tagline: 'Alt und gruselig' }, 500),
  // Exklusive Bücher – 12-14 Tage
  b('geist', 'Geisterbuch', { sprite: 'geist', w: 19, h: 52, effect: { style: 'spuk' }, tagline: 'Hier spukt es' }, 600),
  b('uhrwerk', 'Uhrwerkbuch', { sprite: 'uhrwerk', w: 16, h: 52, effect: { style: 'zahnrad' }, tagline: 'Ein Zahnrad dreht sich' }, 600),
  b('lava', 'Lavabuch', { sprite: 'lava', w: 16, h: 51, effect: { style: 'lava' }, tagline: 'Glüht und tropft' }, 600),
  b('goldband', 'Goldener Band', { sprite: 'goldband', w: 16, h: 51, effect: { style: 'goldglanz' }, tagline: 'Glänzt im Lampenlicht' }, 700),
  b('schatz', 'Schatzbuch', { sprite: 'schatz', w: 21, h: 53, effect: { style: 'muenzen' }, tagline: 'Lässt Münzen funkeln' }, 700),
  // Legendäre Bücher – 15+ Tage
  b('drache', 'Drachenbuch', { sprite: 'drache', w: 18, h: 52, effect: { style: 'rauch' }, tagline: 'Raucht ein bisschen' }, 800),
  b('rakete', 'Raketenbuch', { sprite: 'rakete', w: 20, h: 57, effect: { style: 'start' }, tagline: 'Startet durch' }, 800),
  b('regenbogen', 'Regenbogenbuch', { sprite: 'regenbogen', w: 16, h: 52, effect: { style: 'regenbogen' }, tagline: 'Funkelt in allen Farben' }, 900),
  b('kristall', 'Kristallbuch', { sprite: 'kristall', w: 23, h: 54, effect: { style: 'kristall' }, tagline: 'Leuchtet von innen' }, 1000),
  // Schritt 82: 26 neue Bücher (PixelLab, gleicher Stil) – Fächer, Natur, Fantasie
  // Fach-Bücher (Standard-Tier)
  b('chemie', 'Laborbuch', { sprite: 'chemie', w: 16, h: 51, effect: { style: 'chemie' }, tagline: 'Es blubbert im Kolben' }, 320),
  b('mathe', 'Formelbuch', { sprite: 'mathe', w: 16, h: 51, effect: { style: 'zahlen' }, tagline: 'Zahlen steigen auf' }, 320),
  b('atlas', 'Atlas', { sprite: 'atlas', w: 16, h: 51, effect: { style: 'flieger' }, tagline: 'Papierflieger auf Weltreise' }, 320),
  b('medizin', 'Medizinbuch', { sprite: 'medizin', w: 16, h: 51, effect: { style: 'puls' }, tagline: 'Hat immer den Puls im Blick' }, 320),
  b('kunst', 'Kunstbuch', { sprite: 'kunst', w: 16, h: 51, effect: { style: 'farben' }, tagline: 'Kleckst ein bisschen' }, 320),
  // Natur-Bücher (Premium-Tier)
  b('schach', 'Schachbuch', { sprite: 'schach', w: 16, h: 51, effect: { style: 'schach' }, tagline: 'Denkt drei Züge voraus' }, 500),
  b('pizza', 'Pizzabuch', { sprite: 'pizza', w: 16, h: 51, effect: { style: 'pizzaduft' }, tagline: 'Frisch aus dem Ofen' }, 500),
  b('herbst', 'Herbstbuch', { sprite: 'herbst', w: 16, h: 51, effect: { style: 'herbstlaub' }, tagline: 'Lässt Laub fallen' }, 500),
  b('sakura', 'Kirschblütenbuch', { sprite: 'sakura', w: 16, h: 51, effect: { style: 'kirschblueten' }, tagline: 'Blütenblätter tanzen' }, 600),
  b('biene', 'Bienenbuch', { sprite: 'biene', w: 16, h: 51, effect: { style: 'bienen' }, tagline: 'Fleißig wie eine Biene' }, 600),
  b('frosch', 'Froschbuch', { sprite: 'frosch', w: 16, h: 52, effect: { style: 'quaken' }, tagline: 'Fängt Fliegen beim Lernen' }, 600),
  b('winter', 'Winterbuch', { sprite: 'winter', w: 16, h: 51, effect: { style: 'schneemann' }, tagline: 'Leise rieselt der Schnee' }, 600),
  // Fantasie-Bücher (Exklusiv/Legendär)
  b('gehirn', 'Gehirnbuch', { sprite: 'gehirn', w: 16, h: 51, effect: { style: 'neuronen' }, tagline: 'Die Synapsen feuern' }, 800),
  b('dna', 'Genbuch', { sprite: 'dna', w: 16, h: 51, effect: { style: 'dna' }, tagline: 'Liegt dir in den Genen' }, 800),
  b('gluehwurm', 'Glühwürmchenbuch', { sprite: 'gluehwurm', w: 16, h: 51, effect: { style: 'gluehwuermchen' }, tagline: 'Leuchtet in der Nacht' }, 800),
  b('leuchtturm', 'Leuchtturmbuch', { sprite: 'leuchtturm', w: 16, h: 51, effect: { style: 'leuchtfeuer' }, tagline: 'Weist dir den Weg' }, 900),
  b('roboter', 'Roboterbuch', { sprite: 'roboter', w: 16, h: 52, effect: { style: 'signal' }, tagline: 'Piep. Lernmodus aktiv.' }, 900),
  b('pirat', 'Piratenbuch', { sprite: 'pirat', w: 16, h: 51, effect: { style: 'piratengold' }, tagline: 'Arrr – Wissen ist ein Schatz' }, 900),
  b('dino', 'Dinobuch', { sprite: 'dino', w: 19, h: 51, effect: { style: 'stampf' }, tagline: 'Stampft durchs Regal' }, 1000),
  b('pharao', 'Pharaonenbuch', { sprite: 'pharao', w: 16, h: 51, effect: { style: 'sand' }, tagline: 'Rieselt Wüstensand' }, 1000),
  b('sonne', 'Sonnenbuch', { sprite: 'sonne', w: 16, h: 51, effect: { style: 'sonnenstrahlen' }, tagline: 'Strahlt mit dir um die Wette' }, 1100),
  b('vampir', 'Vampirbuch', { sprite: 'vampir', w: 17, h: 51, effect: { style: 'fledermaus' }, tagline: 'Lernt am liebsten nachts' }, 1100),
  b('planet', 'Planetenbuch', { sprite: 'planet', w: 16, h: 51, effect: { style: 'umlauf' }, tagline: 'Kreist um dein Wissen' }, 1200),
  b('zauber', 'Zauberbuch', { sprite: 'zauber', w: 16, h: 52, effect: { style: 'magie' }, tagline: 'Funkelt vor Magie' }, 1300),
  b('galaxie', 'Galaxiebuch', { sprite: 'galaxie', w: 16, h: 51, effect: { style: 'galaxie' }, tagline: 'Ein ganzes Universum' }, 1400),
  b('einhorn', 'Einhornbuch', { sprite: 'einhorn', w: 16, h: 51, effect: { style: 'glitzer' }, tagline: 'Glitzert unwiderstehlich' }, 1500),
  // Schritt 95c: 25 neue Bücher (PixelLab, Stilvorlage Laborbuch) – Alltag, Tiere, Medizin, Abenteuer
  b('kaffee', 'Kaffeebuch', { sprite: 'kaffee', w: 16, h: 51, effect: { style: 'kaffeebohnen' }, tagline: 'Frisch gebrüht' }, 250),
  b('origami', 'Origamibuch', { sprite: 'origami', w: 16, h: 51, effect: { style: 'kranich' }, tagline: 'Faltet sich zum Kranich' }, 250),
  b('erdbeere', 'Erdbeerbuch', { sprite: 'erdbeere', w: 18, h: 51, effect: { style: 'beeren' }, tagline: 'Frisch gepflückt' }, 250),
  b('mikroskop', 'Mikroskopbuch', { sprite: 'mikroskop', w: 16, h: 51, effect: { style: 'zellen' }, tagline: 'Sieht jede Zelle' }, 320),
  b('kompass', 'Kompassbuch', { sprite: 'kompass', w: 16, h: 51, effect: { style: 'kompassnadel' }, tagline: 'Zeigt immer Richtung Wissen' }, 320),
  b('kopfhoerer', 'Kopfhörerbuch', { sprite: 'kopfhoerer', w: 17, h: 51, effect: { style: 'bass' }, tagline: 'Lernen mit Musik im Ohr' }, 320),
  b('donut', 'Donutbuch', { sprite: 'donut', w: 16, h: 51, effect: { style: 'streusel' }, tagline: 'Mit bunten Streuseln' }, 320),
  b('pinguin', 'Pinguinbuch', { sprite: 'pinguin', w: 16, h: 51, effect: { style: 'watscheln' }, tagline: 'Watschelt durchs Regal' }, 400),
  b('hai', 'Haibuch', { sprite: 'hai', w: 16, h: 51, effect: { style: 'flosse' }, tagline: 'Beißt sich durch jeden Stoff' }, 400),
  b('kardio', 'Kardiobuch', { sprite: 'kardio', w: 14, h: 50, effect: { style: 'herzschlag' }, tagline: 'Hält den Takt' }, 400),
  b('fuchs', 'Fuchsbuch', { sprite: 'fuchs', w: 16, h: 52, effect: { style: 'fuchsfeuer' }, tagline: 'Schlau wie ein Fuchs' }, 500),
  b('eule', 'Eulenbuch', { sprite: 'eule', w: 16, h: 51, effect: { style: 'federn' }, tagline: 'Weise wie eine Eule' }, 500),
  b('gamer', 'Gamerbuch', { sprite: 'gamer', w: 16, h: 51, effect: { style: 'levelup' }, tagline: 'Level up!' }, 500),
  b('detektiv', 'Detektivbuch', { sprite: 'detektiv', w: 16, h: 52, effect: { style: 'spuren' }, tagline: 'Findet jede Wissenslücke' }, 500),
  b('skelett', 'Skelettbuch', { sprite: 'skelett', w: 16, h: 51, effect: { style: 'knochen' }, tagline: 'Klappert mit den Knochen' }, 600),
  b('sanduhr', 'Sanduhrbuch', { sprite: 'sanduhr', w: 16, h: 51, effect: { style: 'rieseln' }, tagline: 'Jede Minute zählt' }, 600),
  b('panda', 'Pandabuch', { sprite: 'panda', w: 16, h: 51, effect: { style: 'bambus' }, tagline: 'Kaut gemütlich Bambus' }, 600),
  b('qualle', 'Quallenbuch', { sprite: 'qualle', w: 16, h: 51, effect: { style: 'tiefsee' }, tagline: 'Leuchtet in der Tiefsee' }, 700),
  b('ritter', 'Ritterbuch', { sprite: 'ritter', w: 16, h: 51, effect: { style: 'schwertglanz' }, tagline: 'Kämpft für dein Wissen' }, 700),
  b('axolotl', 'Axolotlbuch', { sprite: 'axolotl', w: 16, h: 51, effect: { style: 'kiemen' }, tagline: 'Lächelt immer' }, 700),
  b('vulkan', 'Vulkanbuch', { sprite: 'vulkan', w: 14, h: 49, effect: { style: 'ausbruch' }, tagline: 'Kurz vor dem Ausbruch' }, 800),
  b('ninja', 'Ninjabuch', { sprite: 'ninja', w: 21, h: 51, effect: { style: 'shuriken' }, tagline: 'Lernt lautlos' }, 800),
  b('bonsai', 'Bonsaibuch', { sprite: 'bonsai', w: 16, h: 51, effect: { style: 'zen' }, tagline: 'Wächst mit Geduld' }, 900),
  b('ufo', 'UFO-Buch', { sprite: 'ufo', w: 16, h: 51, effect: { style: 'traktorstrahl' }, tagline: 'Nicht von dieser Welt' }, 1200),
  b('krone', 'Kronenbuch', { sprite: 'krone', w: 16, h: 51, effect: { style: 'juwelen' }, tagline: 'Für Königinnen und Könige des Lernens' }, 1500),
  // Schritt 95d: 20 neue Bücher (PixelLab) – Natur, Musik, Fantasie
  b('apfel', 'Apfelbuch', { sprite: 'apfel', w: 15, h: 50, effect: { style: 'apfelfall' }, tagline: 'Fällt nicht weit vom Stamm' }, 250),
  b('tee', 'Teebuch', { sprite: 'tee', w: 16, h: 51, effect: { style: 'teeduft' }, tagline: 'Zum Durchatmen' }, 250),
  b('regenschirm', 'Regenschirmbuch', { sprite: 'regenschirm', w: 16, h: 51, effect: { style: 'nieselregen' }, tagline: 'Für jedes Wetter' }, 250),
  b('kerze', 'Kerzenbuch', { sprite: 'kerze', w: 16, h: 51, effect: { style: 'kerzenschein' }, tagline: 'Für lange Lernabende' }, 320),
  b('zahn', 'Zahnbuch', { sprite: 'zahn', w: 16, h: 51, effect: { style: 'strahlen' }, tagline: 'Strahlend weiß' }, 320),
  b('gitarre', 'Gitarrenbuch', { sprite: 'gitarre', w: 16, h: 51, effect: { style: 'saiten' }, tagline: 'Spielt dein Lieblingslied' }, 320),
  b('hamster', 'Hamsterbuch', { sprite: 'hamster', w: 16, h: 51, effect: { style: 'koerner' }, tagline: 'Hamstert Wissen' }, 400),
  b('kamera', 'Kamerabuch', { sprite: 'kamera', w: 16, h: 51, effect: { style: 'blitzlicht' }, tagline: 'Merkt sich alles fotografisch' }, 400),
  b('schmetterling', 'Schmetterlingsbuch', { sprite: 'schmetterling', w: 16, h: 51, effect: { style: 'falter' }, tagline: 'Flattert davon' }, 400),
  b('anker', 'Ankerbuch', { sprite: 'anker', w: 16, h: 51, effect: { style: 'moewen' }, tagline: 'Gibt dir Halt' }, 500),
  b('wuerfel', 'Würfelbuch', { sprite: 'wuerfel', w: 16, h: 51, effect: { style: 'wuerfelspiel' }, tagline: 'Dreht sich im Kopf' }, 500),
  b('koala', 'Koalabuch', { sprite: 'koala', w: 16, h: 51, effect: { style: 'eukalyptus' }, tagline: 'Döst im Eukalyptus' }, 500),
  b('eiscreme', 'Eiscremebuch', { sprite: 'eiscreme', w: 16, h: 51, effect: { style: 'schmelzen' }, tagline: 'Schmilzt dahin' }, 600),
  b('schildkroete', 'Schildkrötenbuch', { sprite: 'schildkroete', w: 18, h: 52, effect: { style: 'gemaechlich' }, tagline: 'Langsam, aber sicher' }, 600),
  b('wal', 'Walbuch', { sprite: 'wal', w: 16, h: 51, effect: { style: 'fontaene' }, tagline: 'Ein großes Buch' }, 700),
  b('chamaeleon', 'Chamäleonbuch', { sprite: 'chamaeleon', w: 16, h: 51, effect: { style: 'farbwechsel' }, tagline: 'Wechselt die Farbe' }, 800),
  b('tempel', 'Tempelbuch', { sprite: 'tempel', w: 17, h: 54, effect: { style: 'goldstaub' }, tagline: 'Hütet einen alten Schatz' }, 900),
  b('kristallkugel', 'Kristallkugelbuch', { sprite: 'kristallkugel', w: 16, h: 51, effect: { style: 'nebel' }, tagline: 'Kennt schon die Prüfungsfragen' }, 1100),
  b('lebensbaum', 'Lebensbaumbuch', { sprite: 'lebensbaum', w: 16, h: 51, effect: { style: 'lebenslicht' }, tagline: 'Wurzeln des Wissens' }, 1300),
  b('phoenix', 'Phönixbuch', { sprite: 'phoenix', w: 16, h: 51, effect: { style: 'phoenixfeuer' }, tagline: 'Steigt aus der Asche' }, 1500),
]

/** Standard-Buch (auch für alte Sitzungen aus früheren Lernwelten) */
export const DEFAULT_BOOK = 'tower:buch'

export function worldInfo(_id?: string): WorldInfo {
  return WORLDS[0]!
}
export function collectible(id: string | undefined): Collectible | undefined {
  return COLLECTIBLES.find((c) => c.id === id)
}
/** Buchsorte einer Sitzung – unbekannte (alte Welten) werden zum Standard-Buch */
export function bookOf(id: string | undefined): Collectible {
  return collectible(id) ?? collectible(DEFAULT_BOOK)!
}
export function itemsOfWorld(_world?: WorldId): Collectible[] {
  return COLLECTIBLES
}
/** Besitz: Startstücke + gekaufte */
export function ownsItem(id: string, purchased: Set<string>): boolean {
  const c = collectible(id)
  return !!c && (c.price === 0 || purchased.has(id))
}

/* ---------- Turm ---------- */

/** Bücher pro Regalbrett und Bretter pro Stockwerk */
export const BOOKS_PER_BOARD = 10
export const BOARDS_PER_FLOOR = 3
export const BOOKS_PER_FLOOR = BOOKS_PER_BOARD * BOARDS_PER_FLOOR

/**
 * Verteilt n Bücher (in Reihenfolge) auf Stockwerke und Bretter.
 * Das oberste Stockwerk ist das, an dem gerade gebaut wird; es gibt immer mindestens eins.
 */
export function towerLayout(n: number): { floors: number; inTop: number; left: number; slot: (i: number) => { floor: number; board: number; pos: number } } {
  const count = Math.max(0, Math.floor(n))
  const floors = Math.max(1, Math.ceil(count / BOOKS_PER_FLOOR))
  const inTop = count - (floors - 1) * BOOKS_PER_FLOOR
  return {
    floors,
    inTop,
    left: BOOKS_PER_FLOOR - inTop,
    slot: (i: number) => ({
      floor: Math.floor(i / BOOKS_PER_FLOOR),
      board: Math.floor((i % BOOKS_PER_FLOOR) / BOOKS_PER_BOARD),
      pos: i % BOOKS_PER_BOARD,
    }),
  }
}

/** Innenbreite eines Regalbretts in Grafik-Pixeln (Brett 214, Rand je 3) und Abstand zwischen Büchern */
export const BOARD_INNER = 208
export const BOOK_GAP = 1

export interface ShelfPack {
  /** je Brett die Positionen (Index in der Eingabe) der Bücher */
  boards: number[][]
  floors: number
  /** freier Platz (Pixel) im obersten Stockwerk */
  free: number
  /** ungefähr so viele Bücher passen noch ins oberste Stockwerk */
  left: number
}

/**
 * Bretter lückenlos füllen (Schritt 58): Bücher kommen der Reihe nach aufs Brett, bis das nächste nicht mehr passt –
 * nach Breite statt nach fester Anzahl. So bleibt rechts kein großer Rest; volle Bretter werden in der Anzeige bündig verteilt.
 */
export function packShelf(widths: number[], inner = BOARD_INNER, gap = BOOK_GAP): ShelfPack {
  const boards: number[][] = [[]]
  let used = 0
  widths.forEach((w, i) => {
    const need = (boards[boards.length - 1]!.length ? gap : 0) + w
    if (used + need > inner && boards[boards.length - 1]!.length) {
      boards.push([])
      used = 0
    }
    used += (boards[boards.length - 1]!.length ? gap : 0) + w
    boards[boards.length - 1]!.push(i)
  })
  const floors = Math.max(1, Math.ceil(boards.length / BOARDS_PER_FLOOR))
  const emptyBoards = floors * BOARDS_PER_FLOOR - boards.length
  const free = Math.max(0, inner - used) + emptyBoards * inner
  const avg = 18
  return { boards, floors, free, left: widths.length === 0 ? Math.floor((BOARDS_PER_FLOOR * inner) / (avg + gap)) : Math.floor(free / (avg + gap)) }
}

/**
 * Bücher im Regal mischen (Schritt 52): Innerhalb jedes Stockwerks (30 Bücher) wird so angeordnet,
 * dass gleiche Bücher (gleiche Sorte und Farbe) möglichst nicht nebeneinander stehen – zufällig, aber zum `seed` immer gleich.
 * Bücher bleiben in ihrem Stockwerk; nur das oberste, noch wachsende Stockwerk ordnet sich beim nächsten Buch neu.
 */
export function mixShelf<T>(items: T[], keyOf: (t: T) => string, seed: number): T[] {
  let s = (seed * 2654435761 + 1) >>> 0
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
  const out: T[] = []
  for (let start = 0; start < items.length; start += BOOKS_PER_FLOOR) {
    const groups = new Map<string, T[]>()
    for (const it of items.slice(start, start + BOOKS_PER_FLOOR)) {
      const k = keyOf(it)
      const g = groups.get(k)
      if (g) g.push(it)
      else groups.set(k, [it])
    }
    let prev = out.length ? keyOf(out[out.length - 1]!) : null
    let left = items.slice(start, start + BOOKS_PER_FLOOR).length
    while (left > 0) {
      const keys = [...groups.keys()]
      // Muss eine Sorte jetzt dran, damit sie am Ende nicht doppelt steht? Dann sie.
      const forced = keys.find((k) => k !== prev && groups.get(k)!.length * 2 >= left + 1)
      const options = keys.filter((k) => k !== prev)
      let pick: string
      if (forced) pick = forced
      else if (!options.length) pick = keys[0]!
      else {
        // häufige Sorten bevorzugt verteilen (Gewicht = Anzahl²), sonst bleiben sie am Ende als Block übrig
        const w = (k: string) => groups.get(k)!.length ** 2
        const total = options.reduce((a, k) => a + w(k), 0)
        let r = rnd() * total
        pick = options[options.length - 1]!
        for (const k of options) {
          r -= w(k)
          if (r < 0) {
            pick = k
            break
          }
        }
      }
      const g = groups.get(pick)!
      out.push(g.shift()!)
      if (!g.length) groups.delete(pick)
      prev = pick
      left--
    }
  }
  return out
}

/* ---------- Sitzungen ---------- */

/** Mindestens so viele Karten müssen im Stapel-Modus fällig/neu sein */
export const DECK_MODE_MIN_CARDS = 25
export const TIMER_CHOICES = [10, 15, 25, 45, 60, 90]

export interface FocusSessionRecord {
  id: string
  world: WorldId
  itemId: string
  mode: FocusMode
  deckId: string | null
  startedAt: number
  endedAt: number
  minutes: number
  cards: number
  status: 'grown' | 'lost'
  coins: number
  /** so viele Bücher bringt die Sitzung ins Regal (abgebrochen: 1 graues) */
  books?: number
}

/** Den besonderen Effekt bekommt ein Buch erst, wenn die Sitzung mindestens so lange gedauert hat (Schritt 53) */
export const EFFECT_MIN_MINUTES = 30

/** Hat diese Sitzung den Effekt ihrer Bücher freigeschaltet? (geschafft und lang genug) */
export function effectUnlocked(s: Pick<FocusSessionRecord, 'status' | 'minutes'>): boolean {
  return s.status === 'grown' && s.minutes >= EFFECT_MIN_MINUTES
}

/** Bücher für eine geschaffte Sitzung: je 10 Minuten (Timer) bzw. je 25 Karten (Stapel) eins, mindestens 1, höchstens 10 */
export function booksFor(mode: FocusMode, minutes: number, cards: number): number {
  const n = mode === 'timer' ? Math.floor(minutes / 10) : Math.floor(cards / DECK_MODE_MIN_CARDS)
  return Math.min(10, Math.max(1, n))
}

/** Münzen für eine geschaffte Sitzung */
export function coinsFor(mode: FocusMode, minutes: number, cards: number): number {
  if (mode === 'timer') return Math.max(1, Math.round(minutes))
  // 1 Münze pro 2. Karte + 10 Bonus pro Sitzung, gedeckelt auf 60 (100 Karten → 60 Münzen)
  return Math.min(60, Math.floor(cards / 2) + 10)
}

/** Wachstumsstufe 0–4 (Samen, Keim, klein, groß, fertig) aus dem Fortschritt 0–1 */
export function growthStage(progress: number): 0 | 1 | 2 | 3 | 4 {
  const p = Math.min(1, Math.max(0, progress))
  if (p >= 1) return 4
  if (p >= 0.66) return 3
  if (p >= 0.33) return 2
  if (p >= 0.08) return 1
  return 0
}

/** Kontostand: verdiente Münzen minus Ausgaben */
export function coinBalance(sessions: Pick<FocusSessionRecord, 'coins' | 'status'>[], spent: number[], rewards: number[] = []): number {
  return sessions.reduce((a, s) => a + (s.status === 'grown' ? s.coins : 0), 0) + rewards.reduce((a, b) => a + b, 0) - spent.reduce((a, b) => a + b, 0)
}

/** Kann der Stapel-Modus starten? */
export function deckModeCheck(dueToday: number): { ok: boolean; missing: number } {
  return { ok: dueToday >= DECK_MODE_MIN_CARDS, missing: Math.max(0, DECK_MODE_MIN_CARDS - dueToday) }
}

/** Gilt eine Abwesenheit noch als „kurz weg“? */
export function withinGrace(hiddenForMs: number, graceSeconds: number): boolean {
  return hiddenForMs <= graceSeconds * 1000
}

/* ---------- Einstellungen ---------- */

export type SceneBackground = 'off' | 'study' | 'always'

export interface FocusSettings {
  /** Lernwelt (es gibt nur noch den Wissensturm) */
  world: WorldId
  /** zuletzt gewählte Buchsorte */
  item: Partial<Record<WorldId, string>>
  mode: FocusMode
  timerMinutes: number
  /** so lange darf man die App verlassen, ohne dass das Stück verloren geht */
  graceSeconds: number
  /** Lernwelt als Hintergrund: aus · beim Lernen · überall */
  background: SceneBackground
  /** Bücher im Regal mischen, damit gleiche Bücher nicht alle nebeneinander stehen */
  shelfMix: boolean
  /** Zufallszahl der Mischung – „Neu mischen“ ändert sie */
  shelfSeed: number
  /** Effekte im Regal: an allen freigeschalteten Büchern oder sparsam (eine Sorte je Fach, höchstens 4) – Schritt 69 */
  shelfFx: 'all' | 'calm'
}

export const DEFAULT_FOCUS: FocusSettings = { world: 'tower', item: {}, mode: 'timer', timerMinutes: 25, graceSeconds: 15, background: 'study', shelfMix: true, shelfSeed: 1, shelfFx: 'all' }

export function normalizeFocus(raw: unknown): FocusSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const world = WORLDS.some((w) => w.id === r.world) ? (r.world as WorldId) : DEFAULT_FOCUS.world
  const items = (r.item && typeof r.item === 'object' ? r.item : {}) as Record<string, unknown>
  const item: Partial<Record<WorldId, string>> = {}
  for (const w of WORLDS) {
    const id = items[w.id]
    if (typeof id === 'string' && collectible(id)?.world === w.id) item[w.id] = id
  }
  const tm = typeof r.timerMinutes === 'number' && Number.isFinite(r.timerMinutes) ? Math.round(r.timerMinutes) : DEFAULT_FOCUS.timerMinutes
  const g = typeof r.graceSeconds === 'number' && Number.isFinite(r.graceSeconds) ? Math.round(r.graceSeconds) : DEFAULT_FOCUS.graceSeconds
  return {
    world,
    item,
    mode: r.mode === 'deck' ? 'deck' : 'timer',
    timerMinutes: Math.min(180, Math.max(5, tm)),
    graceSeconds: Math.min(60, Math.max(0, g)),
    background: r.background === 'off' || r.background === 'always' || r.background === 'study' ? r.background : DEFAULT_FOCUS.background,
    shelfMix: typeof r.shelfMix === 'boolean' ? r.shelfMix : DEFAULT_FOCUS.shelfMix,
    shelfSeed: typeof r.shelfSeed === 'number' && Number.isFinite(r.shelfSeed) ? Math.floor(Math.abs(r.shelfSeed)) % 2 ** 31 : DEFAULT_FOCUS.shelfSeed,
    shelfFx: r.shelfFx === 'calm' ? 'calm' : 'all',
  }
}

/* ---------- Streak-Münzen ---------- */

/** Meilensteine: einmal je Streak-Lauf */
export const STREAK_MILESTONES: { days: number; coins: number }[] = [
  { days: 3, coins: 25 },
  { days: 7, coins: 50 },
  { days: 14, coins: 100 },
  { days: 30, coins: 200 },
  { days: 50, coins: 300 },
  { days: 100, coins: 500 },
  { days: 365, coins: 1000 },
]

/** Täglicher Streak-Bonus: Tag 1 = 5, jeder weitere Tag +2, höchstens 30 */
export function dailyStreakCoins(streakDays: number): number {
  return streakDays < 1 ? 0 : Math.min(30, 5 + 2 * (streakDays - 1))
}

/** So viele Wiederholungen braucht es am Tag für den Bonus (Tagesziel, höchstens 10) */
export function streakRewardThreshold(dailyGoal: number): number {
  return dailyGoal > 0 ? Math.min(10, dailyGoal) : 10
}

export interface CoinReward {
  /** eindeutig, z. B. „streak:2026-11-02“ oder „milestone:7:2026-10-27“ */
  key: string
  kind: 'streak' | 'milestone'
  coins: number
  days: number
}

/**
 * Welche Streak-Belohnungen stehen heute an?
 * todayKey/startKey: Lerntag heute und erster Tag des laufenden Streaks; granted: schon vergebene Schlüssel.
 */
export function streakRewardsDue(p: { streak: number; todayReviews: number; threshold: number; todayKey: string; startKey: string; granted: Set<string> }): CoinReward[] {
  if (p.streak < 1 || p.todayReviews < p.threshold) return []
  const out: CoinReward[] = []
  const dk = `streak:${p.todayKey}`
  if (!p.granted.has(dk)) out.push({ key: dk, kind: 'streak', coins: dailyStreakCoins(p.streak), days: p.streak })
  for (const m of STREAK_MILESTONES) {
    const mk = `milestone:${m.days}:${p.startKey}`
    if (p.streak >= m.days && !p.granted.has(mk)) out.push({ key: mk, kind: 'milestone', coins: m.coins, days: m.days })
  }
  return out
}

export function nextMilestone(streakDays: number): { days: number; coins: number } | null {
  return STREAK_MILESTONES.find((m) => m.days > streakDays) ?? null
}
