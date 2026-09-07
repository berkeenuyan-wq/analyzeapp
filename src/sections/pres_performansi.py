"""Pres Performansı — batch-level press stats, Pres 1 / Pres 2."""
from __future__ import annotations

import datetime as dt

import pandas as pd
import streamlit as st

from .. import charts, db, excel_io, fmt, metrics, ui
from ..config import PRESS_1, PRESS_2, RECIPE_BY_PRESS
from . import kpi_panel
from ._common import (
    chart_card, granularity, html_card, kpi_row, page_header, plot, tab_bar,
)

_SCOPES = [("all", "Tüm presler", None), ("p1", "Pres 1", None), ("p2", "Pres 2", None)]
_SCOPE_PRESS = {"p1": PRESS_1, "p2": PRESS_2}
_GRAN = ["Batch", "Gün", "Reçete"]


def render(*, theme: str = "dark") -> None:
    b = db.batches()
    if b.empty:
        page_header("Pres Performansı")
        html_card(ui.empty_state(
            "Henüz batch verisi yok",
            "Aşağıdaki tablodan batch ekleyin ya da üstteki Veri Girişi'nden Excel içe aktarın.",
        ), title=None)
        _editable_batch_table(b)
        return

    cov = metrics.coverage(b, db.trucks())
    counts = {
        "all": len(b),
        "p1": int((b["pres"] == PRESS_1).sum()),
        "p2": int((b["pres"] == PRESS_2).sum()),
    }

    page_header(
        "Pres Performansı",
        f"Batch bazında · {len(b)} batch · {fmt.date_range(cov.first_day, cov.last_day)}",
    )

    # controls row: granularity (left) + Excel export (right)
    cg, cx = st.columns([1, 0.26], vertical_alignment="center")
    with cg:
        granularity("pres", _GRAN)
    with cx:
        st.download_button(
            "Excel'e Aktar", data=excel_io.build_workbook(),
            file_name=excel_io.export_filename(),
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            width="stretch", key="pp_export",
        )

    gran = st.session_state.get("pres_gran", "Batch")
    scope = tab_bar("pres", [(i, l, counts[i]) for i, l, _c in _SCOPES], default="all")
    scoped = b if scope == "all" else b[b["pres"] == _SCOPE_PRESS[scope]]
    if scoped.empty:
        html_card(ui.empty_state("Bu kapsamda kayıt yok"), title=None)
        return

    scoped = scoped.sort_values("batch_no")
    scope_label = {"all": "tüm presler", "p1": "Pres 1", "p2": "Pres 2"}[scope]

    # --- hero: average Toplam Verim for the scope --------------------------
    ort_verim = float(scoped["toplam_verim_pct"].mean())
    daily_verim = scoped.groupby(scoped["tarih"].dt.date)["toplam_verim_pct"].mean()
    d_verim = metrics.last_delta(daily_verim)

    ui.render(ui.hero_metric(
        overline=f"Ortalama toplam verim · {scope_label}",
        value=fmt.nf(ort_verim, 1),
        unit="%",
        glyph="gauge",
        status=(f"{len(scoped)} batch tamamlandı", "good"),
        delta=d_verim,
        delta_good_when="up",
        delta_period="önceki güne göre",
        note=(
            f"Ort. F/P verim {fmt.pct_prose(scoped['fp_verim_pct'].mean())}"
            f" · Ort. F/P performans {fmt.nf(scoped['fp_perf_tsa'].mean(), 1)} t/sa"
            f" · Ort. batch süresi {fmt.nf(scoped['batch_suresi_dk'].mean(), 1)} dk"
        ),
        spark=scoped["toplam_verim_pct"].tolist(),
        spark_color="var(--series-1)",
    ))

    daily = scoped.groupby(scoped["tarih"].dt.date)[
        ["fp_verim_pct", "fp_perf_tsa", "batch_suresi_dk", "kesinti_suresi_pct"]
    ].mean()

    def dpc(col: str):
        return metrics.last_pct_change(daily[col]) if len(daily) >= 2 else None

    kpi_row([
        ui.kpi_card(label="Ort. F/P verim Q26", value=fmt.nf(scoped["fp_verim_pct"].mean(), 1),
                    unit="%", glyph="percent", delta=dpc("fp_verim_pct"), delta_good_when="up"),
        ui.kpi_card(label="Ort. F/P performans Q27", value=fmt.nf(scoped["fp_perf_tsa"].mean(), 1),
                    unit="t/sa", glyph="droplet", delta=dpc("fp_perf_tsa"), delta_good_when="up"),
        ui.kpi_card(label="Ort. batch süresi", value=fmt.nf(scoped["batch_suresi_dk"].mean(), 1),
                    unit="dk", glyph="timer", delta=dpc("batch_suresi_dk"), delta_good_when="down"),
        ui.kpi_card(label="Ort. kesinti süresi", value=fmt.nf(scoped["kesinti_suresi_pct"].mean(), 1),
                    unit="%", glyph="circle-alert", delta=dpc("kesinti_suresi_pct"), delta_good_when="down"),
    ])

    # --- charts (respect the Batch / Gün / Reçete granularity) --------------
    labels, series = _grouped(scoped, gran)
    pal = charts.palette(theme)
    unit_note = {"Batch": "batch başına", "Gün": "gün ortalaması", "Reçete": "reçete ortalaması"}[gran]
    c1, c2 = st.columns(2, gap="small")
    with c1:
        with chart_card("Batch verimi", f"Toplam verim ve F/P verim · % · {unit_note}",
                        legend=[("Toplam verim", pal["series"][0]), ("F/P verim Q26", pal["series"][1])],
                        footer="Kırmızı çizgi: %91 alt eşiği", key="pp_verim"):
            fig = charts.bar_chart(
                labels,
                [
                    {"name": "Toplam verim", "values": series["toplam_verim_pct"], "series": 1},
                    {"name": "F/P verim Q26", "values": series["fp_verim_pct"], "series": 2},
                ],
                theme=theme, height=250, limit={"value": 91, "label": "Tolerans %91"},
            )
            fig.update_yaxes(range=[75, 100])
            plot(fig, key="pp_verim_fig")
    with c2:
        with chart_card("F/P performans ve tank sıcaklığı", f"t/sa · °C · {unit_note}",
                        legend=[("F/P performans Q27", pal["series"][2]), ("F tank sıcaklığı", pal["series"][3])],
                        key="pp_perf"):
            fig = charts.line_chart(
                labels,
                [
                    {"name": "F/P performans Q27", "values": series["fp_perf_tsa"], "series": 3},
                    {"name": "F tank sıcaklığı", "values": series["tank_c"], "series": 4},
                ],
                theme=theme, height=250, fill=False,
            )
            plot(fig, key="pp_perf_fig")

    # --- tanısal KPI'ler (idle · fouling · reçete · sıcaklık · tekrarlılık ·
    #     bez yaşı · kamyon-pres sync · bitiş kriteri) — full dataset, scope-bağımsız
    kpi_panel.render(b, db.trucks(), theme=theme)

    # --- Batch Tablosu — fully editable grid (workbook columns, add/edit/delete)
    _editable_batch_table(scoped)


