"""HTML component helpers, rendered via ``st.markdown(html, unsafe_allow_html=True)``.

Each returns a string. They mirror the design system's React components closely
enough that the page rhythm (SectionHeader → Alert → HeroMetric → KPI row →
chart row → detail table) reads the same. Colour is only ever passed a semantic
tone — ``good`` / ``bad`` / ``caution`` / ``neutral``.
"""
from __future__ import annotations

from html import escape

import streamlit as st

from . import fmt
from .icons import icon

TONES = ("good", "bad", "caution", "neutral", "accent")


def render(html: str) -> None:
    st.markdown(html, unsafe_allow_html=True)


# --------------------------------------------------------------------------- #
# section header
# --------------------------------------------------------------------------- #
def section_header(title: str, subtitle: str | None = None) -> str:
    sub = f'<div class="up-section__sub">{escape(subtitle)}</div>' if subtitle else ""
    return (
        '<div class="up-section"><div>'
        f'<h1 class="up-section__title">{escape(title)}</h1>{sub}'
        "</div></div>"
    )


# --------------------------------------------------------------------------- #
# badges & chips
# --------------------------------------------------------------------------- #
def badge(text: str, tone: str = "neutral", *, small: bool = False, dot: bool = False) -> str:
    tone = tone if tone in TONES else "neutral"
    cls = f"up-badge up-badge--{tone}" + (" up-badge--sm" if small else "")
    dot_html = '<span class="up-badge__dot"></span>' if dot else ""
    return f'<span class="{cls}">{dot_html}{escape(text)}</span>'


def delta_chip(
    value: float | None,
    *,
    good_when: str = "up",
    period: str | None = None,
    decimals: int = 1,
    suffix: str = "",
) -> str:
    """A signed delta whose colour comes from the measure's own semantics.

    ``good_when`` decouples arrow direction from colour: a *falling* posa % is
    good, so pass ``good_when="down"`` and it renders green with a down arrow.
    """
    if value is None:
        return f'<span class="up-delta up-delta--neutral">{fmt.MINUS}</span>'
    flat = round(value, decimals) == 0          # rounds to zero at display precision
    rising = value > 0
    if flat or good_when == "none":
        tone = "neutral"
    else:
        good = (good_when == "up" and rising) or (good_when == "down" and not rising)
        tone = "good" if good else "bad"
    arrow = "" if flat else icon("arrow-up" if rising else "arrow-down", 12)
    body = ("0" + suffix) if flat else (fmt.signed(value, decimals) + suffix)
    per = (
        f'<span class="up-delta__period">{escape(period)}</span>' if period else ""
    )
    return f'<span class="up-delta up-delta--{tone}">{arrow}{body}</span>{per}'


# --------------------------------------------------------------------------- #
# sparkline
# --------------------------------------------------------------------------- #
def sparkline(
    values: list[float],
    *,
    width: int = 640,
    height: int = 56,
    color: str = "var(--series-1)",
    fill: bool = True,
    last_dot: bool = True,
    cls: str = "",
) -> str:
    """A tiny inline area chart (ported from the design system's Sparkline)."""
    vals = [float(v) for v in values if v is not None]
    if len(vals) < 2:
        return f'<svg class="{cls}" width="{width}" height="{height}" aria-hidden="true"></svg>'
    lo, hi = min(vals), max(vals)
    span = (hi - lo) or 1.0
    pad = 3.0
    pts = [
        (pad + i / (len(vals) - 1) * (width - pad * 2),
         height - pad - (v - lo) / span * (height - pad * 2))
        for i, v in enumerate(vals)
    ]
    line = " ".join(("L" if i else "M") + f"{x:.1f} {y:.1f}" for i, (x, y) in enumerate(pts))
    area = f"{line} L{pts[-1][0]:.1f} {height} L{pts[0][0]:.1f} {height} Z"
    gid = f"sk{abs(hash((tuple(vals), width, height))) % 10_000_000}"
    fill_p = (
        f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{color}" stop-opacity="0.30"/>'
        f'<stop offset="100%" stop-color="{color}" stop-opacity="0"/></linearGradient></defs>'
        f'<path d="{area}" fill="url(#{gid})"/>'
    ) if fill else ""
    dot = (
        f'<circle cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="2.75" fill="{color}" '
        f'stroke="var(--surface-card)" stroke-width="1.5"/>'
    ) if last_dot else ""
    return (
        f'<svg class="{cls}" width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
        f'preserveAspectRatio="none" style="display:block;width:100%;height:{height}px;overflow:visible" '
        f'aria-hidden="true">{fill_p}'
        f'<path d="{line}" fill="none" stroke="{color}" stroke-width="1.75" '
        f'stroke-linecap="round" stroke-linejoin="round"/>{dot}</svg>'
    )


