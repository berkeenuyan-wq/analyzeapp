"""Araç Lojistiği — truck intake, unloading speed, waiting time."""
from __future__ import annotations

import datetime as dt

import pandas as pd
import streamlit as st

from .. import charts, db, fmt, metrics, ui
from ..config import tone_bekleme
from ._common import chart_card, export_button, html_card, kpi_row, page_header, plot


def render(*, theme: str = "dark") -> None:
    b = db.batches()
    t = db.trucks()

    n_days = t["tarih"].dt.date.nunique() if not t.empty else 0
    page_header(
        "Araç Lojistiği",
        f"Boşaltma hızı · bekleme · {len(t)} araç · {n_days} gün",
        actions=lambda: export_button("arac_export"), ratio=0.42,
    )

    if t.empty:
        html_card(ui.empty_state(
            "Henüz araç kaydı yok",
            "Aşağıdaki tablodan araç kaydı ekleyin ya da üstteki Veri Girişi'nden Excel içe aktarın.",
        ), title=None)
        _editable_truck_table(t)
        return

    stats = metrics.truck_stats(t)
    daily = metrics.truck_daily(b, t)

    # --- hero -----------------------------------------------------------
    d_gelen = metrics.last_pct_change(daily["miktar_ton"]) if not daily.empty else None
    ui.render(ui.hero_metric(
        overline="Toplam gelen ürün",
        value=fmt.nf(stats.toplam_gelen_ton, 1),
        unit="ton",
        glyph="truck",
        status=(f"{stats.arac_sayisi} araç kaydedildi", "good"),
        delta=d_gelen,
        delta_good_when="up",
        delta_period="önceki güne göre",
        note=(
            f"Ort. bekleme {fmt.nf(stats.ort_bekleme_dk, 0)} dk"
            f" · Toplam kayıp zaman {fmt.ni(stats.toplam_kayip_zaman_dk)} dk"
            f" · Ort. boşaltma {fmt.nf(stats.ort_bosaltma_dk, 0)} dk"
            f" · Ort. hız {fmt.nf(stats.ort_bosaltma_hizi_kg_dk, 0)} kg/dk"
        ),
        spark=t.sort_values(["tarih", "arac_no"])["miktar_kg"].tolist(),
        spark_color="var(--series-1)",
    ))

    kpi_row([
        ui.kpi_card(label="Kayıtlı araç sayısı", value=str(stats.arac_sayisi), unit="araç",
                    glyph="truck", delta=None),
        ui.kpi_card(label="Ort. bekleme süresi", value=fmt.nf(stats.ort_bekleme_dk, 1), unit="dk",
                    glyph="clock", delta=None),
        ui.kpi_card(label="Ort. boşaltma süresi", value=fmt.nf(stats.ort_bosaltma_dk, 1), unit="dk",
                    glyph="timer", delta=None),
        ui.kpi_card(label="Ort. boşaltma hızı", value=fmt.nf(stats.ort_bosaltma_hizi_kg_dk, 0),
                    unit="kg/dk", glyph="gauge", delta=None),
    ])

    # --- charts -------------------------------------------------------------
    tt = t.sort_values(["tarih", "arac_no"])
    labels = [f"{fmt.date_short(r.tarih)[:6]} · {int(r.arac_no)}" for r in tt.itertuples()]
    pal = charts.palette(theme)
    c1, c2 = st.columns([1.5, 1], gap="small")
    with c1:
        with chart_card(
            "Filtrat miktarı ve bekleme", "araç sırasına göre",
            legend=[("Filtrat miktarı · kg", pal["series"][0]),
                    ("Bekleme · dk", pal["series"][3])],
            footer="Sol eksen: kg · sağ eksen: dk",
            key="al_bars",
        ):
            fig = charts.dual_area(
                labels,
                [
                    {"name": "Filtrat miktarı", "values": tt["miktar_kg"].tolist(),
                     "series": 1, "axis": "left", "unit": "kg"},
                    {"name": "Bekleme", "values": tt["bekleme_dk"].fillna(0).tolist(),
                     "series": 4, "axis": "right", "unit": "dk"},
                ],
                theme=theme, height=248,
            )
            plot(fig, key="al_bars_fig")
    with c2:
        with chart_card("Günlük gelen ürün", "ton", key="al_daily"):
            fig = charts.bar_chart(
                [fmt.date_short(x) for x in daily["gun"]],
                [{"name": "Miktar", "values": daily["miktar_ton"].tolist(), "series": 2}],
                theme=theme, height=248,
            )
            plot(fig, key="al_daily_fig")

    # --- günlük tablo (inset cards) --------------------------------------
    parts = []
    for r in daily.itertuples():
        parts.append(
            '<div class="up-inset" style="display:flex;flex-direction:column;gap:8px">'
            f'<div style="display:flex;justify-content:space-between;align-items:center">'
            f'<span style="font:var(--type-label);color:var(--text-muted)">{fmt.date_short(r.gun)}</span>'
            f'{ui.badge(f"{fmt.nf(r.bekleme_dk, 0)} dk bekleme", tone_bekleme(r.bekleme_dk), small=True)}</div>'
            f'<div style="display:flex;justify-content:space-between;font:var(--type-caption);'
            f'font-size:var(--text-xs);color:var(--text-subtle)"><span>Gelen ürün</span>'
            f'<span style="font:var(--type-table-num);color:var(--text-primary)">{fmt.nf(r.miktar_ton, 1)} t</span></div>'
            f'<div style="display:flex;justify-content:space-between;font:var(--type-caption);'
            f'font-size:var(--text-xs);color:var(--text-subtle)"><span>Pres başlangıç–bitiş arası</span>'
            f'<span style="font:var(--type-table-num);color:var(--text-primary)">{fmt.hm_from_seconds(r.pres_araligi_sn)}</span></div>'
            "</div>"
        )
    grid = (
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">'
        + "".join(parts)
        + "</div>"
        + f'<div class="up-divrow"><span>Toplam kayıp zaman</span>'
          f'{ui.badge(f"{fmt.ni(stats.toplam_kayip_zaman_dk)} dk", "bad", small=True)}</div>'
    )
    html_card(grid, title="Günlük tablo", subtitle="Gün bazında miktar, bekleme ve pres aralığı",
              glyph="calendar")

    # --- Araç Takip Tablosu — fully editable grid ------------------------
    _editable_truck_table(t)


