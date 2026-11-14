"""Texte des Python-Teils in allen Sprachen des Add-ons (die Oberfläche hat eigene Dateien in web/src/i18n)."""

from __future__ import annotations

LANGS = ("de", "en", "es", "fr", "pt")

T: dict[str, dict[str, str]] = {
    "de": {
        "notify_away": "Zurück zu Anki – nach {s} Sekunden in dieser App endet deine Fokus-Sitzung.",
        "r_left": "Du warst länger als {s} Sekunden in einer nicht erlaubten App ({a}).",
        "deck_short": "Stapel für heute geschafft – für das Buch fehlen noch {n} Karten.",
        "name": "Lernwelt", "menu": "Lernwelt (Wissensturm) …", "tip": "Lernwelt öffnen (Fokus-Sitzungen, Wissensturm, Bücherladen)",
        "window": "Lernwelt – Wissensturm", "overview_btn": "📚 Fokus-Sitzung", "deck_menu": "📚 Fokus-Sitzung starten …",
        "started_lock": "📚 Fokus-Sitzung läuft – mehr als 10 Sekunden in einer nicht erlaubten App beendet sie 🔒", "started_nolock": "📚 Fokus-Sitzung läuft – ohne App-Sperre gibt es keine Münzen, nur Bücher",
        "welcome_back": "Gut, dass du zurück bist – dein Buch wächst weiter.", "streak_toast": "🔥 {d} Tage in Folge: +{c} Münzen", "streak_toast_one": "🔥 1 Tag in Folge: +{c} Münzen",
        "bought": "{n} gehört jetzt dir 🎉", "missing": "Dafür fehlen dir noch {n} Münzen – lern weiter!",
        "theme_on": "Design „{n}“ ist jetzt in Anki aktiv", "theme_off": "Design ausgeschaltet",
        "giveup_q": "Sitzung aufgeben?\n\nDas Buch fällt herunter (es landet auf dem Bücherhaufen) und du bekommst keine Münzen.",
        "r_gaveup": "Aufgegeben.", "r_away": "Du warst {s} Sekunden außerhalb von Anki.", "r_closed": "Anki wurde während der Sitzung geschlossen.", "r_closed_long": "Anki war während der Sitzung zu lange geschlossen.",
        "note_mac": "macOS: Du darfst kurz in andere Apps wechseln – bist du länger als 10 Sekunden in einer nicht erlaubten App, endet die Sitzung.",
        "note_win": "Windows: Du darfst kurz in andere Programme wechseln – bist du länger als 10 Sekunden in einem nicht erlaubten Programm, endet die Sitzung.",
        "note_linux": "Linux: Die aktive App wird über xdotool erkannt (nur X11) – länger als 10 Sekunden in einer nicht erlaubten App beendet die Sitzung.",
        "note_linux_off": "Linux: Zum Erkennen erlaubter Apps wird „xdotool“ unter X11 gebraucht – das Add-on merkt aber, wenn du Anki verlässt.",
        "note_other": "Auf diesem System kann das Add-on andere Apps nicht erkennen – es merkt aber, wenn du Anki verlässt.",
        "days": "Mo,Di,Mi,Do,Fr,Sa,So",
    },
    "en": {
        "notify_away": "Back to Anki – after {s} seconds in this app your focus session ends.",
        "r_left": "You spent more than {s} seconds in a non-allowed app ({a}).",
        "deck_short": "Deck done for today – {n} more cards needed for the book.",
        "name": "Study World", "menu": "Study World (Tower of Knowledge) …", "tip": "Open Study World (focus sessions, tower of knowledge, bookshop)",
        "window": "Study World – Tower of Knowledge", "overview_btn": "📚 Focus session", "deck_menu": "📚 Start focus session …",
        "started_lock": "📚 Focus session running – more than 10 seconds in a non-allowed app ends it 🔒", "started_nolock": "📚 Focus session running – without the app lock you only get books, no coins",
        "welcome_back": "Good to have you back – your book keeps growing.", "streak_toast": "🔥 {d} days in a row: +{c} coins", "streak_toast_one": "🔥 1 day in a row: +{c} coins",
        "bought": "{n} is yours now 🎉", "missing": "You need {n} more coins – keep studying!",
        "theme_on": "Design “{n}” is now active in Anki", "theme_off": "Design turned off",
        "giveup_q": "Give up this session?\n\nThe book falls off the shelf (it lands on the pile) and you get no coins.",
        "r_gaveup": "Gave up.", "r_away": "You were outside Anki for {s} seconds.", "r_closed": "Anki was closed during the session.", "r_closed_long": "Anki was closed for too long during the session.",
        "note_mac": "macOS: you may briefly switch to other apps – spend more than 10 seconds in a non-allowed app and the session ends.",
        "note_win": "Windows: you may briefly switch to other programs – spend more than 10 seconds in a non-allowed program and the session ends.",
        "note_linux": "Linux: the active app is detected via xdotool (X11 only) – more than 10 seconds in a non-allowed app ends the session.",
        "note_linux_off": "Linux: detecting allowed apps needs “xdotool” on X11 – the add-on still notices when you leave Anki.",
        "note_other": "On this system the add-on can’t detect other apps – it still notices when you leave Anki.",
        "days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
    },
    "es": {
        "notify_away": "Vuelve a Anki: tras {s} segundos en esta app tu sesión de concentración termina.",
        "r_left": "Pasaste más de {s} segundos en una app no permitida ({a}).",
        "deck_short": "Mazo terminado por hoy: faltan {n} tarjetas para el libro.",
        "name": "Mundo de Estudio", "menu": "Mundo de Estudio (Torre del saber) …", "tip": "Abrir Mundo de Estudio (sesiones de concentración, torre del saber, librería)",
        "window": "Mundo de Estudio – Torre del saber", "overview_btn": "📚 Sesión de concentración", "deck_menu": "📚 Iniciar sesión de concentración …",
        "started_lock": "📚 Sesión en curso: más de 10 segundos en una app no permitida la termina 🔒", "started_nolock": "📚 Sesión en curso: sin bloqueo de apps solo hay libros, no monedas",
        "welcome_back": "¡Qué bien que vuelvas! Tu libro sigue creciendo.", "streak_toast": "🔥 {d} días seguidos: +{c} monedas", "streak_toast_one": "🔥 1 día seguido: +{c} monedas",
        "bought": "{n} ya es tuyo 🎉", "missing": "Te faltan {n} monedas: ¡sigue estudiando!",
        "theme_on": "El diseño «{n}» está activo en Anki", "theme_off": "Diseño desactivado",
        "giveup_q": "¿Rendirse en esta sesión?\n\nEl libro se cae (acaba en el montón) y no recibes monedas.",
        "r_gaveup": "Te has rendido.", "r_away": "Estuviste {s} segundos fuera de Anki.", "r_closed": "Anki se cerró durante la sesión.", "r_closed_long": "Anki estuvo cerrado demasiado tiempo durante la sesión.",
        "note_mac": "macOS: puedes cambiar un momento a otras apps; si pasas más de 10 segundos en una app no permitida, la sesión termina.",
        "note_win": "Windows: puedes cambiar un momento a otros programas; si pasas más de 10 segundos en un programa no permitido, la sesión termina.",
        "note_linux": "Linux: la app activa se detecta con xdotool (solo X11); más de 10 segundos en una app no permitida terminan la sesión.",
        "note_linux_off": "Linux: para detectar las apps permitidas hace falta «xdotool» en X11; el complemento igualmente detecta cuando sales de Anki.",
        "note_other": "En este sistema el complemento no puede detectar otras apps, pero sí nota cuando sales de Anki.",
        "days": "Lu,Ma,Mi,Ju,Vi,Sá,Do",
    },
    "fr": {
        "notify_away": "Reviens dans Anki – après {s} secondes dans cette app, ta session de concentration s’arrête.",
        "r_left": "Tu es resté plus de {s} secondes dans une app non autorisée ({a}).",
        "deck_short": "Paquet terminé pour aujourd’hui – encore {n} cartes pour le livre.",
        "name": "Monde d’étude", "menu": "Monde d’étude (Tour du savoir) …", "tip": "Ouvrir le Monde d’étude (sessions de concentration, tour du savoir, librairie)",
        "window": "Monde d’étude – Tour du savoir", "overview_btn": "📚 Session de concentration", "deck_menu": "📚 Lancer une session de concentration …",
        "started_lock": "📚 Session en cours – plus de 10 secondes dans une app non autorisée y met fin 🔒", "started_nolock": "📚 Session en cours : sans blocage, seulement des livres, pas de pièces",
        "welcome_back": "Content de te revoir – ton livre continue de pousser.", "streak_toast": "🔥 {d} jours d’affilée : +{c} pièces", "streak_toast_one": "🔥 1 jour d’affilée : +{c} pièces",
        "bought": "{n} est à toi 🎉", "missing": "Il te manque {n} pièces : continue à réviser !",
        "theme_on": "Le thème « {n} » est actif dans Anki", "theme_off": "Thème désactivé",
        "giveup_q": "Abandonner la session ?\n\nLe livre tombe (il finit sur la pile) et tu ne gagnes pas de pièces.",
        "r_gaveup": "Abandonné.", "r_away": "Tu as quitté Anki pendant {s} secondes.", "r_closed": "Anki a été fermé pendant la session.", "r_closed_long": "Anki est resté fermé trop longtemps pendant la session.",
        "note_mac": "macOS : tu peux passer brièvement à d’autres apps – plus de 10 secondes dans une app non autorisée et la session s’arrête.",
        "note_win": "Windows : tu peux passer brièvement à d’autres programmes – plus de 10 secondes dans un programme non autorisé et la session s’arrête.",
        "note_linux": "Linux : l’app active est détectée via xdotool (X11 uniquement) – plus de 10 secondes dans une app non autorisée arrêtent la session.",
        "note_linux_off": "Linux : il faut « xdotool » sous X11 pour reconnaître les apps autorisées – l’extension remarque quand même quand tu quittes Anki.",
        "note_other": "Sur ce système, l’extension ne peut pas reconnaître les autres apps – elle remarque quand même quand tu quittes Anki.",
        "days": "Lu,Ma,Me,Je,Ve,Sa,Di",
    },
    "pt": {
        "notify_away": "Volte ao Anki – após {s} segundos neste app sua sessão de foco termina.",
        "r_left": "Você ficou mais de {s} segundos num app não permitido ({a}).",
        "deck_short": "Baralho concluído por hoje – faltam {n} cartões para o livro.",
        "name": "Mundo de Estudo", "menu": "Mundo de Estudo (Torre do saber) …", "tip": "Abrir o Mundo de Estudo (sessões de foco, torre do saber, livraria)",
        "window": "Mundo de Estudo – Torre do saber", "overview_btn": "📚 Sessão de foco", "deck_menu": "📚 Iniciar sessão de foco …",
        "started_lock": "📚 Sessão em andamento – mais de 10 segundos num app não permitido a encerram 🔒", "started_nolock": "📚 Sessão em andamento: sem bloqueio de apps, só livros, sem moedas",
        "welcome_back": "Que bom que você voltou – seu livro continua crescendo.", "streak_toast": "🔥 {d} dias seguidos: +{c} moedas", "streak_toast_one": "🔥 1 dia seguido: +{c} moedas",
        "bought": "{n} agora é seu 🎉", "missing": "Faltam {n} moedas: continue estudando!",
        "theme_on": "O tema “{n}” está ativo no Anki", "theme_off": "Tema desativado",
        "giveup_q": "Desistir da sessão?\n\nO livro cai (vai para a pilha) e você não ganha moedas.",
        "r_gaveup": "Desistiu.", "r_away": "Você ficou {s} segundos fora do Anki.", "r_closed": "O Anki foi fechado durante a sessão.", "r_closed_long": "O Anki ficou fechado tempo demais durante a sessão.",
        "note_mac": "macOS: você pode mudar rapidamente para outros apps – mais de 10 segundos num app não permitido e a sessão termina.",
        "note_win": "Windows: você pode mudar rapidamente para outros programas – mais de 10 segundos num programa não permitido e a sessão termina.",
        "note_linux": "Linux: o app ativo é detectado via xdotool (só X11) – mais de 10 segundos num app não permitido encerram a sessão.",
        "note_linux_off": "Linux: para reconhecer os apps permitidos é preciso o “xdotool” no X11 – o complemento ainda percebe quando você sai do Anki.",
        "note_other": "Neste sistema o complemento não consegue reconhecer outros apps – mas percebe quando você sai do Anki.",
        "days": "Seg,Ter,Qua,Qui,Sex,Sáb,Dom",
    },
}


def resolve(setting: str | None) -> str:
    """Sprache aus der Einstellung („auto“ = Ankis Sprache, sonst Englisch)."""
    if setting in LANGS:
        return setting  # type: ignore[return-value]
    try:
        from anki.lang import current_lang

        code = (current_lang or "en")[:2].lower()
    except Exception:  # noqa: BLE001
        code = "en"
    return code if code in LANGS else "en"


def tr(lang: str, key: str, **vars) -> str:  # noqa: ANN003
    d = T.get(lang, T["en"])
    if vars.get("d") == 1 and f"{key}_one" in d:
        key = f"{key}_one"
    s = d.get(key) or T["en"].get(key) or key
    return s.format(**vars) if vars else s