# --------------------------------------------------------------------------- #
# hero metric
# --------------------------------------------------------------------------- #
def hero_metric(
    *,
    overline: str,
    value: str,
    unit: str = "",
    glyph: str = "gauge",
    status: tuple[str, str] | None = None,        # (text, tone) -> dot badge
    delta: float | None = None,
    delta_good_when: str = "up",
    delta_period: str | None = None,
    delta_suffix: str = "%",
    note: str | None = None,
    spark: list[float] | None = None,            # full-width sparkline along the bottom
    spark_color: str = "var(--series-1)",
    aside: list[tuple[str, str, str]] | None = None,  # (label, value, tone|css-color)
) -> str:
    unit_html = f'<span class="up-hero__unit">{escape(unit)}</span>' if unit else ""
    status_html = ("  " + badge(status[0], status[1], small=True, dot=True)) if status else ""
    delta_html = ""
    if delta is not None:
        delta_html = (
            '<span class="up-hero__delta">'
            + delta_chip(delta, good_when=delta_good_when, period=delta_period, suffix=delta_suffix)
            + "</span>"
        )
    note_html = f'<div class="up-hero__note">{escape(note)}</div>' if note else ""

    aside_html = ""
    if aside:
        items = []
        for label, val, tone in aside:
            color = {
                "good": "var(--signal-good)", "bad": "var(--signal-bad)",
                "caution": "var(--signal-caution)", "neutral": "var(--text-primary)",
            }.get(tone, tone or "var(--text-primary)")
            items.append(
                f'<div class="up-hero__aside-item"><div class="l">{escape(label)}</div>'
                f'<div class="v" style="color:{color}">{escape(val)}</div></div>'
            )
        aside_html = f'<div class="up-hero__aside">{"".join(items)}</div>'

    spark_html = ""
    if spark and len([v for v in spark if v is not None]) >= 2:
        spark_html = f'<div class="up-hero__spark">{sparkline(spark, color=spark_color)}</div>'

    return (
        '<div class="up-hero"><div class="up-hero__main">'
        f'<div class="up-hero__overline">{icon(glyph, 13)}{escape(overline.upper())}{status_html}</div>'
        f'<div class="up-hero__value">{escape(value)}{unit_html}{delta_html}</div>'
        f'{note_html}'
        "</div>"
        f"{aside_html}{spark_html}"
        "</div>"
    )


# --------------------------------------------------------------------------- #
# KPI card
# --------------------------------------------------------------------------- #
def kpi_card(
    *,
    label: str,
    value: str,
    unit: str = "",
    glyph: str = "percent",
    delta: float | None = None,
    delta_good_when: str = "up",
    delta_period: str | None = "Önceki güne göre",
    delta_suffix: str = "%",
    selected: bool = False,
) -> str:
    unit_html = f'<span class="up-kpi__unit">{escape(unit)}</span>' if unit else ""
    foot = ""
    if delta is not None:
        foot = (
            '<div class="up-kpi__foot">'
            + delta_chip(delta, good_when=delta_good_when, period=delta_period, suffix=delta_suffix)
            + "</div>"
        )
    cls = "up-kpi up-kpi--selected" if selected else "up-kpi"
    return (
        f'<div class="{cls}">'
        f'<div class="up-kpi__top"><span class="up-kpi__label">{escape(label)}</span>'
        f'<span class="up-kpi__glyph">{icon(glyph, 16)}</span></div>'
        f'<div class="up-kpi__value">{escape(value)}{unit_html}</div>'
        f"{foot}</div>"
    )


# --------------------------------------------------------------------------- #
# cards
# --------------------------------------------------------------------------- #
def card_open(
    title: str | None = None,
    *,
    subtitle: str | None = None,
    glyph: str | None = None,
    tone: str | None = None,
    tight: bool = False,
    right: str = "",
) -> str:
    cls = "up-card" + (" up-card--tight" if tight else "")
    if tone in ("good", "bad"):
        cls += f" up-card--{tone}"
    head = ""
    if title:
        g = f'<span class="up-card__icon">{icon(glyph, 16)}</span>' if glyph else ""
        sub = f'<span class="up-card__sub">{escape(subtitle)}</span>' if subtitle else ""
        head = (
            f'<div class="up-card__head">{g}'
            f'<span class="up-card__title">{escape(title)}</span>{sub}'
            f'<span class="up-card__spacer"></span>{right}</div>'
        )
    return f'<div class="{cls}">{head}'


def card_close() -> str:
    return "</div>"


