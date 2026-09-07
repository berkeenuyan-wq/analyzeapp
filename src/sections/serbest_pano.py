"""Serbest Pano — a free canvas of draggable, resizable panels.

Built with streamlit-elements (react-grid-layout + MUI + Nivo). The panels are
dragged/resized by mouse; layout auto-saves. New panels come from the "＋ Ekle"
menu; each panel's data binding is set in the "Panel ayarları" strip. The five
analytic pages are untouched — this is the place for ad-hoc dashboards.
"""
from __future__ import annotations

import streamlit as st
from streamlit_elements import dashboard, elements, mui, nivo, sync

from .. import canvas as cv
from .. import custom
from ..charts import palette
from ._common import page_header

_GRID_COLS = 12
_ROW_H = 58


def render(*, theme: str = "dark") -> None:
    page_header(
        "Serbest Pano",
        "Panelleri fareyle sürükle · köşeden boyutlandır · ＋ Ekle ile yeni öğe",
    )
    state = cv.load()
    panels: list[dict] = state["panels"]

    _toolbar(state, panels)

    if not panels:
        st.info("Henüz panel yok — yukarıdan **＋ Ekle** ile bir öğe oluştur.")
        return

    _canvas(state, panels, theme)


# --------------------------------------------------------------------------- #
# toolbar (plain Streamlit — must live outside the elements frame)
# --------------------------------------------------------------------------- #
def _toolbar(state: dict, panels: list[dict]) -> None:
    add, edit, wipe = st.columns([1.1, 2.4, 0.7], vertical_alignment="bottom")

    with add:
        ptype = st.selectbox("Yeni öğe", list(cv.PANEL_TYPES),
                             format_func=lambda t: cv.PANEL_TYPES[t], key="cv_newtype")
        if st.button("＋ Ekle", key="cv_add", width="stretch", type="primary"):
            panels.append(cv.new_panel(ptype, panels))
            cv.save(state)
            st.rerun()

    with edit:
        if panels:
            with st.expander("Panel ayarları", expanded=False):
                _panel_config(state, panels)

    with wipe:
        if panels and st.button("Sıfırla", key="cv_reset", width="stretch",
                                help="Tüm panelleri sil"):
            cv.reset()
            st.rerun()


def _panel_config(state: dict, panels: list[dict]) -> None:
    idx = st.selectbox(
        "Panel", range(len(panels)),
        format_func=lambda i: f"{i + 1}. {panels[i]['title']} "
                              f"({cv.PANEL_TYPES.get(panels[i]['type'], panels[i]['type'])})",
        key="cv_pick")
    p = panels[idx]
    p["title"] = st.text_input("Başlık", p.get("title", ""), key=f"cv_t_{p['id']}")

    if p["type"] in ("kpi", "ratio"):
        _num_binding(p, "", "A değeri" if p["type"] == "ratio" else "Değer")
        if p["type"] == "ratio":
            _num_binding(p, "_b", "B değeri")
        c1, c2 = st.columns(2)
        p["unit"] = c1.text_input("Birim", p.get("unit", ""), key=f"cv_u_{p['id']}")
        p["decimals"] = c2.number_input("Ondalık", 0, 3, int(p.get("decimals", 1)),
                                        key=f"cv_d_{p['id']}")

    elif p["type"] in ("line", "bar"):
        _series_editor(p)

    elif p["type"] == "table":
        ds = st.selectbox("Veri kümesi", list(custom.DATASETS),
                          index=list(custom.DATASETS).index(p.get("dataset", "batch")),
                          format_func=custom.dataset_label, key=f"cv_tds_{p['id']}")
        p["dataset"] = ds
        allcols = (custom.dataset_columns(ds)["numeric"]
                   + custom.dataset_columns(ds)["dimension"])
        allcols = list(dict.fromkeys(allcols))
        p["columns"] = st.multiselect("Sütunlar", allcols,
                                      default=[c for c in p.get("columns", []) if c in allcols],
                                      format_func=custom.col_label, key=f"cv_tc_{p['id']}")
        p["rows"] = st.number_input("Satır sayısı", 3, 50, int(p.get("rows", 8)),
                                    key=f"cv_tr_{p['id']}")

    st.caption("Konum ve boyut (12'lik ızgara) — fareyle sürüklemek de çalışır")
    g1, g2, g3, g4 = st.columns(4)
    p["x"] = g1.number_input("X", 0, 11, int(p.get("x", 0)), key=f"cv_px_{p['id']}")
    p["y"] = g2.number_input("Y", 0, 99, int(p.get("y", 0)), key=f"cv_py_{p['id']}")
    p["w"] = g3.number_input("Genişlik", 1, 12, int(p.get("w", 6)), key=f"cv_pw_{p['id']}")
    p["h"] = g4.number_input("Yükseklik", 1, 20, int(p.get("h", 4)), key=f"cv_ph_{p['id']}")

    c1, c2 = st.columns([1, 1])
    if c1.button("Kaydet", key=f"cv_save_{p['id']}", type="primary", width="stretch"):
        cv.save(state)
        st.toast("Panel güncellendi.")
        st.rerun()
    if c2.button("Bu paneli sil", key=f"cv_del_{p['id']}", width="stretch"):
        state["panels"] = [q for q in panels if q["id"] != p["id"]]
        cv.save(state, allow_empty=True)
        st.rerun()


