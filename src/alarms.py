"""Cross-section alarm feed.

Every warning the dashboard raises is gathered here, in one place, and shown on
the **Alarmlar** page instead of being pinned to the top of each section. An
alarm's ``id`` is a hash of its source, kind and a fingerprint of the offending
values — acknowledging it (:func:`db.ack_alarm`) hides it until that fingerprint
changes, i.e. until the situation materially moves.
"""
from __future__ import annotations

import hashlib
import datetime as dt
from dataclasses import dataclass

import pandas as pd

from . import db, fmt, metrics
from .config import FARK_TOLERANCE, LAB_MEASURES, LAB_SPECS_CONFIRMED

_SOURCE_LABEL = {
    "genel": "Genel Bakış",
    "pres": "Pres Performansı",
    "posa": "Posa Analizi",
    "arac": "Araç Lojistiği",
    "lab": "Laboratuvar",
}
_TONE_RANK = {"bad": 0, "caution": 1, "good": 2, "info": 3}


@dataclass(frozen=True)
class Alarm:
    id: str
    source: str
    source_label: str
    tone: str            # "bad" | "caution"
    title: str
    body: str
    sort_key: str        # ISO date or "" — newest first within a tone


def _mk(source: str, kind: str, fingerprint: str, tone: str,
        title: str, body: str, sort_key: str = "") -> Alarm:
    raw = f"{source}|{kind}|{fingerprint}"
    aid = hashlib.md5(raw.encode("utf-8")).hexdigest()[:12]
    return Alarm(aid, source, _SOURCE_LABEL.get(source, source),
                 tone, title, body, sort_key)


def collect() -> list[Alarm]:
    """Every active-or-acknowledgeable alarm, sorted bad → caution, newest first."""
    out: list[Alarm] = []
    for fn in (_mass_balance_alarms, _lab_alarms):
        try:
            out.extend(fn())
        except Exception:  # noqa: BLE001 — a broken collector must not blank the page
            continue
    out.sort(key=lambda a: (_TONE_RANK.get(a.tone, 9), _neg(a.sort_key)))
    return out


def active_count() -> int:
    acked = db.acked_alarms()
    return sum(1 for a in collect() if a.id not in acked)


def _neg(s: str) -> str:
    """Sort helper: makes a plain string sort descending."""
    return "".join(chr(255 - ord(c)) for c in s) if s else ""


# --------------------------------------------------------------------------- #
# collectors
# --------------------------------------------------------------------------- #
def _mass_balance_alarms() -> list[Alarm]:
    """Araç vs pres kütle dengesi — one alarm per day outside ±tolerance.

    Genel Bakış and Posa Analizi both raised this from the same data; here it is
    a single kind so the two are not shown twice.
    """
    mb = metrics.mass_balance()
    if mb.empty:
        return []
    rows = mb[mb["tolerans_disi"]].to_dict("records")
    out = []
    for r in rows:
        day = r["tarih"]
        iso = day.isoformat() if isinstance(day, (dt.date, dt.datetime)) else str(day)
        out.append(_mk(
            "posa", "mass_balance",
            f"{iso}:{fmt.nf(r['fark_pct'], 1)}",
            "bad",
            "Kütle dengesi toleransın dışında",
            f"{fmt.date_short(day)} için araç–pres farkı "
            f"{fmt.pct_prose(r['fark_pct'])} ({fmt.ni(r['fark_kg'])} kg) — "
            f"tolerans ±%{FARK_TOLERANCE:g}.",
            sort_key=iso,
        ))
    return out


def _lab_alarms() -> list[Alarm]:
    lr = metrics.lab_readings()
    if lr.empty:
        return []
    out: list[Alarm] = []
    summ = metrics.lab_summary()
    comp = metrics.lab_completeness()

    # --- readings outside the (provisional) quality bands ------------------
    if not summ.out_of_spec.empty:
        r = summ.out_of_spec.iloc[-1]
        bad_bits = [
            f"{m['label']} {fmt.nf(r[m['key']], m['decimals'])}"
            for m in LAB_MEASURES
            if m["key"] in r and m["tone"](r[m["key"]]) == "bad"
        ]
        saat = r["kontrol_saati"] if isinstance(r["kontrol_saati"], str) else ""
        last_iso = _iso(r["tarih"])
        suffix = "" if LAB_SPECS_CONFIRMED else " · eşikler geçici"
        out.append(_mk(
            "lab", "out_of_spec",
            f"{len(summ.out_of_spec)}:{last_iso}:{saat}",
            "bad",
            f"{len(summ.out_of_spec)} ölçüm eşik dışında",
            f"Son: {fmt.date_short(r['tarih'])} {saat} · "
            + " · ".join(bad_bits) + suffix,
            sort_key=last_iso,
        ))

    # --- readings missing a core (juice) value ---------------------------
    if comp.n_incomplete:
        out.append(_mk(
            "lab", "incomplete",
            f"{comp.n_incomplete}:{comp.worst_field}:{fmt.nf(comp.core_pct, 0)}",
            "caution",
            f"{comp.n_incomplete} ölçümde sıkım değeri eksik",
            "Sıkım Brix / pH / Asitlik alanlarının en az biri boş · en sık boş: "
            f"{comp.worst_field or '—'} · sıkım doldurma oranı "
            f"%{fmt.nf(comp.core_pct, 0)}",
        ))

    # --- readings that did not bind to a batch --------------------------
    unmatched = lr[lr["batch_no"].isna()]
    if not unmatched.empty:
        keys = sorted(
            f"{_iso(x['tarih'])}/{x.get('kontrol_saati') or ''}/{x.get('pres_no')}"
            for x in unmatched.to_dict("records")
        )
        out.append(_mk(
            "lab", "unmatched", ";".join(keys),
            "caution",
            f"{len(unmatched)} ölçüm batch ile eşleşmedi",
            "Aynı gün + pres + saat penceresine düşen batch bulunamadı — "
            "Kalite Ölçüm Tablosu'ndan düzeltin · "
            + " · ".join(unmatched_bits(unmatched)),
        ))
    return out


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def unmatched_bits(unmatched: pd.DataFrame) -> list[str]:
    """`'31 Ağu 2026 10:40 Pres 2 (o gün/pres için batch penceresi yok)'` per row."""
    out = []
    for r in unmatched.sort_values(["tarih", "kontrol_saati"]).to_dict("records"):
        saat = r["kontrol_saati"] if (
            isinstance(r["kontrol_saati"], str) and r["kontrol_saati"]
        ) else None
        pres = r.get("pres")
        has_pres = pres is not None and not pd.isna(pres)
        if not has_pres:
            reason = "pres bilgisi yok"
        elif not saat:
            reason = "kontrol saati yok"
        else:
            reason = "o gün/pres için batch penceresi yok"
        parts = [fmt.date_short(r["tarih"])]
        if saat:
            parts.append(saat)
        if has_pres:
            parts.append(str(pres))
        out.append(f"{' '.join(parts)} ({reason})")
    return out


def _iso(v) -> str:
    try:
        return pd.Timestamp(v).date().isoformat()
    except (ValueError, TypeError):
        return str(v)