def stat_bar(value: float, maximum: float, *, series: int = 1) -> str:
    pct = 0 if not maximum else max(0.0, min(100.0, value / maximum * 100))
    return (
        '<div class="up-statbar"><div class="up-statbar__fill" '
        f'style="width:{pct:.2f}%;background:var(--series-{series})"></div></div>'
    )


def threshold_meter(value_pct: float | None, *, tolerance: float = 5.0, span: float = 12.0) -> str:
    """±tolerance band on a −span…+span axis, with a marker at ``value_pct``."""
    v = 0.0 if value_pct is None else max(-span, min(span, value_pct))
    left = (v + span) / (2 * span) * 100
    return (
        '<div class="up-meter"><div class="up-meter__track">'
        '<div class="up-meter__band"></div>'
        f'<div class="up-meter__marker" style="left:{left:.2f}%"></div>'
        "</div>"
        f'<div class="up-meter__scale"><span>{fmt.MINUS}%{span:g}</span>'
        f'<span>±%{tolerance:g} tolerans</span><span>+%{span:g}</span></div></div>'
    )


# --------------------------------------------------------------------------- #
# alert & empty state
# --------------------------------------------------------------------------- #
def alert(title: str, body: str | None = None, tone: str = "info") -> str:
    tone = tone if tone in ("bad", "caution", "good", "info") else "info"
    glyph = {"bad": "triangle-alert", "caution": "circle-alert", "good": "circle-check", "info": "info"}[tone]
    body_html = f'<div class="up-alert__body">{escape(body)}</div>' if body else ""
    return (
        f'<div class="up-alert up-alert--{tone}">'
        f'<span class="up-alert__icon">{icon(glyph, 18)}</span>'
        f'<div><div class="up-alert__title">{escape(title)}</div>{body_html}</div></div>'
    )


def empty_state(title: str, body: str | None = None, glyph: str = "inbox") -> str:
    body_html = f'<div class="up-empty__body">{escape(body)}</div>' if body else ""
    return (
        f'<div class="up-empty"><div class="up-empty__tile">{icon(glyph, 18)}</div>'
        f'<div class="up-empty__title">{escape(title)}</div>{body_html}</div>'
    )


# --------------------------------------------------------------------------- #
# data table
# --------------------------------------------------------------------------- #
def data_table(
    columns: list[dict],
    rows: list[dict],
    *,
    foot: dict | None = None,
) -> str:
    """Render a table.

    Each column: ``{"key", "header", "numeric"?: bool, "emph"?: bool,
    "render"?: callable(row) -> str (may contain HTML)}``.
    Cells from ``render`` are trusted HTML; plain values are escaped.
    """
    head_cells = "".join(
        f'<th class="{"num" if c.get("numeric") else ""}">{escape(c["header"])}</th>'
        for c in columns
    )
    body_rows = []
    for r in rows:
        tds = []
        for c in columns:
            klass = []
            if c.get("numeric"):
                klass.append("num")
            if c.get("emph"):
                klass.append("emph")
            if "render" in c:
                inner = c["render"](r)
            else:
                val = r.get(c["key"])
                inner = escape("" if val is None else str(val))
            tds.append(f'<td class="{" ".join(klass)}">{inner}</td>')
        body_rows.append(f"<tr>{''.join(tds)}</tr>")

    foot_html = ""
    if foot:
        fcells = []
        for c in columns:
            klass = "num" if c.get("numeric") else ""
            val = foot.get(c["key"], "")
            fcells.append(f'<td class="{klass}">{val}</td>')  # foot values are pre-formatted, trusted
        foot_html = f"<tfoot><tr>{''.join(fcells)}</tr></tfoot>"

    return (
        '<div class="up-table-wrap"><table class="up-table">'
        f"<thead><tr>{head_cells}</tr></thead>"
        f"<tbody>{''.join(body_rows)}</tbody>{foot_html}</table></div>"
    )


def muted_dash() -> str:
    return '<span class="muted">—</span>'


# --------------------------------------------------------------------------- #
# small layout helpers
# --------------------------------------------------------------------------- #
def figrow(items: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<div class="up-fig"><div class="l">{escape(l)}</div><div class="v">{escape(v)}</div></div>'
        for l, v in items
    )
    return f'<div class="up-figrow">{cells}</div>'


def legend(items: list[tuple[str, str]]) -> str:
    """items: (label, css-color)."""
    lis = "".join(
        f'<span class="up-legend__item"><span class="up-legend__dot" style="background:{c}"></span>{escape(l)}</span>'
        for l, c in items
    )
    return f'<div class="up-legend">{lis}</div>'


def foot_note(text: str) -> str:
    return f'<div class="up-foot-note">{escape(text)}</div>'
