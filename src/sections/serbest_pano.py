"""Serbest Pano — build your own charts.

Each panel: pick the X axis (Gün / Batch / Tarih), then add as many Y variables
as you want from any dataset — each is drawn as its own coloured line or bar.
Panels stack top to bottom and are saved.

(A true mouse-drag canvas needs a component whose event channel this Streamlit
build supports; that is tracked separately. This page is the working builder.)
"""
from __future__ import annotations

import streamlit as st

from .. import canvas as cv
from .. import charts, custom
from ._common import chart_card, page_header, plot

_XCHOICES = {"gun": "Gün", "batch_no": "Batch", "tarih": "Tarih"}


def _var_options() -> list[tuple[str, str, str]]:
    """(key, label, ds_id) for every numeric column across every dataset."""
    out = []
    for ds_id in custom.DATASETS:
        for col in custom.dataset_columns(ds_id)["numeric"]:
            out.append((f"{ds_id}:{col}",
                        f"{custom.col_label(col)} · {custom.dataset_label(ds_id)}",
                        ds_id))
    return out


def render(*, theme: str = "dark") -> None:
    page_header("Serbest Pano", "X eksenini seç · istediğin kadar değişken ekle · "
                                "her biri ayrı renkte çizilir")
    state = cv.load()
    panels: list[dict] = state["panels"]

    top = st.columns([1, 1, 4])
    if top[0].button("＋ Çizgi", key="cv_add_line", type="primary", width="stretch"):
        panels.append(cv.new_panel("line", panels))
        cv.save(state)
        st.rerun()
    if top[1].button("＋ Çubuk", key="cv_add_bar", width="stretch"):
        panels.append(cv.new_panel("bar", panels))
        cv.save(state)
        st.rerun()

    if not panels:
        st.info("Henüz panel yok — **＋ Çizgi** veya **＋ Çubuk** ile başla.")
        return

    opts = _var_options()
    by_key = {k: (lbl, ds) for k, lbl, ds in opts}
    keys = [k for k, _, _ in opts]
    pal = charts.palette(theme)

    for i, p in enumerate(panels):
        _panel(state, panels, p, i, keys, by_key, pal, theme)


def _panel(state, panels, p, i, keys, by_key, pal, theme) -> None:
    pid = p["id"]
    p.setdefault("series", [])
    p.setdefault("xkey", "gun")

    cur_keys = [f'{s["dataset"]}:{s["column"]}' for s in p["series"]
                if s.get("column") and f'{s["dataset"]}:{s["column"]}' in keys]

    with st.container(border=True):
        head = st.columns([2.4, 2, 0.6], vertical_alignment="center")
        title = head[0].text_input("Başlık", p.get("title", ""),
                                   placeholder=cv.panel_title(p),
                                   key=f"cv_t_{pid}", label_visibility="collapsed")
        xkey = head[1].radio("X ekseni", list(_XCHOICES), horizontal=True,
                             index=list(_XCHOICES).index(p.get("xkey", "gun")),
                             format_func=lambda x: _XCHOICES[x],
                             key=f"cv_x_{pid}", label_visibility="collapsed")
        deleted = head[2].button("Sil", key=f"cv_del_{pid}", width="stretch")

        picked = st.multiselect(
            "Değişkenler (Y ekseni)", keys, default=cur_keys,
            format_func=lambda k: by_key[k][0], key=f"cv_vars_{pid}",
            placeholder="Değişken ekle — posa nem %, F/P verim, …")

        dual = st.checkbox(
            "Ölçekler çok farklıysa küçük değişkeni sağ eksene al",
            value=p.get("dual", True), key=f"cv_dual_{pid}")

        new_series = [{"dataset": by_key[k][1], "column": k.split(":", 1)[1], "agg": "mean"}
                      for k in picked]
        changed = (new_series != p["series"] or xkey != p.get("xkey")
                   or title.strip() != (p.get("title") or "")
                   or bool(dual) != bool(p.get("dual", True)))
        if changed:
            p["series"] = new_series
            p["xkey"] = xkey
            p["title"] = title.strip()
            p["dual"] = bool(dual)
            cv.save(state)

        if deleted:
            state["panels"] = [q for q in panels if q["id"] != pid]
            cv.save(state, allow_empty=True)
            st.rerun()

        _chart(p, pal, theme)


def _chart(p, pal, theme) -> None:
    gf = custom.grouped_frame(p.get("series", []), p.get("xkey", "gun"))
    if gf.empty:
        st.caption("Bir veya daha fazla değişken seç.")
        return
    xk = p.get("xkey", "gun")
    labels = [f"#{int(v)}" if xk == "batch_no" and _isnum(v) else custom.x_label(v)
              for v in gf.index]
    cols = list(gf.columns)
    colors = pal["series"]

    # When one series sits on a very different scale, move it to a right-hand
    # axis so both stay readable (line charts only; bars on split axes look bad).
    split = (_dual_split(gf) if p.get("dual", True) and p.get("type") != "bar"
             and len(cols) >= 2 else None)
    right = set(split[1]) if split else set()

    legend = [(str(c) + (" · sağ eksen" if c in right else ""),
               colors[j % len(colors)]) for j, c in enumerate(cols)]
    sub = f'{_XCHOICES.get(xk, xk)} ekseni · {len(cols)} değişken'
    footer = None
    if split:
        sub += " · çift eksen"
        left_lbl = " · ".join(_short(c) for c in cols if c not in right)
        right_lbl = " · ".join(_short(c) for c in cols if c in right)
        footer = f"Sol eksen: {left_lbl} · sağ eksen: {right_lbl}"

    with chart_card(cv.panel_title(p), sub,
                    legend=legend if len(cols) > 1 else None,
                    footer=footer, key=f"cc_{p['id']}"):
        if p.get("type") == "bar":
            series = [{"name": str(c), "values": gf[c].round(3).tolist(), "series": j + 1}
                      for j, c in enumerate(cols)]
            fig = charts.bar_chart(labels, series, theme=theme, height=300)
        else:
            series = [{"name": str(c), "values": gf[c].round(3).tolist(), "series": j + 1,
                       **({"axis": "right"} if c in right else {})}
                      for j, c in enumerate(cols)]
            fig = charts.dual_area(labels, series, theme=theme, height=300)
        plot(fig, key=f"ccfig_{p['id']}")


def _dual_split(gf, factor: float = 8.0):
    """Return ``(left_cols, right_cols)`` when the series magnitudes differ by
    more than ``factor``×, else ``None``. Magnitude = median of positive |value|.
    """
    mag = {}
    for c in gf.columns:
        s = gf[c].abs()
        s = s[(s > 0) & s.notna()]
        mag[c] = float(s.median()) if len(s) else None
    valid = {c: m for c, m in mag.items() if m}
    if len(valid) < 2:
        return None
    hi = max(valid.values())
    left = [c for c in gf.columns if valid.get(c, hi) >= hi / factor]
    right = [c for c in gf.columns if c not in left]
    return (left, right) if left and right else None


def _short(c) -> str:
    return str(c).split(" · ")[0]


def _isnum(v) -> bool:
    try:
        float(v)
        return True
    except (TypeError, ValueError):
        return False
