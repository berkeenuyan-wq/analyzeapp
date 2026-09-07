"""Alarmlar — every dashboard warning in one place.

Sections no longer pin their own alerts to the top of the page; they are all
collected in :mod:`src.alarms` and listed here. "Onayla" acknowledges an alarm
(:func:`db.ack_alarm`) so it drops off the active list; it comes back only if its
underlying values change. "Geri al" un-acknowledges.
"""
from __future__ import annotations

import streamlit as st

from .. import alarms, db, ui
from ._common import html_card, page_header


def render(*, theme: str = "dark") -> None:
    feed = alarms.collect()
    acked = db.acked_alarms()
    active = [a for a in feed if a.id not in acked]
    done = [a for a in feed if a.id in acked]

    page_header(
        "Alarmlar",
        f"{len(active)} aktif · {len(done)} onaylanmış uyarı",
        actions=(lambda: _ack_all_button(active)) if active else None,
        ratio=0.3,
    )

    if not feed:
        html_card(ui.empty_state(
            "Aktif alarm yok",
            "Tüm kontroller tolerans içinde — kütle dengesi ve kalite ölçümleri "
            "eşiklerin içinde.",
            glyph="circle-check",
        ), title=None)
        return

    if active:
        for a in active:
            _alarm_row(a, acked=False)
    else:
        html_card(ui.empty_state(
            "Aktif alarm yok", "Tüm uyarılar onaylandı.", glyph="circle-check",
        ), title=None)

    if done:
        ui.render(
            '<div class="up-charthead" style="margin-top:18px">'
            '<span class="up-charthead__title">Onaylanmış</span>'
            f'<span class="up-charthead__sub">{len(done)} uyarı · '
            'değerler değişirse yeniden etkinleşir</span></div>'
        )
        for a in done:
            _alarm_row(a, acked=True, ack_at=acked.get(a.id))


# --------------------------------------------------------------------------- #
def _alarm_row(a: alarms.Alarm, *, acked: bool, ack_at: str | None = None) -> None:
    with st.container(border=True, key=f"alarm_{a.id}"):
        body, ctrl = st.columns([1, 0.18], vertical_alignment="center")
        with body:
            note = f"{a.source_label} · {a.body}"
            if acked and ack_at:
                note += f" · onaylandı {ack_at.replace('T', ' ')[:16]}"
            ui.render(ui.alert(a.title, note, tone="info" if acked else a.tone))
        with ctrl:
            if acked:
                if st.button("Geri al", key=f"unack_{a.id}", width="stretch"):
                    db.unack_alarm(a.id)
                    st.rerun()
            else:
                if st.button("Onayla", key=f"ack_{a.id}", width="stretch"):
                    db.ack_alarm(a.id)
                    st.rerun()


def _ack_all_button(active: list[alarms.Alarm]) -> None:
    if st.button(f"Tümünü onayla ({len(active)})", key="ack_all",
                 width="stretch", icon=":material/done_all:"):
        for a in active:
            db.ack_alarm(a.id)
        st.rerun()
