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
SEED_LAB_CSV = DATA_DIR / "seed" / "pres_kalite_kontrolleri.csv"
ASSETS_DIR = BUNDLE_ROOT / "assets"
TOKENS_DIR = ASSETS_DIR / "tokens"
EXPORT_DIR = STATE_DIR / "exports"

# --- sections (fixed Turkish strings — never translate or reword) -------------
SECTIONS = [
    {"id": "genel", "icon": "layout-dashboard", "label": "Genel Bakış"},
    {"id": "pres", "icon": "gauge", "label": "Pres Performansı"},
    {"id": "posa", "icon": "percent", "label": "Posa Analizi"},
    {"id": "arac", "icon": "truck", "label": "Araç Lojistiği"},
    {"id": "lab", "icon": "flask-conical", "label": "Laboratuvar"},
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


# --- Laboratuvar (Pres Kalite Kontrolleri) threshold rules ------------------
# UNCONFIRMED — provisional bands, not the plant lab's own spec sheet. The
# Laboratuvar section carries a "eşikler doğrulanmadı" footnote until these are
# checked against the lab. Sıkım Asitlik has no band at all: its unit (g/L vs %)
# is unknown, so it renders neutral.
LAB_SPECS_CONFIRMED = False


def tone_posa_brix(v: float | None) -> str:
    """Residual sugar in the pomace — lower means more juice extracted."""
    if v is None:
        return "neutral"
    return "good" if v <= 2.0 else "caution" if v <= 4.0 else "bad"


def tone_posa_nem(v: float | None) -> str:
    """Pomace moisture % — a drier cake means a better press."""
    if v is None:
        return "neutral"
    return "good" if v <= 65 else "caution" if v <= 70 else "bad"


def tone_sikim_ph(v: float | None) -> str:
    if v is None:
        return "neutral"
    if v < 3.2 or v > 4.3:
        return "bad"
    return "good" if v <= 4.0 else "caution"


def tone_sikim_brix(v: float | None) -> str:
    if v is None:
        return "neutral"
    if v < 8.0 or v > 16.0:
        return "bad"
    return "good" if 10.0 <= v <= 14.0 else "caution"


def tone_sikim_asitlik(v: float | None) -> str:
    return "neutral"  # unit unconfirmed — no band


def tone_pulp(v: float | None) -> str:
    if v is None:
        return "neutral"
    return "good" if 0.2 <= v <= 0.5 else "caution"


# UI registry: which lab columns get a KPI tile / threshold tone, and how a
# rising value reads (good_when drives the DeltaChip colour, per the design kit).
LAB_MEASURES = [
    {"key": "sikim_brix", "label": "Sıkım Brix", "unit": "°Bx", "glyph": "droplet",
     "tone": tone_sikim_brix, "good_when": "none", "decimals": 2},
    {"key": "sikim_ph", "label": "Sıkım pH", "unit": "", "glyph": "activity",
     "tone": tone_sikim_ph, "good_when": "none", "decimals": 2},
    {"key": "sikim_asitlik", "label": "Sıkım Asitlik", "unit": "", "glyph": "activity",
     "tone": tone_sikim_asitlik, "good_when": "none", "decimals": 2},
    {"key": "posa_brix", "label": "Posa Brix", "unit": "°Bx", "glyph": "percent",
     "tone": tone_posa_brix, "good_when": "down", "decimals": 2},
    {"key": "posa_nem_pct", "label": "Posa Nem", "unit": "%", "glyph": "droplet",
     "tone": tone_posa_nem, "good_when": "down", "decimals": 1},
]
