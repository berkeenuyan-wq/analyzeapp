"""Laboratuvar — Pres Kalite Kontrolleri (juice & pomace quality per reading).

The quality sheet is time-sampled, not batch-indexed: a reading every few hours
per press. Each reading is tied to its batch at query time (same day, same
press, Kontrol Saati inside the batch's başlangıç–bitiş window) in
``metrics.lab_readings``. Thresholds here are PROVISIONAL — see the footnote.
"""
from __future__ import annotations

import datetime as dt

import pandas as pd
import streamlit as st

from .. import charts, db, excel_io, fmt, metrics, ui
from ..config import LAB_MEASURES, LAB_SPECS_CONFIRMED, PRESS_1, PRESS_2
from ._common import (
    chart_card, granularity, html_card, kpi_row, page_header, plot, table_card,
)

_HERO = next(m for m in LAB_MEASURES if m["key"] == "posa_brix")
_KPIS = LAB_MEASURES  # all five measures get a KPI tile (Posa Brix included)

_UNCONFIRMED_NOTE = (
    "Eşik bantları (Posa Brix, Posa Nem, Sıkım pH/Brix) geçicidir — laboratuvarın "
    "kendi spesifikasyonuyla doğrulanmadı. Sıkım Asitlik birimi teyit edilmediği "
    "için nötr gösterilir."
)


