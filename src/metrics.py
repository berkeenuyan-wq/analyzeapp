"""Every figure the dashboard shows, derived from the two source tables.

The plant workbook carries pre-computed sheets (Press Analiz, Ön Hatlar Analiz,
the İstatistikler block). Those are treated as *output*, not input — the numbers
here are recomputed from ``batch`` and ``truck`` so there is a single source of
truth. Formulas were reconciled against the workbook's own cells:

* ``İşlenen Toplam Ürün``           = Σ dolum
* per-press ``Saatlik Ortalama``    = Σ filtrat / (Σ batch süresi ⁄ 60)
* ``Çıkan Toplam Ürün ortalaması``  = Pres 1 saatlik + Pres 2 saatlik
* ``Fark %``                        = (Araç Toplamı − Pres Toplamı) / Araç Toplamı × 100
* per-day press span               = last batch bitiş − first batch başlangıç
"""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass

import pandas as pd

from . import db
from .config import PRESS_1, PRESS_2, FARK_TOLERANCE


# --------------------------------------------------------------------------- #
# small helpers
# --------------------------------------------------------------------------- #
def _hours(minutes: pd.Series | float) -> float:
    return float(pd.Series(minutes).sum()) / 60.0


def _secs(t: str | None) -> float | None:
    if not t or pd.isna(t):
        return None
    for f in ("%H:%M:%S", "%H:%M"):
        try:
            x = dt.datetime.strptime(str(t), f)
            return x.hour * 3600 + x.minute * 60 + x.second
        except ValueError:
            continue
    return None


def _safe_div(a: float, b: float) -> float | None:
    return a / b if b else None


def _mean(s: pd.Series) -> float | None:
    s = s.dropna()
    return float(s.mean()) if len(s) else None


# --------------------------------------------------------------------------- #
# dataset facts
# --------------------------------------------------------------------------- #
@dataclass
class Coverage:
    batch_days: list[dt.date]
    truck_days: list[dt.date]
    first_day: dt.date | None
    last_day: dt.date | None
    batch_count: int
    truck_count: int
    last_import_at: str | None
    source_filename: str | None


def coverage(batches: pd.DataFrame | None = None, trucks: pd.DataFrame | None = None) -> Coverage:
    b = db.batches() if batches is None else batches
    t = db.trucks() if trucks is None else trucks
    bdays = sorted({d.date() for d in b["tarih"].dropna()}) if not b.empty else []
    tdays = sorted({d.date() for d in t["tarih"].dropna()}) if not t.empty else []
    alld = sorted(set(bdays) | set(tdays))
    return Coverage(
        batch_days=bdays,
        truck_days=tdays,
        first_day=alld[0] if alld else None,
        last_day=alld[-1] if alld else None,
        batch_count=len(b),
        truck_count=len(t),
        last_import_at=db.get_meta("last_import_at"),
        source_filename=db.get_meta("source_filename"),
    )


# --------------------------------------------------------------------------- #
# per-press roll-up
# --------------------------------------------------------------------------- #
@dataclass
class PressRollup:
    press: str
    label: str
    batches: int
    calisma_saat: float          # Σ batch süresi ⁄ 60
    giren_ton: float             # Σ dolum ⁄ 1000
    cikan_ton: float             # Σ filtrat ⁄ 1000
    saatlik_kg_sa: float | None  # Σ filtrat / çalışma saat
    posa_saatlik_kg_sa: float | None  # Σ (dolum − filtrat) / çalışma saat
    ort_toplam_verim: float | None
    ort_fp_verim: float | None

    @property
    def saatlik_t_sa(self) -> float | None:
        return None if self.saatlik_kg_sa is None else self.saatlik_kg_sa / 1000

    @property
    def posa_saatlik_t_sa(self) -> float | None:
        return None if self.posa_saatlik_kg_sa is None else self.posa_saatlik_kg_sa / 1000


def press_rollup(df: pd.DataFrame, press: str, label: str) -> PressRollup:
    p = df[df["pres"] == press]
    hrs = _hours(p["batch_suresi_dk"]) if len(p) else 0.0
    giren = float(p["dolum_kg"].sum())
    cikan = float(p["filtrat_kg"].sum())
    posa = giren - cikan
    return PressRollup(
        press=press,
        label=label,
        batches=len(p),
        calisma_saat=hrs,
        giren_ton=giren / 1000,
        cikan_ton=cikan / 1000,
        saatlik_kg_sa=_safe_div(cikan, hrs),
        posa_saatlik_kg_sa=_safe_div(posa, hrs),
        ort_toplam_verim=_mean(p["toplam_verim_pct"]),
        ort_fp_verim=_mean(p["fp_verim_pct"]),
    )


