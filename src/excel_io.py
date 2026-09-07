"""Excel round-trip: import a workbook into SQLite, export a clean one back out.

Import reuses the cleaning pipeline in :mod:`src.ingest`; the app shows the
:class:`~src.ingest.ImportReport` for confirmation before anything is written.
Export regenerates a fresh ``.xlsx`` from the current database — the two source
tables, cleaned, plus the derived sheets recomputed from them.
"""
from __future__ import annotations

import datetime as dt
import io

import pandas as pd

from . import db, metrics
from .ingest import CleanResult, load_frames, read_and_clean

# ----------------------------------------------------------------------------- #
# import
# ----------------------------------------------------------------------------- #
def preview(path_or_buffer) -> CleanResult:
    """Clean an uploaded workbook and return frames + report, writing nothing."""
    return read_and_clean(path_or_buffer)


def commit(result: CleanResult, *, mode: str = "upsert") -> dict[str, int]:
    """Persist a previously previewed :class:`CleanResult`."""
    return load_frames(
        result.batches, result.trucks, mode=mode, source=result.report.source
    )


# ----------------------------------------------------------------------------- #
# export
# ----------------------------------------------------------------------------- #
_BATCH_HEADERS = {
    "pres": "Pres", "batch_no": "Batch No", "tarih": "Tarih", "recete": "Reçete",
    "baslangic": "Başlangıç", "bitis": "Bitiş", "batch_suresi_dk": "Batch Süresi (dk)",
    "dolum_kg": "F Toplam Dolum Q15 (kg)", "filtrat_kg": "F/P Filtrat Miktarı (kg)",
    "fp_verim_pct": "F/P Verim Q26 (%)", "fp_perf_tsa": "F/P Performans Q27 (t/sa)",
    "tank_c": "F Tank Sıcaklığı (°C)", "nw_cevrim": "NW Çevrim Sayısı",
    "nw_su_l": "NW Toplam Su (l)", "toplam_verim_pct": "Toplam Verim (%)",
    "uretim_suresi_pct": "Üretim Süresi (%)", "kesinti_suresi_pct": "Kesinti Süresi (%)",
    "kalan_sure_pct": "Kalan Süre (%)", "notlar": "Notlar", "yikama_yapildi": "Yıkama Yapıldı mı?",
    "bez_degisti": "Bez Değişti mi?", "bitis_kriteri": "Bitiş Kriteri",
}
_TRUCK_HEADERS = {
    "tarih": "Tarih", "arac_no": "Araç No", "urun": "Ürün", "miktar_kg": "Miktar (kg)",
    "baslangic": "Başlangıç", "bitis": "Bitiş", "sure_dk": "Süre (dk)",
    "hiz_kg_dk": "Hız (kg/dk)", "bekleme_dk": "Bekleme (dk)",
}


