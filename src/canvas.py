"""Serbest Pano — free-canvas dashboard state + panel data shaping.

Layout and panel definitions live in one JSON blob in ``meta`` under ``canvas``.
Panels are drawn by :mod:`src.sections.serbest_pano` with streamlit-elements;
this module only persists state and turns a panel spec into plain
(JSON-serialisable) data for Nivo / MUI.
"""
from __future__ import annotations

import json
import time

from . import custom, db

_KEY = "canvas"

PANEL_TYPES = {
    "kpi": "KPI — tek sayı",
    "line": "Çizgi grafik",
    "bar": "Çubuk grafik",
    "ratio": "Oran (A ÷ B × 100)",
    "table": "Tablo",
}

_DEFAULT_WH = {"kpi": (3, 2), "ratio": (3, 2), "line": (6, 4), "bar": (6, 4), "table": (5, 4)}


# --------------------------------------------------------------------------- #
# persistence
# --------------------------------------------------------------------------- #
def load() -> dict:
    raw = db.get_meta(_KEY)
    if not raw:
        return {"panels": []}
    try:
        d = json.loads(raw)
        if not isinstance(d, dict):
            return {"panels": []}
        d.setdefault("panels", [])
        return d
    except (ValueError, TypeError):
        return {"panels": []}


def save(state: dict, *, allow_empty: bool = False) -> None:
    # A layout-sync event that arrives with no panels must never clobber a
    # non-empty canvas; only explicit add/delete/reset may write an empty list.
    if not state.get("panels") and not allow_empty and db.get_meta(_KEY):
        return
    db.put_meta(_KEY, json.dumps(state, ensure_ascii=False))


def reset() -> None:
    db.del_meta(_KEY)


def new_panel(ptype: str, existing: list[dict]) -> dict:
    w, h = _DEFAULT_WH.get(ptype, (6, 4))
    y = max((p.get("y", 0) + p.get("h", 4) for p in existing), default=0)
    p = {
        "id": f"p{int(time.time() * 1000) % 100_000_000:08d}",
        "type": ptype, "title": PANEL_TYPES.get(ptype, ptype).split(" —")[0].split(" (")[0],
        "x": 0, "y": y, "w": w, "h": h,
    }
    if ptype in ("kpi", "ratio"):
        p.update(dataset="batch", column=None, agg="mean", unit="", decimals=1)
        if ptype == "ratio":
            p.update(dataset_b="batch", column_b=None, agg_b="mean", unit="%")
    elif ptype in ("line", "bar"):
        p.update(xkey="gun",
                 series=[{"dataset": "batch", "column": None, "agg": "mean"}])
    elif ptype == "table":
        p.update(dataset="batch", columns=[], rows=8)
    return p


# --------------------------------------------------------------------------- #
# panel -> data
# --------------------------------------------------------------------------- #
def kpi_value(p: dict) -> str:
    if not p.get("column"):
        return "—"
    return custom.kpi_text(p["dataset"], p["column"], p.get("agg", "mean"),
                           int(p.get("decimals", 1)))


def ratio_value(p: dict) -> str:
    a = custom.aggregate(p.get("dataset"), p.get("column"), p.get("agg", "mean")) \
        if p.get("column") else None
    b = custom.aggregate(p.get("dataset_b"), p.get("column_b"), p.get("agg_b", "mean")) \
        if p.get("column_b") else None
    if a is None or not b:
        return "—"
    from . import fmt
    return fmt.nf(a / b * 100, int(p.get("decimals", 1)))


def line_data(p: dict) -> list[dict]:
    """Nivo Line: ``[{"id": series, "data": [{"x": label, "y": value}]}]``."""
    gf = custom.grouped_frame(p.get("series", []), p.get("xkey", "gun"))
    if gf.empty:
        return []
    labels = [custom.x_label(ix) for ix in gf.index]
    out = []
    for col in gf.columns:
        pts = [{"x": lb, "y": None if v != v else round(float(v), 3)}
               for lb, v in zip(labels, gf[col])]
        out.append({"id": col, "data": pts})
    return out


def bar_data(p: dict) -> tuple[list[dict], list[str]]:
    """Nivo Bar: ``(rows, keys)`` with ``indexBy="x"``."""
    gf = custom.grouped_frame(p.get("series", []), p.get("xkey", "gun"))
    if gf.empty:
        return [], []
    keys = [str(c) for c in gf.columns]
    rows = []
    for ix, row in zip(gf.index, gf.itertuples(index=False)):
        r = {"x": custom.x_label(ix)}
        for k, v in zip(keys, row):
            r[k] = 0 if v != v else round(float(v), 3)
        rows.append(r)
    return rows, keys


def table_data(p: dict) -> tuple[list[str], list[list]]:
    df = custom.load_dataset(p.get("dataset", ""))
    if df.empty:
        return [], []
    cols = [c for c in p.get("columns", []) if c in df.columns] or list(df.columns)[:6]
    n = int(p.get("rows", 8))
    body = []
    for _, row in df[cols].head(n).iterrows():
        body.append([_cell(row[c]) for c in cols])
    return [custom.col_label(c) for c in cols], body


def _cell(v) -> str:
    from . import fmt
    if v is None or (isinstance(v, float) and v != v):
        return "—"
    if isinstance(v, float):
        return fmt.nf(v, 2)
    if hasattr(v, "year"):
        return fmt.date_short(v)
    return str(v)