_CHART_COLS = ["toplam_verim_pct", "fp_verim_pct", "fp_perf_tsa", "tank_c"]


def _grouped(df, gran: str):
    """(labels, {col: [values]}) for the chosen Batch / Gün / Reçete granularity."""
    if gran == "Gün":
        g = df.groupby(df["tarih"].dt.date)[_CHART_COLS].mean()
        labels = [fmt.date_short(d) for d in g.index]
    elif gran == "Reçete":
        g = df.groupby(df["recete"].fillna("—"))[_CHART_COLS].mean()
        labels = list(g.index)
    else:  # Batch
        g = df.set_index("batch_no")[_CHART_COLS]
        labels = [f"#{n}" for n in g.index]
    return labels, {c: g[c].round(2).tolist() for c in _CHART_COLS}


# --------------------------------------------------------------------------- #
# editable Batch Tablosu (add rows / edit cells / delete rows in place)
#
# Mirrors Araç Lojistiği's editable truck grid. Operator columns are typed
# directly; süre / F-P verim / F-P performans / toplam verim are recomputed on
# save (batch_suresi = bitiş − başlangıç · fp_verim = filtrat ⁄ dolum × 100).
# Üretim / kesinti / kalan % are workbook-only fields: shown read-only, carried
# through unchanged on edit.
# --------------------------------------------------------------------------- #
_B_EDIT_COLS = [
    "batch_no", "pres", "tarih", "recete", "baslangic", "bitis",
    "dolum_kg", "filtrat_kg", "tank_c", "nw_cevrim", "nw_su_l",
    "yikama_yapildi", "bez_degisti", "bitis_kriteri", "notlar",
]
_B_DERIVED_COLS = [
    "batch_suresi_dk", "fp_verim_pct", "fp_perf_tsa", "toplam_verim_pct",
    "uretim_suresi_pct", "kesinti_suresi_pct", "kalan_sure_pct",
]


