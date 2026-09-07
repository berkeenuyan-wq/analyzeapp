"""Shared building blocks for the five section pages.

Streamlit renders every ``st.markdown`` call into its own sibling wrapper, so an
unclosed ``<div>`` in one call cannot wrap a widget produced by the next. Two
patterns follow from that:

* a card that holds only HTML (a table, a stat block) is emitted in **one**
  ``ui.render`` call — :func:`html_card`, :func:`table_card`;
* a card that holds a Streamlit widget (a Plotly chart, a form) uses a bordered
  ``st.container`` styled as a card — :func:`chart_card`.
"""
from __future__ import annotations

from contextlib import contextmanager
from html import escape

import streamlit as st

from .. import charts, ui


def page_header(title: str, subtitle: str | None = None, *, actions=None, ratio=0.6) -> None:
    if actions is None:
        ui.render(ui.section_header(title, subtitle))
        return
    left, right = st.columns([1, ratio], vertical_alignment="center")
    with left:
        ui.render(ui.section_header(title, subtitle))
    with right:
        actions()


def tab_bar(prefix: str, tabs: list[tuple], *, default: str | None = None) -> str:
    """Underlined in-page tab bar built from ``st.button`` (see .st-key-uptabbar CSS).

    ``tabs`` is a list of ``(id, label, count | None)``. Returns the active id.
    """
    key = f"{prefix}_scope"
    ids = [t[0] for t in tabs]
    if st.session_state.get(key) not in ids:
        st.session_state[key] = default or ids[0]
    active = st.session_state[key]

    with st.container(key="uptabbar"):
        for tid, label, count in tabs:
            lbl = label if count is None else f"{label} :gray-badge[{count}]"
            if st.button(lbl, key=f"{prefix}_tab_{tid}",
                         type="primary" if tid == active else "secondary"):
                st.session_state[key] = tid
                st.rerun()
    return st.session_state[key]


def granularity(prefix: str, options: list[str], *, default: str | None = None) -> str:
    """Compact `Batch | Gün | Reçete` segmented control. Returns the selected label."""
    return st.segmented_control(
        "Kırılım", options, default=default or options[0],
        key=f"{prefix}_gran", label_visibility="collapsed",
    ) or (default or options[0])


def export_button(key: str) -> None:
    """The standard right-aligned 'Excel'e Aktar' download button."""
    from .. import excel_io  # local import: excel_io pulls in openpyxl

    st.download_button(
        "Excel'e Aktar",
        data=excel_io.build_workbook(),
        file_name=excel_io.export_filename(),
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        width="stretch",
        key=key,
    )


def kpi_row(cards: list[str]) -> None:
    if not cards:
        return
    cols = st.columns(len(cards), gap="small")
    for col, html in zip(cols, cards):
        with col:
            ui.render(html)


def html_card(
    body: str,
    *,
    title: str | None = None,
    subtitle: str | None = None,
    glyph: str | None = None,
    tone: str | None = None,
    right: str = "",
) -> None:
    """One card, one render call. ``body`` is trusted HTML."""
    ui.render(ui.card_open(title, subtitle=subtitle, glyph=glyph, tone=tone, right=right) + body + ui.card_close())


def table_card(
    columns: list[dict],
    rows: list[dict],
    *,
    title: str,
    subtitle: str | None = None,
    glyph: str | None = "table-2",
    foot: dict | None = None,
    tone: str | None = None,
    empty_title: str = "Kayıt yok",
    empty_body: str | None = None,
) -> None:
    if not rows:
        html_card(ui.empty_state(empty_title, empty_body, "calendar-x"),
                  title=title, subtitle=subtitle, glyph=glyph)
        return
    html_card(ui.data_table(columns, rows, foot=foot),
              title=title, subtitle=subtitle, glyph=glyph, tone=tone)


@contextmanager
def chart_card(title, subtitle=None, *, legend=None, footer=None, key=None):
    box = st.container(border=True, key=key)
    with box:
        sub = f'<span class="up-charthead__sub">{escape(subtitle)}</span>' if subtitle else ""
        ui.render(f'<div class="up-charthead"><span class="up-charthead__title">{escape(title)}</span>{sub}</div>')
        if legend:
            ui.render(ui.legend(legend))
        yield box
        if footer:
            ui.render(ui.foot_note(footer))


def plot(fig, *, key=None) -> None:
    st.plotly_chart(fig, width="stretch", config=charts.PLOTLY_CONFIG, key=key)