def render(*, theme: str = "dark") -> None:
    lr = metrics.lab_readings()
    if lr.empty:
        page_header("Laboratuvar", "Pres Kalite Kontrolleri")
        html_card(ui.empty_state(
            "Henüz kalite verisi yok",
            "Aşağıdaki tablodan ölçüm ekleyin ya da üstteki Veri Girişi'nden "
            "kalite sayfasını içeren bir Excel içe aktarın.",
        ), title=None)
        _editable_lab_table(db.labs())
        return

    summ = metrics.lab_summary(lr, None)
    daily = metrics.lab_daily(lr, None)
    first_day = lr["tarih"].min()
    last_day = lr["tarih"].max()

    page_header(
        "Laboratuvar",
        f"Pres Kalite Kontrolleri · {summ.n_readings} ölçüm · "
        f"{fmt.date_range(first_day, last_day)}",
        actions=lambda: _export_button("lab_export"), ratio=0.42,
    )

    comp = metrics.lab_completeness(lr, None)

    # Out-of-spec / incomplete / unmatched warnings are raised on the Alarmlar
    # page (src/alarms.py) — not pinned to the top here.

    # --- hero: mean Posa Brix (low = good extraction) --------------------
    hero_mean = summ.means.get("posa_brix")
    d_hero = (
        metrics.last_delta(daily["posa_brix"])
        if not daily.empty and "posa_brix" in daily else None
    )
    matched_txt = f"{summ.n_matched}/{summ.n_readings} batch ile eşleşti"
    ui.render(ui.hero_metric(
        overline=f"Ort. Posa Brix · {summ.n_days} gün",
        value=fmt.nf(hero_mean, 2),
        unit="°Bx",
        glyph="percent",
        status=(matched_txt, "neutral"),
        delta=d_hero,
        delta_good_when="down",
        delta_period="önceki güne göre",
        delta_suffix=" °Bx",
        note=(
            "Posada kalan şeker — düşük olması presleme veriminin yüksek olduğunu "
            f"gösterir · Ort. Posa Nem {fmt.pct_prose(summ.means.get('posa_nem_pct'))}"
            f" · Ort. Sıkım Brix {fmt.nf(summ.means.get('sikim_brix'), 2)} °Bx"
        ),
        spark=daily["posa_brix"].tolist() if "posa_brix" in daily else None,
        spark_color="var(--series-1)",
    ))

    # --- KPI rows (2 × 3): five measures + lab data-entry completeness ------
    measure_cards = [
        ui.kpi_card(
            label=f"Ort. {m['label']}",
            value=fmt.nf(summ.means.get(m["key"]), m["decimals"]),
            unit=m["unit"], glyph=m["glyph"],
            delta=(metrics.last_delta(daily[m["key"]])
                   if not daily.empty and m["key"] in daily else None),
            delta_good_when=m["good_when"],
            delta_period="Önceki güne göre",
            delta_suffix="",  # deltas stay one line — no unit suffix on the chip
        )
        for m in _KPIS
    ]
    comp_card = ui.kpi_card(
        label="Veri tamlığı",
        value=fmt.nf(comp.core_pct, 0), unit="%", glyph="circle-check",
        delta=comp.daily_delta, delta_good_when="up",
        delta_period="Önceki güne göre", delta_suffix="",
    )
    cards = measure_cards + [comp_card]
    kpi_row(cards[:3])
    kpi_row(cards[3:])

    # --- trend charts: Ölçüm (gün içi) · Batch · Gün ---------------------
    gran = granularity("lab", ["Ölçüm", "Batch", "Gün"], default="Batch")
    pal = charts.palette(theme)
    base, labels, note = _series_for(lr, gran, daily)

    def _col(key: str):
        return base[key].round(2).tolist() if (not base.empty and key in base.columns) else []

    c1, c2 = st.columns(2, gap="small")
    with c1:
        with chart_card("Brix eğilimi", f"Sıkım vs posa · °Bx · {note}",
                        legend=[("Sıkım Brix", pal["series"][1]),
                                ("Posa Brix", pal["series"][0])],
                        key="lab_brix"):
            fig = charts.line_chart(
                labels,
                [
                    {"name": "Sıkım Brix", "values": _col("sikim_brix"), "series": 2},
                    {"name": "Posa Brix", "values": _col("posa_brix"), "series": 1},
                ],
                theme=theme, height=248, fill=False,
            )
            plot(fig, key="lab_brix_fig")
    with c2:
        with chart_card("Sıkım pH ve asitlik", note,
                        legend=[("Sıkım pH", pal["series"][2]),
                                ("Sıkım Asitlik", pal["series"][3])],
                        key="lab_ph"):
            fig = charts.line_chart(
                labels,
                [
                    {"name": "Sıkım pH", "values": _col("sikim_ph"), "series": 3},
                    {"name": "Sıkım Asitlik", "values": _col("sikim_asitlik"), "series": 4},
                ],
                theme=theme, height=248, fill=False,
            )
            plot(fig, key="lab_ph_fig")

    # --- batch-by-batch quality (intraday progression) -----------------
    bb = metrics.lab_by_batch(lr, None)
    if not bb.empty:
        def _bmeas(key: str, decimals: int):
            m = next(mm for mm in LAB_MEASURES if mm["key"] == key)
            return lambda r: (
                ui.badge(fmt.nf(r[key], decimals), m["tone"](r[key]), small=True)
                if r.get(key) is not None and not pd.isna(r[key]) else ui.muted_dash()
            )

        bb_cols = [
            {"key": "batch_no", "header": "Batch", "emph": True, "numeric": True,
             "render": lambda r: f"#{int(r['batch_no'])}"},
            {"key": "tarih", "header": "Tarih", "render": lambda r: fmt.date_short(r["tarih"])},
            {"key": "pres", "header": "Pres",
             "render": lambda r: (ui.badge(str(r["pres"]), "neutral", small=True)
                                  if r.get("pres") is not None and not pd.isna(r["pres"])
                                  else ui.muted_dash())},
            {"key": "olcum", "header": "Ölçüm", "numeric": True},
            {"key": "sikim_brix", "header": "Sıkım Brix", "numeric": True, "render": _bmeas("sikim_brix", 2)},
            {"key": "sikim_ph", "header": "Sıkım pH", "numeric": True, "render": _bmeas("sikim_ph", 2)},
            {"key": "sikim_asitlik", "header": "Sıkım Asitlik", "numeric": True, "render": _bmeas("sikim_asitlik", 2)},
            {"key": "posa_brix", "header": "Posa Brix", "numeric": True, "render": _bmeas("posa_brix", 2)},
            {"key": "posa_nem_pct", "header": "Posa Nem %", "numeric": True, "render": _bmeas("posa_nem_pct", 1)},
        ]
        table_card(bb_cols, bb.to_dict("records"),
                   title="Batch bazında kalite",
                   subtitle="Her batch'in ölçüm ortalaması · batch sırası = gün içi ilerleme",
                   glyph="table-2")

    # Raw readings are shown (and edited) in the "Kalite Ölçüm Tablosu" grid
    # below — no separate read-only reading × batch table.
    ui.render(ui.foot_note(_UNCONFIRMED_NOTE if not LAB_SPECS_CONFIRMED else
                           "Eşikler laboratuvar spesifikasyonuyla doğrulandı."))

    _editable_lab_table(db.labs())