# --------------------------------------------------------------------------- #
# editable Araç Takip Tablosu (add rows / edit cells / delete rows in place)
# --------------------------------------------------------------------------- #
_EDIT_COLS = ["tarih", "arac_no", "urun", "miktar_kg", "baslangic", "bitis"]
_DERIVED_COLS = ["sure_dk", "hiz_kg_dk", "bekleme_dk"]


def _editable_truck_table(t) -> None:
    cols = _EDIT_COLS + _DERIVED_COLS
    if t.empty:
        seed = pd.DataFrame({c: pd.Series(dtype="object") for c in cols})
    else:
        seed = t.copy()
        seed["tarih"] = seed["tarih"].dt.date
        seed = seed[cols].reset_index(drop=True)
    st.session_state["_arac_seed"] = seed  # positional reference for the delta

    box = st.container(border=True, key="arac_grid_box")
    with box:
        ui.render(
            '<div class="up-charthead"><span class="up-charthead__title">Araç Takip Tablosu</span>'
            f'<span class="up-charthead__sub">{len(seed)} kayıt · hücreyi düzenleyin · '
            'en alttan satır ekleyin · satır seçip silin</span></div>'
        )
        st.data_editor(
            seed,
            key="arac_editor",
            num_rows="dynamic",
            width="stretch",
            hide_index=True,
            column_order=_EDIT_COLS + _DERIVED_COLS,
            column_config={
                "tarih": st.column_config.DateColumn("Tarih", format="DD.MM.YYYY"),
                "arac_no": st.column_config.NumberColumn("Araç", min_value=1, step=1, format="%d"),
                "urun": st.column_config.TextColumn("Ürün", default="Elma"),
                "miktar_kg": st.column_config.NumberColumn("Miktar (kg)", min_value=0.0, step=100.0, format="%d"),
                "baslangic": st.column_config.TextColumn("Başlangıç", help="SS:DD (örn. 09:15)"),
                "bitis": st.column_config.TextColumn("Bitiş", help="SS:DD"),
                "sure_dk": st.column_config.NumberColumn("Süre (dk)", disabled=True, format="%d"),
                "hiz_kg_dk": st.column_config.NumberColumn("Hız (kg/dk)", disabled=True, format="%.1f"),
                "bekleme_dk": st.column_config.NumberColumn("Bekleme (dk)", disabled=True, format="%d"),
            },
        )

        delta = st.session_state.get("arac_editor", {}) or {}
        dirty = bool(delta.get("edited_rows") or delta.get("added_rows") or delta.get("deleted_rows"))

        cta, note = st.columns([0.42, 1], vertical_alignment="center")
        with cta:
            if st.button("Değişiklikleri kaydet", type="primary", disabled=not dirty,
                         width="stretch", key="arac_save"):
                added, changed, removed = _apply_truck_delta(seed, delta)
                st.cache_data.clear()
                st.toast(f"{added} eklendi · {changed} güncellendi · {removed} silindi.")
                st.rerun()
        with note:
            msg = ("Kaydedilmemiş değişiklik var — süre, hız ve bekleme kaydettikten sonra "
                   "otomatik hesaplanır." if dirty else
                   "Süre = bitiş − başlangıç · hız = miktar ⁄ süre · bekleme = önceki araçtan boşluk.")
            ui.render(ui.foot_note(msg))


