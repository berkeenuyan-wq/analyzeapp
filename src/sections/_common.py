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


def marked_view(grid_id: str, display_df, row_label_fn) -> None:
    """Read-only styled table + an add/remove-marks editor.

    ``display_df`` must already use the human column labels; ``row_label_fn``
    maps a row dict to the label shown in the row picker and stored in a mark.
    """
    from .. import marks as mk

    marks = mk.load(grid_id)
    row_labels = display_df.apply(lambda r: row_label_fn(r.to_dict()), axis=1)
    st.dataframe(mk.style_frame(display_df, marks, row_labels),
                 width="stretch", hide_index=True)

    with st.expander("İşaret ekle / kaldır", expanded=not marks):
        _mark_editor(grid_id, display_df, list(dict.fromkeys(row_labels)), marks)


_KIND_LABEL = {"row": "Satır", "col": "Sütun", "cell": "Hücre"}


def _mark_editor(grid_id: str, display_df, row_options: list, marks: list) -> None:
    from .. import marks as mk

    c = st.columns([0.8, 1.5, 1.5, 1, 0.7], vertical_alignment="bottom")
    kind = c[0].selectbox("Tür", ["row", "col", "cell"],
                          format_func=_KIND_LABEL.get, key=f"{grid_id}_mk_kind")
    row = (c[1].selectbox("Satır", row_options, key=f"{grid_id}_mk_row")
           if kind in ("row", "cell") and row_options else None)
    col = (c[2].selectbox("Sütun", list(display_df.columns), key=f"{grid_id}_mk_col")
           if kind in ("col", "cell") else None)
    color = c[3].selectbox("Renk", list(mk.PALETTE),
                           format_func=lambda k: mk.PALETTE[k][0],
                           key=f"{grid_id}_mk_color")
    if c[4].button("Ekle", key=f"{grid_id}_mk_add", type="primary", width="stretch"):
        marks.append({"kind": kind, "color": color, "row": row, "col": col})
        mk.save(grid_id, marks)
        st.rerun()

    for i, m in enumerate(marks):
        r = st.columns([5, 0.6])
        r[0].markdown(
            f'<span style="display:inline-block;width:10px;height:10px;border-radius:3px;'
            f'background:{mk.PALETTE.get(m.get("color",""), ("", "#888"))[1]};'
            f'vertical-align:middle;margin-right:6px"></span>{mk.describe(m)}',
            unsafe_allow_html=True)
        if r[1].button("Sil", key=f"{grid_id}_mk_del_{i}", width="stretch"):
            marks.pop(i)
            mk.save(grid_id, marks)
            st.rerun()
    if marks and st.button("Tüm işaretleri temizle", key=f"{grid_id}_mk_clear"):
        mk.clear(grid_id)
        st.rerun()
