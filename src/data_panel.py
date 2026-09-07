"""Veri paneli — top-bar modal for Excel import / export and file status.

Replaces the former standalone *Veri Girişi* page. Batch and truck records are
now added / edited / deleted inline in the Pres Performansı and Araç Lojistiği
grids, so all that is left is bulk file work — it opens as an ``st.dialog`` from
the top bar (button left of the theme toggle).
"""
from __future__ import annotations

import streamlit as st

from . import db, excel_io, fmt, metrics, ui
from .sections._common import html_card


def _file_status() -> None:
    cov = metrics.coverage()
    stamp = (cov.last_import_at or "—").replace("T", " ")[:16]
    body = (
        ui.figrow([
            ("Batch kaydı", str(cov.batch_count)),
            ("Araç kaydı", str(cov.truck_count)),
            ("Lab kaydı", str(db.lab_count())),
            ("Gün", str(len(set(cov.batch_days) | set(cov.truck_days)))),
        ])
        + f'<div class="up-divrow"><span>Son içe aktarma</span>'
          f'<span style="color:var(--text-body)">{stamp}</span></div>'
        + f'<div class="up-divrow"><span>Kaynak</span>'
          f'<span style="color:var(--text-body)">{cov.source_filename or "—"}</span></div>'
    )
    html_card(body, title="Dosya durumu", glyph="file-spreadsheet")


def _excel_tools() -> None:
    ui.render(ui.card_open("Excel", subtitle="İçe / dışa aktarma", glyph="file-spreadsheet"))

    st.download_button(
        "Excel'e Aktar",
        data=excel_io.build_workbook(),
        file_name=excel_io.export_filename(),
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        width="stretch",
        key="vg_export",
    )

    up = st.file_uploader("Excel'den içe aktar", type=["xlsx"], key="vg_upload",
                          label_visibility="collapsed")
    if up is not None:
        try:
            result = excel_io.preview(up)
        except Exception as exc:  # noqa: BLE001 — surfaced to the operator
            ui.render(ui.alert("Dosya okunamadı", str(exc), tone="bad"))
            ui.render(ui.card_close())
            return

        rep = result.report
        lab_bit = f"{rep.lab_rows} lab · " if rep.lab_rows else ""
        ui.render(ui.alert(
            "Önizleme — henüz yazılmadı",
            f"{rep.batch_rows} batch · {rep.truck_rows} araç · {lab_bit}"
            f"{len(rep.fixes)} düzeltme · {len(rep.warnings)} uyarı · "
            f"{len(rep.rejected)} reddedilen satır.",
            tone="info",
        ))
        for label, items in (
            ("Düzeltmeler", rep.fixes),
            ("Uyarılar", rep.warnings),
            ("Reddedilen satırlar", rep.rejected),
        ):
            if items:
                lis = "".join(f"<li>{i}</li>" for i in items[:12])
                more = f"<li>… {len(items) - 12} kayıt daha</li>" if len(items) > 12 else ""
                ui.render(
                    f'<div class="up-inset" style="margin-top:8px"><div style="font:var(--type-label);'
                    f'color:var(--text-muted);margin-bottom:6px">{label}</div>'
                    f'<ul style="margin:0;padding-left:18px;font:var(--type-caption);'
                    f'color:var(--text-body)">{lis}{more}</ul></div>'
                )

        mode_label = st.radio(
            "Yazma biçimi", ["Anahtara göre birleştir (upsert)", "Tümünü değiştir"],
            key="vg_mode",
        )
        mode = "upsert" if mode_label.startswith("Anahtar") else "replace"
        if st.button("İçe aktarmayı onayla", type="primary", key="vg_commit"):
            counts = excel_io.commit(result, mode=mode)
            st.cache_data.clear()
            lab_bit = f", {counts['lab']} lab" if counts.get("lab") else ""
            st.toast(
                f"İçe aktarıldı — {counts['batch']} batch, {counts['truck']} araç{lab_bit}."
            )
            st.rerun()

    ui.render(ui.card_close())


def _recent() -> None:
    b = db.batches()
    rows_html = []
    for r in b.sort_values("batch_no", ascending=False).head(6).itertuples():
        rows_html.append(
            f'<tr><td class="emph">#{r.batch_no}</td><td>{r.pres}</td>'
            f'<td>{fmt.date_short(r.tarih)}</td>'
            f'<td class="num">{fmt.pct_prose(r.toplam_verim_pct)}</td></tr>'
        )
    batch_tbl = (
        '<div class="up-table-wrap"><table class="up-table"><thead><tr>'
        '<th>Batch</th><th>Pres</th><th>Tarih</th><th class="num">Verim</th>'
        f'</tr></thead><tbody>{"".join(rows_html) or "<tr><td colspan=4>Kayıt yok</td></tr>"}</tbody></table></div>'
    )
    html_card(batch_tbl, title="Son kayıtlar", subtitle="Son eklenen batch'ler", glyph="table-2")


@st.dialog("Veri Girişi", width="large")
def open_panel() -> None:
    """Modal: file status + Excel import (with cleaning preview) + Excel export."""
    st.caption(
        "Batch ve araç kayıtları Pres Performansı ve Araç Lojistiği tablolarından "
        "düzenlenir. Buradan toplu Excel içe / dışa aktarımı yapılır."
    )
    _file_status()
    _excel_tools()
    _recent()