def build_workbook() -> bytes:
    """Return the bytes of a fresh, clean ``.xlsx`` built from the current DB."""
    b = db.batches()
    t = db.trucks()

    batch_out = b.drop(columns=[c for c in ("id",) if c in b.columns]).copy()
    if not batch_out.empty:
        batch_out["tarih"] = batch_out["tarih"].dt.date
        for flag in ("yikama_yapildi", "bez_degisti"):
            if flag in batch_out.columns:
                batch_out[flag] = batch_out[flag].map({1: "Evet", 0: "Hayır"})
        for col in _BATCH_HEADERS:
            if col not in batch_out.columns:
                batch_out[col] = None
        batch_out = batch_out[list(_BATCH_HEADERS)].rename(columns=_BATCH_HEADERS)

    truck_out = t.drop(columns=[c for c in ("id",) if c in t.columns]).copy()
    if not truck_out.empty:
        truck_out["tarih"] = truck_out["tarih"].dt.date
        truck_out = truck_out[list(_TRUCK_HEADERS)].rename(columns=_TRUCK_HEADERS)

    # --- derived sheets -------------------------------------------------- #
    mb = metrics.mass_balance(b, t)
    if not mb.empty:
        mb = mb.assign(fark_pct=(mb["fark_pct"]).round(4))[
            ["tarih", "arac_toplam_kg", "pres_toplam_kg", "fark_kg", "fark_pct"]
        ].rename(columns={
            "tarih": "Tarih", "arac_toplam_kg": "Araç Toplamı (kg)",
            "pres_toplam_kg": "Pres Toplamı (kg)", "fark_kg": "Fark (kg)", "fark_pct": "Fark (%)",
        })

    dpp = metrics.daily_press_performance(b)
    if not dpp.empty:
        dpp = dpp.rename(columns={
            "gun": "Gün", "p1_perf_t_sa": "Press 1 t/sa", "p2_perf_t_sa": "Press 2 t/sa",
            "toplam_perf_t_sa": "Toplam t/sa", "toplam_giren_ton": "Toplam Giren (t)",
            "toplam_cikan_ton": "Toplam Çıkan (t)", "verim_pct": "Verim (%)",
            "leeching_verim_pct": "Leeching Verimi (%)", "ort_verim_pct": "Ortalama Verim (%)",
            "p1_girdi_ton": "P1 Girdi (t)", "p1_cikti_ton": "P1 Çıktı (t)",
            "p2_girdi_ton": "P2 Girdi (t)", "p2_cikti_ton": "P2 Çıktı (t)",
        })

    ts = metrics.truck_stats(t)
    stats_out = pd.DataFrame(
        [
            ("Kayıtlı Araç Sayısı", ts.arac_sayisi),
            ("Ortalama Bekleme Süresi (dk)", _r(ts.ort_bekleme_dk)),
            ("Toplam Kayıp Zaman (dk)", _r(ts.toplam_kayip_zaman_dk)),
            ("Ortalama Boşaltma Süresi (dk)", _r(ts.ort_bosaltma_dk)),
            ("Ortalama Boşaltma Hızı (kg/dk)", _r(ts.ort_bosaltma_hizi_kg_dk, 2)),
            ("Toplam Gelen Ürün (ton)", _r(ts.toplam_gelen_ton, 2)),
        ],
        columns=["İstatistik", "Değer"],
    )

    h = metrics.headline(b)
    headline_out = pd.DataFrame(
        [
            ("İşlenen Toplam Ürün Miktarı (ton)", _r(h.islenen_ton, 2)),
            ("Ort. Toplam Verim (%)", _r(h.ort_toplam_verim, 2)),
            ("Ort. Batch Süresi (dk)", _r(h.ort_batch_suresi_dk, 2)),
            ("Çıkan Toplam Ürün Ortalaması (t/sa)", _r(h.cikan_ort_t_sa, 2)),
            ("Saatlik Ortalama Toplam Posa (t/sa)", _r(h.posa_saatlik_toplam_t_sa, 2)),
        ],
        columns=["Ölçü", "Değer"],
    )

    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as xw:
        headline_out.to_excel(xw, sheet_name="Özet", index=False)
        (batch_out if not batch_out.empty else pd.DataFrame(columns=list(_BATCH_HEADERS.values()))) \
            .to_excel(xw, sheet_name="Press Batch Kayıtları", index=False)
        (truck_out if not truck_out.empty else pd.DataFrame(columns=list(_TRUCK_HEADERS.values()))) \
            .to_excel(xw, sheet_name="Araç Takip", index=False)
        if not mb.empty:
            mb.to_excel(xw, sheet_name="Ön Hatlar Analiz", index=False)
        if not dpp.empty:
            dpp.to_excel(xw, sheet_name="Günlük Press Performansı", index=False)
        stats_out.to_excel(xw, sheet_name="Araç İstatistikleri", index=False)
        _autofit(xw)
    return buf.getvalue()


def export_filename() -> str:
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M")
    return f"Uretim_Paneli_{stamp}.xlsx"


def _r(v, d: int = 1):
    return None if v is None else round(float(v), d)


def _autofit(writer) -> None:
    for ws in writer.book.worksheets:
        for col in ws.columns:
            width = max((len(str(c.value)) for c in col if c.value is not None), default=10)
            ws.column_dimensions[col[0].column_letter].width = min(max(width + 2, 12), 42)
