"""Genel Bakış — plant-wide overview."""
from __future__ import annotations

import streamlit as st

from .. import charts, db, fmt, metrics, ui
from ..config import tone_toplam_verim
from ._common import (
    chart_card, export_button, html_card, kpi_row, page_header, plot, table_card,
)


def render(*, theme: str = "dark") -> None:
    b = db.batches()
    t = db.trucks()

    if b.empty:
        page_header("Genel Bakış")
        html_card(ui.empty_state(
            "Henüz veri yok",
            "Pres Performansı tablosundan batch ekleyin ya da üstteki Veri Girişi'nden Excel içe aktarın.",
        ), title=None)
        return

    cov = metrics.coverage(b, t)
    h = metrics.headline(b)
    presses = metrics.both_presses(b)
    dpp = metrics.daily_press_performance(b)
    series = metrics.daily_headline_series(b)

    subtitle = (
        f"Bucher Pres · {h.batch_count} batch · "
        f"{fmt.date_range(cov.first_day, cov.last_day)}"
    )
    page_header("Genel Bakış", subtitle,
                actions=lambda: export_button("genel_export"), ratio=0.42)

    # --- hero ---------------------------------------------------------------
    d_islenen = metrics.last_pct_change(series["islenen_ton"]) if not series.empty else None
    ui.render(ui.hero_metric(
        overline="İşlenen toplam ürün miktarı",
        value=fmt.nf(h.islenen_ton, 1),
        unit="ton",
        glyph="gauge",
        status=(f"{h.batch_count} batch tamamlandı", "good"),
        delta=d_islenen,
        delta_good_when="up",
        delta_period="önceki güne göre",
        note=(
            f"Ort. toplam verim {fmt.pct_prose(h.ort_toplam_verim)}"
            f" · Çıkan ort. {fmt.nf(h.cikan_ort_t_sa, 1)} t/sa"
            f" · Saatlik ort. posa {fmt.nf(h.posa_saatlik_toplam_t_sa, 1)} t/sa"
            f" · Ort. batch süresi {fmt.nf(h.ort_batch_suresi_dk, 1)} dk"
        ),
        spark=b.sort_values("batch_no")["dolum_kg"].tolist(),
        spark_color="var(--series-1)",
    ))

    # --- KPI row ----------------------------------------------------------
    def d(col: str):
        return metrics.last_pct_change(series[col]) if not series.empty else None

    kpi_row([
        ui.kpi_card(label="Ort. toplam verim", value=fmt.nf(h.ort_toplam_verim, 1), unit="%",
                    glyph="percent", delta=d("ort_toplam_verim"), delta_good_when="up"),
        ui.kpi_card(label="Ort. batch süresi", value=fmt.nf(h.ort_batch_suresi_dk, 1), unit="dk",
                    glyph="timer", delta=d("ort_batch_suresi_dk"), delta_good_when="down"),
        ui.kpi_card(label="Çıkan toplam ürün ort.", value=fmt.nf(h.cikan_ort_t_sa, 1), unit="t/sa",
                    glyph="droplet", delta=d("cikan_ort_t_sa"), delta_good_when="up"),
        ui.kpi_card(label="Saatlik ort. toplam posa", value=fmt.nf(h.posa_saatlik_toplam_t_sa, 1),
                    unit="t/sa", glyph="scale", delta=None),
    ])

    # --- per-press cards -----------------------------------------------------
    cols = st.columns(2, gap="small")
    for i, (col, p) in enumerate(zip(cols, presses), start=1):
        with col:
            oran = (p.cikan_ton / p.giren_ton * 100) if p.giren_ton else 0
            body = (
                ui.figrow([
                    ("Giren toplam", f"{fmt.nf(p.giren_ton, 1)} t"),
                    ("Çıkan toplam", f"{fmt.nf(p.cikan_ton, 1)} t"),
                    ("Saatlik ort.", f"{fmt.nf(p.saatlik_t_sa, 1)} t/sa"),
                ])
                + '<div style="height:14px"></div>'
                + '<div style="display:flex;justify-content:space-between;font:var(--type-caption);'
                  'font-size:var(--text-xs);color:var(--text-subtle);margin-bottom:6px">'
                  f'<span>Çıkan / giren oranı</span><span style="font:var(--type-table-num);'
                  f'font-size:var(--text-xs);color:var(--text-primary)">{fmt.pct_prose(oran)}</span></div>'
                + ui.stat_bar(p.cikan_ton, p.giren_ton, series=i)
                + '<div class="up-divrow"><span>Saatlik ortalama toplam posa</span>'
                  f'{ui.badge(f"{fmt.nf(p.posa_saatlik_t_sa, 1)} t/sa", "bad", small=True)}</div>'
            )
            html_card(
                body,
                title=p.label,
                subtitle="Toplam çalışma, giren / çıkan ürün",
                glyph="factory",
                right=ui.badge(f"{fmt.nf(p.calisma_saat, 2)} saat", "neutral", small=True),
            )

    # --- daily performance trend ------------------------------------------
    if not dpp.empty:
        labels = [fmt.date_short(x) for x in dpp["gun"]]
        pal = charts.palette(theme)
        with chart_card(
            "Günlük performans trendi", "Ton/saat",
            legend=[("Press 1", pal["series"][0]), ("Press 2", pal["series"][1]), ("Toplam", pal["series"][2])],
            footer="Kaynak: batch performans tablosu · GÜNLÜK PRESS PERFORMANSI TON/SA",
            key="gb_trend",
        ):
            fig = charts.line_chart(
                labels,
                [
                    {"name": "Press 1", "values": dpp["p1_perf_t_sa"].tolist(), "series": 1},
                    {"name": "Press 2", "values": dpp["p2_perf_t_sa"].tolist(), "series": 2},
                    {"name": "Toplam", "values": dpp["toplam_perf_t_sa"].tolist(), "series": 3},
                ],
                theme=theme, height=252, fill=False,
            )
            plot(fig, key="gb_trend_fig")

    # Mass-balance / tolerance warnings now live on the Alarmlar page.

    # --- daily press performance table -----------------------------------
    def _n(v, dgts=1):
        return f'{fmt.nf(v, dgts)}'

    rows = dpp.to_dict("records")
    columns = [
        {"key": "gun", "header": "Gün", "emph": True, "render": lambda r: fmt.date_short(r["gun"])},
        {"key": "p1", "header": "Press 1 t/sa", "numeric": True, "render": lambda r: _n(r["p1_perf_t_sa"])},
        {"key": "p2", "header": "Press 2 t/sa", "numeric": True, "render": lambda r: _n(r["p2_perf_t_sa"])},
        {"key": "tp", "header": "Toplam t/sa", "numeric": True, "emph": True, "render": lambda r: _n(r["toplam_perf_t_sa"])},
        {"key": "tg", "header": "Toplam giren (t)", "numeric": True, "render": lambda r: _n(r["toplam_giren_ton"], 2)},
        {"key": "tc", "header": "Toplam çıkan (t)", "numeric": True, "render": lambda r: _n(r["toplam_cikan_ton"], 2)},
        {"key": "vr", "header": "Verim %", "numeric": True, "render": lambda r: _n(r["verim_pct"], 2)},
        {"key": "lc", "header": "Leeching verimi %", "numeric": True, "render": lambda r: _n(r["leeching_verim_pct"], 2)},
        {"key": "ov", "header": "Ortalama verim", "render": lambda r: ui.badge(fmt.pct_prose(r["ort_verim_pct"]), tone_toplam_verim(r["ort_verim_pct"]), small=True, dot=True)},
    ]
    tot_giren = dpp["toplam_giren_ton"].sum()
    tot_cikan = dpp["toplam_cikan_ton"].sum()
    foot = {
        "gun": "Toplam",
        "tg": fmt.nf(tot_giren, 2),
        "tc": fmt.nf(tot_cikan, 2),
        "vr": fmt.nf(tot_cikan / tot_giren * 100, 2) if tot_giren else "—",
    }
    table_card(columns, rows, title="Günlük press performansı",
               subtitle="Girdi, çıktı ve verim", foot=foot)

    ui.render(ui.foot_note(
        f"Kaynak: {cov.source_filename or 'Production_Stats.xlsx'} · "
        f"Son güncelleme {(cov.last_import_at or '—').replace('T', ' ')[:16]}"
    ))