# --------------------------------------------------------------------------- #
# chart series per granularity
# --------------------------------------------------------------------------- #
def _series_for(lr, gran: str, daily):
    """(frame, x-labels, subtitle) for the trend charts at the chosen granularity.

    * Gün    — one point per day (mean of that day's readings)
    * Batch  — one point per batch, in batch order (= how quality moved through
               the day, since batches run sequentially)
    * Ölçüm  — every reading of a single picked day, x = sample time (gün içi)
    """
    if gran == "Gün":
        labels = [fmt.date_short(d) for d in daily["gun"]] if not daily.empty else []
        return daily, labels, "gün ortalaması"
    if gran == "Batch":
        bb = metrics.lab_by_batch(lr, None)
        labels = [f"#{int(n)}" for n in bb["batch_no"]] if not bb.empty else []
        return bb, labels, "batch ortalaması · gün içi sıra"
    # Ölçüm — one day at a time
    days = sorted(lr["tarih"].dt.date.unique())
    if not days:
        return lr, [], "ölçüm saati"
    opts = [fmt.date_short(d) for d in days]
    pick = st.segmented_control(
        "Gün", opts, default=opts[-1], key="lab_day", label_visibility="collapsed",
    ) or opts[-1]
    day = dict(zip(opts, days)).get(pick, days[-1])
    sub = lr[lr["tarih"].dt.date == day].sort_values("kontrol_saati")
    labels = [str(s) for s in sub["kontrol_saati"]]
    return sub, labels, f"{pick} · ölçüm saati"


# --------------------------------------------------------------------------- #
# export
# --------------------------------------------------------------------------- #
def _export_button(key: str) -> None:
    st.download_button(
        "Excel'e Aktar",
        data=excel_io.build_workbook(),
        file_name=excel_io.export_filename(),
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        width="stretch",
        key=key,
    )


# --------------------------------------------------------------------------- #
# editable lab grid (add rows / edit cells / delete rows in place)
#
# Mirrors the Pres Performansı batch grid. Rows are identified by the hidden
# ``id``; editing a key field (tarih / pres_no / kontrol_saati) drops the old
# row and re-inserts, so the (tarih, pres_no, kontrol_saati) unique key stays
# consistent.
# --------------------------------------------------------------------------- #
_L_EDIT_COLS = [
    "id", "tarih", "pres_no", "kontrol_saati", "urun_alinan_tank_no",
    "sikim_brix", "sikim_ph", "sikim_asitlik",
    "posa_kontrol_saati", "posa_brix", "posa_nem_pct",
    "pulp_pct", "giris_pulp", "lot_no", "notlar",
]


def _editable_lab_table(lab: pd.DataFrame) -> None:
    if lab.empty:
        seed = pd.DataFrame({c: pd.Series(dtype="object") for c in _L_EDIT_COLS})
    else:
        seed = lab.copy()
        seed["tarih"] = seed["tarih"].dt.date
        seed = seed[[c for c in _L_EDIT_COLS if c in seed.columns]].reset_index(drop=True)

    box = st.container(border=True, key="lab_grid_box")
    with box:
        ui.render(
            '<div class="up-charthead"><span class="up-charthead__title">Kalite Ölçüm Tablosu</span>'
            f'<span class="up-charthead__sub">{len(seed)} kayıt · hücreyi düzenleyin · '
            'en alttan satır ekleyin · satır seçip silin</span></div>'
        )
        st.data_editor(
            seed,
            key="lab_editor",
            num_rows="dynamic",
            width="stretch",
            hide_index=True,
            column_order=[c for c in _L_EDIT_COLS if c != "id"],
            column_config={
                "id": None,
                "tarih": st.column_config.DateColumn("Tarih", format="DD.MM.YYYY"),
                "pres_no": st.column_config.SelectboxColumn("Pres No", options=[1, 2]),
                "kontrol_saati": st.column_config.TextColumn("Kontrol saati", help="SS:DD"),
                "urun_alinan_tank_no": st.column_config.NumberColumn("Tank no", min_value=0, step=1, format="%d"),
                "sikim_brix": st.column_config.NumberColumn("Sıkım Brix", min_value=0.0, step=0.1, format="%.2f"),
                "sikim_ph": st.column_config.NumberColumn("Sıkım pH", min_value=0.0, step=0.01, format="%.2f"),
                "sikim_asitlik": st.column_config.NumberColumn("Sıkım Asitlik", min_value=0.0, step=0.01, format="%.2f"),
                "posa_kontrol_saati": st.column_config.TextColumn("Posa saati", help="SS:DD"),
                "posa_brix": st.column_config.NumberColumn("Posa Brix", min_value=0.0, step=0.1, format="%.2f"),
                "posa_nem_pct": st.column_config.NumberColumn("Posa Nem %", min_value=0.0, step=0.1, format="%.1f"),
                "pulp_pct": st.column_config.NumberColumn("Pulp %", min_value=0.0, step=0.01, format="%.2f"),
                "giris_pulp": st.column_config.NumberColumn("Giriş Pulp", min_value=0.0, step=0.01, format="%.2f"),
                "lot_no": st.column_config.TextColumn("Lot No"),
                "notlar": st.column_config.TextColumn("Notlar"),
            },
        )

        delta = st.session_state.get("lab_editor", {}) or {}
        dirty = bool(delta.get("edited_rows") or delta.get("added_rows") or delta.get("deleted_rows"))

        cta, note = st.columns([0.42, 1], vertical_alignment="center")
        with cta:
            if st.button("Değişiklikleri kaydet", type="primary", disabled=not dirty,
                         width="stretch", key="lab_save"):
                added, changed, removed = _apply_lab_delta(seed, delta)
                st.cache_data.clear()
                st.toast(f"{added} eklendi · {changed} güncellendi · {removed} silindi.")
                st.rerun()
        with note:
            msg = ("Kaydedilmemiş değişiklik var." if dirty else
                   "Her ölçüm gün + pres + kontrol saati ile benzersizdir.")
            ui.render(ui.foot_note(msg))


