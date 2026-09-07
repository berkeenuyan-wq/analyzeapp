"""Tanısal KPI paneli — Pres Performansı sayfasının alt bölümü.

Cross-cutting diagnostics derived from batch + truck data; ``render(b, t)`` is
called by :mod:`src.sections.pres_performansi` (there is no separate page).

Eight KPIs (planned with Berke, 2026-09-06):
  1  Press arası boşta kalma / kullanım
  2  Fouling decay — verim vs. yıkamadan bu yana batch
  3  Reçete verim varyansı
  4  Tank sıcaklığı ↔ verim
  5  Düşük verim tekrarlılığı
  6  Bez (cloth) yaşı — verim vs. bez değişiminden bu yana batch   (needs bez_degisti)
  7  Kamyon–pres senkronizasyon kaybı
  8  Bitiş kriteri Pareto                                          (needs bitis_kriteri)
"""
from __future__ import annotations

from .. import charts, fmt, metrics, ui
from ._common import chart_card, html_card, plot, table_card


def render(b, t, *, theme: str = "dark") -> None:
    if b.empty:
        return

    ui.render(ui.section_header("Tanısal KPI'ler", "8 gösterge · batch + araç verisinden türetilir"))

    _kpi1_idle(b, theme)
    _kpi2_fouling(b, theme)
    _kpi3_recipe_variance(b, theme)
    _kpi4_temp_yield(b, theme)
    _kpi5_low_verim_repeat(b)
    _kpi6_cloth_age(b, theme)
    _kpi7_truck_press_sync(b, t, theme)
    _kpi8_end_criteria(b, theme)


# --------------------------------------------------------------------------- #
# 1 — press idle / utilisation
# --------------------------------------------------------------------------- #
def _kpi1_idle(b, theme: str) -> None:
    pi = metrics.press_idle(b)
    summ = metrics.press_idle_summary(b)
    if pi.empty:
        return

    days = sorted(pi["gun"].unique())
    p1 = [float(pi[(pi.gun == d) & (pi.press == "Pres 1")]["idle_dk"].sum()) for d in days]
    p2 = [float(pi[(pi.gun == d) & (pi.press == "Pres 2")]["idle_dk"].sum()) for d in days]

    with chart_card(
        "1 · Press arası boşta kalma", "Gün içi batch aralarındaki toplam boşluk · dk",
        legend=[("Pres 1", pal_c(theme, 0)), ("Pres 2", pal_c(theme, 1))],
        footer="Boşta = (ilk başlangıç → son bitiş) − presin fiili çalışma süresi. "
               "Kullanım % = fiili çalışma ⁄ pencere.",
        key="an_idle",
    ):
        fig = charts.bar_chart(
            [fmt.date_short(d) for d in days],
            [
                {"name": "Pres 1", "values": p1, "series": 1},
                {"name": "Pres 2", "values": p2, "series": 2},
            ],
            theme=theme, height=230,
        )
        plot(fig, key="an_idle_fig")

    rows = summ.to_dict("records")
    cols = [
        {"key": "press", "header": "Pres", "render": lambda r: ui.badge(r["press"], "neutral", small=True)},
        {"key": "gun", "header": "Gün", "numeric": True},
        {"key": "batch", "header": "Batch", "numeric": True},
        {"key": "toplam_idle_dk", "header": "Toplam boşta (dk)", "numeric": True,
         "render": lambda r: fmt.nf(r["toplam_idle_dk"], 0)},
        {"key": "ort_idle_dk", "header": "Batch başına boşta (dk)", "numeric": True,
         "render": lambda r: fmt.nf(r["ort_idle_dk"], 1)},
        {"key": "ort_utilization_pct", "header": "Ort. kullanım", "numeric": True,
         "render": lambda r: ui.badge(fmt.pct_prose(r["ort_utilization_pct"]),
                                      "good" if r["ort_utilization_pct"] >= 85 else "caution", small=True)},
    ]
    table_card(cols, rows, title="Press kullanımı — özet", glyph="gauge")