def spacer(px: int = 4) -> None:
    st.markdown(f"<div style='height:{px}px'></div>", unsafe_allow_html=True)


# --------------------------------------------------------------------------- #
# colour marks for the editable grids (row / column / cell highlights)
# --------------------------------------------------------------------------- #
def marking_toggle(grid_id: str) -> bool:
    """Düzenle / İşaretle switch above a grid. Returns True in marking mode."""
    mode = st.segmented_control(
        "Görünüm", ["Düzenle", "İşaretle"], default="Düzenle",
        key=f"{grid_id}_gridmode", label_visibility="collapsed")
    return mode == "İşaretle"


_KIND_LABEL = {"cell": "Hücre", "row": "Satır", "col": "Sütun"}


def marked_view(grid_id: str, display_df, row_label_fn) -> None:
    """Read-only styled table + a colour-mark editor. Pick a colour from the
    wheel, choose one or more rows and/or columns, paint. Marks persist and
    repaint on every load.

    ``display_df`` must already use the human column labels; ``row_label_fn``
    maps a row dict to the row's stable label (stored in each mark).
    """
    from .. import marks as mk

    marks = mk.load(grid_id)
    row_labels = display_df.apply(lambda r: row_label_fn(r.to_dict()), axis=1)
    st.dataframe(mk.style_frame(display_df, marks, row_labels),
                 width="stretch", hide_index=True)

    rows_all = list(dict.fromkeys(row_labels))
    cols_all = list(display_df.columns)

    top = st.columns([0.9, 0.9, 1.4], vertical_alignment="bottom")
    kind = top[0].selectbox("Kapsam", ["cell", "row", "col"],
                            format_func=_KIND_LABEL.get, key=f"{grid_id}_mk_kind")
    hexc = top[1].color_picker("Renk", "#e8b53f", key=f"{grid_id}_mk_color")

    sel_rows = sel_cols = []
    if kind in ("cell", "row"):
        sel_rows = st.multiselect("Satırlar", rows_all, key=f"{grid_id}_mk_rows",
                                  placeholder="Bir veya birden çok satır seç")
    if kind in ("cell", "col"):
        sel_cols = st.multiselect("Sütunlar", cols_all, key=f"{grid_id}_mk_cols",
                                  placeholder="Bir veya birden çok sütun seç")

    ok = (sel_rows if kind == "row" else sel_cols if kind == "col"
          else sel_rows and sel_cols)
    b = st.columns([1, 1, 3])
    if b[0].button("Boya", key=f"{grid_id}_mk_paint", type="primary",
                   disabled=not ok, width="stretch"):
        _paint(grid_id, marks, kind, sel_rows, sel_cols, hexc)
    if b[1].button("İşareti kaldır", key=f"{grid_id}_mk_unpaint",
                   disabled=not ok, width="stretch"):
        _paint(grid_id, marks, kind, sel_rows, sel_cols, None)

    if marks:
        chips = "".join(
            f'<span style="display:inline-block;background:{mk.css_color(m.get("color",""))};'
            f'border-radius:5px;padding:1px 7px;margin:2px 4px 2px 0;font-size:12px">'
            f'{escape(mk.describe(m))}</span>' for m in marks)
        st.markdown(f"**{len(marks)} işaret** &nbsp; {chips}", unsafe_allow_html=True)
        if st.button("Tüm işaretleri temizle", key=f"{grid_id}_mk_clearall"):
            mk.clear(grid_id)
            st.rerun()


def _paint(grid_id, marks, kind, rows, cols, hexc) -> None:
    from .. import marks as mk

    def drop(pred):
        marks[:] = [m for m in marks if not pred(m)]

    if kind == "row":
        for r in rows:
            drop(lambda m: m["kind"] == "row" and m.get("row") == r)
            if hexc:
                marks.append({"kind": "row", "color": hexc, "row": r, "col": None})
    elif kind == "col":
        for c in cols:
            drop(lambda m: m["kind"] == "col" and m.get("col") == c)
            if hexc:
                marks.append({"kind": "col", "color": hexc, "row": None, "col": c})
    else:
        for r in rows:
            for c in cols:
                drop(lambda m: m["kind"] == "cell" and m.get("row") == r
                     and m.get("col") == c)
                if hexc:
                    marks.append({"kind": "cell", "color": hexc, "row": r, "col": c})
    mk.save(grid_id, marks)
    st.rerun()