def _editable_batch_table(b: pd.DataFrame) -> None:
    cols = _B_EDIT_COLS + _B_DERIVED_COLS
    bool_cols = ("yikama_yapildi", "bez_degisti")
    if b.empty:
        seed = pd.DataFrame({
            c: pd.Series(dtype="boolean" if c in bool_cols else "object") for c in cols
        })
    else:
        seed = b.copy()
        seed["tarih"] = seed["tarih"].dt.date
        seed["baslangic"] = seed["baslangic"].map(lambda v: (v or "")[:5])
        seed["bitis"] = seed["bitis"].map(lambda v: (v or "")[:5])
        # Nullable "boolean" (not numpy bool): pandas 3.0 raises on nan→bool, and
        # st.data_editor writes nan into checkbox cells while applying a row delete.
        for c in bool_cols:
            seed[c] = seed[c].fillna(0).astype("boolean")
        seed = seed[cols].reset_index(drop=True)

    box = st.container(border=True, key="batch_grid_box")
    with box:
        ui.render(
            '<div class="up-charthead"><span class="up-charthead__title">Batch Tablosu</span>'
            f'<span class="up-charthead__sub">{len(seed)} kayıt · tüm workbook sütunları · '
            'hücreyi düzenleyin · en alttan satır ekleyin · satır seçip silin</span></div>'
        )
        st.data_editor(
            seed,
            key="batch_editor",
            num_rows="dynamic",
            width="stretch",
            hide_index=True,
            column_order=_B_EDIT_COLS + _B_DERIVED_COLS,
            column_config={
                "batch_no": st.column_config.NumberColumn("Batch", min_value=1, step=1, format="%d",
                                                          help="Boş bırakılırsa sıradaki numara atanır."),
                "pres": st.column_config.SelectboxColumn("Pres", options=[PRESS_1, PRESS_2],
                                                         default=PRESS_1),
                "tarih": st.column_config.DateColumn("Tarih", format="DD.MM.YYYY"),
                "recete": st.column_config.TextColumn("Reçete", default=RECIPE_BY_PRESS[PRESS_1]),
                "baslangic": st.column_config.TextColumn("Başlangıç", help="SS:DD (örn. 09:15)"),
                "bitis": st.column_config.TextColumn("Bitiş", help="SS:DD"),
                "dolum_kg": st.column_config.NumberColumn("Dolum Q15 (kg)", min_value=0.0, step=100.0, format="%d"),
                "filtrat_kg": st.column_config.NumberColumn("Filtrat (kg)", min_value=0.0, step=100.0, format="%d"),
                "tank_c": st.column_config.NumberColumn("Tank °C", min_value=0.0, step=0.1, format="%.1f"),
                "nw_cevrim": st.column_config.NumberColumn("NW çevrim", min_value=0.0, step=1.0, format="%d"),
                "nw_su_l": st.column_config.NumberColumn("NW su (l)", min_value=0.0, step=100.0, format="%d"),
                "yikama_yapildi": st.column_config.CheckboxColumn("Yıkama", default=False),
                "bez_degisti": st.column_config.CheckboxColumn(
                    "Bez değişti", default=False,
                    help="Bu batch'te pres bezi değiştirildiyse işaretleyin (KPI #6)."),
                "bitis_kriteri": st.column_config.TextColumn(
                    "Bitiş kriteri", help="HMI end-criteria kodu, örn. F2/P2/NW2/E1 (KPI #8)."),
                "notlar": st.column_config.TextColumn("Notlar"),
                "batch_suresi_dk": st.column_config.NumberColumn("Süre (dk)", disabled=True, format="%.1f"),
                "fp_verim_pct": st.column_config.NumberColumn("F/P verim Q26", disabled=True, format="%.1f"),
                "fp_perf_tsa": st.column_config.NumberColumn("F/P perf Q27", disabled=True, format="%.1f"),
                "toplam_verim_pct": st.column_config.NumberColumn("Toplam verim", disabled=True, format="%.1f"),
                "uretim_suresi_pct": st.column_config.NumberColumn("Üretim %", disabled=True, format="%.1f"),
                "kesinti_suresi_pct": st.column_config.NumberColumn("Kesinti %", disabled=True, format="%.1f"),
                "kalan_sure_pct": st.column_config.NumberColumn("Kalan %", disabled=True, format="%.1f"),
            },
        )

        delta = st.session_state.get("batch_editor", {}) or {}
        dirty = bool(delta.get("edited_rows") or delta.get("added_rows") or delta.get("deleted_rows"))

        cta, note = st.columns([0.42, 1], vertical_alignment="center")
        with cta:
            if st.button("Değişiklikleri kaydet", type="primary", disabled=not dirty,
                         width="stretch", key="batch_save"):
                added, changed, removed = _apply_batch_delta(seed, delta)
                st.cache_data.clear()
                st.toast(f"{added} eklendi · {changed} güncellendi · {removed} silindi.")
                st.rerun()
        with note:
            msg = ("Kaydedilmemiş değişiklik var — süre, F/P verim ve performans kaydettikten "
                   "sonra otomatik hesaplanır." if dirty else
                   "Süre = bitiş − başlangıç · F/P verim = filtrat ⁄ dolum × 100 · "
                   "toplam verim = F/P verim.")
            ui.render(ui.foot_note(msg))