def _apply_lab_delta(seed: pd.DataFrame, delta: dict) -> tuple[int, int, int]:
    added = changed = removed = 0

    for i in delta.get("deleted_rows", []):
        lid = _int_or_none(seed.iloc[int(i)].get("id"))
        if lid is not None:
            db.delete_lab(lid)
            removed += 1

    for i_str, changes in delta.get("edited_rows", {}).items():
        orig = seed.iloc[int(i_str)].to_dict()
        new = {**orig, **changes}
        rec = _lab_rec(new)
        if rec["tarih"] is None:
            continue
        lid = _int_or_none(orig.get("id"))
        if lid is not None:
            db.delete_lab(lid)  # key may have changed; re-insert cleanly
        db.insert_lab(rec)
        changed += 1

    for add in delta.get("added_rows", []):
        rec = _lab_rec(add)
        if rec["tarih"] is None or all(
            rec[k] is None for k in ("sikim_brix", "sikim_ph", "posa_brix")
        ):
            continue  # nothing meaningful entered
        db.insert_lab(rec)
        added += 1

    return added, changed, removed


def _lab_rec(d: dict) -> dict:
    return {
        "tarih": _iso_date(d.get("tarih")),
        "pres_no": _int_or_none(d.get("pres_no")) or 0,
        "kontrol_saati": _hhmm(d.get("kontrol_saati")),
        "urun": (str(d["urun"]).strip() if d.get("urun") else "ELMA"),
        "lot_no": (str(d["lot_no"]).strip() if d.get("lot_no") else None),
        "urun_alinan_tank_no": _int_or_none(d.get("urun_alinan_tank_no")),
        "sikim_brix": _float_or_none(d.get("sikim_brix")),
        "sikim_ph": _float_or_none(d.get("sikim_ph")),
        "sikim_asitlik": _float_or_none(d.get("sikim_asitlik")),
        "posa_kontrol_saati": _hhmm(d.get("posa_kontrol_saati")),
        "posa_brix": _float_or_none(d.get("posa_brix")),
        "posa_nem_pct": _float_or_none(d.get("posa_nem_pct")),
        "pulp_pct": _float_or_none(d.get("pulp_pct")),
        "giris_pulp": _float_or_none(d.get("giris_pulp")),
        "notlar": (str(d["notlar"]).strip() if d.get("notlar") else None),
    }


def _iso_date(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    if isinstance(v, str):
        for f in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y"):
            try:
                return dt.datetime.strptime(v[:10], f).date().isoformat()
            except ValueError:
                continue
        return None
    try:
        return pd.Timestamp(v).date().isoformat()
    except (ValueError, TypeError):
        return None


def _hhmm(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    if isinstance(v, dt.time):
        return v.strftime("%H:%M")
    s = str(v).strip()
    for f in ("%H:%M:%S", "%H:%M", "%H.%M"):
        try:
            return dt.datetime.strptime(s, f).strftime("%H:%M")
        except ValueError:
            continue
    return None


def _int_or_none(v):
    try:
        return None if v is None or pd.isna(v) else int(v)
    except (ValueError, TypeError):
        return None


def _float_or_none(v):
    try:
        return None if v is None or pd.isna(v) else float(v)
    except (ValueError, TypeError):
        return None
