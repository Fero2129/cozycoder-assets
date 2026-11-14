"""
App-Sperre für Fokus-Sitzungen (wie „Deep Focus“ in Forest).

Während einer Sitzung prüft das Add-on mehrmals pro Sekunde, welche App vorne ist.
Ist es eine andere App als Anki und steht sie nicht auf der Erlaubt-Liste, wird sie
ausgeblendet (macOS) bzw. minimiert (Windows/Linux) und Anki wieder nach vorn geholt.

- macOS: über AppKit (NSWorkspace/NSRunningApplication) per ctypes – keine Zusatzpakete,
  keine Bedienungshilfen-Freigabe nötig. Notfalls holt `open -a` Anki nach vorn.
- Windows: über user32/kernel32 per ctypes.
- Linux: nur mit `xdotool` (X11). Ohne xdotool oder unter Wayland nicht verfügbar.

Systemteile (Dock, Kontrollzentrum, Anmeldefenster, Passwortabfragen, Taskleiste …) werden nie gesperrt.
"""

from __future__ import annotations

import ctypes
import ctypes.util
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from typing import Optional


@dataclass
class FrontApp:
    pid: int
    name: str
    ident: str = ""  # Bundle-ID (macOS) bzw. Programmpfad (Windows)
    handle: int = 0  # Fenster (Windows/Linux)


# Systemteile, die nie gesperrt werden – sonst ließe sich der Rechner nicht mehr bedienen
SYSTEM_ALWAYS = {
    # macOS
    "loginwindow", "dock", "systemuiserver", "control center", "controlcenter", "kontrollzentrum",
    "notification center", "notificationcenter", "mitteilungszentrale", "spotlight", "screensaverengine",
    "securityagent", "coreautha", "coreservicesuiagent", "usernotificationcenter", "universalaccessauthwarn",
    "screencaptureui", "bildschirmfoto", "screenshot", "window server", "windowmanager", "talagent",
    "com.apple.loginwindow", "com.apple.dock", "com.apple.systemuiserver", "com.apple.controlcenter",
    "com.apple.notificationcenterui", "com.apple.spotlight", "com.apple.securityagent",
    # Windows
    "explorer.exe", "shellexperiencehost.exe", "startmenuexperiencehost.exe", "searchhost.exe", "searchapp.exe",
    "lockapp.exe", "logonui.exe", "consent.exe", "textinputhost.exe", "credentialuibroker.exe", "taskmgr.exe",
    "applicationframehost.exe_lockscreen",
}


def _norm(s: str) -> str:
    s = (s or "").strip().lower()
    return s


def is_allowed(app: FrontApp, allow: list[str]) -> bool:
    names = {_norm(app.name), _norm(app.ident)}
    base = os.path.basename(app.ident).lower() if app.ident else ""
    if base:
        names.add(base)
        if base.endswith(".exe"):
            names.add(base[:-4])
    if _norm(app.name).endswith(".exe"):
        names.add(_norm(app.name)[:-4])
    names.discard("")
    if names & SYSTEM_ALWAYS:
        return True
    for a in allow:
        a = _norm(a)
        if not a:
            continue
        if a in names or (a + ".exe") in names:
            return True
    return False


class _Base:
    available = False
    platform = "other"
    note = "Auf diesem System kann das Add-on andere Apps nicht sperren – es merkt aber, wenn du Anki verlässt."

    def frontmost(self) -> Optional[FrontApp]:
        return None

    def is_self(self, app: FrontApp) -> bool:
        return app.pid == os.getpid()

    def push_back(self, app: FrontApp, window_id: int) -> None:
        pass

    def activate_self(self, window_id: int) -> None:
        pass

    def force_activate(self) -> None:
        pass


# ---------------------------------------------------------------- macOS


