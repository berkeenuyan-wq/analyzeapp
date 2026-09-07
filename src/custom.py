"""Shared data layer for the Serbest Pano (free canvas) page.

The canvas panels never touch the source tables directly — they ask here for a
dataset, a column and an aggregation, and get back a plain number or a tidy
frame. Nothing in this module renders anything.
"""
from __future__ import annotations

import pandas as pd

from . import db, fmt, metrics

# --------------------------------------------------------------------------- #
# datasets a panel can pull from
# --------------------------------------------------------------------------- #
DATASETS: dict[str, dict] = {
    "batch": {"label": "Batch tablosu", "load": lambda: db.batches()},
    "truck": {"label": "Araç tablosu", "load": lambda: db.trucks()},
    "lab": {"label": "Laboratuvar okumaları", "load": lambda: metrics.lab_readings()},
    "gunluk_pres": {"label": "Günlük pres performansı",
                    "load": lambda: metrics.daily_press_performance()},
    "kutle_dengesi": {"label": "Kütle dengesi (araç vs pres)",
                      "load": lambda: metrics.mass_balance()},
}

_COL_LABELS = {
    "tarih": "Tarih", "pres": "Pres", "batch_no": "Batch no", "recete": "Reçete",
    "batch_suresi_dk": "Batch süresi (dk)", "dolum_kg": "Dolum (kg)",
    "filtrat_kg": "Filtrat (kg)", "fp_verim_pct": "F/P verim %",
    "fp_perf_tsa": "F/P performans (t/sa)", "tank_c": "Tank sıcaklığı (°C)",
    "toplam_verim_pct": "Toplam verim %", "uretim_suresi_pct": "Üretim süresi %",
    "kesinti_suresi_pct": "Kesinti süresi %", "kalan_sure_pct": "Kalan süre %",
    "nw_cevrim": "NW çevrim", "nw_su_l": "NW su (L)", "baslangic": "Başlangıç",
    "bitis": "Bitiş", "arac_no": "Araç no", "urun": "Ürün", "miktar_kg": "Miktar (kg)",
    "sure_dk": "Süre (dk)", "hiz_kg_dk": "Hız (kg/dk)", "bekleme_dk": "Bekleme (dk)",
    "kontrol_saati": "Kontrol saati", "sikim_brix": "Sıkım Brix",
    "sikim_ph": "Sıkım pH", "sikim_asitlik": "Sıkım Asitlik",
    "posa_brix": "Posa Brix", "posa_nem_pct": "Posa Nem %", "pres_no": "Pres no",
    "gun": "Gün", "p1_perf_t_sa": "Pres 1 (t/sa)", "p2_perf_t_sa": "Pres 2 (t/sa)",
    "toplam_perf_t_sa": "Toplam (t/sa)", "toplam_giren_ton": "Toplam giren (t)",
    "toplam_cikan_ton": "Toplam çıkan (t)", "verim_pct": "Verim %",
    "leeching_verim_pct": "Leeching verimi %", "ort_verim_pct": "Ortalama verim %",
    "arac_toplam_kg": "Araç toplamı (kg)", "pres_toplam_kg": "Pres toplamı (kg)",
    "fark_kg": "Fark (kg)", "fark_pct": "Fark %",
}

AGGS = {
    "mean": "Ortalama", "sum": "Toplam", "last": "Son değer",
    "min": "En düşük", "max": "En yüksek", "count": "Adet",
}
_PANDAS_AGG = {"mean": "mean", "sum": "sum", "min": "min", "max": "max",
               "last": "last", "count": "count"}


def col_label(name: str) -> str:
    return _COL_LABELS.get(name, name.replace("_", " ").capitalize())


def dataset_label(ds_id: str) -> str:
    return DATASETS.get(ds_id, {}).get("label", ds_id)


def load_dataset(ds_id: str) -> pd.DataFrame:
    spec = DATASETS.get(ds_id)
    if spec is None:
        return pd.DataFrame()
    try:
        df = spec["load"]()
    except Exception:  # noqa: BLE001
        return pd.DataFrame()
    return df if isinstance(df, pd.DataFrame) else pd.DataFrame()


def dataset_columns(ds_id: str) -> dict[str, list[str]]:
    """``{"numeric": [...], "dimension": [...]}`` for the dataset."""
    df = load_dataset(ds_id)
    if df.empty:
        return {"numeric": [], "dimension": []}
    numeric, dim = [], []
    for c in df.columns:
        s = df[c]
        if pd.api.types.is_numeric_dtype(s) and not pd.api.types.is_bool_dtype(s):
            numeric.append(c)
        if (pd.api.types.is_datetime64_any_dtype(s)
                or pd.api.types.is_object_dtype(s)
                or s.nunique(dropna=True) <= 24):
            dim.append(c)
    return {"numeric": numeric, "dimension": dim}


# --------------------------------------------------------------------------- #
# aggregation
# --------------------------------------------------------------------------- #
def aggregate(dataset: str, column: str, agg: str = "mean") -> float | None:
    """One number from a dataset column."""
    df = load_dataset(dataset)
    if df.empty or column not in df.columns:
        return None
    if agg == "count":
        return float(df[column].notna().sum())
    s = pd.to_numeric(df[column], errors="coerce").dropna()
    if s.empty:
        return None
    return float({
        "mean": s.mean, "sum": s.sum, "min": s.min, "max": s.max,
        "last": lambda: s.iloc[-1],
    }.get(agg, s.mean)())


def kpi_text(dataset: str, column: str, agg: str, decimals: int = 1) -> str:
    v = aggregate(dataset, column, agg)
    return "—" if v is None else fmt.nf(v, decimals)


def _daily_index(df: pd.DataFrame):
    for cand in ("tarih", "gun", "gün"):
        if cand in df.columns:
            return pd.to_datetime(df[cand], errors="coerce").dt.date
    return None


def grouped_frame(series: list[dict], xkey: str = "gun") -> pd.DataFrame:
    """One column per series, indexed by the shared X.

    ``series`` items: ``{"dataset", "column", "agg", "label"?}``. With
    ``xkey == "gun"`` every series is aggregated per day and aligned on the
    date, so panels can mix datasets. Otherwise (single dataset) rows are taken
    raw, sorted by ``xkey``.
    """
    series = [s for s in series if s.get("dataset") and s.get("column")]
    if not series:
        return pd.DataFrame()
    one_ds = len({s["dataset"] for s in series}) == 1
    raw = xkey != "gun" and one_ds

    cols: list[pd.Series] = []
    for i, s in enumerate(series):
        df = load_dataset(s["dataset"])
        col = s["column"]
        if df.empty or col not in df.columns:
            continue
        name = s.get("label") or f'{col_label(col)} · {dataset_label(s["dataset"])}'
        vals = pd.to_numeric(df[col], errors="coerce")
        if raw and xkey in df.columns:
            g = pd.Series(vals.values, index=df[xkey].map(x_label), name=name)
            g = g[~g.index.duplicated(keep="first")]
        else:
            key = _daily_index(df)
            if key is None:
                continue
            g = vals.groupby(key).agg(_PANDAS_AGG.get(s.get("agg", "mean"), "mean"))
            g.name = name
        cols.append(g)
    if not cols:
        return pd.DataFrame()
    return pd.concat(cols, axis=1).sort_index()


def x_label(v) -> str:
    try:
        return fmt.date_short(v) if hasattr(v, "year") or isinstance(v, str) and v[:4].isdigit() \
            else str(v)
    except Exception:  # noqa: BLE001
        return str(v)