def _num_binding(p: dict, sfx: str, label: str) -> None:
    st.caption(label)
    c1, c2, c3 = st.columns([1.3, 1.5, 1])
    ds_key, col_key, agg_key = f"dataset{sfx}", f"column{sfx}", f"agg{sfx}"
    ds = c1.selectbox("Veri kümesi", list(custom.DATASETS),
                      index=list(custom.DATASETS).index(p.get(ds_key, "batch")),
                      format_func=custom.dataset_label, key=f"cv_{col_key}ds_{p['id']}",
                      label_visibility="collapsed")
    p[ds_key] = ds
    nums = custom.dataset_columns(ds)["numeric"]
    p[col_key] = c2.selectbox(
        "Sütun", nums,
        index=nums.index(p[col_key]) if p.get(col_key) in nums else 0,
        format_func=custom.col_label, key=f"cv_{col_key}_{p['id']}",
        label_visibility="collapsed") if nums else None
    p[agg_key] = c3.selectbox(
        "Hesaplama", list(custom.AGGS),
        index=list(custom.AGGS).index(p.get(agg_key, "mean")),
        format_func=lambda a: custom.AGGS[a], key=f"cv_{agg_key}_{p['id']}",
        label_visibility="collapsed")


def _series_editor(p: dict) -> None:
    ds_ids = list(custom.DATASETS)
    draft = p.setdefault("series", [{"dataset": "batch", "column": None, "agg": "mean"}])
    st.caption("Seriler — farklı veri kümelerinden ekleyebilirsin")
    for i, s in enumerate(draft):
        c1, c2, c3, c4 = st.columns([1.3, 1.5, 1, 0.35])
        s["dataset"] = c1.selectbox(
            "Veri kümesi", ds_ids,
            index=ds_ids.index(s["dataset"]) if s.get("dataset") in ds_ids else 0,
            format_func=custom.dataset_label, key=f"cv_sds_{p['id']}_{i}",
            label_visibility="collapsed")
        nums = custom.dataset_columns(s["dataset"])["numeric"]
        s["column"] = c2.selectbox(
            "Sütun", nums,
            index=nums.index(s["column"]) if s.get("column") in nums else 0,
            format_func=custom.col_label, key=f"cv_scol_{p['id']}_{i}",
            label_visibility="collapsed") if nums else None
        s["agg"] = c3.selectbox(
            "Hesaplama", list(custom.AGGS),
            index=list(custom.AGGS).index(s.get("agg", "mean")),
            format_func=lambda a: custom.AGGS[a], key=f"cv_sagg_{p['id']}_{i}",
            label_visibility="collapsed")
        if c4.button("✕", key=f"cv_srm_{p['id']}_{i}", disabled=len(draft) == 1):
            draft.pop(i)
            st.rerun()

    c1, c2 = st.columns([1, 2])
    if c1.button("＋ seri", key=f"cv_sadd_{p['id']}", width="stretch"):
        draft.append({"dataset": ds_ids[0], "column": None, "agg": "mean"})
        st.rerun()
    dss = {s["dataset"] for s in draft}
    xopts = ["gun"] + (custom.dataset_columns(next(iter(dss)))["dimension"]
                       if len(dss) == 1 else [])
    p["xkey"] = c2.selectbox(
        "X ekseni", xopts,
        index=xopts.index(p["xkey"]) if p.get("xkey") in xopts else 0,
        format_func=lambda x: "Gün (günlük özet)" if x == "gun" else custom.col_label(x),
        key=f"cv_x_{p['id']}")