def _apply_batch_delta(seed: pd.DataFrame, delta: dict) -> tuple[int, int, int]:
    added = changed = removed = 0

    for i in delta.get("deleted_rows", []):
        bn = _int_or_none(seed.iloc[int(i)]["batch_no"])
        if bn is not None:
            db.delete_batch(bn)
            removed += 1

    for i_str, changes in delta.get("edited_rows", {}).items():
        orig = seed.iloc[int(i_str)].to_dict()
        new = {**orig, **changes}
        old_no = _int_or_none(orig.get("batch_no"))
        new_no = _int_or_none(new.get("batch_no")) or old_no
        if new_no is None:
            continue
        new["batch_no"] = new_no
        if old_no is not None and old_no != new_no:
            db.delete_batch(old_no)
        db.insert_batch(_batch_rec(new))
        changed += 1

    for add in delta.get("added_rows", []):
        rec = _batch_rec(add)
        if rec["batch_no"] is None:
            rec["batch_no"] = db.next_batch_no()
        if rec["dolum_kg"] is None and rec["filtrat_kg"] is None and rec["tarih"] is None:
            continue  # nothing meaningful entered
        db.insert_batch(rec)
        added += 1

    return added, changed, removed


def _batch_rec(d: dict) -> dict:
    bas, bit = _hhmmss(d.get("baslangic")), _hhmmss(d.get("bitis"))
    sure = None
    if bas and bit:
        gap = _t2m(bit) - _t2m(bas)
        sure = round(gap, 1) if gap and gap > 0 else None

    dolum = _float_or_none(d.get("dolum_kg"))
    filtrat = _float_or_none(d.get("filtrat_kg"))
    fp_verim = round(filtrat / dolum * 100, 1) if (dolum and filtrat) else None
    pres = str(d["pres"]).strip() if d.get("pres") else PRESS_1

    return {
        "batch_no": _int_or_none(d.get("batch_no")),
        "pres": pres,
        "tarih": _iso_date(d.get("tarih")),
        "recete": (str(d["recete"]).strip() if d.get("recete") else RECIPE_BY_PRESS.get(pres)),
        "baslangic": bas,
        "bitis": bit,
        "batch_suresi_dk": sure,
        "dolum_kg": dolum,
        "filtrat_kg": filtrat,
        "fp_verim_pct": fp_verim,
        "fp_perf_tsa": round(filtrat / 1000 / (sure / 60), 1) if (filtrat and sure) else None,
        "tank_c": _float_or_none(d.get("tank_c")),
        "nw_cevrim": _float_or_none(d.get("nw_cevrim")),
        "nw_su_l": _float_or_none(d.get("nw_su_l")),
        "toplam_verim_pct": fp_verim,
        "uretim_suresi_pct": _float_or_none(d.get("uretim_suresi_pct")),
        "kesinti_suresi_pct": _float_or_none(d.get("kesinti_suresi_pct")),
        "kalan_sure_pct": _float_or_none(d.get("kalan_sure_pct")),
        "notlar": (str(d["notlar"]).strip() if d.get("notlar") else None),
        "yikama_yapildi": _flag(d.get("yikama_yapildi")),
        "bez_degisti": _flag(d.get("bez_degisti")),
        "bitis_kriteri": (str(d["bitis_kriteri"]).strip() if d.get("bitis_kriteri") else None),
    }


def _flag(v) -> int:
    """Checkbox cell → 1/0. Tolerates pd.NA (bool(NA) raises), None, np.bool_."""
    try:
        return 1 if bool(v) else 0
    except (TypeError, ValueError):
        return 0


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


def _hhmmss(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    if isinstance(v, dt.time):
        return v.strftime("%H:%M:%S")
    s = str(v).strip()
    for f in ("%H:%M:%S", "%H:%M", "%H.%M"):
        try:
            return dt.datetime.strptime(s, f).strftime("%H:%M:%S")
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
