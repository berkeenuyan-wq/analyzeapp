"""Posa Analizi — mass balance (Araç vs Pres farkı) against ±5% tolerance."""
from __future__ import annotations

import streamlit as st

from .. import charts, db, fmt, metrics, ui
from ..config import FARK_TOLERANCE, tone_fark
from ._common import (
    chart_card, export_button, html_card, kpi_row, page_header, plot, table_card,
)


def render(*, theme: str = "dark") -> None:
    b = db.batches()
    t = db.trucks()
    mb = metrics.mass_balance(b, t)
    posa = metrics.posa_summary(b)

    n_days = int(mb["kayit_var"].sum()) if not mb.empty else 0
    page_header(
        "Posa Analizi",
        f"Araç vs pres farkı · {n_days} gün · tolerans ±%5",
        actions=lambda: export_button("posa_export"), ratio=0.42,
    )

    if mb.empty:
        html_card(ui.empty_state(
            "Kütle dengesi için araç kaydı yok",
            "Araç Lojistiği bölümüne en az bir gün için araç girişi ekleyin.",
        ), title=None)
        return

    breaches = mb[mb["tolerans_disi"]]
    if not breaches.empty:
        row = breaches.iloc[-1]
        ui.render(ui.alert(
            "Kütle dengesi toleransın dışında",
            f"{fmt.date_short(row['tarih'])} için fark {fmt.pct_prose(row['fark_pct'])} "
            f"({fmt.ni(row['fark_kg'])} kg) — tolerans ±%{FARK_TOLERANCE:g}.",
            tone="bad",
        ))

    # --- hero: latest day's Fark % ---------------------------------------
    last = mb.iloc[-1]
    fark_pct = last["fark_pct"]
    d_fark = metrics.last_delta(mb["fark_pct"])
    ui.render(ui.hero_metric(
        overline=f"Araç vs pres farkı · {fmt.date_short(last['tarih'])}",
        value=fmt.nf(fark_pct, 1),
        unit="%",
        glyph="percent",
        status=("Tolerans içinde" if not last["tolerans_disi"] else "Eşik aşıldı",
                tone_fark(fark_pct)),
        delta=d_fark,
        delta_good_when="down",
        delta_period="önceki güne göre",
        delta_suffix=" puan",
        note=(
            "(Araç Toplamı − Pres Toplamı) / Araç Toplamı · Tolerans ±%5"
            f" · Araç {fmt.ni(last['arac_toplam_kg'])} kg"
            f" · Pres {fmt.ni(last['pres_toplam_kg'])} kg"
            f" · Fark {fmt.ni(last['fark_kg'])} kg"
        ),
        spark=mb["fark_pct"].tolist(),
        spark_color="var(--series-1)",
    ))
    html_card(ui.threshold_meter(fark_pct, tolerance=FARK_TOLERANCE),
              title="Tolerans bandı", subtitle="±%5 içinde kalmalı", glyph="scale")

    # --- KPI row ----------------------------------------------------------
    kpi_row([
        ui.kpi_card(label="Saatlik ort. toplam posa", value=fmt.nf(posa.saatlik_toplam_t_sa, 1),
                    unit="t/sa", glyph="scale", delta=None),
        ui.kpi_card(label="Pres 1 saatlik posa", value=fmt.nf(posa.p1_saatlik_t_sa, 1),
                    unit="t/sa", glyph="droplet", delta=None),
        ui.kpi_card(label="Pres 2 saatlik posa", value=fmt.nf(posa.p2_saatlik_t_sa, 1),
                    unit="t/sa", glyph="droplet", delta=None),
        ui.kpi_card(label="Ort. leeching verimi", value=fmt.nf(posa.ort_leeching_verim_pct, 1),
                    unit="%", glyph="percent", delta=None),
    ])

    # --- charts ----------------------------------------------------------
    plotted = mb[mb["kayit_var"]]
    pal = charts.palette(theme)
    c1, c2 = st.columns([1.5, 1], gap="small")
    with c1:
        with chart_card("Günlük fark %", "Araç vs pres · %",
                        footer="Kayıt olmayan günler grafik dışında; tabloda 'Kayıt yok' olarak görünür.",
                        key="pa_bars"):
            fig = charts.bar_chart(
                [fmt.date_short(x) for x in plotted["tarih"]],
                [{"name": "Fark %", "values": plotted["fark_pct"].tolist(), "series": 1}],
                theme=theme, height=248,
                limit={"value": FARK_TOLERANCE, "label": f"Tolerans %{FARK_TOLERANCE:g}"},
            )
            plot(fig, key="pa_bars_fig")
    with c2:
        with chart_card("Son gün · dağılım", fmt.date_short(last["tarih"]), key="pa_donut"):
            preslenen = max(last["pres_toplam_kg"], 0)
            fark_abs = max(last["arac_toplam_kg"] - last["pres_toplam_kg"], 0)
            fig = charts.donut(
                [
                    {"name": "Preslenen", "value": preslenen, "series": 2},
                    {"name": "Fark", "value": fark_abs, "series": 1},
                ],
                theme=theme, height=236,
                center_value=fmt.pct_prose(last["fark_pct"]), center_label="fark",
            )
            plot(fig, key="pa_donut_fig")

    # --- Ön Hatlar Analiz table (1:1) ----------------------------------
    rows = mb.to_dict("records")
    columns = [
        {"key": "tarih", "header": "Tarih", "emph": True, "render": lambda r: fmt.date_short(r["tarih"])},
        {"key": "arac_toplam_kg", "header": "Araç toplamı (kg)", "numeric": True, "render": lambda r: fmt.ni(r["arac_toplam_kg"])},
        {"key": "pres_toplam_kg", "header": "Pres toplamı (kg)", "numeric": True,
         "render": lambda r: fmt.ni(r["pres_toplam_kg"]) if r["kayit_var"] else ui.muted_dash()},
        {"key": "fark_kg", "header": "Fark (kg)", "numeric": True,
         "render": lambda r: fmt.ni(r["fark_kg"]) if r["kayit_var"] else ui.muted_dash()},
        {"key": "fark_pct", "header": "Fark (%)", "numeric": True,
         "render": lambda r: (ui.badge(fmt.pct_prose(r["fark_pct"]), tone_fark(r["fark_pct"]), small=True)
                              if r["kayit_var"] else '<span class="muted">Kayıt yok</span>')},
    ]
    table_card(columns, rows, title="Ön Hatlar Analiz — günlük araç vs pres farkı",
               subtitle="Workbook sayfasının birebir karşılığı")

    # --- low-verim batch table -----------------------------------------
    low = metrics.low_verim_batches(b, threshold=90.0)
    low_rows = low.to_dict("records")
    max_loss = low["verim_kaybi_puan"].max() if not low.empty else 1
    low_cols = [
        {"key": "pres", "header": "Pres", "render": lambda r: ui.badge(r["pres"], "neutral", small=True)},
        {"key": "batch_no", "header": "Batch", "emph": True, "numeric": True},
        {"key": "tarih", "header": "Tarih", "render": lambda r: fmt.date_short(r["tarih"])},
        {"key": "toplam_verim_pct", "header": "Toplam verim", "numeric": True,
         "render": lambda r: ui.badge(fmt.pct_prose(r["toplam_verim_pct"]), "bad", small=True)},
        {"key": "verim_kaybi_puan", "header": "Verim kaybı (puan)", "numeric": True,
         "render": lambda r: fmt.nf(r["verim_kaybi_puan"], 1)},
        {"key": "bar", "header": "", "render": lambda r: ui.stat_bar(r["verim_kaybi_puan"], max_loss, series=1)},
    ]
    table_card(low_cols, low_rows, title="Düşük verimli batch'ler",
               subtitle="Toplam verim %90 altında", glyph="triangle-alert",
               empty_title="Tüm batch'ler %90 ve üzerinde",
               empty_body="Bu dönem için düşük verimli batch yok.")
