"""Turkish-locale number, date and duration formatting.

Rules from the design system: dot thousands, comma decimal, unit outside the
value (`1.284,6 ton`), `−` (U+2212) for negatives so it aligns with tabular
figures, `·` as the metadata separator, dates as `12 Eyl 2026`, times 24-hour.
Python's `locale` module is not reliable across platforms, so this is done by
hand.
"""
from __future__ import annotations

import datetime as _dt
import math

MINUS = "−"  # U+2212, not a hyphen
SEP = " · "  # middle dot with spaces

_MONTHS_SHORT = [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
]
_MONTHS_LONG = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
]


def _group(int_digits: str) -> str:
    """Insert dot thousands separators into a run of digits."""
    neg = int_digits.startswith("-")
    int_digits = int_digits.lstrip("-")
    parts = []
    while len(int_digits) > 3:
        parts.insert(0, int_digits[-3:])
        int_digits = int_digits[:-3]
    parts.insert(0, int_digits)
    out = ".".join(parts)
    return (MINUS + out) if neg else out


def nf(value: float | int | None, decimals: int = 1, *, dash: str = "—") -> str:
    """Number with fixed decimals, Turkish separators. None/NaN -> dash."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return dash
    q = round(float(value), decimals)
    if q == 0:
        q = 0.0  # kill negative zero
    s = f"{q:.{decimals}f}"
    neg = s.startswith("-")
    s = s.lstrip("-")
    if "." in s:
        int_part, frac = s.split(".")
        body = f"{_group(int_part)},{frac}"
    else:
        body = _group(s)
    return (MINUS + body) if neg else body


def ni(value: float | int | None, *, dash: str = "—") -> str:
    """Integer with thousands separators. None/NaN -> dash."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return dash
    return _group(str(int(round(float(value)))))


def pct(value: float | None, decimals: int = 1, *, dash: str = "—") -> str:
    """Percent in a metric slot: `7,4%` (sign tight against the number)."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return dash
    return nf(value, decimals) + "%"


def pct_prose(value: float | None, decimals: int = 1, *, dash: str = "—") -> str:
    """Percent in running Turkish prose: `%7,4`."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return dash
    return "%" + nf(value, decimals)


def signed(value: float | None, decimals: int = 1) -> str:
    """Delta value with an explicit +/− and the U+2212 minus."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "—"
    if value > 0:
        return "+" + nf(value, decimals)
    if value < 0:
        return MINUS + nf(abs(value), decimals)
    return nf(0, decimals)


def date_short(d: _dt.date | _dt.datetime | str | None) -> str:
    """`12 Eyl 2026`."""
    d = _coerce_date(d)
    if d is None:
        return "—"
    return f"{d.day} {_MONTHS_SHORT[d.month - 1]} {d.year}"


def date_long(d: _dt.date | _dt.datetime | str | None) -> str:
    """`12 Eylül 2026`."""
    d = _coerce_date(d)
    if d is None:
        return "—"
    return f"{d.day} {_MONTHS_LONG[d.month - 1]} {d.year}"


def date_range(a, b) -> str:
    """`31 Ağu – 4 Eyl 2026`, collapsing shared year/month."""
    a, b = _coerce_date(a), _coerce_date(b)
    if a is None or b is None:
        return "—"
    if a == b:
        return date_short(a)
    left = f"{a.day} {_MONTHS_SHORT[a.month - 1]}"
    if a.year != b.year:
        left += f" {a.year}"
    return f"{left} – {b.day} {_MONTHS_SHORT[b.month - 1]} {b.year}"


def clock(t: _dt.time | _dt.datetime | str | None, *, seconds: bool = False) -> str:
    """24-hour `14:20` (or `14:20:05`)."""
    if t is None:
        return "—"
    if isinstance(t, str):
        return t if not seconds else t
    if isinstance(t, _dt.datetime):
        t = t.time()
    return t.strftime("%H:%M:%S" if seconds else "%H:%M")


def hm_from_seconds(total_seconds: float | None) -> str:
    """A duration in seconds -> `H:MM:SS` (used for the press start–end span)."""
    if total_seconds is None or (isinstance(total_seconds, float) and math.isnan(total_seconds)):
        return "—"
    total = int(round(total_seconds))
    sign = ""
    if total < 0:
        sign, total = MINUS, -total
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    return f"{sign}{h}:{m:02d}:{s:02d}"


def _coerce_date(d):
    if d is None:
        return None
    if isinstance(d, _dt.datetime):
        return d.date()
    if isinstance(d, _dt.date):
        return d
    if isinstance(d, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d.%m.%Y"):
            try:
                return _dt.datetime.strptime(d.strip(), fmt).date()
            except ValueError:
                continue
    return None
