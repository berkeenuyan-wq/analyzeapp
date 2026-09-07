"""Read the plant workbook, clean it, and load the two source tables to SQLite.

Only the two *source* tables are ingested — ``Press Batch Kayıtları`` and the
``Araç Takip`` truck log. Every derived sheet in the workbook (Press Analiz,
Ön Hatlar Analiz, the İstatistikler block) is recomputed at query time in
``metrics.py`` and is never read as truth.

Usable two ways:

* CLI, for the one-time (or full-refresh) load::

      python -m src.ingest [path/to/Production_Stats.xlsx] [--replace|--upsert]

* From the app's "Excel'den İçe Aktar" feature, which calls
  :func:`read_and_clean` for a preview and then :func:`load_frames`.
"""
from __future__ import annotations

import argparse
import datetime as dt
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from . import db
from .config import SEED_XLSX

SHEET_BATCH = "Press Batch Kayıtları"
SHEET_TRUCK = "Araç Takip"

# Workbook column order for the batch sheet (row 2 headers), source columns only.
BATCH_COLUMNS = [
    "pres", "batch_no", "tarih", "recete", "baslangic", "bitis", "batch_suresi_dk",
    "dolum_kg", "filtrat_kg", "fp_verim_pct", "fp_perf_tsa", "tank_c",
    "nw_cevrim", "nw_su_l",
    "toplam_verim_pct", "uretim_suresi_pct", "kesinti_suresi_pct", "kalan_sure_pct",
    "notlar", "yikama_yapildi",
]
BATCH_NUMERIC = [
    "batch_suresi_dk", "dolum_kg", "filtrat_kg", "fp_verim_pct", "fp_perf_tsa",
    "tank_c", "nw_cevrim", "nw_su_l", "toplam_verim_pct", "uretim_suresi_pct",
    "kesinti_suresi_pct", "kalan_sure_pct",
]

TRUCK_COLUMNS = [
    "tarih", "arac_no", "urun", "miktar_kg", "baslangic", "bitis",
    "sure_dk", "hiz_kg_dk", "bekleme_dk",
]
TRUCK_NUMERIC = ["miktar_kg", "sure_dk", "hiz_kg_dk", "bekleme_dk"]


# --------------------------------------------------------------------------- #
# report
# --------------------------------------------------------------------------- #
@dataclass
class ImportReport:
    """What the cleaner changed, kept, and rejected — surfaced before any write."""

    source: str = ""
    batch_rows: int = 0
    truck_rows: int = 0
    fixes: list[str] = field(default_factory=list)      # silent corrections applied
    warnings: list[str] = field(default_factory=list)   # kept, but the operator should look
    rejected: list[str] = field(default_factory=list)   # dropped rows, with the reason

    def add_fix(self, msg: str) -> None:
        self.fixes.append(msg)

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)

    def add_rejected(self, msg: str) -> None:
        self.rejected.append(msg)

    def summary_tr(self) -> str:
        return (
            f"{self.batch_rows} batch · {self.truck_rows} araç kaydı · "
            f"{len(self.fixes)} düzeltme · {len(self.warnings)} uyarı · "
            f"{len(self.rejected)} reddedilen satır"
        )


@dataclass
class CleanResult:
    batches: pd.DataFrame
    trucks: pd.DataFrame
    report: ImportReport


# --------------------------------------------------------------------------- #
# coercion helpers
# --------------------------------------------------------------------------- #
def _iso_date(value) -> str | None:
    if value is None or value == "":
        return None
    if isinstance(value, dt.datetime):
        return value.date().isoformat()
    if isinstance(value, dt.date):
        return value.isoformat()
    s = str(value).strip()
    for f in ("%Y-%m-%d", "%d/%m/%Y", "%d.%m.%Y", "%m/%d/%Y"):
        try:
            return dt.datetime.strptime(s, f).date().isoformat()
        except ValueError:
            continue
    return None


def _hhmmss(value, *, seconds: bool = True) -> str | None:
    if value is None or value == "":
        return None
    if isinstance(value, dt.datetime):
        value = value.time()
    if isinstance(value, dt.time):
        return value.strftime("%H:%M:%S" if seconds else "%H:%M")
    s = str(value).strip()
    for f in ("%H:%M:%S", "%H:%M"):
        try:
            t = dt.datetime.strptime(s, f).time()
            return t.strftime("%H:%M:%S" if seconds else "%H:%M")
        except ValueError:
            continue
    return None