class _Mac(_Base):
    platform = "mac"
    note = "macOS: Andere Apps werden während der Sitzung ausgeblendet, Anki kommt zurück nach vorn."

    def __init__(self) -> None:
        objc = ctypes.cdll.LoadLibrary(ctypes.util.find_library("objc"))
        ctypes.cdll.LoadLibrary("/System/Library/Frameworks/AppKit.framework/AppKit")
        objc.objc_getClass.restype = ctypes.c_void_p
        objc.objc_getClass.argtypes = [ctypes.c_char_p]
        objc.sel_registerName.restype = ctypes.c_void_p
        objc.sel_registerName.argtypes = [ctypes.c_char_p]
        self._objc = objc
        addr = ctypes.cast(objc.objc_msgSend, ctypes.c_void_p).value

        def fn(restype, *argtypes):
            # objc_msgSend mit festen Typen aufrufen (wichtig auf Apple Silicon)
            return ctypes.CFUNCTYPE(restype, ctypes.c_void_p, ctypes.c_void_p, *argtypes)(addr)

        self._id = fn(ctypes.c_void_p)
        self._id_int = fn(ctypes.c_void_p, ctypes.c_int)
        self._int = fn(ctypes.c_int)
        self._bool = fn(ctypes.c_bool)
        self._bool_ulong = fn(ctypes.c_bool, ctypes.c_ulong)
        self._str = fn(ctypes.c_char_p)
        self._ws = self._id(self._cls("NSWorkspace"), self._sel("sharedWorkspace"))
        if not self._ws:
            raise OSError("NSWorkspace nicht verfügbar")
        self.available = True
        cur = self._id(self._cls("NSRunningApplication"), self._sel("currentApplication"))
        self._self_name = self._nsstr(self._id(cur, self._sel("localizedName"))) if cur else ""
        self._self_ident = self._nsstr(self._id(cur, self._sel("bundleIdentifier"))) if cur else ""
        self._bundle = self._app_bundle()
        if not self._bundle and cur:
            url = self._id(cur, self._sel("bundleURL"))
            path = self._nsstr(self._id(url, self._sel("path"))) if url else ""
            self._bundle = path if path.endswith(".app") else None

    def _cls(self, name: str) -> int:
        return self._objc.objc_getClass(name.encode())

    def _sel(self, name: str) -> int:
        return self._objc.sel_registerName(name.encode())

    def _nsstr(self, obj: int) -> str:
        if not obj:
            return ""
        raw = self._str(obj, self._sel("UTF8String"))
        return raw.decode("utf-8", "replace") if raw else ""

    @staticmethod
    def _app_bundle() -> Optional[str]:
        p = os.path.realpath(sys.executable)
        i = p.find(".app/")
        return p[: i + 4] if i > 0 else None

    def is_self(self, app: FrontApp) -> bool:
        if app.pid == os.getpid():
            return True
        # Anki 25+ startet über einen Launcher – Anki selbst erkennt man dann an Bundle-ID bzw. Namen
        if self._self_ident and app.ident == self._self_ident:
            return True
        return bool(app.ident) and app.ident == "net.ankiweb.dtop" or (not app.ident and app.name == self._self_name and app.name != "")

    def frontmost(self) -> Optional[FrontApp]:
        app = self._id(self._ws, self._sel("frontmostApplication"))
        if not app:
            return None
        pid = self._int(app, self._sel("processIdentifier"))
        name = self._nsstr(self._id(app, self._sel("localizedName")))
        ident = self._nsstr(self._id(app, self._sel("bundleIdentifier")))
        return FrontApp(pid=pid, name=name, ident=ident)

    def push_back(self, app: FrontApp, window_id: int) -> None:
        running = self._id_int(self._cls("NSRunningApplication"), self._sel("runningApplicationWithProcessIdentifier:"), app.pid)
        if running:
            self._bool(running, self._sel("hide"))
        self.activate_self(window_id)

    def activate_self(self, window_id: int) -> None:
        cur = self._id(self._cls("NSRunningApplication"), self._sel("currentApplication"))
        ok = False
        if cur:
            # NSApplicationActivateAllWindows | NSApplicationActivateIgnoringOtherApps
            ok = bool(self._bool_ulong(cur, self._sel("activateWithOptions:"), 1 | 2))
        if not ok and self._bundle:
            try:
                subprocess.Popen(["open", "-a", self._bundle], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except OSError:
                pass

    def force_activate(self) -> None:
        """Zweiter Versuch, falls Anki trotz activateWithOptions nicht vorn ist (macOS 14+ ist da strenger)."""
        try:
            if self._bundle:
                subprocess.Popen(["open", "-a", self._bundle], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                # Letzter Ausweg: über System Events (macOS fragt einmal nach der Erlaubnis)
                script = f'tell application "System Events" to set frontmost of (first process whose unix id is {os.getpid()}) to true'
                subprocess.Popen(["osascript", "-e", script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except OSError:
            pass


# ---------------------------------------------------------------- Windows


class _Win(_Base):
    platform = "win"
    note = "Windows: Andere Programme werden während der Sitzung minimiert, Anki kommt zurück nach vorn."

    def __init__(self) -> None:
        from ctypes import wintypes

        self._wt = wintypes
        u = ctypes.WinDLL("user32", use_last_error=True)
        k = ctypes.WinDLL("kernel32", use_last_error=True)
        u.GetForegroundWindow.restype = wintypes.HWND
        u.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
        u.GetWindowThreadProcessId.restype = wintypes.DWORD
        u.ShowWindow.argtypes = [wintypes.HWND, ctypes.c_int]
        u.SetForegroundWindow.argtypes = [wintypes.HWND]
        u.IsIconic.argtypes = [wintypes.HWND]
        u.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
        u.keybd_event.argtypes = [wintypes.BYTE, wintypes.BYTE, wintypes.DWORD, ctypes.c_void_p]
        k.OpenProcess.restype = wintypes.HANDLE
        k.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        k.QueryFullProcessImageNameW.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPWSTR, ctypes.POINTER(wintypes.DWORD)]
        k.CloseHandle.argtypes = [wintypes.HANDLE]
        self._u, self._k = u, k
        self.available = True

    def frontmost(self) -> Optional[FrontApp]:
        wt = self._wt
        hwnd = self._u.GetForegroundWindow()
        if not hwnd:
            return None
        pid = wt.DWORD()
        self._u.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        path = ""
        h = self._k.OpenProcess(0x1000, False, pid.value)  # PROCESS_QUERY_LIMITED_INFORMATION
        if h:
            buf = ctypes.create_unicode_buffer(1024)
            size = wt.DWORD(1024)
            if self._k.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(size)):
                path = buf.value
            self._k.CloseHandle(h)
        name = os.path.basename(path) if path else ""
        if not name:
            t = ctypes.create_unicode_buffer(256)
            self._u.GetWindowTextW(hwnd, t, 256)
            name = t.value
        return FrontApp(pid=pid.value, name=name, ident=path, handle=int(hwnd))

    def push_back(self, app: FrontApp, window_id: int) -> None:
        if app.handle:
            self._u.ShowWindow(app.handle, 6)  # SW_MINIMIZE
        self.activate_self(window_id)

    def activate_self(self, window_id: int) -> None:
        if not window_id:
            return
        if self._u.IsIconic(window_id):
            self._u.ShowWindow(window_id, 9)  # SW_RESTORE
        # Windows erlaubt SetForegroundWindow nur nach einer Eingabe – kurzer Alt-Tastendruck schaltet das frei
        self._u.keybd_event(0x12, 0, 0, None)
        self._u.SetForegroundWindow(window_id)
        self._u.keybd_event(0x12, 0, 2, None)

    def force_activate(self) -> None:
        pass


# ---------------------------------------------------------------- Linux (X11 + xdotool)


class _Linux(_Base):
    platform = "linux"
    note = "Linux: Andere Programme werden über xdotool minimiert (nur X11)."

    def __init__(self) -> None:
        self._xdo = shutil.which("xdotool")
        if not self._xdo or os.environ.get("XDG_SESSION_TYPE") == "wayland":
            self.note = "Linux: Zum Sperren anderer Apps wird „xdotool“ unter X11 gebraucht – das Add-on merkt aber, wenn du Anki verlässt."
            return
        self.available = True

    def _run(self, *args: str) -> str:
        try:
            return subprocess.run([self._xdo, *args], capture_output=True, text=True, timeout=1).stdout.strip()
        except (OSError, subprocess.SubprocessError):
            return ""

    def frontmost(self) -> Optional[FrontApp]:
        wid = self._run("getactivewindow")
        if not wid.isdigit():
            return None
        pid = self._run("getwindowpid", wid)
        if not pid.isdigit():
            # manche Programme melden keine Prozessnummer – dann zählt der Fenstername
            title = self._run("getwindowname", wid)
            return FrontApp(pid=-1, name=title, ident="", handle=int(wid))
        name = ""
        try:
            with open(f"/proc/{pid}/comm", encoding="utf-8") as f:
                name = f.read().strip()
        except OSError:
            pass
        return FrontApp(pid=int(pid), name=name, ident=name, handle=int(wid))

    def push_back(self, app: FrontApp, window_id: int) -> None:
        if app.handle:
            self._run("windowminimize", str(app.handle))
        self.activate_self(window_id)

    def activate_self(self, window_id: int) -> None:
        if window_id:
            self._run("windowactivate", str(window_id))

    def force_activate(self) -> None:
        pass


def create() -> _Base:
    try:
        if sys.platform == "darwin":
            return _Mac()
        if sys.platform.startswith("win"):
            return _Win()
        if sys.platform.startswith("linux"):
            return _Linux()
    except Exception as e:  # noqa: BLE001 – lieber ohne Sperre weiterlernen als abstürzen
        b = _Base()
        b.note = f"Die App-Sperre ließ sich nicht starten ({e}). Das Add-on merkt aber, wenn du Anki verlässt."
        return b
    return _Base()


def notify(title: str, text: str) -> None:
    """Kleine Systemmitteilung (macOS: Mitteilungszentrale, Linux: notify-send). Windows: keine – Fehler werden ignoriert."""
    try:
        if sys.platform == "darwin":
            esc = lambda x: x.replace("\\", "\\\\").replace('"', '\\"')  # noqa: E731
            script = f'display notification "{esc(text)}" with title "{esc(title)}"'
            subprocess.Popen(["osascript", "-e", script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif sys.platform.startswith("linux") and shutil.which("notify-send"):
            subprocess.Popen(["notify-send", "-t", "8000", title, text], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:  # noqa: BLE001
        pass
