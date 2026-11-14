"""
Lernwelt für Anki: Fokus-Sitzungen (Timer oder „Stapel schaffen“), Bücherregal/Wissensturm,
Münzen, Bücherladen, Streak-Münzen und – auf Wunsch – Sperre anderer Apps während der Sitzung.

Die Oberfläche ist dieselbe wie in der App (React, aus apps/web gebaut, liegt in web/).
Gespeichert wird in der Anki-Sammlung (Konfiguration „lernwelt“) – so wandert alles mit der
AnkiWeb-Synchronisierung auf andere Computer. Die gerade laufende Sitzung liegt zusätzlich lokal
in user_files/, damit ein Absturz sie nicht verschluckt.
"""

from __future__ import annotations

import datetime
import json
import os
import time
import uuid
from typing import Any, Optional

from anki.utils import ids2str
from aqt import gui_hooks, mw
from aqt.qt import QAction, QApplication, QColor, QDialog, QTimer, QUrl, QVBoxLayout, QWidget, Qt
from aqt.utils import askUser, restoreGeom, saveGeom, tooltip
from aqt.webview import AnkiWebView

from . import applock, i18n, logic

ADDON = mw.addonManager.addonFromModule(__name__)
CONFIG_KEY = "lernwelt"
DAYS_BACK = 5000  # so weit zurück wird für die Serie geschaut (~13 Jahre)


def now_ms() -> int:
    return int(time.time() * 1000)


def page_url(view: str) -> QUrl:
    return QUrl(f"{mw.serverURL()}_addons/{ADDON}/web/index.html?view={view}")


def addon_config() -> dict:
    return mw.addonManager.getConfig(__name__) or {}


def L(key: str, **vars) -> str:  # noqa: ANN003, N802
    """Text in der eingestellten Sprache (Einstellung in der Lernwelt, sonst Ankis Sprache)."""
    setting = LW.data.get("lang") if LW and LW.data else None
    return i18n.tr(i18n.resolve(setting), key, **vars)


def night_mode() -> bool:
    try:
        from aqt.theme import theme_manager

        return bool(theme_manager.night_mode)
    except Exception:  # noqa: BLE001
        return False


def reduce_motion() -> bool:
    try:
        return bool(mw.pm.reduce_motion())
    except Exception:  # noqa: BLE001
        return False


# --------------------------------------------------------------------------- Fenster


def make_web(parent: QWidget, title: str, bg: str, ctl: "Lernwelt", view: str) -> AnkiWebView:
    web = AnkiWebView(parent, title=title)
    web.page().setBackgroundColor(QColor(bg))
    # Unsere Seite liegt unter /_addons/ – ohne das würde Anki sie im System-Browser öffnen
    try:
        web.page().open_links_externally = False
    except Exception:  # noqa: BLE001
        pass
    web.set_bridge_command(ctl.on_bridge, parent)
    web.load_url(page_url(view))
    return web


class LernweltDialog(QDialog):
    """Eigenes Fenster mit der Bibliothek (Regal, Shop, Einstellungen, Start, Ergebnis)."""

    def __init__(self, ctl: "Lernwelt") -> None:
        super().__init__(None, Qt.WindowType.Window)
        self.ctl = ctl
        self.setWindowTitle(L("window"))
        self.setMinimumSize(640, 520)
        self.resize(1100, 800)
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        self.web = make_web(self, "lernwelt", "#1a1018", ctl, "world")
        lay.addWidget(self.web)
        restoreGeom(self, "lernwelt")

    def push(self, state: dict) -> None:
        self.web.page().runJavaScript(f"window.lwSetState && window.lwSetState({json.dumps(state)})")

    def toast(self, text: str) -> None:
        self.web.page().runJavaScript(f"window.lwToast && window.lwToast({json.dumps(text)})")

    def reject(self) -> None:
        """Schließen über ×, Esc oder den Knopf „Schließen“ (QDialog.closeEvent ruft ebenfalls reject auf)."""
        saveGeom(self, "lernwelt")
        self.ctl.on_dialog_closed()
        super().reject()


