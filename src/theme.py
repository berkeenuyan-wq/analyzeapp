"""Assemble the design-system stylesheet and inject it into Streamlit.

The token files ship both a dark ``:root`` block and a ``[data-theme="light"]``
override. Streamlit strips `<script>` from injected markup, so we cannot flip a
``data-theme`` attribute at runtime; instead, for the light theme we re-emit the
light block re-scoped to ``:root`` so its custom properties win.
"""
from __future__ import annotations

import re
from urllib.parse import quote

import streamlit as st

from .config import ASSETS_DIR, SECTIONS, TOKENS_DIR
from .icons import icon as _icon

# Concatenation order matters: fonts + tokens first, components last.
_TOKEN_ORDER = [
    "fonts.css", "colors.css", "typography.css", "spacing.css",
    "radius.css", "elevation.css", "motion.css", "base.css",
]

# Chart palette pulled straight from the tokens, per theme — Plotly needs the
# resolved hex values, it cannot read CSS custom properties.
SERIES_DARK = ["#e0409e", "#3ecf8e", "#5b8def", "#e8b53f", "#a06ce8", "#4bc2c7"]
SERIES_LIGHT = ["#c8318a", "#1d9c67", "#3a6fd8", "#b8860c", "#7d47c4", "#1e9ba1"]
SIGNAL_DARK = {"good": "#3ecf8e", "bad": "#f0525b", "caution": "#e8b53f", "neutral": "#8f8f9b"}
SIGNAL_LIGHT = {"good": "#1d9c67", "bad": "#d23a44", "caution": "#b8860c", "neutral": "#6f6f7b"}
CHART_INK = {
    "dark": {"grid": "rgba(255,255,255,.055)", "axis": "#6f6f7b", "paper": "rgba(0,0,0,0)",
             "text": "#a8a8b3", "accent": "#e0409e", "crosshair": "rgba(255,255,255,.22)"},
    "light": {"grid": "rgba(20,20,26,.07)", "axis": "#84848f", "paper": "rgba(0,0,0,0)",
              "text": "#5c5c69", "accent": "#c8318a", "crosshair": "rgba(20,20,26,.22)"},
}


def _base_css() -> str:
    parts = []
    for name in _TOKEN_ORDER:
        parts.append((TOKENS_DIR / name).read_text(encoding="utf-8"))
    parts.append((ASSETS_DIR / "components.css").read_text(encoding="utf-8"))
    return "\n".join(parts)


def _light_overrides() -> str:
    """Extract the body of the `[data-theme="light"]{ ... }` rule from colors.css."""
    css = (TOKENS_DIR / "colors.css").read_text(encoding="utf-8")
    m = re.search(r'\[data-theme="light"\]\s*\{(.*?)\}\s*$', css, re.S)
    body = m.group(1).strip() if m else ""
    return f":root, [data-testid=\"stAppViewContainer\"] {{\n{body}\n}}"


def _nav_icon_css() -> str:
    """Per-section Lucide glyph as a masked ::before on the sidebar nav button."""
    rules = []
    for s in SECTIONS:
        u = f'url("data:image/svg+xml,{quote(_icon(s["icon"], 24))}")'
        rules.append(
            f'.st-key-nav_{s["id"]} .stButton>button::before{{'
            "content:'';flex:0 0 auto;width:17px;height:17px;margin-right:2px;"
            f"background:currentColor;-webkit-mask:{u} center/contain no-repeat;"
            f"mask:{u} center/contain no-repeat}}"
        )
        rules.append(
            f'.st-key-nav_{s["id"]} .stButton>button[kind="primary"]::before'
            "{background:var(--accent-base)}"
        )
    return "\n".join(rules)


def inject(theme: str = "dark") -> None:
    css = _base_css() + "\n" + _nav_icon_css()
    if theme == "light":
        css += "\n" + _light_overrides()
    st.markdown(f"<style>\n{css}\n</style>", unsafe_allow_html=True)


def palette(theme: str = "dark") -> dict:
    """Resolved colours for the Plotly layer."""
    is_light = theme == "light"
    return {
        "series": SERIES_LIGHT if is_light else SERIES_DARK,
        "signal": SIGNAL_LIGHT if is_light else SIGNAL_DARK,
        **CHART_INK["light" if is_light else "dark"],
    }
