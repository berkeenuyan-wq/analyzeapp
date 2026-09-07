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

        new_series = [{"dataset": by_key[k][1], "column": k.split(":", 1)[1], "agg": "mean"}
                      for k in picked]
        changed = (new_series != p["series"] or xkey != p.get("xkey")
                   or title.strip() != (p.get("title") or ""))
        if changed:
            p["series"] = new_series
            p["xkey"] = xkey
            p["title"] = title.strip()
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
    series = [{"name": str(c), "values": gf[c].round(3).tolist(), "series": j + 1}
              for j, c in enumerate(gf.columns)]
    legend = [(str(c), pal["series"][j % len(pal["series"])])
              for j, c in enumerate(gf.columns)]
    with chart_card(cv.panel_title(p),
                    f'{_XCHOICES.get(xk, xk)} ekseni · {len(series)} değişken',
                    legend=legend if len(series) > 1 else None,
                    key=f"cc_{p['id']}"):
        fn = charts.bar_chart if p.get("type") == "bar" else charts.line_chart
        fig = fn(labels, series, theme=theme, height=300,
                 **({} if p.get("type") == "bar" else {"fill": False}))
        plot(fig, key=f"ccfig_{p['id']}")


def _isnum(v) -> bool:
    try:
        float(v)
        return True
    except (TypeError, ValueError):
        return False