# --------------------------------------------------------------------------- #
# 2 — fouling decay
# --------------------------------------------------------------------------- #
def _kpi2_fouling(b, theme: str) -> None:
    fd = metrics.fouling_decay(b, metric="toplam_verim_pct")
    if fd.empty:
        return
    xs = sorted(fd["since_wash"].unique())
    labels = [str(int(x)) for x in xs]

    def _line(press: str):
        sub = fd[fd["press"] == press].set_index("since_wash")["ort"]
        return [round(float(sub[x]), 2) if x in sub.index else None for x in xs]

    with chart_card(
        "2 · Fouling decay", "Ort. toplam verim · yıkamadan bu yana batch sayısı",
        legend=[("Tümü", pal_c(theme, 0)), ("Pres 1", pal_c(theme, 1)), ("Pres 2", pal_c(theme, 2))],
        footer="0 = yıkamadan hemen sonraki batch. Sayaç yıkama yapılan batch'te sıfırlanır "
               "(yikama_yapildi). Düşen eğri membran kirlenmesini gösterir.",
        key="an_foul",
    ):
        fig = charts.line_chart(
            labels,
            [
                {"name": "Tümü", "values": _line("Tümü"), "series": 1},
                {"name": "Pres 1", "values": _line("Pres 1"), "series": 2},
                {"name": "Pres 2", "values": _line("Pres 2"), "series": 3},
            ],
            theme=theme, height=230, fill=False,
        )
        plot(fig, key="an_foul_fig")


# --------------------------------------------------------------------------- #
# 3 — recipe yield variance
# --------------------------------------------------------------------------- #
def _kpi3_recipe_variance(b, theme: str) -> None:
    rv = metrics.recipe_variance(b)
    if rv.empty:
        return

    with chart_card("3 · Reçete verim varyansı", "Toplam verim std sapması · puan",
                    footer="Yüksek çubuk = o reçetede batch'ler arası verim daha oynak.",
                    key="an_rv"):
        fig = charts.bar_chart(
            rv["recete"].tolist(),
            [{"name": "Std sapma", "values": rv["std_toplam_verim"].round(2).tolist(), "series": 1}],
            theme=theme, height=200,
        )
        plot(fig, key="an_rv_fig")

    rows = rv.to_dict("records")
    cols = [
        {"key": "recete", "header": "Reçete", "emph": True},
        {"key": "n", "header": "Batch", "numeric": True},
        {"key": "ort_toplam_verim", "header": "Ort. verim", "numeric": True,
         "render": lambda r: fmt.pct_prose(r["ort_toplam_verim"])},
        {"key": "std_toplam_verim", "header": "Std (puan)", "numeric": True,
         "render": lambda r: fmt.nf(r["std_toplam_verim"], 2)},
        {"key": "aralik_puan", "header": "Aralık (min–max, puan)", "numeric": True,
         "render": lambda r: f'{fmt.nf(r["min_toplam_verim"], 1)}–{fmt.nf(r["max_toplam_verim"], 1)}'},
        {"key": "ort_batch_suresi_dk", "header": "Ort. süre (dk)", "numeric": True,
         "render": lambda r: fmt.nf(r["ort_batch_suresi_dk"], 0)},
    ]
    table_card(cols, rows, title="Reçete karşılaştırma", glyph="table-2")


# --------------------------------------------------------------------------- #
# 4 — tank temperature vs yield
# --------------------------------------------------------------------------- #
def _kpi4_temp_yield(b, theme: str) -> None:
    ty = metrics.temp_yield(b)
    if ty.n < 3:
        return

    def _r_badge(r):
        if r is None:
            return ui.muted_dash()
        tone = "bad" if r <= -0.3 else "good" if r >= 0.3 else "caution"
        return ui.badge(fmt.nf(r, 2), tone, small=True)

    corr = (
        f'<div class="up-divrow"><span>r · tank °C ↔ toplam verim</span>{_r_badge(ty.r_toplam)}</div>'
        f'<div class="up-divrow"><span>r · tank °C ↔ F/P verim</span>{_r_badge(ty.r_fp)}</div>'
        f'<div class="up-divrow"><span>Örnek</span>'
        f'<span style="color:var(--text-body)">{ty.n} batch</span></div>'
        '<div class="up-divrow"><span>Okuma</span>'
        f'<span style="color:var(--text-body)">{_corr_reading(ty.r_toplam)}</span></div>'
    )
    html_card(corr, title="4 · Tank sıcaklığı ↔ verim",
              subtitle="Pearson r · −1…+1", glyph="thermometer")

    if not ty.bins.empty:
        bn = ty.bins
        with chart_card("Sıcaklık aralığına göre ort. verim", "toplam verim · %",
                        footer="Çubuk üstü: o aralıktaki batch sayısı.", key="an_ty"):
            fig = charts.bar_chart(
                [f'{a} °C' for a in bn["tank_araligi"].astype(str)],
                [{"name": "Ort. toplam verim", "values": bn["ort_toplam_verim"].round(2).tolist(), "series": 1}],
                theme=theme, height=210,
            )
            fig.update_yaxes(range=[80, 100])
            plot(fig, key="an_ty_fig")