def _apply_truck_delta(seed: pd.DataFrame, delta: dict) -> tuple[int, int, int]:
    added = changed = removed = 0

    for i in delta.get("deleted_rows", []):
        row = seed.iloc[int(i)]
        db.delete_truck(_iso_date(row["tarih"]), int(row["arac_no"]))
        removed += 1

    for i_str, changes in delta.get("edited_rows", {}).items():
        orig = seed.iloc[int(i_str)].to_dict()
        new = {**orig, **changes}
        old_key = (_iso_date(orig["tarih"]), _int_or_none(orig["arac_no"]))
        new_key = (_iso_date(new["tarih"]), _int_or_none(new["arac_no"]))
        if None in new_key:
            continue
        if old_key != new_key and None not in old_key:
            db.delete_truck(*old_key)
        db.insert_truck(_truck_rec(new))
        changed += 1

    for add in delta.get("added_rows", []):
        if _iso_date(add.get("tarih")) is None or _int_or_none(add.get("arac_no")) is None:
            continue
        db.insert_truck(_truck_rec(add))
        added += 1

    return added, changed, removed


def _truck_rec(d: dict) -> dict:
    bas, bit = _hhmm(d.get("baslangic")), _hhmm(d.get("bitis"))
    sure = None
    if bas and bit:
        gap = _t2m(bit) - _t2m(bas)
        sure = round(gap) if gap and gap > 0 else None
    miktar = _float_or_none(d.get("miktar_kg"))
    return {
        "tarih": _iso_date(d.get("tarih")),
        "arac_no": _int_or_none(d.get("arac_no")),
        "urun": (str(d["urun"]).strip() if d.get("urun") else "Elma"),
        "miktar_kg": miktar,
        "baslangic": bas,
        "bitis": bit,
        "sure_dk": sure,
        "hiz_kg_dk": round(miktar / sure, 2) if (miktar and sure) else None,
        "bekleme_dk": None,  # always derived on read
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


def _t2m(v) -> float | None:
    for f in ("%H:%M:%S", "%H:%M"):
        try:
            x = dt.datetime.strptime(str(v), f)
            return x.hour * 60 + x.minute
        except (ValueError, TypeError):
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
