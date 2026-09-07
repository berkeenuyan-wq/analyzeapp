"""Persistent colour marks for the editable grids — highlight a row, a column
or a single cell and have it stick.

``st.data_editor`` cannot paint cells, so a marked grid is shown as a read-only
styled ``st.dataframe``. Marks live in ``meta`` under ``marks:<grid_id>``.
A mark: ``{"kind": "row"|"col"|"cell", "color": <key>, "row": <row label>,
"col": <column label>}`` — targets are matched by the *displayed* labels so
they survive row reordering and column renames.
"""
from __future__ import annotations

import json

import pandas as pd

from . import db

# key -> (label, translucent css colour that reads on the dark grid)
PALETTE: dict[str, tuple[str, str]] = {
    "sari": ("Sarı", "rgba(232,181,63,.30)"),
    "yesil": ("Yeşil", "rgba(62,207,142,.26)"),
    "kirmizi": ("Kırmızı", "rgba(240,82,91,.28)"),
    "mavi": ("Mavi", "rgba(91,141,239,.28)"),
    "mor": ("Mor", "rgba(160,108,232,.28)"),
    "turuncu": ("Turuncu", "rgba(232,120,60,.28)"),
}


def css_color(value: str) -> str:
    """A stored colour may be a palette key or a raw #hex — return CSS."""
    if value in PALETTE:
        return PALETTE[value][1]
    if isinstance(value, str) and value.startswith("#") and len(value) in (4, 7):
        return value + "66"  # ~40% alpha so grid text stays readable
    return "rgba(255,255,255,.12)"


def _key(grid_id: str) -> str:
    return f"marks:{grid_id}"


def load(grid_id: str) -> list[dict]:
    raw = db.get_meta(_key(grid_id))
    if not raw:
        return []
    try:
        v = json.loads(raw)
        return v if isinstance(v, list) else []
    except (ValueError, TypeError):
        return []


def save(grid_id: str, marks: list[dict]) -> None:
    db.put_meta(_key(grid_id), json.dumps(marks, ensure_ascii=False))


def clear(grid_id: str) -> None:
    db.del_meta(_key(grid_id))


def describe(m: dict) -> str:
    col = m.get("color")
    tag = PALETTE.get(col, (col, ""))[0]
    if m["kind"] == "row":
        return f"Satır «{m['row']}» · {tag}"
    if m["kind"] == "col":
        return f"Sütun «{m['col']}» · {tag}"
    return f"Hücre «{m['row']} / {m['col']}» · {tag}"


def style_frame(df: pd.DataFrame, marks: list[dict], row_labels: pd.Series):
    """Return a pandas Styler for ``df`` (already using display labels as its
    column names) with ``marks`` applied. ``row_labels`` is a Series aligned to
    ``df.index`` giving each row's display label."""
    css = pd.DataFrame("", index=df.index, columns=df.columns)
    for m in marks:
        bg = f"background-color: {css_color(m.get('color', ''))}"
        if m["kind"] == "col" and m.get("col") in css.columns:
            css.loc[:, m["col"]] = bg
        elif m["kind"] == "row":
            css.loc[row_labels == m.get("row"), :] = bg
        elif m["kind"] == "cell" and m.get("col") in css.columns:
            css.loc[row_labels == m.get("row"), m["col"]] = bg
    return df.style.apply(lambda _: css, axis=None)