def both_presses(df: pd.DataFrame | None = None) -> list[PressRollup]:
    df = db.batches() if df is None else df
    return [
        press_rollup(df, PRESS_1, "Press 1"),
        press_rollup(df, PRESS_2, "Press 2"),
    ]


# --------------------------------------------------------------------------- #
# headline (Bucher dashboard sheet)
# --------------------------------------------------------------------------- #
@dataclass
class Headline:
    islenen_ton: float                 # Σ dolum ⁄ 1000
    ort_toplam_verim: float | None     # mean toplam verim %
    ort_batch_suresi_dk: float | None
    cikan_ort_t_sa: float | None       # Pres 1 saatlik + Pres 2 saatlik
    posa_saatlik_toplam_t_sa: float | None  # Σ over presses of posa/çalışma saat
    batch_count: int


def headline(df: pd.DataFrame | None = None) -> Headline:
    df = db.batches() if df is None else df
    p1, p2 = both_presses(df)
    cikan_ort = None
    if p1.saatlik_kg_sa is not None or p2.saatlik_kg_sa is not None:
        cikan_ort = ((p1.saatlik_kg_sa or 0) + (p2.saatlik_kg_sa or 0)) / 1000
    posa_tot = None
    if p1.posa_saatlik_kg_sa is not None or p2.posa_saatlik_kg_sa is not None:
        posa_tot = ((p1.posa_saatlik_kg_sa or 0) + (p2.posa_saatlik_kg_sa or 0)) / 1000
    return Headline(
        islenen_ton=float(df["dolum_kg"].sum()) / 1000,
        ort_toplam_verim=_mean(df["toplam_verim_pct"]),
        ort_batch_suresi_dk=_mean(df["batch_suresi_dk"]),
        cikan_ort_t_sa=cikan_ort,
        posa_saatlik_toplam_t_sa=posa_tot,
        batch_count=len(df),
    )


# --------------------------------------------------------------------------- #
# GÜNLÜK PRESS PERFORMANSI TON/SA
# --------------------------------------------------------------------------- #
def daily_press_performance(df: pd.DataFrame | None = None) -> pd.DataFrame:
    df = db.batches() if df is None else df
    if df.empty:
        return pd.DataFrame()
    out = []
    for day, g in df.groupby(df["tarih"].dt.date):
        row = {"gun": day}
        tot_giren = tot_cikan = 0.0
        for press, key in ((PRESS_1, "p1"), (PRESS_2, "p2")):
            pg = g[g["pres"] == press]
            hrs = _hours(pg["batch_suresi_dk"]) if len(pg) else 0.0
            giren = float(pg["dolum_kg"].sum())
            cikan = float(pg["filtrat_kg"].sum())
            row[f"{key}_perf_t_sa"] = (_safe_div(cikan, hrs) or 0) / 1000 if hrs else None
            row[f"{key}_girdi_ton"] = giren / 1000
            row[f"{key}_cikti_ton"] = cikan / 1000
            tot_giren += giren
            tot_cikan += cikan
        row["toplam_perf_t_sa"] = sum(
            row[k] or 0 for k in ("p1_perf_t_sa", "p2_perf_t_sa")
        ) or None
        row["toplam_giren_ton"] = tot_giren / 1000
        row["toplam_cikan_ton"] = tot_cikan / 1000
        row["verim_pct"] = _safe_div(tot_cikan, tot_giren)
        row["verim_pct"] = row["verim_pct"] * 100 if row["verim_pct"] is not None else None
        # Leeching verimi: incremental yield the NW wash phase adds, read as the
        # gap between Toplam Verim and F/P Verim for the day. The workbook's exact
        # cell formula is unconfirmed; this is the domain reading.
        tv, fv = _mean(g["toplam_verim_pct"]), _mean(g["fp_verim_pct"])
        row["leeching_verim_pct"] = (tv - fv) if (tv is not None and fv is not None) else None
        row["ort_verim_pct"] = tv
        out.append(row)
    return pd.DataFrame(out).sort_values("gun").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# ÖN HATLAR ANALİZ — Araç vs Pres farkı (mass balance)