class FocusBar(QWidget):
    """Schmale Leiste über den Karten während einer Fokus-Sitzung (wachsendes Buch, Zeit, Sperre, Aufgeben)."""

    def __init__(self, ctl: "Lernwelt") -> None:
        super().__init__(mw)
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        self.web = make_web(self, "lernwelt-bar", "#4f2c14", ctl, "bar")
        self.web.setFixedHeight(58)
        lay.addWidget(self.web)
        self.setFixedHeight(58)

    def push(self, state: dict) -> None:
        self.web.page().runJavaScript(f"window.lwSetState && window.lwSetState({json.dumps(state)})")


# --------------------------------------------------------------------------- Steuerung


class Lernwelt:
    def __init__(self) -> None:
        self.data: dict = {}
        self.active: Optional[dict] = None
        self.result: Optional[dict] = None
        self.dialog: Optional[LernweltDialog] = None
        self.bar: Optional[FocusBar] = None
        self.lock = applock.create()
        self.open_start: Optional[str] = None
        self.tab = "welt"
        self.visit = 0
        self.timer = QTimer(mw)
        self.timer.setInterval(400)
        self.timer.timeout.connect(self.tick)
        self._last_heartbeat = 0
        self._last_push_back = 0
        self._last_force = 0
        self._in_blocked = False
        self._finishing = False

    # ---------------- Speicher

    def load(self) -> None:
        raw = mw.col.get_config(CONFIG_KEY, None) or {}
        d = raw if isinstance(raw, dict) else {}
        plat = self.lock.platform
        lock = d.get("lock") if isinstance(d.get("lock"), dict) else {}
        self.data = {
            "v": 1,
            "sessions": [s for s in d.get("sessions", []) if isinstance(s, dict)],
            "purchases": [p for p in d.get("purchases", []) if isinstance(p, dict)],
            "rewards": [r for r in d.get("rewards", []) if isinstance(r, dict)],
            "focus": logic.normalize_focus(d.get("focus")),
            "lock": {
                "enabled": bool(lock.get("enabled", True)),
                "allow": [str(x) for x in lock.get("allow", logic.DEFAULT_ALLOW.get(plat, []))][:50],
            },
            "deckColors": {str(k): v for k, v in (d.get("deckColors") or {}).items() if isinstance(v, str)},
            "theme": d.get("theme") if isinstance(d.get("theme"), dict) else None,
            "lang": d.get("lang") if d.get("lang") in i18n.LANGS else "auto",
        }

    def save(self) -> None:
        mw.col.set_config(CONFIG_KEY, self.data)

    def _active_path(self) -> str:
        folder = os.path.join(mw.addonManager.addonsFolder(ADDON), "user_files")
        os.makedirs(folder, exist_ok=True)
        name = "".join(c for c in (mw.pm.name or "profil") if c.isalnum() or c in "-_") or "profil"
        return os.path.join(folder, f"aktive-sitzung-{name}.json")

    def _write_active(self) -> None:
        try:
            path = self._active_path()
            if self.active:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(self.active, f)
            elif os.path.exists(path):
                os.remove(path)
        except OSError:
            pass

    # ---------------- Profil

    def on_profile_open(self) -> None:
        self.load()
        self.active = None
        self.result = None
        try:
            with open(self._active_path(), encoding="utf-8") as f:
                a = json.load(f)
        except (OSError, ValueError):
            a = None
        if isinstance(a, dict) and isinstance(a.get("startedAt"), int):
            self.active = a
            gone = now_ms() - int(a.get("lastSeen") or a["startedAt"])
            if gone > (int(a.get("graceSeconds", 15)) + 10) * 1000:
                self.finish("lost", L("r_closed_long"), show=False)
            else:
                self._resume()
        QTimer.singleShot(1500, self.grant_streak_rewards)

    def on_profile_close(self) -> None:
        if self.active:
            self.finish("lost", L("r_closed"), show=False)
        self.timer.stop()
        if self.dialog:
            self.dialog.reject()
            self.dialog = None
        self._remove_bar()

    # ---------------- Anki-Daten

    def _deck_rows(self) -> list[tuple[str, int]]:
        rows = [(d.name, int(d.id)) for d in mw.col.decks.all_names_and_ids()]
        has_default_cards = mw.col.db.scalar("select 1 from cards where did = 1 limit 1")
        if len(rows) > 1 and not has_default_cards:
            rows = [r for r in rows if r[1] != 1]
        return sorted(rows, key=lambda r: [p.lower() for p in r[0].split("::")])

    def _due_map(self) -> dict[int, int]:
        out: dict[int, int] = {}

        def walk(node) -> None:
            out[int(node.deck_id)] = int(node.new_count) + int(node.learn_count) + int(node.review_count)
            for ch in node.children:
                walk(ch)

        try:
            walk(mw.col.sched.deck_due_tree())
        except Exception:  # noqa: BLE001
            pass
        return out

    def decks_info(self, with_due: bool) -> list[dict]:
        rows = self._deck_rows()
        due = self._due_map() if with_due else {}
        tops = [r for r in rows if "::" not in r[0]]
        top_color: dict[str, str] = {}
        for i, (name, did) in enumerate(tops):
            top_color[name] = self.data["deckColors"].get(str(did)) or logic.TILE_COLORS[i % len(logic.TILE_COLORS)]
        out = []
        for name, did in rows:
            top = name.split("::")[0]
            out.append({
                "id": str(did),
                "name": name,
                "color": top_color.get(top, logic.TILE_COLORS[0]),
                "due": due.get(did, 0),
                "depth": name.count("::"),
            })
        return out

    def remaining_today(self, did: int) -> int:
        try:
            node = mw.col.sched.deck_due_tree(did)
            if node is not None:
                return int(node.new_count) + int(node.learn_count) + int(node.review_count)
        except Exception:  # noqa: BLE001
            pass
        return self._due_map().get(did, 0)

    def answered_since(self, start_ms: int, dids: list[int]) -> int:
        base = "select count() from revlog where id >= ? and ease > 0 and type in (0, 1, 2, 3)"
        if dids:
            ids = ids2str(dids)
            return int(mw.col.db.scalar(f"{base} and cid in (select id from cards where did in {ids} or odid in {ids})", start_ms) or 0)
        return int(mw.col.db.scalar(base, start_ms) or 0)

    # ---------------- Serie & Streak-Münzen

    def _streak_data(self) -> dict:
        cutoff = int(mw.col.sched.day_cutoff)
        base = cutoff - 86400 * DAYS_BACK
        today = DAYS_BACK - 1
        days = set(
            int(x)
            for x in mw.col.db.list(
                "select distinct (id / 1000 - ?) / 86400 from revlog where id >= ? and ease > 0 and type in (0, 1, 2, 3)",
                base,
                base * 1000,
            )
        )
        n = logic.streak_length(days, today)
        start_idx = (today if today in days else today - 1) - n + 1
        key = lambda idx: datetime.date.fromtimestamp(base + idx * 86400 + 7200).isoformat()  # noqa: E731
        today_reviews = int(
            mw.col.db.scalar("select count() from revlog where id >= ? and ease > 0 and type in (0, 1, 2, 3)", (cutoff - 86400) * 1000) or 0
        )
        names = L("days").split(",")
        week = []
        for idx in range(today - 6, today + 1):
            d = datetime.date.fromtimestamp(base + idx * 86400 + 7200)
            week.append({"label": names[d.weekday()], "done": idx in days, "today": idx == today})
        return {"days": n, "todayKey": key(today), "startKey": key(start_idx), "todayReviews": today_reviews, "week": week}

    def grant_streak_rewards(self) -> None:
        if not mw.col:
            return
        threshold = logic.streak_reward_threshold()
        cutoff = int(mw.col.sched.day_cutoff)
        today_key = datetime.date.fromtimestamp(cutoff - 86400 + 7200).isoformat()
        granted = {r.get("key") for r in self.data.get("rewards", [])}
        if f"streak:{today_key}" in granted:
            return
        today_reviews = int(
            mw.col.db.scalar("select count() from revlog where id >= ? and ease > 0 and type in (0, 1, 2, 3)", (cutoff - 86400) * 1000) or 0
        )
        if today_reviews < threshold:
            return
        sd = self._streak_data()
        due = logic.streak_rewards_due(sd["days"], sd["todayReviews"], threshold, sd["todayKey"], sd["startKey"], granted)
        if not due:
            return
        for r in due:
            self.data["rewards"].append({**r, "at": now_ms()})
        self.save()
        total = sum(r["coins"] for r in due)
        text = L("streak_toast", d=sd["days"], c=total)
        self.toast(text)
        self.push()

    def streak_info(self) -> dict:
        sd = self._streak_data()
        threshold = logic.streak_reward_threshold()
        got = next((r for r in self.data["rewards"] if r.get("key") == f"streak:{sd['todayKey']}"), None)
        days = sd["days"]
        coming = days if sd["todayReviews"] > 0 else days + 1
        return {
            "days": days,
            "todayReviews": sd["todayReviews"],
            "threshold": threshold,
            "todayGot": bool(got),
            "todayCoins": int(got["coins"]) if got else logic.daily_streak_coins(max(1, coming)),
            "next": logic.next_milestone(days),
            "streakCoins": sum(int(r.get("coins") or 0) for r in self.data["rewards"]),
            "week": sd["week"],
        }

    # ---------------- Zustand für die Oberfläche

    def lock_info(self) -> dict:
        return {
            "enabled": bool(self.data["lock"]["enabled"]) and self.lock.available,
            "allow": self.data["lock"]["allow"],
            "available": self.lock.available,
            "platform": self.lock.platform,
            "note": L(self._lock_note_key()),
        }

    def _lock_note_key(self) -> str:
        if self.lock.platform == "mac" and self.lock.available:
            return "note_mac"
        if self.lock.platform == "win" and self.lock.available:
            return "note_win"
        if self.lock.platform == "linux":
            return "note_linux" if self.lock.available else "note_linux_off"
        return "note_other"

    def active_public(self) -> Optional[dict]:
        a = self.active
        if not a:
            return None
        return {
            "mode": a["mode"],
            "itemId": a["itemId"],
            "deckId": a.get("deckId"),
            "startedAt": a["startedAt"],
            "minutes": a["minutes"],
            "target": a.get("target", 0),
            "cards": a.get("cards", 0),
            "lock": bool(a.get("lock")),
            "blocked": a.get("blocked", 0),
            "blockedApp": a.get("blockedApp"),
            "away": bool(a.get("awaySince")),
        }

    def state(self) -> dict:
        d = self.data
        return {
            "sessions": d["sessions"],
            "purchased": [p.get("itemId") for p in d["purchases"]],
            "balance": logic.balance(d),
            "focus": d["focus"],
            "lock": self.lock_info(),
            "decks": self.decks_info(with_due=True),
            "currentDeck": str(mw.col.decks.current()["id"]),
            "streak": self.streak_info(),
            "active": self.active_public(),
            "result": self.result,
            "night": night_mode(),
            "reduceMotion": reduce_motion(),
            "openStart": self.open_start,
            "tab": self.tab,
            "visit": self.visit,
            "theme": (self.data.get("theme") or {}).get("id"),
            "lang": i18n.resolve(self.data.get("lang")),
            "langSetting": self.data.get("lang", "auto"),
        }

    def bar_state(self) -> dict:
        return {
            "lang": i18n.resolve(self.data.get("lang")),
            "focus": self.data["focus"],
            "decks": self.decks_info(with_due=False),
            "active": self.active_public(),
            "night": night_mode(),
            "reduceMotion": reduce_motion(),
        }

    def push(self) -> None:
        if self.dialog and self.dialog.isVisible():
            self.dialog.push(self.state())
        self.push_bar()

    def push_bar(self) -> None:
        if self.bar:
            self.bar.push(self.bar_state())

    def toast(self, text: str) -> None:
        if self.dialog and self.dialog.isVisible():
            self.dialog.toast(text)
        else:
            tooltip(text, period=4000)

    # ---------------- Fenster

    def open(self, start_deck: Optional[str] = None, tab: str = "welt") -> None:
        if not mw.col:
            return
        self.open_start = start_deck
        self.tab = tab
        self.visit += 1
        if not self.dialog:
            self.dialog = LernweltDialog(self)
        self.dialog.show()
        self.dialog.raise_()
        self.dialog.activateWindow()
        self.dialog.push(self.state())

    def close_dialog(self) -> None:
        # erst nach dem laufenden Aufruf aus der Webseite schließen
        if self.dialog and self.dialog.isVisible():
            QTimer.singleShot(0, self.dialog.reject)

    def on_dialog_closed(self) -> None:
        self.result = None
        self.open_start = None

    # ---------------- Befehle aus der Oberfläche

    def on_bridge(self, cmd: str) -> Any:
        if not cmd.startswith("lw:"):
            return None
        _, name, payload = cmd.split(":", 2)
        try:
            p = json.loads(payload) if payload else {}
        except ValueError:
            p = {}
        if name == "ready":
            if self.dialog and self.dialog.web.page() is not None:
                self.push()
        elif name == "close":
            self.close_dialog()
        elif name == "open":
            self.open()
        elif name == "settings":
            self.data["focus"] = logic.normalize_focus({**self.data["focus"], **(p.get("focus") or {})})
            self.save()
            self.push()
        elif name == "lock":
            if "enabled" in p:
                self.data["lock"]["enabled"] = bool(p["enabled"])
            if isinstance(p.get("allow"), list):
                self.data["lock"]["allow"] = [str(x).strip() for x in p["allow"] if str(x).strip()][:50]
            self.save()
            self.push()
        elif name == "deckcolor":
            if p.get("color") in logic.TILE_COLORS and p.get("id"):
                self.data["deckColors"][str(p["id"])] = p["color"]
                self.save()
                self.push()
        elif name == "lang":
            v = p.get("lang")
            self.data["lang"] = v if v in i18n.LANGS else "auto"
            self.save()
            if self.dialog:
                self.dialog.setWindowTitle(L("window"))
            self.push()
            try:
                mw.toolbar.draw()
            except Exception:  # noqa: BLE001
                pass
        elif name == "theme":
            self.set_theme(p)
        elif name == "buy":
            self.buy(str(p.get("id", "")), int(p.get("price") or 0), str(p.get("name") or ""))
        elif name == "start":
            self.start(p)
        elif name == "giveup":
            self.give_up()
        elif name == "study":
            self.close_dialog()
            self._go_study()
        elif name == "dismiss":
            self.result = None
            self.open_start = None
            if p.get("close"):
                self.close_dialog()
            else:
                self.push()
        return None

    def buy(self, item_id: str, price: int, name: str = "Das Buch") -> None:
        if not (item_id.startswith("tower:") or item_id.startswith("theme:")) or price < 0:
            return
        if any(x.get("itemId") == item_id for x in self.data["purchases"]):
            return
        if logic.balance(self.data) < price:
            self.toast(L("missing", n=price - logic.balance(self.data)))
            return
        self.data["purchases"].append({"itemId": item_id, "price": price, "at": now_ms()})
        self.save()
        self.toast(L("bought", n=name))
        self.push()

    # ---------------- Pixel-Designs als Hintergrund in Anki

    def set_theme(self, p: dict) -> None:
        tid = p.get("id")
        if not tid:
            self.data["theme"] = None
            self.toast(L("theme_off"))
        else:
            image = str(p.get("image") or "")
            if not image.replace("-", "").replace("_", "").isalnum():
                return
            if not any(x.get("itemId") == f"theme:{tid}" for x in self.data["purchases"]):
                return
            self.data["theme"] = {"id": str(tid), "image": image, "dim": int(p.get("dim") or 30), "name": str(p.get("name") or "")}
            self.toast(L("theme_on", n=self.data["theme"]["name"]))
        self.save()
        self.push()
        # Hauptfenster neu zeichnen, damit der Hintergrund gleich wechselt
        try:
            if mw.state == "deckBrowser":
                mw.deckBrowser.refresh()
            elif mw.state == "overview":
                mw.overview.refresh()
            elif mw.state == "review":
                mw.moveToState("review")
        except Exception:  # noqa: BLE001
            pass

    def theme_css(self) -> str:
        t = self.data.get("theme") if self.data else None
        if not t:
            return ""
        url = f"/_addons/{ADDON}/web/themes/{t['image']}.png"
        a = max(0, min(80, int(t.get("dim") or 30))) / 100
        panel = "rgba(30, 25, 38, .9)" if night_mode() else "rgba(255, 255, 255, .92)"
        return f"""<style id="lernwelt-theme">
html {{ background: linear-gradient(rgba(0,0,0,{a}), rgba(0,0,0,{a})), url("{url}") center / cover fixed no-repeat !important; image-rendering: pixelated; min-height: 100%; }}
body, body.card, body.nightMode, body.night_mode {{ background: transparent !important; }}
body:not(.card) > center {{ display: block; width: fit-content; max-width: min(900px, 94vw); margin: 22px auto; padding: 14px 22px; border-radius: 16px; background: {panel}; box-shadow: 0 10px 30px rgba(0,0,0,.35); image-rendering: auto; }}
#qa {{ max-width: 880px; margin: 18px auto !important; padding: 18px 24px; border-radius: 16px; background: {panel}; box-shadow: 0 10px 30px rgba(0,0,0,.35); image-rendering: auto; }}
#qa img {{ image-rendering: auto; }}
</style>"""

    # ---------------- Fokus-Sitzung

    def start(self, p: dict) -> None:
        if self.active or not mw.col:
            return
        # Nur Timer-Sitzungen. Der Stapel bestimmt die Buchfarbe und was gelernt wird;
        # Münzen gibt es für alle Karten, die während der Sitzung in Anki beantwortet werden.
        mode = "timer"
        deck_id = str(p["deckId"]) if p.get("deckId") else None
        did = int(deck_id) if deck_id else None
        dids: list[int] = []
        target = 0
        minutes = int(p.get("minutes") or 25)
        minutes = min(180, max(5, minutes))
        item = str(p.get("itemId") or "tower:buch")
        lock = bool(p.get("lock")) and self.lock.available
        grace = int(self.data["focus"]["graceSeconds"])
        t = now_ms()
        self.active = {
            "mode": mode,
            "itemId": item,
            "deckId": deck_id,
            "deckIds": dids,
            "startedAt": t,
            "lastSeen": t,
            "minutes": minutes,
            "target": target,
            "graceSeconds": grace,
            "lock": lock,
            "cards": 0,
            "blocked": 0,
            "blockedApp": None,
            "awaySince": None,
        }
        f = self.data["focus"]
        f["mode"], f["timerMinutes"], f["item"] = "timer", minutes, {"tower": item}
        if self.lock.available:
            self.data["lock"]["enabled"] = lock
        self.save()
        self._write_active()
        self.result = None
        self.open_start = None
        self.close_dialog()
        self._resume()
        if did:
            self._go_study()
        tooltip(L("started_lock") if lock else L("started_nolock"), period=4000)

    def _go_study(self) -> None:
        a = self.active
        if not a or not a.get("deckId"):
            return
        try:
            mw.col.decks.select(int(a["deckId"]))
            mw.col.startTimebox()
        except Exception:  # noqa: BLE001
            pass
        mw.moveToState("review")

    def _resume(self) -> None:
        self._in_blocked = False
        self._show_bar()
        self.timer.start()
        self.push()

    def _show_bar(self) -> None:
        if not addon_config().get("show_focus_bar", True):
            return
        if not self.bar:
            self.bar = FocusBar(self)
            mw.mainLayout.insertWidget(1, self.bar)
        self.bar.show()
        QTimer.singleShot(400, self.push_bar)

    def _remove_bar(self) -> None:
        if self.bar:
            self.bar.hide()
            mw.mainLayout.removeWidget(self.bar)
            self.bar.deleteLater()
            self.bar = None

    def give_up(self) -> None:
        a = self.active
        if not a:
            return
        parent = self.dialog if self.dialog and self.dialog.isVisible() else mw
        if askUser(L("giveup_q"), parent=parent, defaultno=True, title=L("name")):
            if self.active:
                self.finish("lost", L("r_gaveup"))

    def finish(self, status: str, reason: Optional[str] = None, show: bool = True) -> None:
        a = self.active
        if not a or self._finishing:
            return
        self._finishing = True
        try:
            t = now_ms()
            end = t if status == "grown" else min(t, int(a.get("awaySince") or t))
            try:
                cards = self.answered_since(a["startedAt"], a.get("deckIds") or [])
            except Exception:  # noqa: BLE001
                cards = int(a.get("cards") or 0)
            minutes = a["minutes"] if a["mode"] == "timer" and status == "grown" else max(0, round((end - a["startedAt"]) / 60000))
            record = {
                "world": "tower",
                "itemId": a["itemId"],
                "mode": a["mode"],
                "deckId": a.get("deckId"),
                "startedAt": a["startedAt"],
                "endedAt": end,
                "minutes": minutes,
                "cards": cards,
                "status": status,
                # Münzen nur mit App-Sperre – ohne Sperre wächst das Buch trotzdem
                "coins": logic.coins_for(a["mode"], minutes, cards) if status == "grown" and a.get("lock") else 0,
                "books": logic.books_for(a["mode"], minutes, cards) if status == "grown" else 1,
            }
            self.active = None
            self.timer.stop()
            self._write_active()
            self.data["sessions"].append({"id": uuid.uuid4().hex, **record})
            self.save()
            self._remove_bar()
            self.result = {"record": record, "reason": reason}
            if show:
                self.open()
                if self.lock.available and a.get("lock"):
                    self.lock.activate_self(int(self.dialog.winId()) if self.dialog else 0)
            else:
                self.result = None
        finally:
            self._finishing = False

    def tick(self) -> None:
        a = self.active
        if not a:
            self.timer.stop()
            return
        t = now_ms()
        if a["mode"] == "timer" and t - a["startedAt"] >= a["minutes"] * 60_000:
            self.finish("grown")
            return
        here = self._check_presence(a, t)
        if here:
            if a.get("awaySince"):
                away = t - int(a["awaySince"])
                a["awaySince"] = None
                if away > 1500:
                    tooltip(L("welcome_back"), period=2500)
                self.push_bar()
        else:
            if not a.get("awaySince"):
                a["awaySince"] = t
                self.push_bar()
            away = t - int(a["awaySince"])
            if a.get("lock") and self.lock.available:
                # App-Sperre: kurz in andere Apps wechseln ist erlaubt, länger als LOCK_AWAY_SECONDS beendet die Sitzung
                if away > logic.LOCK_AWAY_SECONDS * 1000:
                    self.finish("lost", L("r_left", s=logic.LOCK_AWAY_SECONDS, a=a.get("blockedApp") or "?"))
                    return
            elif away > int(a.get("graceSeconds", 15)) * 1000:
                self.finish("lost", L("r_away", s=round(away / 1000)))
                return
        if t - self._last_heartbeat > 5000:
            self._last_heartbeat = t
            a["lastSeen"] = t
            self._write_active()

    def _check_presence(self, a: dict, t: int) -> bool:
        """True, wenn der Nutzer in Anki (oder einer erlaubten App) ist. Mit Sperre zählt jede nicht erlaubte App als „weg“."""
        if a.get("lock") and self.lock.available:
            try:
                front = self.lock.frontmost()
            except Exception:  # noqa: BLE001
                front = None
            if front is None or self.lock.is_self(front) or applock.is_allowed(front, self.data["lock"]["allow"]):
                self._in_blocked = False
                return True
            if not self._in_blocked:
                # gerade in eine nicht erlaubte App gewechselt: zählen und per Mitteilung warnen (kein Wegschieben mehr)
                self._in_blocked = True
                a["blocked"] = int(a.get("blocked") or 0) + 1
                a["blockedApp"] = front.name or front.ident
                applock.notify(L("name"), L("notify_away", s=logic.LOCK_AWAY_SECONDS))
                self.push_bar()
            return False
        return QApplication.applicationState() == Qt.ApplicationState.ApplicationActive

    # ---------------- Anki-Ereignisse

    def on_answer(self, reviewer, card, ease) -> None:  # noqa: ANN001
        a = self.active
        if a:
            try:
                a["cards"] = self.answered_since(a["startedAt"], a.get("deckIds") or [])
            except Exception:  # noqa: BLE001
                pass
            if a["mode"] == "deck":
                QTimer.singleShot(80, self.check_deck_done)
            self.push_bar()
        QTimer.singleShot(200, self.grant_streak_rewards)

    def check_deck_done(self) -> None:
        a = self.active
        if not a or a["mode"] != "deck" or not a.get("deckId"):
            return
        if self.remaining_today(int(a["deckId"])) > 0:
            return
        cards = self.answered_since(a["startedAt"], a.get("deckIds") or [])
        if cards >= logic.DECK_MODE_MIN_CARDS:
            self.finish("grown")
        else:
            tooltip(L("deck_short", n=logic.DECK_MODE_MIN_CARDS - cards), period=5000)

    def on_state_change(self, new_state: str, old_state: str) -> None:
        if self.active and self.active["mode"] == "deck" and new_state == "overview":
            QTimer.singleShot(100, self.check_deck_done)