# --------------------------------------------------------------------------- #
# the canvas
# --------------------------------------------------------------------------- #
def _canvas(state: dict, panels: list[dict], theme: str) -> None:
    pal = palette(theme)
    surface = "#17171c" if theme == "dark" else "#ffffff"
    border = "rgba(255,255,255,.09)" if theme == "dark" else "rgba(20,20,26,.10)"
    ink = pal["text"]

    # A layout change from the previous run arrives here as a plain list of
    # ``{i,x,y,w,h}`` dicts — fold it into the panels and persist.
    ev = st.session_state.get("cv_layout_ev")
    if isinstance(ev, list) and ev:
        by_id = {u.get("i"): u for u in ev}
        matched = [p for p in panels if p["id"] in by_id]
        dirty = False
        for p in matched:
            u = by_id[p["id"]]
            if (p.get("x"), p.get("y"), p.get("w"), p.get("h")) != \
               (u["x"], u["y"], u["w"], u["h"]):
                p["x"], p["y"], p["w"], p["h"] = u["x"], u["y"], u["w"], u["h"]
                dirty = True
        st.session_state.pop("cv_layout_ev", None)
        if dirty and matched:
            cv.save(state)

    layout = [
        dashboard.Item(p["id"], p.get("x", 0), p.get("y", 0),
                       p.get("w", 6), p.get("h", 4))
        for p in panels
    ]

    with elements("serbest_pano"):
        with dashboard.Grid(layout, rowHeight=_ROW_H, draggableHandle=".cv-drag",
                            onLayoutChange=sync("cv_layout_ev"), margin=[12, 12],
                            containerPadding=[0, 0]):
            for p in panels:
                _panel(p, theme, surface, border, ink, pal)


def _panel(p, theme, surface, border, ink, pal) -> None:
    with mui.Paper(
        key=p["id"],
        elevation=0,
        sx={
            "height": "100%", "display": "flex", "flexDirection": "column",
            "overflow": "hidden", "bgcolor": surface,
            "border": f"1px solid {border}", "borderRadius": "12px",
        },
    ):
        mui.Box(
            mui.Typography(p.get("title") or "Panel",
                           sx={"fontSize": 13, "fontWeight": 600, "color": ink,
                               "letterSpacing": ".01em"}),
            className="cv-drag",
            sx={"px": 1.5, "py": 1, "cursor": "move", "flex": "0 0 auto",
                "borderBottom": f"1px solid {border}", "userSelect": "none"},
        )
        with mui.Box(sx={"flex": 1, "minHeight": 0, "p": 1.25,
                         "display": "flex", "flexDirection": "column"}):
            _body(p, theme, ink, pal)


def _body(p, theme, ink, pal) -> None:
    t = p["type"]
    if t == "kpi":
        _big_number(cv.kpi_value(p), p.get("unit", ""), ink, pal)
    elif t == "ratio":
        _big_number(cv.ratio_value(p), p.get("unit", "%"), ink, pal)
    elif t == "line":
        _nivo_line(p, theme, ink, pal)
    elif t == "bar":
        _nivo_bar(p, theme, ink, pal)
    elif t == "table":
        _table(p, ink, pal)


