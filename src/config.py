"""Paths, section registry, and the workbook's threshold rules in one place."""
from __future__ import annotations

import os
import sys
from pathlib import Path

# --- paths ------------------------------------------------------------------- #
# Two roots so the app works both from source and as a PyInstaller one-file exe:
#   * BUNDLE_ROOT — read-only resources shipped inside the build (app.py, src,
#     assets, the seed workbook). From source this is the repo root; when frozen
#     it is PyInstaller's temp extraction dir (``sys._MEIPASS``).
#   * STATE_DIR   — a writable folder for the SQLite DB and Excel exports. From
#     source that is ``<repo>/data``; when frozen, ``%LOCALAPPDATA%\UretimPaneli``
#     (falls back to ``~/.uretim-paneli``) so data survives between runs.
_FROZEN = getattr(sys, "frozen", False)

if _FROZEN:
    BUNDLE_ROOT = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
    _base = os.environ.get("LOCALAPPDATA") or os.environ.get("APPDATA") or str(Path.home())
    STATE_DIR = Path(_base) / "UretimPaneli"
else:
    BUNDLE_ROOT = Path(__file__).resolve().parent.parent
    STATE_DIR = BUNDLE_ROOT / "data"

STATE_DIR.mkdir(parents=True, exist_ok=True)

ROOT = BUNDLE_ROOT
DATA_DIR = BUNDLE_ROOT / "data"
DB_PATH = STATE_DIR / "uretim.db"
SEED_XLSX = DATA_DIR / "seed" / "Production_Stats.xlsx"
ASSETS_DIR = BUNDLE_ROOT / "assets"
TOKENS_DIR = ASSETS_DIR / "tokens"
EXPORT_DIR = STATE_DIR / "exports"

# --- sections (fixed Turkish strings — never translate or reword) -------------
SECTIONS = [
    {"id": "genel", "icon": "layout-dashboard", "label": "Genel Bakış"},
    {"id": "pres", "icon": "gauge", "label": "Pres Performansı"},
    {"id": "posa", "icon": "percent", "label": "Posa Analizi"},
    {"id": "arac", "icon": "truck", "label": "Araç Lojistiği"},
]

# --- press vocabulary --------------------------------------------------------
PRESS_1 = "Pres 1"
PRESS_2 = "Pres 2"
RECIPE_BY_PRESS = {PRESS_1: "Enz. 1 Sld. Elma", PRESS_2: "Enzimli 1 Sld. Elma"}

# Mass-balance tolerance, both directions (Ön Hatlar Analiz — Fark %).
FARK_TOLERANCE = 5.0

# --- threshold rules, mirroring the workbook's conditional fills -------------
# Each returns one of: "good" | "caution" | "bad" | "neutral".
def tone_toplam_verim(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "good" if v >= 93 else "caution" if v >= 90 else "bad"


def tone_fp_verim(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "good" if v >= 86 else "caution" if v >= 83 else "bad"


def tone_tank(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "good" if v <= 23 else "caution" if v <= 28 else "bad"


def tone_kesinti(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "bad" if v > 10 else "caution" if v >= 5 else "good"


def tone_fark(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "bad" if abs(v) > FARK_TOLERANCE else "good"


def tone_bekleme(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "bad" if v > 60 else "caution" if v > 15 else "good"
