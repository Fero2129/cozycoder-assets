# Kleine Selbstprüfung der Regeln: python3 -m lernwelt.test_logic (aus anki-addon/)
from .logic import books_for, coins_for, daily_streak_coins, streak_length, streak_rewards_due, balance, normalize_focus

assert books_for("timer", 25, 0) == 2 and books_for("timer", 5, 0) == 1 and books_for("timer", 180, 0) == 10
assert books_for("deck", 0, 60) == 2
assert coins_for("timer", 25, 0) == 25 and coins_for("timer", 25, 41) == 45 and coins_for("timer", 25, 500) == 75 and coins_for("deck", 0, 100) == 60 and coins_for("deck", 0, 30) == 25
assert daily_streak_coins(1) == 5 and daily_streak_coins(3) == 9 and daily_streak_coins(50) == 30
assert streak_length({10, 9, 8, 6}, 10) == 3 and streak_length({9, 8}, 10) == 2 and streak_length({8}, 10) == 0
r = streak_rewards_due(7, 12, 10, "2026-11-14", "2026-11-08", set())
assert [x["key"] for x in r] == ["streak:2026-11-14", "milestone:3:2026-11-08", "milestone:7:2026-11-08"]
assert streak_rewards_due(7, 3, 10, "a", "b", set()) == []
assert balance({"sessions": [{"status": "grown", "coins": 25}, {"status": "lost", "coins": 0}], "rewards": [{"coins": 5}], "purchases": [{"price": 20}]}) == 10
assert normalize_focus({"timerMinutes": 999, "graceSeconds": -3, "shelfFx": "calm"})["timerMinutes"] == 180
print("logic ok")