def _corr_reading(r: float | None) -> str:
    if r is None:
        return "yetersiz veri"
    a = abs(r)
    strength = "güçlü" if a >= 0.6 else "orta" if a >= 0.3 else "zayıf"
    if a < 0.15:
        return "anlamlı ilişki yok"
    yon = "sıcaklık arttıkça verim düşüyor" if r < 0 else "sıcaklık arttıkça verim artıyor"
    return f"{strength} ilişki — {yon}"


# --------------------------------------------------------------------------- #
# 5 — low-yield repeatability
# --------------------------------------------------------------------------- #
def _kpi5_low_verim_repeat(b) -> None:
    rep = metrics.low_verim_repeat(b, threshold=90.0)
    if rep["count"] == 0:
        html_card(ui.empty_state("5 · Düşük verim tekrarlılığı",
                                 "Bu dönemde %90 altı batch yok."), title=None)
        return

    bp = "".join(
        f'<div class="up-divrow"><span>{r["pres"]}</span>'
        f'<span style="color:var(--text-body)">{int(r["dusuk_batch"])} batch</span></div>'
        for r in rep["by_press"].to_dict("records")
    )
    br = "".join(
        f'<div class="up-divrow"><span>{r["recete"]}</span>'
        f'<span style="color:var(--text-body)">{int(r["dusuk_batch"])} batch</span></div>'
        for r in rep["by_recete"].to_dict("records")
    )
    streaks = rep["streaks"]
    if streaks.empty:
        sr = '<div class="up-divrow"><span>Art arda düşük seri</span><span class="muted">yok</span></div>'
    else:
        sr = "".join(
            f'<div class="up-divrow"><span>{r["press"]} · {int(r["uzunluk"])} batch</span>'
            f'<span style="color:var(--text-body)">{r["batchler"]}</span></div>'
            for r in streaks.to_dict("records")
        )
    body = (
        f'<div style="font:var(--type-label);color:var(--text-muted);margin:2px 0 4px">'
        f'{rep["count"]} batch %90 altında</div>'
        '<div style="font:var(--type-label);color:var(--text-subtle);margin-top:8px">Prese göre</div>' + bp
        + '<div style="font:var(--type-label);color:var(--text-subtle);margin-top:8px">Reçeteye göre</div>' + br
        + '<div style="font:var(--type-label);color:var(--text-subtle);margin-top:8px">Art arda düşük seriler</div>' + sr
    )
    html_card(body, title="5 · Düşük verim tekrarlılığı",
              subtitle="Aynı pres / reçete / ardışıklık örüntüsü", glyph="triangle-alert")


# --------------------------------------------------------------------------- #
# 6 — press-cloth age
# --------------------------------------------------------------------------- #
def _kpi6_cloth_age(b, theme: str) -> None:
    cd = metrics.cloth_decay(b, metric="fp_verim_pct")
    if cd.empty:
        html_card(ui.empty_state(
            "6 · Bez (cloth) yaşı",
            "Henüz bez değişimi işaretlenmemiş. Pres Performansı tablosunda bezin "
            "değiştirildiği batch için 'Bez değişti' kutusunu işaretleyin; sonraki "
            "batch'ler bez yaşına göre burada izlenir.",
        ), title=None)
        return

    xs = sorted(cd["since_cloth"].unique())
    labels = [str(int(x)) for x in xs]

    def _line(press: str):
        sub = cd[cd["press"] == press].set_index("since_cloth")["ort"]
        return [round(float(sub[x]), 2) if x in sub.index else None for x in xs]

    with chart_card(
        "6 · Bez (cloth) yaşı", "Ort. F/P verim · bez değişiminden bu yana batch",
        legend=[("Pres 1", pal_c(theme, 0)), ("Pres 2", pal_c(theme, 1))],
        footer="Yıkama (#2) membranı temizler; bu eğri ayrı bir arıza modunu — bez aşınmasını — izole eder.",
        key="an_cloth",
    ):
        fig = charts.line_chart(
            labels,
            [
                {"name": "Pres 1", "values": _line("Pres 1"), "series": 1},
                {"name": "Pres 2", "values": _line("Pres 2"), "series": 2},
            ],
            theme=theme, height=230, fill=False,
        )
        plot(fig, key="an_cloth_fig")