# --------------------------------------------------------------------------- #
def mass_balance(
    batches: pd.DataFrame | None = None, trucks: pd.DataFrame | None = None
) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    t = db.trucks() if trucks is None else trucks

    arac = (
        t.groupby(t["tarih"].dt.date)["miktar_kg"].sum()
        if not t.empty else pd.Series(dtype=float)
    )
    pres = (
        b.groupby(b["tarih"].dt.date)["dolum_kg"].sum()
        if not b.empty else pd.Series(dtype=float)
    )
    # Only days with at least one truck load carry a mass balance.
    days = sorted(arac.index)
    rows = []
    for day in days:
        a = float(arac.get(day, 0.0))
        p = float(pres.get(day, 0.0))
        fark = a - p
        pct = (fark / a * 100) if a else None
        rows.append(
            {
                "tarih": day,
                "arac_toplam_kg": a,
                "pres_toplam_kg": p,
                "fark_kg": fark,
                "fark_pct": pct,
                "tolerans_disi": (pct is not None and abs(pct) > FARK_TOLERANCE),
                "kayit_var": p > 0,
            }
        )
    return pd.DataFrame(rows)


def breaches(batches=None, trucks=None) -> pd.DataFrame:
    mb = mass_balance(batches, trucks)
    return mb[mb["tolerans_disi"]] if not mb.empty else mb


# --------------------------------------------------------------------------- #
# posa (pomace) rate
# --------------------------------------------------------------------------- #
@dataclass
class PosaSummary:
    saatlik_toplam_t_sa: float | None
    p1_saatlik_t_sa: float | None
    p2_saatlik_t_sa: float | None
    ort_leeching_verim_pct: float | None
    toplam_posa_ton: float


def posa_summary(df: pd.DataFrame | None = None) -> PosaSummary:
    df = db.batches() if df is None else df
    p1, p2 = both_presses(df)
    dpp = daily_press_performance(df)
    leech = _mean(dpp["leeching_verim_pct"]) if not dpp.empty else None
    toplam_posa = float((df["dolum_kg"] - df["filtrat_kg"]).sum()) / 1000
    tot = None
    if p1.posa_saatlik_kg_sa is not None or p2.posa_saatlik_kg_sa is not None:
        tot = ((p1.posa_saatlik_kg_sa or 0) + (p2.posa_saatlik_kg_sa or 0)) / 1000
    return PosaSummary(
        saatlik_toplam_t_sa=tot,
        p1_saatlik_t_sa=p1.posa_saatlik_t_sa,
        p2_saatlik_t_sa=p2.posa_saatlik_t_sa,
        ort_leeching_verim_pct=leech,
        toplam_posa_ton=toplam_posa,
    )


def low_verim_batches(df: pd.DataFrame | None = None, threshold: float = 90.0) -> pd.DataFrame:
    df = db.batches() if df is None else df
    low = df[df["toplam_verim_pct"] < threshold].copy()
    low["verim_kaybi_puan"] = threshold - low["toplam_verim_pct"]
    return low.sort_values("toplam_verim_pct").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# araç istatistikleri
# --------------------------------------------------------------------------- #
@dataclass
class TruckStats:
    arac_sayisi: int
    ort_bekleme_dk: float | None
    toplam_kayip_zaman_dk: float
    ort_bosaltma_dk: float | None
    ort_bosaltma_hizi_kg_dk: float | None
    toplam_gelen_ton: float


def truck_stats(t: pd.DataFrame | None = None) -> TruckStats:
    t = db.trucks() if t is None else t
    if t.empty:
        return TruckStats(0, None, 0.0, None, None, 0.0)
    bek = t["bekleme_dk"].dropna()
    total_kg = float(t["miktar_kg"].sum())
    total_min = float(t["sure_dk"].sum())
    return TruckStats(
        arac_sayisi=len(t),
        ort_bekleme_dk=float(bek.mean()) if len(bek) else None,
        toplam_kayip_zaman_dk=float(bek.sum()),
        ort_bosaltma_dk=_mean(t["sure_dk"]),
        ort_bosaltma_hizi_kg_dk=_safe_div(total_kg, total_min),
        toplam_gelen_ton=total_kg / 1000,
    )