def _num(value) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        v = float(value)
        return None if pd.isna(v) else v
    s = str(value).strip().replace(" ", "")
    if s in {"", "-", "—", "#REF!", "#DIV/0!", "#N/A", "NaN", "None"}:
        return None
    # tolerate a Turkish-typed number ("1.234,5")
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _secs_between(start: str | None, end: str | None) -> float | None:
    if not start or not end:
        return None
    try:
        s = dt.datetime.strptime(start, "%H:%M:%S")
    except ValueError:
        s = dt.datetime.strptime(start, "%H:%M")
    try:
        e = dt.datetime.strptime(end, "%H:%M:%S")
    except ValueError:
        e = dt.datetime.strptime(end, "%H:%M")
    return (e - s).total_seconds()


# --------------------------------------------------------------------------- #
# read + clean
# --------------------------------------------------------------------------- #
def read_and_clean(path: str | Path) -> CleanResult:
    path = Path(path)
    report = ImportReport(source=path.name)
    xls = pd.read_excel(path, sheet_name=[SHEET_BATCH, SHEET_TRUCK], header=None)

    batches = _clean_batches(xls[SHEET_BATCH], report)
    trucks = _clean_trucks(xls[SHEET_TRUCK], report)
    report.batch_rows = len(batches)
    report.truck_rows = len(trucks)
    return CleanResult(batches=batches, trucks=trucks, report=report)


def _find_data_start(raw: pd.DataFrame, markers: tuple[str, ...], default: int) -> int:
    """Row index just after the one holding the column headers.

    The plant workbook has a two-row header band; a file exported by this app has
    one. Locate the header by its known labels instead of assuming a fixed offset.
    """
    want = {m.strip().lower() for m in markers}
    for i in range(min(8, len(raw))):
        cells = {str(c).strip().lower() for c in raw.iloc[i].tolist() if c is not None}
        if len(want & cells) >= 2:
            return i + 1
    return default


def _clean_batches(raw: pd.DataFrame, report: ImportReport) -> pd.DataFrame:
    start = _find_data_start(raw, ("pres", "batch no", "tarih", "reçete"), default=2)
    body = raw.iloc[start:, : len(BATCH_COLUMNS)].copy()
    body.columns = BATCH_COLUMNS
    rows: list[dict] = []
    seen: set[int] = set()

    # Optional columns only app-exported workbooks carry — located by header name
    # so the plant workbook's trailing #REF! helper columns are never mistaken
    # for them.
    hdr = raw.iloc[start - 1] if start - 1 >= 0 else pd.Series(dtype=object)

    def _col(*names: str):
        want = {n.strip().lower() for n in names}
        for j, v in enumerate(hdr.tolist()):
            if v is not None and str(v).strip().lower() in want:
                return raw.iloc[start:, j]
        return None

    bez_col = _col("bez değişti mi?", "bez degisti mi?", "bez değişti", "bez_degisti")
    kriter_col = _col("bitiş kriteri", "bitis kriteri", "bitis_kriteri")

    for idx, r in body.iterrows():
        pres = (str(r["pres"]).strip() if r["pres"] is not None else "")
        if pres in ("", "None", "nan"):
            continue  # trailing blank row

        rec: dict = {"pres": pres, "recete": _clean_str(r["recete"])}
        rec["baslangic"] = _hhmmss(r["baslangic"])
        rec["bitis"] = _hhmmss(r["bitis"])
        rec["tarih"] = _iso_date(r["tarih"])

        bn = _num(r["batch_no"])
        if bn is None:
            report.add_rejected(f"Batch No boş bir satır atlandı (pres {pres}).")
            continue
        batch_no = int(round(bn))
        if batch_no in seen:
            report.add_warning(f"Batch No {batch_no} yinelenmiş — ilk kayıt korundu.")
            continue
        seen.add(batch_no)
        rec["batch_no"] = batch_no

        for col in BATCH_NUMERIC:
            rec[col] = _num(r[col])

        # Documented scaling glitch: Üretim Süresi (%) occasionally stored as a
        # fraction (0.963 instead of 96.3). Production time is always tens of %,
        # so a sub-1.5 value is unambiguous here. Kesinti/Kalan are left alone —
        # they legitimately sit below 1.5.
        u = rec["uretim_suresi_pct"]
        if u is not None and 0 < u < 1.5:
            rec["uretim_suresi_pct"] = round(u * 100, 1)
            report.add_fix(
                f"Batch {batch_no}: Üretim Süresi %{u:g} → %{rec['uretim_suresi_pct']:g} "
                "(oran olarak girilmiş)."
            )

        if r["tarih"] is not None and rec["tarih"] is None:
            report.add_warning(f"Batch {batch_no}: tarih çözümlenemedi ({r['tarih']!r}).")

        rec["notlar"] = _clean_str(r["notlar"])
        y = (str(r["yikama_yapildi"]).strip().lower() if r["yikama_yapildi"] is not None else "")
        rec["yikama_yapildi"] = 1 if y == "evet" else 0 if y in ("hayır", "hayir") else None

        bez = str(bez_col.get(idx)).strip().lower() if bez_col is not None else ""
        rec["bez_degisti"] = 1 if bez == "evet" else 0 if bez in ("hayır", "hayir") else None
        kv = _clean_str(kriter_col.get(idx)) if kriter_col is not None else None
        rec["bitis_kriteri"] = kv if (kv and "#ref" not in kv.lower()) else None

        d, f = rec["dolum_kg"], rec["filtrat_kg"]
        if d is not None and f is not None and f > d:
            report.add_warning(
                f"Batch {batch_no}: filtrat ({f:g} kg) dolumdan ({d:g} kg) büyük — "
                "kontrol edin."
            )

        rows.append(rec)

    df = pd.DataFrame(
        rows,
        columns=["batch_no", *[c for c in BATCH_COLUMNS if c != "batch_no"],
                 "bez_degisti", "bitis_kriteri"],
    )
    return df.sort_values("batch_no").reset_index(drop=True)