def _big_number(value, unit, ink, pal) -> None:
    with mui.Box(sx={"flex": 1, "display": "flex", "alignItems": "center",
                     "justifyContent": "flex-start", "gap": 0.75}):
        mui.Typography(value, sx={"fontSize": 40, "fontWeight": 700,
                                  "lineHeight": 1, "color": pal["series"][0]})
        if unit:
            mui.Typography(unit, sx={"fontSize": 14, "color": ink, "pb": 0.5})


def _nivo_theme(theme, ink) -> dict:
    grid = "rgba(255,255,255,.06)" if theme == "dark" else "rgba(20,20,26,.07)"
    return {
        "background": "transparent",
        "textColor": ink,
        "fontSize": 11,
        "axis": {"domain": {"line": {"stroke": grid}},
                 "ticks": {"line": {"stroke": grid}, "text": {"fill": ink}},
                 "legend": {"text": {"fill": ink}}},
        "grid": {"line": {"stroke": grid, "strokeWidth": 1}},
        "legends": {"text": {"fill": ink}},
        "tooltip": {"container": {"background": "#0f0f13" if theme == "dark" else "#fff",
                                  "color": ink, "fontSize": 12}},
    }


def _nivo_line(p, theme, ink, pal) -> None:
    data = cv.line_data(p)
    if not data:
        _placeholder(ink)
        return
    nivo.Line(
        data=data,
        theme=_nivo_theme(theme, ink),
        colors=pal["series"],
        margin={"top": 12, "right": 20, "bottom": 46, "left": 48},
        xScale={"type": "point"},
        yScale={"type": "linear", "min": "auto", "max": "auto"},
        axisBottom={"tickRotation": -32, "tickSize": 0, "tickPadding": 8},
        axisLeft={"tickSize": 0, "tickPadding": 6},
        enableGridX=False,
        curve="monotoneX",
        lineWidth=2,
        pointSize=6,
        pointBorderWidth=1,
        useMesh=True,
        enableSlices="x",
        legends=[{
            "anchor": "top-left", "direction": "row", "translateY": -2,
            "itemWidth": 110, "itemHeight": 14, "symbolSize": 9, "itemsSpacing": 6,
        }] if len(data) > 1 else [],
    )


def _nivo_bar(p, theme, ink, pal) -> None:
    rows, keys = cv.bar_data(p)
    if not rows:
        _placeholder(ink)
        return
    nivo.Bar(
        data=rows, keys=keys, indexBy="x",
        theme=_nivo_theme(theme, ink),
        colors=pal["series"],
        groupMode="grouped",
        margin={"top": 12, "right": 20, "bottom": 46, "left": 48},
        padding=0.3,
        axisBottom={"tickRotation": -32, "tickSize": 0, "tickPadding": 8},
        axisLeft={"tickSize": 0, "tickPadding": 6},
        enableLabel=False,
        enableGridX=False,
        legends=[{
            "dataFrom": "keys", "anchor": "top-left", "direction": "row",
            "translateY": -2, "itemWidth": 110, "itemHeight": 14, "symbolSize": 9,
        }] if len(keys) > 1 else [],
    )


def _table(p, ink, pal) -> None:
    headers, body = cv.table_data(p)
    if not headers:
        _placeholder(ink)
        return
    with mui.Box(sx={"flex": 1, "overflow": "auto"}):
        with mui.Table(size="small", stickyHeader=True):
            with mui.TableHead():
                with mui.TableRow():
                    for h in headers:
                        mui.TableCell(h, sx={"fontWeight": 700, "fontSize": 11,
                                             "color": ink, "bgcolor": "transparent"})
            with mui.TableBody():
                for row in body:
                    with mui.TableRow():
                        for c in row:
                            mui.TableCell(c, sx={"fontSize": 12, "color": ink,
                                                 "borderColor": "rgba(255,255,255,.06)"})


def _placeholder(ink) -> None:
    mui.Box(
        mui.Typography("Panel ayarları'ndan veri seç",
                       sx={"fontSize": 12, "color": ink, "opacity": 0.7}),
        sx={"flex": 1, "display": "flex", "alignItems": "center",
            "justifyContent": "center"},
    )
