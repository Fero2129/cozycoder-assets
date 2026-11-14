"""
Regeln der Lernwelt – dieselben wie in packages/core/src/focus.ts der App
(Münzen, Bücher, Streak-Belohnungen). Ohne Anki-Abhängigkeit, damit sie sich testen lassen.
"""

from __future__ import annotations

DECK_MODE_MIN_CARDS = 25
# App-Sperre: so lange darf man in einer nicht erlaubten App sein, danach endet die Sitzung
LOCK_AWAY_SECONDS = 10
TIMER_CHOICES = [10, 15, 25, 45, 60, 90]

STREAK_MILESTONES = [(3, 25), (7, 50), (14, 100), (30, 200), (50, 300), (100, 500), (365, 1000)]

# Gleiche Stapelfarben wie in der App (UI-Richtung C)
TILE_COLORS = ["#4f46e5", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#ca8a04", "#65a30d"]

DEFAULT_FOCUS = {
    "world": "tower",
    "item": {},
    "mode": "timer",
    "timerMinutes": 25,
    "graceSeconds": 15,
    "background": "study",
    "shelfMix": True,
    "shelfSeed": 1,
    "shelfFx": "all",
}

# Auf macOS meist sinnvoll erlaubt; frei änderbar in den Einstellungen der Lernwelt
DEFAULT_ALLOW = {"mac": ["Finder"], "win": [], "linux": [], "other": []}


def books_for(mode: str, minutes: int, cards: int) -> int:
    """Je 10 Minuten (Timer) bzw. je 25 Karten (Stapel) ein Buch, mindestens 1, höchstens 10."""
    n = minutes // 10 if mode == "timer" else cards // DECK_MODE_MIN_CARDS
    return min(10, max(1, n))


# Im Add-on gibt es nur Timer-Sitzungen; beantwortete Karten bringen zusätzlich Münzen
CARD_COINS_MAX = 50


def card_coins(cards: int) -> int:
    """1 Münze pro 2. beantwortete Karte während der Sitzung, höchstens 50."""
    return min(CARD_COINS_MAX, max(0, cards) // 2)


def coins_for(mode: str, minutes: int, cards: int) -> int:
    if mode == "timer":
        return max(1, round(minutes)) + card_coins(cards)
    # alte Stapel-Sitzungen (aus der App): 1 Münze pro 2. Karte + 10 Bonus, gedeckelt auf 60
    return min(60, cards // 2 + 10)


def daily_streak_coins(days: int) -> int:
    return 0 if days < 1 else min(30, 5 + 2 * (days - 1))


def streak_reward_threshold(daily_goal: int = 0) -> int:
    return min(10, daily_goal) if daily_goal > 0 else 10


def next_milestone(days: int):
    for d, c in STREAK_MILESTONES:
        if d > days:
            return {"days": d, "coins": c}
    return None


def streak_rewards_due(streak: int, today_reviews: int, threshold: int, today_key: str, start_key: str, granted: set[str]) -> list[dict]:
    if streak < 1 or today_reviews < threshold:
        return []
    out = []
    dk = f"streak:{today_key}"
    if dk not in granted:
        out.append({"key": dk, "kind": "streak", "coins": daily_streak_coins(streak), "days": streak})
    for d, c in STREAK_MILESTONES:
        mk = f"milestone:{d}:{start_key}"
        if streak >= d and mk not in granted:
            out.append({"key": mk, "kind": "milestone", "coins": c, "days": d})
    return out


def streak_length(days: set[int], today: int) -> int:
    """Tage in Folge bis heute (oder bis gestern, wenn heute noch nicht gelernt wurde)."""
    t = today if today in days else today - 1
    n = 0
    while t in days:
        n += 1
        t -= 1
    return n


def balance(data: dict) -> int:
    earned = sum(int(s.get("coins") or 0) for s in data.get("sessions", []) if s.get("status") == "grown")
    bonus = sum(int(r.get("coins") or 0) for r in data.get("rewards", []))
    spent = sum(int(p.get("price") or 0) for p in data.get("purchases", []))
    return earned + bonus - spent


def normalize_focus(raw) -> dict:
    r = raw if isinstance(raw, dict) else {}
    f = dict(DEFAULT_FOCUS)
    item = r.get("item")
    f["item"] = {"tower": item["tower"]} if isinstance(item, dict) and isinstance(item.get("tower"), str) else {}
    f["mode"] = "deck" if r.get("mode") == "deck" else "timer"
    for key, lo, hi in (("timerMinutes", 5, 180), ("graceSeconds", 0, 60)):
        v = r.get(key)
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            f[key] = int(min(hi, max(lo, round(v))))
    if r.get("background") in ("off", "study", "always"):
        f["background"] = r["background"]
    if isinstance(r.get("shelfMix"), bool):
        f["shelfMix"] = r["shelfMix"]
    v = r.get("shelfSeed")
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        f["shelfSeed"] = int(abs(v)) % 2**31
    f["shelfFx"] = "calm" if r.get("shelfFx") == "calm" else "all"
    return f