def _clean_trucks(raw: pd.DataFrame, report: ImportReport) -> pd.DataFrame:
    start = _find_data_start(raw, ("tarih", "araç no", "araç no:", "miktar (kg)", "ürün"), default=2)
    body = raw.iloc[start:, : len(TRUCK_COLUMNS)].copy()
    body.columns = TRUCK_COLUMNS
    rows: list[dict] = []

    for _, r in body.iterrows():
        tarih = _iso_date(r["tarih"])
        an = _num(r["arac_no"])
        if tarih is None and an is None and _num(r["miktar_kg"]) is None:
            continue  # blank spacer row in the sideways-laid-out sheet

        if tarih is None or an is None:
            report.add_rejected(
                f"Araç kaydı atlandı — tarih/araç no eksik ({r['tarih']!r}, {r['arac_no']!r})."
            )
            continue

        rec: dict = {
            "tarih": tarih,
            "arac_no": int(round(an)),
            "urun": _clean_str(r["urun"]) or "Elma",
            "miktar_kg": _num(r["miktar_kg"]),
            "baslangic": _hhmmss(r["baslangic"], seconds=False),
            "bitis": _hhmmss(r["bitis"], seconds=False),
            "sure_dk": _num(r["sure_dk"]),
            "hiz_kg_dk": _num(r["hiz_kg_dk"]),
            "bekleme_dk": _num(r["bekleme_dk"]),  # None = first truck of the day, no wait
        }

        secs = _secs_between(rec["baslangic"], rec["bitis"])
        if secs is not None and secs <= 0:
            report.add_warning(
                f"{tarih} araç {rec['arac_no']}: bitiş başlangıçtan önce — süre kontrol edin."
            )
        elif secs is not None:
            derived_min = round(secs / 60)
            if rec["sure_dk"] is None:
                rec["sure_dk"] = derived_min
                report.add_fix(f"{tarih} araç {rec['arac_no']}: süre saatlerden hesaplandı ({derived_min} dk).")
            elif abs(rec["sure_dk"] - derived_min) > 2:
                report.add_warning(
                    f"{tarih} araç {rec['arac_no']}: yazılı süre {rec['sure_dk']:g} dk, "
                    f"saatlerden {derived_min} dk."
                )
        if rec["hiz_kg_dk"] is None and rec["miktar_kg"] and rec["sure_dk"]:
            rec["hiz_kg_dk"] = round(rec["miktar_kg"] / rec["sure_dk"], 2)

        rows.append(rec)

    df = pd.DataFrame(rows, columns=TRUCK_COLUMNS)
    return df.sort_values(["tarih", "arac_no"]).reset_index(drop=True)