def truck_daily(
    batches: pd.DataFrame | None = None, trucks: pd.DataFrame | None = None
) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    t = db.trucks() if trucks is None else trucks
    if t.empty:
        return pd.DataFrame()
    rows = []
    for day, g in t.groupby(t["tarih"].dt.date):
        bg = b[b["tarih"].dt.date == day] if not b.empty else b
        span = None
        starts = [_secs(x) for x in bg["baslangic"]] if len(bg) else []
        ends = [_secs(x) for x in bg["bitis"]] if len(bg) else []
        starts = [s for s in starts if s is not None]
        ends = [e for e in ends if e is not None]
        if starts and ends:
            span = max(ends) - min(starts)
        rows.append(
            {
                "gun": day,
                "miktar_ton": float(g["miktar_kg"].sum()) / 1000,
                "bekleme_dk": float(g["bekleme_dk"].dropna().sum()),
                "arac_sayisi": len(g),
                "pres_araligi_sn": span,
            }
        )
    return pd.DataFrame(rows).sort_values("gun").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# day-over-day deltas for KPI chips
# --------------------------------------------------------------------------- #
def daily_headline_series(df: pd.DataFrame | None = None) -> pd.DataFrame:
    """One row per batch-day with the headline measures, for sparklines + deltas."""
    df = db.batches() if df is None else df
    if df.empty:
        return pd.DataFrame()
    dpp = daily_press_performance(df)
    rows = []
    for day, g in df.groupby(df["tarih"].dt.date):
        d = dpp[dpp["gun"] == day].iloc[0] if not dpp.empty else {}
        rows.append(
            {
                "gun": day,
                "islenen_ton": float(g["dolum_kg"].sum()) / 1000,
                "ort_toplam_verim": _mean(g["toplam_verim_pct"]),
                "ort_batch_suresi_dk": _mean(g["batch_suresi_dk"]),
                "cikan_ort_t_sa": d.get("toplam_perf_t_sa") if hasattr(d, "get") else d["toplam_perf_t_sa"],
                "ort_kesinti_pct": _mean(g["kesinti_suresi_pct"]),
                "ort_fp_verim": _mean(g["fp_verim_pct"]),
                "ort_fp_perf": _mean(g["fp_perf_tsa"]),
            }
        )
    return pd.DataFrame(rows).sort_values("gun").reset_index(drop=True)


# =========================================================================== #
# KPI set (added 2026-09-06): idle · fouling decay · recipe variance ·
# temp↔yield · low-yield repeatability · cloth age · truck-press sync ·
# end-criteria Pareto. All derived from batch + truck; #6 needs bez_degisti,
# #8 needs bitis_kriteri (both entered in the Pres Performansı grid).
# =========================================================================== #
def _intervals(g: pd.DataFrame) -> list[tuple[float, float]]:
    """Sorted [(start_s, end_s)] for a batch frame; drops unparseable / inverted."""
    iv = []
    for r in g.itertuples():
        s, e = _secs(r.baslangic), _secs(r.bitis)
        if s is not None and e is not None and e > s:
            iv.append((s, e))
    return sorted(iv)


def _covered_seconds(iv: list[tuple[float, float]]) -> float:
    """Union length of intervals (overlaps counted once)."""
    if not iv:
        return 0.0
    total = 0.0
    cur_s, cur_e = iv[0]
    for s, e in iv[1:]:
        if s <= cur_e:
            cur_e = max(cur_e, e)
        else:
            total += cur_e - cur_s
            cur_s, cur_e = s, e
    return total + (cur_e - cur_s)