# --------------------------------------------------------------------------- #
# 7 — truck ↔ press synchronisation loss
# --------------------------------------------------------------------------- #
def _kpi7_truck_press_sync(b, t, theme: str) -> None:
    sync = metrics.truck_press_sync(b, t)
    if sync.empty:
        return

    labels = [fmt.date_short(d) for d in sync["gun"]]
    with chart_card(
        "7 · Kamyon–pres senkronizasyon kaybı", "Araç bekleme vs. pres boşta · dk",
        legend=[("Araç bekleme", pal_c(theme, 3)), ("Pres boşta", pal_c(theme, 0))],
        footer="Eş zamanlı kayıp = min(araç bekleme, pres boşta) — aynı gün hem kamyon bekliyor "
               "hem pres boştaysa giderilebilir koordinasyon kaybı.",
        key="an_sync",
    ):
        fig = charts.bar_chart(
            labels,
            [
                {"name": "Araç bekleme", "values": sync["arac_bekleme_dk"].round(0).tolist(), "series": 4},
                {"name": "Pres boşta", "values": sync["pres_idle_dk"].round(0).tolist(), "series": 1},
            ],
            theme=theme, height=220,
        )
        plot(fig, key="an_sync_fig")

    rows = sync.to_dict("records")
    cols = [
        {"key": "gun", "header": "Gün", "emph": True, "render": lambda r: fmt.date_short(r["gun"])},
        {"key": "arac_sayisi", "header": "Araç", "numeric": True},
        {"key": "arac_bekleme_dk", "header": "Araç bekleme (dk)", "numeric": True,
         "render": lambda r: fmt.nf(r["arac_bekleme_dk"], 0)},
        {"key": "pres_idle_dk", "header": "Pres boşta (dk)", "numeric": True,
         "render": lambda r: fmt.nf(r["pres_idle_dk"], 0)},
        {"key": "es_zamanli_kayip_dk", "header": "Eş zamanlı kayıp (dk)", "numeric": True,
         "render": lambda r: ui.badge(fmt.nf(r["es_zamanli_kayip_dk"], 0),
                                      "good" if r["es_zamanli_kayip_dk"] < 10 else "caution", small=True)},
    ]
    table_card(cols, rows, title="Günlük bekleme vs. boşta", glyph="truck")


# --------------------------------------------------------------------------- #
# 8 — end-criteria Pareto
# --------------------------------------------------------------------------- #
def _kpi8_end_criteria(b, theme: str) -> None:
    ep = metrics.end_criteria_pareto(b)
    if ep.empty:
        html_card(ui.empty_state(
            "8 · Bitiş kriteri Pareto",
            "Henüz bitiş kriteri girilmemiş. Pres Performansı tablosunda 'Bitiş kriteri' "
            "sütununa HMI'daki kodu (örn. F2/P2/NW2/E1) girin; en sık duruş nedenleri "
            "burada Pareto olarak sıralanır.",
        ), title=None)
        return

    with chart_card("8 · Bitiş kriteri Pareto", "Batch sayısı · en sık → en seyrek",
                    footer="Hangi kriterin batch'i sonlandırdığı — düşük verimli batch'lerin "
                           "nedenini ayrıştırır.", key="an_end"):
        fig = charts.bar_chart(
            ep["kriter"].tolist(),
            [{"name": "Batch", "values": ep["adet"].tolist(), "series": 1}],
            theme=theme, height=220,
        )
        plot(fig, key="an_end_fig")

    rows = ep.to_dict("records")
    cols = [
        {"key": "kriter", "header": "Bitiş kriteri", "emph": True},
        {"key": "adet", "header": "Batch", "numeric": True},
        {"key": "pay_pct", "header": "Pay", "numeric": True, "render": lambda r: fmt.pct_prose(r["pay_pct"])},
        {"key": "kumulatif_pct", "header": "Kümülatif", "numeric": True,
         "render": lambda r: fmt.pct_prose(r["kumulatif_pct"])},
    ]
    table_card(cols, rows, title="Kriter dağılımı", glyph="table-2")


# --------------------------------------------------------------------------- #
def pal_c(theme: str, i: int) -> str:
    return charts.palette(theme)["series"][i % len(charts.palette(theme)["series"])]