def _clean_str(value) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    if s in ("", "None", "nan", "#REF!"):
        return None
    return s


# --------------------------------------------------------------------------- #
# load
# --------------------------------------------------------------------------- #
def load_frames(
    batches: pd.DataFrame,
    trucks: pd.DataFrame,
    *,
    mode: str = "replace",
    source: str = "",
    conn: sqlite3.Connection | None = None,
) -> dict[str, int]:
    """Write cleaned frames to SQLite.

    ``mode="replace"`` clears both tables first (full refresh).
    ``mode="upsert"`` merges by natural key (``batch_no``; ``tarih+arac_no``),
    so manual entries made since the last import are not lost.
    """
    own = conn is None
    conn = conn or db.connect()
    try:
        db.ensure_schema(conn)
        cur = conn.cursor()
        if mode == "replace":
            cur.execute("DELETE FROM batch")
            cur.execute("DELETE FROM truck")

        b_cols = list(batches.columns)
        cur.executemany(
            f"INSERT INTO batch ({','.join(b_cols)}) VALUES ({','.join('?' * len(b_cols))}) "
            f"ON CONFLICT(batch_no) DO UPDATE SET "
            + ", ".join(f"{c}=excluded.{c}" for c in b_cols if c != "batch_no"),
            [tuple(_py(v) for v in row) for row in batches.itertuples(index=False, name=None)],
        )
        t_cols = list(trucks.columns)
        cur.executemany(
            f"INSERT INTO truck ({','.join(t_cols)}) VALUES ({','.join('?' * len(t_cols))}) "
            f"ON CONFLICT(tarih, arac_no) DO UPDATE SET "
            + ", ".join(f"{c}=excluded.{c}" for c in t_cols if c not in ("tarih", "arac_no")),
            [tuple(_py(v) for v in row) for row in trucks.itertuples(index=False, name=None)],
        )

        now = dt.datetime.now().replace(microsecond=0).isoformat()
        db.set_meta(conn, "last_import_at", now, cur=cur)
        db.set_meta(conn, "source_filename", source or "Production_Stats.xlsx", cur=cur)
        db.set_meta(conn, "last_import_mode", mode, cur=cur)
        conn.commit()

        return {
            "batch": cur.execute("SELECT COUNT(*) FROM batch").fetchone()[0],
            "truck": cur.execute("SELECT COUNT(*) FROM truck").fetchone()[0],
        }
    finally:
        if own:
            conn.close()


def _py(v):
    """Coerce numpy/pandas scalars to plain Python for sqlite3."""
    if v is None:
        return None
    if isinstance(v, float) and pd.isna(v):
        return None
    if hasattr(v, "item"):
        return v.item()
    return v


def run(path: str | Path = SEED_XLSX, *, mode: str = "replace") -> ImportReport:
    result = read_and_clean(path)
    counts = load_frames(
        result.batches, result.trucks, mode=mode, source=Path(path).name
    )
    result.report.batch_rows = counts["batch"]
    result.report.truck_rows = counts["truck"]
    return result.report


def main() -> None:
    ap = argparse.ArgumentParser(description="Load the plant workbook into SQLite.")
    ap.add_argument("path", nargs="?", default=str(SEED_XLSX))
    ap.add_argument("--upsert", action="store_true", help="merge by key instead of full replace")
    args = ap.parse_args()

    report = run(args.path, mode="upsert" if args.upsert else "replace")
    print(f"Kaynak: {report.source}")
    print(report.summary_tr())
    for label, items in (("Düzeltmeler", report.fixes), ("Uyarılar", report.warnings), ("Reddedilenler", report.rejected)):
        if items:
            print(f"\n{label}:")
            for it in items:
                print(f"  - {it}")


if __name__ == "__main__":
    main()