LW: Optional[Lernwelt] = None


def _on_webview_content(web_content, context) -> None:  # noqa: ANN001
    """Aktives Pixel-Design als Hintergrund in Stapelübersicht, Übersicht und beim Lernen."""
    if not LW or not LW.data or not LW.data.get("theme"):
        return
    from aqt.deckbrowser import DeckBrowser
    from aqt.overview import Overview
    from aqt.reviewer import Reviewer

    if isinstance(context, (DeckBrowser, Overview, Reviewer)):
        web_content.head += LW.theme_css()


# --------------------------------------------------------------------------- Einbindung in Anki


def _on_toolbar(links: list, toolbar) -> None:  # noqa: ANN001
    if not addon_config().get("toolbar_button", True):
        return
    links.append(toolbar.create_link("lernwelt", L("name"), lambda: LW and LW.open(), tip=L("tip"), id="lernwelt"))


def _on_overview_bottom(link_handler, links: list):  # noqa: ANN001
    links.append(["", "lernwelt-focus", L("overview_btn")])

    def handler(url: str) -> bool:
        if url == "lernwelt-focus":
            if LW:
                LW.open(start_deck=str(mw.col.decks.current()["id"]))
            return False
        return link_handler(url)

    return handler


def _on_deck_menu(menu, deck_id: int) -> None:  # noqa: ANN001
    a = menu.addAction(L("deck_menu"))
    a.triggered.connect(lambda: LW and LW.open(start_deck=str(deck_id)))


def setup() -> None:
    global LW
    mw.addonManager.setWebExports(__name__, r"web/.*")
    LW = Lernwelt()
    gui_hooks.profile_did_open.append(LW.on_profile_open)
    gui_hooks.profile_will_close.append(LW.on_profile_close)
    gui_hooks.reviewer_did_answer_card.append(LW.on_answer)
    gui_hooks.top_toolbar_did_init_links.append(_on_toolbar)
    gui_hooks.overview_will_render_bottom.append(_on_overview_bottom)
    gui_hooks.deck_browser_will_show_options_menu.append(_on_deck_menu)
    gui_hooks.webview_will_set_content.append(_on_webview_content)
    action = QAction(i18n.tr(i18n.resolve(None), "menu"), mw)
    action.setShortcut("Ctrl+Shift+L")
    action.triggered.connect(lambda: LW and LW.open())
    mw.form.menuTools.addAction(action)
