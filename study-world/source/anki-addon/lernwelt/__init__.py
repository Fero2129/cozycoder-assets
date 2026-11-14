"""Lernwelt – Wissensturm: Fokus-Sitzungen mit Bücherregal, Münzen, Bücherladen und App-Sperre für Anki."""

try:
    from aqt import mw
except ImportError:  # außerhalb von Anki (Tests)
    mw = None

if mw is not None:
    from . import main

    main.setup()
