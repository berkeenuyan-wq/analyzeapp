"""Üretim Paneli — Streamlit entry point (shell: sidebar + top bar + routing)."""
from __future__ import annotations

import streamlit as st

from src import data_panel, db, metrics, theme
from src.config import SECTIONS, SEED_XLSX
from src.icons import icon
from src.ingest import run as run_ingest
from src.sections import (
    arac_lojistigi,
    genel_bakis,
    posa_analizi,
    pres_performansi,
)

st.set_page_config(
    page_title="Üretim Paneli",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

_RENDERERS = {
    "genel": genel_bakis.render,
    "pres": pres_performansi.render,
    "posa": posa_analizi.render,
    "arac": arac_lojistigi.render,
}


def _bootstrap() -> None:
    """First run: load the seed workbook so the panel is never empty."""
    if not db.is_ready() and SEED_XLSX.exists():
        with st.spinner("İlk veri yükleniyor…"):
            run_ingest(SEED_XLSX, mode="replace")


def _sidebar() -> str:
    with st.sidebar:
        st.markdown(
            '<div class="up-brand">'
            f'<span class="up-brand__mark">{icon("factory", 16)}</span>'
            '<span><div class="up-brand__name">Üretim Paneli</div>'
            '<div class="up-brand__sub">Elma Presleme Tesisi</div></span></div>',
            unsafe_allow_html=True,
        )

        try:
            badges = {"posa": len(metrics.breaches())}
        except Exception:
            badges = {}

        current = st.session_state.get("page", "genel")
        for s in SECTIONS:
            n = badges.get(s["id"], 0)
            label = f"{s['label']} :red-badge[{n}]" if n else s["label"]
            if st.button(
                label,
                key=f"nav_{s['id']}",
                width="stretch",
                type="primary" if s["id"] == current else "secondary",
            ):
                st.session_state.page = s["id"]
                st.rerun()

        st.markdown("<div class='up-sidebar-spacer'></div>", unsafe_allow_html=True)

        # footer: file status only
        meta_time = db.get_meta("last_import_at", "—")
        src_name = db.get_meta("source_filename", "Production_Stats.xlsx")
        try:
            n_batch, n_truck = len(db.batches()), len(db.trucks())
        except Exception:
            n_batch = n_truck = 0
        stamp = meta_time.replace("T", " ")[:16] if meta_time and meta_time != "—" else "—"
        with st.container(key="sidefoot"):
            st.markdown(
                '<div class="up-file-chip">'
                f'<span class="up-file-chip__row"><span class="up-file-chip__dot"></span>{src_name}</span>'
                f'<span class="up-file-chip__meta">Son okuma {stamp} · '
                f'{n_batch} batch · {n_truck} araç</span></div>',
                unsafe_allow_html=True,
            )

    return st.session_state.get("page", "genel")


def _topbar() -> None:
    """Sticky bar over the content: global search + theme toggle + refresh."""
    with st.container(key="topbar"):
        left, mid, right = st.columns([1, 0.34, 0.2], vertical_alignment="center")
        with left:
            st.text_input(
                "Ara",
                key="q",
                placeholder="Plaka veya tedarikçi ara",
                label_visibility="collapsed",
                icon=":material/search:",
            )
        with mid:
            if st.button("Veri Girişi", key="tb_data", width="stretch",
                         icon=":material/database:",
                         help="Excel içe / dışa aktarma ve dosya durumu"):
                data_panel.open_panel()
        with right:
            a, b = st.columns(2, gap="small")
            night = st.session_state.theme == "dark"
            with a:
                if st.button(
                    "", key="tb_theme", width="stretch",
                    icon=":material/light_mode:" if night else ":material/dark_mode:",
                    help="Tema değiştir",
                ):
                    st.session_state.theme = "light" if night else "dark"
                    st.rerun()
            with b:
                if st.button("", key="tb_refresh", width="stretch",
                             icon=":material/refresh:", help="Verileri yenile"):
                    st.cache_data.clear()
                    st.rerun()


def main() -> None:
    st.session_state.setdefault("page", "genel")
    st.session_state.setdefault("theme", "dark")

    theme.inject(st.session_state.theme)
    _bootstrap()
    page = _sidebar()
    _topbar()

    _RENDERERS.get(page, genel_bakis.render)(theme=st.session_state.theme)


if __name__ == "__main__":
    main()
