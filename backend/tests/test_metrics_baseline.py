"""Frozen metric baseline (docs/RULES.md §7–8).

These numbers are the reconciled v1 output on the seed data. A refactor that
moves any of them is a bug until the user confirms the new value. The
workbook's own pre-computed cells (Ort. Toplam Verim 91.24, Ort. Batch
Süresi 115.06) are deliberately *not* what we assert — ``metrics.py``
recomputes and ignores them.
"""
from __future__ import annotations

from collections.abc import Callable

import pytest

from backend.core import config, db
from backend.domain import metrics
from backend.domain.metrics import _secs


# --- headline ------------------------------------------------------------- #
def test_headline_reconciled_values() -> None:
    h = metrics.headline()
    assert h.batch_count == 24
    assert h.islenen_ton == pytest.approx(349.643, abs=1e-3)
    assert h.ort_toplam_verim == pytest.approx(91.05, abs=0.02)
    assert h.ort_batch_suresi_dk == pytest.approx(112.71, abs=0.02)
    assert h.cikan_ort_t_sa == pytest.approx(13.1481, abs=1e-3)
    assert h.posa_saatlik_toplam_t_sa == pytest.approx(2.3320, abs=1e-3)


def test_headline_is_not_the_workbook_stale_value() -> None:
    h = metrics.headline()
    assert h.ort_toplam_verim is not None and h.ort_batch_suresi_dk is not None
    assert abs(h.ort_toplam_verim - 91.24) > 0.1  # stale sheet value
    assert abs(h.ort_batch_suresi_dk - 115.06) > 1.0  # stale sheet value


def test_per_press_rollup() -> None:
    p1, p2 = metrics.both_presses()
    assert (p1.batches, p2.batches) == (13, 11)
    assert p1.ort_toplam_verim == pytest.approx(90.3923, abs=1e-3)
    assert p2.ort_toplam_verim == pytest.approx(91.8182, abs=1e-3)


# --- constants ---------------------------------------------------------- #
def test_fark_tolerance_frozen() -> None:
    assert config.FARK_TOLERANCE == 5.0


def test_lab_specs_not_confirmed() -> None:
    assert config.LAB_SPECS_CONFIRMED is False


def test_lab_measures_registry_frozen() -> None:
    assert [m["key"] for m in config.LAB_MEASURES] == [
        "sikim_brix",
        "sikim_ph",
        "sikim_asitlik",
        "posa_brix",
        "posa_nem_pct",
    ]
    assert [m["label"] for m in config.LAB_MEASURES] == [
        "Sıkım Brix",
        "Sıkım pH",
        "Sıkım Asitlik",
        "Posa Brix",
        "Posa Nem",
    ]


# --- threshold bands (exactly as config.py) ---------------------------- #
@pytest.mark.parametrize(
    ("fn", "value", "expected"),
    [
        (config.tone_toplam_verim, 93.0, "good"),
        (config.tone_toplam_verim, 92.9, "caution"),
        (config.tone_toplam_verim, 89.9, "bad"),
        (config.tone_toplam_verim, None, "neutral"),
        (config.tone_fp_verim, 86.0, "good"),
        (config.tone_fp_verim, 85.0, "caution"),
        (config.tone_fp_verim, 82.0, "bad"),
        (config.tone_tank, 23.0, "good"),
        (config.tone_tank, 28.0, "caution"),
        (config.tone_tank, 28.1, "bad"),
        (config.tone_kesinti, 4.9, "good"),
        (config.tone_kesinti, 10.0, "caution"),
        (config.tone_kesinti, 10.1, "bad"),
        (config.tone_fark, 5.0, "good"),
        (config.tone_fark, 5.01, "bad"),
        (config.tone_fark, -5.01, "bad"),
        (config.tone_bekleme, 15.0, "good"),
        (config.tone_bekleme, 15.1, "caution"),
        (config.tone_bekleme, 60.1, "bad"),
    ],
)
def test_tone_bands(
    fn: Callable[[float | None], str], value: float | None, expected: str
) -> None:
    assert fn(value) == expected


def test_sikim_asitlik_has_no_band() -> None:
    for v in (0.0, 2.5, 10.0, None):
        assert config.tone_sikim_asitlik(v) == "neutral"


# --- lab reading -> batch window matching rule ------------------------- #
def test_lab_window_matching_counts() -> None:
    lr = metrics.lab_readings()
    assert len(lr) == 34
    assert int(lr["batch_no"].notna().sum()) == 33  # one row stays 'eşleşmedi'


def test_lab_window_matched_rows_are_inside_their_batch_window() -> None:
    lr = metrics.lab_readings()
    batches = db.batches().set_index("batch_no")
    matched = lr[lr["batch_no"].notna()]
    assert len(matched) == 33
    for row in matched.itertuples():
        b = batches.loc[int(row.batch_no)]  # type: ignore[arg-type]
        assert b["pres"] == row.pres  # same press
        assert b["tarih"].date() == row.tarih.date()  # type: ignore[union-attr]
        control = _secs(str(row.kontrol_saati))
        start = _secs(str(b["baslangic"]))
        end = _secs(str(b["bitis"]))
        assert control is not None and start is not None and end is not None
        assert start <= control <= end  # inside window


def test_lab_summary_frozen() -> None:
    s = metrics.lab_summary()
    assert (s.n_readings, s.n_matched, s.n_days) == (34, 33, 3)
    assert s.means["sikim_brix"] == pytest.approx(10.7656, abs=1e-3)
    assert s.means["posa_nem_pct"] == pytest.approx(69.0463, abs=1e-3)