# --- #1 press idle / utilization ----------------------------------------- #
def press_idle(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    """Per press per day: span, running time, idle gap, utilization %."""
    b = db.batches() if batches is None else batches
    if b.empty:
        return pd.DataFrame()
    rows = []
    for (day, press), g in b.groupby([b["tarih"].dt.date, "pres"]):
        iv = _intervals(g)
        if not iv:
            continue
        span = iv[-1][1] - iv[0][0]
        covered = _covered_seconds(iv)
        rows.append({
            "gun": day,
            "press": press,
            "batch_count": len(g),
            "span_dk": span / 60,
            "calisma_dk": covered / 60,
            "idle_dk": max(span - covered, 0.0) / 60,
            "utilization_pct": (covered / span * 100) if span else None,
        })
    return pd.DataFrame(rows).sort_values(["gun", "press"]).reset_index(drop=True)


def press_idle_summary(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    """Per press across all days: total idle, mean utilization."""
    pi = press_idle(batches)
    if pi.empty:
        return pi
    return (
        pi.groupby("press")
        .agg(
            gun=("gun", "nunique"),
            batch=("batch_count", "sum"),
            toplam_idle_dk=("idle_dk", "sum"),
            ort_idle_dk=("idle_dk", "mean"),
            ort_utilization_pct=("utilization_pct", "mean"),
        )
        .reset_index()
    )


# --- #2 fouling decay (yield vs batches-since-wash) --------------------- #
def batches_since_wash(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    """Tag each batch with how many batches ran on its press since the last NW
    wash (0 = first batch after a wash)."""
    b = db.batches() if batches is None else batches
    if b.empty:
        return pd.DataFrame()
    out = []
    ordered = b.sort_values(["pres", "tarih", "baslangic", "batch_no"])
    for press, g in ordered.groupby("pres"):
        counter = 0
        for r in g.itertuples():
            out.append({
                "batch_no": r.batch_no, "press": press, "tarih": r.tarih,
                "since_wash": counter,
                "toplam_verim_pct": r.toplam_verim_pct,
                "fp_verim_pct": r.fp_verim_pct,
            })
            counter = 0 if r.yikama_yapildi == 1 else counter + 1
    return pd.DataFrame(out)


def fouling_decay(
    batches: pd.DataFrame | None = None, metric: str = "toplam_verim_pct"
) -> pd.DataFrame:
    """Mean `metric` by 'batches since wash', combined ('Tümü') and per press."""
    sw = batches_since_wash(batches)
    if sw.empty:
        return sw
    combined = (
        sw.groupby("since_wash")[metric].agg(n="count", ort="mean")
        .reset_index().assign(press="Tümü")
    )
    per = (
        sw.groupby(["press", "since_wash"])[metric].agg(n="count", ort="mean")
        .reset_index()
    )
    return pd.concat([combined, per], ignore_index=True)


# --- #3 recipe yield variance ----------------------------------------- #
def recipe_variance(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    if b.empty:
        return pd.DataFrame()
    out = (
        b.groupby(b["recete"].fillna("—"))
        .agg(
            n=("batch_no", "count"),
            ort_toplam_verim=("toplam_verim_pct", "mean"),
            std_toplam_verim=("toplam_verim_pct", "std"),
            min_toplam_verim=("toplam_verim_pct", "min"),
            max_toplam_verim=("toplam_verim_pct", "max"),
            ort_fp_verim=("fp_verim_pct", "mean"),
            ort_batch_suresi_dk=("batch_suresi_dk", "mean"),
        )
        .reset_index()
        .rename(columns={"recete": "recete"})
    )
    out["aralik_puan"] = out["max_toplam_verim"] - out["min_toplam_verim"]
    return out.sort_values("std_toplam_verim", ascending=False, na_position="last").reset_index(drop=True)


# --- #4 tank temperature ↔ yield ------------------------------------- #
@dataclass
class TempYield:
    n: int
    r_toplam: float | None
    r_fp: float | None
    points: pd.DataFrame          # tank_c, toplam_verim_pct, fp_verim_pct, pres
    bins: pd.DataFrame            # tank_c bucket -> mean yield


def temp_yield(batches: pd.DataFrame | None = None) -> TempYield:
    b = db.batches() if batches is None else batches
    pts = (
        b[["tank_c", "toplam_verim_pct", "fp_verim_pct", "pres"]].dropna(subset=["tank_c"])
        if not b.empty else pd.DataFrame(columns=["tank_c", "toplam_verim_pct", "fp_verim_pct", "pres"])
    )

    def _r(col: str) -> float | None:
        d = pts[["tank_c", col]].dropna()
        return float(d["tank_c"].corr(d[col])) if len(d) >= 3 else None

    bins = pd.DataFrame()
    if not pts.empty:
        edges = [-1, 23, 25, 27, 29, 999]
        names = ["≤23", "24–25", "26–27", "28–29", "30+"]
        cut = pd.cut(pts["tank_c"], bins=edges, labels=names)
        bins = (
            pts.assign(_bin=cut).groupby("_bin", observed=True)
            .agg(n=("tank_c", "count"),
                 ort_toplam_verim=("toplam_verim_pct", "mean"),
                 ort_fp_verim=("fp_verim_pct", "mean"))
            .reset_index().rename(columns={"_bin": "tank_araligi"})
        )
    return TempYield(
        n=len(pts), r_toplam=_r("toplam_verim_pct"), r_fp=_r("fp_verim_pct"),
        points=pts.reset_index(drop=True), bins=bins,
    )


# --- #5 low-yield repeatability ------------------------------------- #
def low_verim_repeat(
    batches: pd.DataFrame | None = None, threshold: float = 90.0
) -> dict:
    b = db.batches() if batches is None else batches
    low = low_verim_batches(b, threshold)
    empty = pd.DataFrame()
    if low.empty:
        return {"threshold": threshold, "count": 0, "by_press": empty,
                "by_recete": empty, "by_gun": empty, "streaks": empty}
    by_press = low.groupby("pres").size().reset_index(name="dusuk_batch")
    by_recete = (
        low.groupby(low["recete"].fillna("—")).size()
        .reset_index(name="dusuk_batch").rename(columns={"recete": "recete"})
    )
    by_gun = (
        low.groupby(low["tarih"].dt.date).size()
        .reset_index(name="dusuk_batch").rename(columns={"tarih": "gun"})
    )
    streaks = []
    for press, g in b.sort_values(["pres", "tarih", "baslangic", "batch_no"]).groupby("pres"):
        run: list[int] = []
        for r in g.itertuples():
            if r.toplam_verim_pct is not None and r.toplam_verim_pct < threshold:
                run.append(int(r.batch_no))
            else:
                if len(run) >= 2:
                    streaks.append({"press": press, "uzunluk": len(run),
                                    "batchler": ", ".join(f"#{x}" for x in run)})
                run = []
        if len(run) >= 2:
            streaks.append({"press": press, "uzunluk": len(run),
                            "batchler": ", ".join(f"#{x}" for x in run)})
    return {"threshold": threshold, "count": int(len(low)), "by_press": by_press,
            "by_recete": by_recete, "by_gun": by_gun, "streaks": pd.DataFrame(streaks)}


# --- #6 press-cloth age (yield vs batches-since-cloth-change) --------- #
def batches_since_cloth(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    if b.empty or "bez_degisti" not in b.columns:
        return pd.DataFrame()
    out = []
    for press, g in b.sort_values(["pres", "tarih", "baslangic", "batch_no"]).groupby("pres"):
        counter = 0
        seen = False
        for r in g.itertuples():
            out.append({
                "batch_no": r.batch_no, "press": press, "tarih": r.tarih,
                "since_cloth": counter, "seen_change": seen,
                "toplam_verim_pct": r.toplam_verim_pct, "fp_verim_pct": r.fp_verim_pct,
            })
            if getattr(r, "bez_degisti", None) == 1:
                counter, seen = 0, True
            else:
                counter += 1
    return pd.DataFrame(out)


def cloth_decay(
    batches: pd.DataFrame | None = None, metric: str = "fp_verim_pct"
) -> pd.DataFrame:
    """Mean `metric` by batches-since-cloth-change, per press. Empty until at
    least one bez_degisti is recorded."""
    sc = batches_since_cloth(batches)
    if sc.empty:
        return sc
    sc = sc[sc["seen_change"]]
    if sc.empty:
        return pd.DataFrame()
    return (
        sc.groupby(["press", "since_cloth"])[metric].agg(n="count", ort="mean")
        .reset_index()
    )


# --- #7 truck ↔ press synchronisation loss --------------------------- #
def truck_press_sync(
    batches: pd.DataFrame | None = None, trucks: pd.DataFrame | None = None
) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    t = db.trucks() if trucks is None else trucks
    if t.empty:
        return pd.DataFrame()
    pi = press_idle(b)
    idle_by_day = pi.groupby("gun")["idle_dk"].sum() if not pi.empty else pd.Series(dtype=float)
    rows = []
    for day, g in t.groupby(t["tarih"].dt.date):
        wait = float(g["bekleme_dk"].dropna().sum())
        idle = float(idle_by_day.get(day, 0.0))
        rows.append({
            "gun": day,
            "arac_bekleme_dk": wait,
            "pres_idle_dk": idle,
            "es_zamanli_kayip_dk": min(wait, idle),
            "arac_sayisi": len(g),
        })
    return pd.DataFrame(rows).sort_values("gun").reset_index(drop=True)


# --- #8 end-criteria Pareto ---------------------------------------- #
def end_criteria_pareto(batches: pd.DataFrame | None = None) -> pd.DataFrame:
    b = db.batches() if batches is None else batches
    if b.empty or "bitis_kriteri" not in b.columns:
        return pd.DataFrame()
    s = b["bitis_kriteri"].dropna().astype(str).str.strip()
    s = s[s != ""]
    if s.empty:
        return pd.DataFrame()
    vc = s.value_counts().reset_index()
    vc.columns = ["kriter", "adet"]
    vc["pay_pct"] = vc["adet"] / vc["adet"].sum() * 100
    vc["kumulatif_pct"] = vc["pay_pct"].cumsum()
    return vc


# =========================================================================== #
# Laboratuvar — Pres Kalite Kontrolleri (juice / pomace quality)
#
# The quality sheet is time-sampled (a reading every few hours per press), not
# batch-indexed. Each reading is tied to a batch at query time: same day, same
# press, and the reading's Kontrol Saati inside the batch's başlangıç–bitiş
# window. 0, 1 or several readings may land on one batch; a reading that fits no
# window keeps batch_no = <NA> and is surfaced as "eşleşmedi".
# =========================================================================== #
def lab_readings(
    labs: pd.DataFrame | None = None, batches: pd.DataFrame | None = None
) -> pd.DataFrame:
    lab = db.labs() if labs is None else labs
    b = db.batches() if batches is None else batches
    if lab.empty:
        return lab.assign(
            pres=pd.Series(dtype=object),
            batch_no=pd.array([], dtype="Int64"),
        )

    out = lab.copy()
    out["pres"] = out["pres_no"].map(
        lambda n: f"Pres {int(n)}" if pd.notna(n) and int(n) in (1, 2) else None
    )
    out["batch_no"] = pd.array([pd.NA] * len(out), dtype="Int64")

    if not b.empty:
        windows: dict = {}
        for r in b.itertuples():
            s, e = _secs(r.baslangic), _secs(r.bitis)
            if s is None or e is None or pd.isna(r.tarih):
                continue
            windows.setdefault((r.tarih.date(), r.pres), []).append(
                (s, e, int(r.batch_no))
            )
        for i in out.index:
            t = out.at[i, "tarih"]
            key = (t.date() if pd.notna(t) else None, out.at[i, "pres"])
            secs = _secs(out.at[i, "kontrol_saati"])
            if key[0] is None or secs is None or key not in windows:
                continue
            hits = [(e - s, bn) for s, e, bn in windows[key] if s <= secs <= e]
            if hits:
                out.at[i, "batch_no"] = min(hits)[1]  # tightest window wins

    return out.reset_index(drop=True)


@dataclass
class LabSummary:
    n_readings: int
    n_matched: int
    n_days: int
    means: dict          # measure key -> mean (or None)
    out_of_spec: pd.DataFrame   # readings with at least one 'bad' measure


def lab_summary(
    labs: pd.DataFrame | None = None, batches: pd.DataFrame | None = None
) -> LabSummary:
    from .config import LAB_MEASURES

    lr = lab_readings(labs, batches)
    if lr.empty:
        return LabSummary(0, 0, 0, {m["key"]: None for m in LAB_MEASURES}, pd.DataFrame())

    means = {m["key"]: _mean(lr[m["key"]]) for m in LAB_MEASURES if m["key"] in lr.columns}

    def _bad(row) -> bool:
        return any(
            m["tone"](row[m["key"]]) == "bad"
            for m in LAB_MEASURES if m["key"] in lr.columns
        )

    oos = lr[lr.apply(_bad, axis=1)] if len(lr) else lr
    return LabSummary(
        n_readings=len(lr),
        n_matched=int(lr["batch_no"].notna().sum()),
        n_days=lr["tarih"].dt.date.nunique(),
        means=means,
        out_of_spec=oos.reset_index(drop=True),
    )


def lab_daily(
    labs: pd.DataFrame | None = None, batches: pd.DataFrame | None = None
) -> pd.DataFrame:
    """One row per day with the mean of every lab measure — for trend charts."""
    from .config import LAB_MEASURES

    lr = lab_readings(labs, batches)
    if lr.empty:
        return pd.DataFrame()
    keys = [m["key"] for m in LAB_MEASURES if m["key"] in lr.columns]
    g = lr.groupby(lr["tarih"].dt.date)[keys].mean().reset_index(names="gun")
    return g.sort_values("gun").reset_index(drop=True)


@dataclass
class LabCompleteness:
    n_readings: int
    core_pct: float | None      # filled Sıkım Brix/pH/Asitlik cells ÷ (3 × readings)
    posa_pct: float | None      # filled Posa cells ÷ (2 × readings with a posa time)
    by_field: dict              # measure key -> fill fraction 0..1 over all readings
    n_incomplete: int           # readings missing at least one core (juice) field
    worst_field: str | None     # "Sıkım Asitlik (7)" — most-often-blank core field
    incomplete: pd.DataFrame     # the readings missing a core field
    daily_delta: float | None = None  # core_pct change, last day vs the one before


def lab_completeness(
    labs: pd.DataFrame | None = None, batches: pd.DataFrame | None = None
) -> LabCompleteness:
    """How thoroughly the lab fills the quality sheet — did every scheduled
    reading get its Sıkım Brix / pH / Asitlik (and Posa values where a pomace
    check was logged)."""
    from .config import LAB_CORE_FIELDS, LAB_MEASURES, LAB_POSA_FIELDS

    lr = lab_readings(labs, batches)
    if lr.empty:
        return LabCompleteness(0, None, None, {}, 0, None, pd.DataFrame())

    n = len(lr)
    core_filled = sum(int(lr[f].notna().sum()) for f in LAB_CORE_FIELDS if f in lr.columns)
    core_pct = core_filled / (3 * n) * 100 if n else None

    has_posa_time = (
        lr["posa_kontrol_saati"].notna() if "posa_kontrol_saati" in lr.columns
        else pd.Series([False] * n, index=lr.index)
    )
    npt = int(has_posa_time.sum())
    posa_filled = sum(
        int(lr.loc[has_posa_time, f].notna().sum())
        for f in LAB_POSA_FIELDS if f in lr.columns
    )
    posa_pct = posa_filled / (2 * npt) * 100 if npt else None

    keys = [m["key"] for m in LAB_MEASURES if m["key"] in lr.columns]
    by_field = {k: float(lr[k].notna().mean()) for k in keys}

    core_cols = [f for f in LAB_CORE_FIELDS if f in lr.columns]
    miss = lr[core_cols].isna().any(axis=1)
    blanks = {f: int(lr[f].isna().sum()) for f in core_cols}
    label_by = {m["key"]: m["label"] for m in LAB_MEASURES}
    wf = max(blanks, key=blanks.get) if blanks else None
    worst = f"{label_by.get(wf, wf)} ({blanks[wf]})" if (wf and blanks[wf]) else None

    by_day = (
        lr.assign(_d=lr["tarih"].dt.date)
        .groupby("_d")
        .apply(lambda g: g[core_cols].notna().to_numpy().sum() / (3 * len(g)) * 100,
               include_groups=False)
    )
    d_delta = float(by_day.iloc[-1] - by_day.iloc[-2]) if len(by_day) >= 2 else None

    return LabCompleteness(
        n_readings=n, core_pct=core_pct, posa_pct=posa_pct, by_field=by_field,
        n_incomplete=int(miss.sum()), worst_field=worst,
        incomplete=lr[miss].reset_index(drop=True), daily_delta=d_delta,
    )


def lab_by_batch(
    labs: pd.DataFrame | None = None, batches: pd.DataFrame | None = None
) -> pd.DataFrame:
    """One row per batch that carries at least one reading — mean of every lab
    measure plus the reading count. Batch order tracks intraday progression."""
    from .config import LAB_MEASURES

    lr = lab_readings(labs, batches)
    if lr.empty:
        return pd.DataFrame()
    matched = lr[lr["batch_no"].notna()]
    if matched.empty:
        return pd.DataFrame()
    keys = [m["key"] for m in LAB_MEASURES if m["key"] in lr.columns]
    named: dict = {
        "tarih": ("tarih", "first"),
        "pres": ("pres", "first"),
        "olcum": ("batch_no", "size"),
    }
    named.update({k: (k, "mean") for k in keys})
    g = matched.groupby("batch_no").agg(**named).reset_index()
    return g.sort_values("batch_no").reset_index(drop=True)


def last_delta(series: pd.Series) -> float | None:
    """Absolute change between the last two points of a series (skipping NaN)."""
    s = series.dropna()
    if len(s) < 2:
        return None
    return float(s.iloc[-1] - s.iloc[-2])


def last_pct_change(series: pd.Series) -> float | None:
    """Percent change between the last two points of a series (skipping NaN)."""
    s = series.dropna()
    if len(s) < 2 or s.iloc[-2] == 0:
        return None
    return float((s.iloc[-1] - s.iloc[-2]) / abs(s.iloc[-2]) * 100)
