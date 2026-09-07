"""SQLite access layer.

The database holds only the two cleaned source tables; everything the dashboard
shows is derived from them in :mod:`src.metrics`. Kept deliberately small — plain
``sqlite3`` plus pandas, no ORM.
"""
from __future__ import annotations

import sqlite3

import pandas as pd

from .config import DB_PATH

_SCHEMA = """
CREATE TABLE IF NOT EXISTS batch (
    batch_no           INTEGER PRIMARY KEY,
    pres               TEXT NOT NULL,
    tarih              TEXT,              -- ISO date 'YYYY-MM-DD'
    recete             TEXT,
    baslangic          TEXT,              -- 'HH:MM:SS'
    bitis              TEXT,
    batch_suresi_dk    REAL,
    dolum_kg           REAL,
    filtrat_kg         REAL,
    fp_verim_pct       REAL,
    fp_perf_tsa        REAL,
    tank_c             REAL,
    nw_cevrim          REAL,
    nw_su_l            REAL,
    toplam_verim_pct   REAL,
    uretim_suresi_pct  REAL,
    kesinti_suresi_pct REAL,
    kalan_sure_pct     REAL,
    notlar             TEXT,
    yikama_yapildi     INTEGER,           -- 1 / 0 / NULL  (NW wash on this batch)
    bez_degisti        INTEGER,           -- 1 / 0 / NULL  (press cloth changed on this batch)
    bitis_kriteri      TEXT               -- HMI end-criteria code, e.g. 'F2/P2/NW2/E1'
);

CREATE TABLE IF NOT EXISTS truck (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih      TEXT NOT NULL,             -- ISO date
    arac_no    INTEGER NOT NULL,          -- numbered per day, not a plate
    urun       TEXT,
    miktar_kg  REAL,
    baslangic  TEXT,                      -- 'HH:MM'
    bitis      TEXT,
    sure_dk    REAL,
    hiz_kg_dk  REAL,
    bekleme_dk REAL,                      -- NULL = first truck of the day, no wait
    UNIQUE (tarih, arac_no)
);

CREATE TABLE IF NOT EXISTS lab (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih                 TEXT NOT NULL,     -- ISO date 'YYYY-MM-DD' (Üretim Tarihi)
    pres_no               INTEGER NOT NULL DEFAULT 0,  -- 1 / 2 (PRES NO); 0 = belirtilmemiş
    kontrol_saati         TEXT,              -- 'HH:MM' juice sample time
    urun                  TEXT,              -- Ürün Adı (ELMA)
    lot_no                TEXT,
    urun_alinan_tank_no   INTEGER,           -- Ürün Alınan İşleme Tankı No
    sikim_brix            REAL,              -- Sıkım Brix (°Bx)
    sikim_ph              REAL,              -- Sıkım pH
    sikim_asitlik         REAL,              -- Sıkım Asitlik (unit unconfirmed)
    posa_kontrol_saati    TEXT,              -- 'HH:MM' pomace sample time
    posa_brix             REAL,              -- Posa Brix (°Bx) — low = good extraction
    posa_nem_pct          REAL,              -- Posa Nem (m/w %)
    pulp_pct              REAL,              -- Pulp (% w/w)
    giris_pulp            REAL,              -- Giriş Pulp (mL/15 mL veya % v/v)
    notlar                TEXT,
    UNIQUE (tarih, pres_no, kontrol_saati)
);

CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
);

-- Acknowledged alarms (Alarmlar page). Independent of the source tables, so it
-- survives a re-ingest: an alarm stays silenced until its content fingerprint
-- (encoded in alarm_id) changes.
CREATE TABLE IF NOT EXISTS alarm_ack (
    alarm_id TEXT PRIMARY KEY,
    ack_at   TEXT NOT NULL              -- ISO timestamp
);

CREATE INDEX IF NOT EXISTS ix_batch_tarih ON batch (tarih);
CREATE INDEX IF NOT EXISTS ix_batch_pres  ON batch (pres);
CREATE INDEX IF NOT EXISTS ix_truck_tarih ON truck (tarih);
CREATE INDEX IF NOT EXISTS ix_lab_tarih   ON lab (tarih);
"""


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, detect_types=0)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn


# Columns added after the first schema shipped — created on older DBs via ALTER.
_BATCH_ADDED_COLUMNS = {
    "bez_degisti": "INTEGER",
    "bitis_kriteri": "TEXT",
}


def ensure_schema(conn: sqlite3.Connection | None = None) -> None:
    own = conn is None
    conn = conn or connect()
    try:
        conn.executescript(_SCHEMA)
        have = {r[1] for r in conn.execute("PRAGMA table_info(batch)")}
        for col, decl in _BATCH_ADDED_COLUMNS.items():
            if col not in have:
                conn.execute(f"ALTER TABLE batch ADD COLUMN {col} {decl}")
        conn.commit()
    finally:
        if own:
            conn.close()


def is_ready() -> bool:
    """True when the DB exists and has at least one batch row."""
    if not DB_PATH.exists():
        return False
    try:
        with connect() as conn:
            ensure_schema(conn)
            return conn.execute("SELECT COUNT(*) FROM batch").fetchone()[0] > 0
    except sqlite3.Error:
        return False


# --- meta -------------------------------------------------------------------- #
def set_meta(conn: sqlite3.Connection, key: str, value: str, *, cur=None) -> None:
    (cur or conn).execute(
        "INSERT INTO meta (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )


def get_meta(key: str, default: str | None = None) -> str | None:
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        return row[0] if row else default


def put_meta(key: str, value: str) -> None:
    """Standalone upsert into ``meta`` (opens its own connection)."""
    with connect() as conn:
        ensure_schema(conn)
        set_meta(conn, key, value)
        conn.commit()


def del_meta(key: str) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM meta WHERE key = ?", (key,))
        conn.commit()


# --- alarm acknowledgements ---------------------------------------------------- #
def ack_alarm(alarm_id: str) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute(
            "INSERT INTO alarm_ack (alarm_id, ack_at) VALUES (?, ?) "
            "ON CONFLICT(alarm_id) DO NOTHING",
            (alarm_id, pd.Timestamp.now().isoformat(timespec="seconds")),
        )
        conn.commit()


def unack_alarm(alarm_id: str) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM alarm_ack WHERE alarm_id = ?", (alarm_id,))
        conn.commit()


def acked_alarms() -> dict[str, str]:
    """``alarm_id -> ack timestamp`` for every acknowledged alarm."""
    with connect() as conn:
        ensure_schema(conn)
        return {r[0]: r[1] for r in conn.execute("SELECT alarm_id, ack_at FROM alarm_ack")}


def clear_alarm_acks() -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM alarm_ack")
        conn.commit()


# --- typed reads ----------------------------------------------------------- #
def batches() -> pd.DataFrame:
    """All batch rows, parsed dtypes, ordered by date then start time."""
    with connect() as conn:
        ensure_schema(conn)
        df = pd.read_sql_query("SELECT * FROM batch", conn)
    if not df.empty:
        df["tarih"] = pd.to_datetime(df["tarih"], errors="coerce")
        df = df.sort_values(["tarih", "baslangic", "batch_no"]).reset_index(drop=True)
    return df


def trucks() -> pd.DataFrame:
    """All truck rows. ``bekleme_dk`` is always **recomputed** from the gap
    between each truck's start and the previous truck's end that day — the
    stored/imported value is ignored (there is no manual waiting-time entry)."""
    with connect() as conn:
        ensure_schema(conn)
        df = pd.read_sql_query("SELECT * FROM truck", conn)
    if not df.empty:
        df["tarih"] = pd.to_datetime(df["tarih"], errors="coerce")
        df = df.sort_values(["tarih", "arac_no"]).reset_index(drop=True)
        df = compute_bekleme(df)
    return df


def _to_minutes(t) -> float | None:
    if t is None or (isinstance(t, float) and pd.isna(t)):
        return None
    s = str(t).strip()
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            import datetime as _dt
            x = _dt.datetime.strptime(s, fmt)
            return x.hour * 60 + x.minute + x.second / 60
        except ValueError:
            continue
    return None


def compute_bekleme(df: pd.DataFrame) -> pd.DataFrame:
    """Per day, order by start time; waiting = this start − previous end (min).
    First truck of the day → NA. Overlaps clamp to 0."""
    df = df.copy()
    df["bekleme_dk"] = pd.NA
    if df.empty:
        df["bekleme_dk"] = pd.to_numeric(df["bekleme_dk"], errors="coerce")
        return df
    for _day, grp in df.groupby(df["tarih"].dt.date):
        order = grp.assign(_s=grp["baslangic"].map(_to_minutes)).sort_values(
            ["_s", "arac_no"], kind="stable"
        )
        prev_end = None
        for i in order.index:
            start = _to_minutes(df.at[i, "baslangic"])
            if prev_end is not None and start is not None:
                df.at[i, "bekleme_dk"] = max(round(start - prev_end), 0)
            end = _to_minutes(df.at[i, "bitis"])
            if end is not None:
                prev_end = end if prev_end is None else max(prev_end, end)
    df["bekleme_dk"] = pd.to_numeric(df["bekleme_dk"], errors="coerce")
    return df


def labs() -> pd.DataFrame:
    """All lab (Pres Kalite Kontrolleri) rows, ordered by date then sample time."""
    with connect() as conn:
        ensure_schema(conn)
        df = pd.read_sql_query("SELECT * FROM lab", conn)
    if not df.empty:
        df["tarih"] = pd.to_datetime(df["tarih"], errors="coerce")
        df = df.sort_values(
            ["tarih", "kontrol_saati", "pres_no", "id"]
        ).reset_index(drop=True)
    return df


def lab_count() -> int:
    with connect() as conn:
        ensure_schema(conn)
        return conn.execute("SELECT COUNT(*) FROM lab").fetchone()[0]


def insert_lab(rec: dict) -> None:
    """Upsert one lab row keyed by (tarih, pres_no, kontrol_saati)."""
    cols = [c for c in rec if c != "id"]
    with connect() as conn:
        ensure_schema(conn)
        conn.execute(
            f"INSERT INTO lab ({','.join(cols)}) VALUES ({','.join('?' * len(cols))}) "
            f"ON CONFLICT(tarih, pres_no, kontrol_saati) DO UPDATE SET "
            + ", ".join(
                f"{c}=excluded.{c}"
                for c in cols
                if c not in ("tarih", "pres_no", "kontrol_saati")
            ),
            [rec[c] for c in cols],
        )
        conn.commit()


def get_lab(lab_id: int) -> dict | None:
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute("SELECT * FROM lab WHERE id = ?", (lab_id,)).fetchone()
        return dict(row) if row else None


def delete_lab(lab_id: int) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM lab WHERE id = ?", (lab_id,))
        conn.commit()


def lab_keys() -> list[int]:
    with connect() as conn:
        ensure_schema(conn)
        return [
            r[0]
            for r in conn.execute("SELECT id FROM lab ORDER BY id DESC").fetchall()
        ]


def insert_batch(rec: dict) -> None:
    cols = [c for c in rec if rec[c] is not None or c in ("notlar",)]
    with connect() as conn:
        ensure_schema(conn)
        conn.execute(
            f"INSERT INTO batch ({','.join(cols)}) VALUES ({','.join('?' * len(cols))}) "
            f"ON CONFLICT(batch_no) DO UPDATE SET "
            + ", ".join(f"{c}=excluded.{c}" for c in cols if c != "batch_no"),
            [rec[c] for c in cols],
        )
        conn.commit()


def insert_truck(rec: dict) -> None:
    cols = list(rec)
    with connect() as conn:
        ensure_schema(conn)
        conn.execute(
            f"INSERT INTO truck ({','.join(cols)}) VALUES ({','.join('?' * len(cols))}) "
            f"ON CONFLICT(tarih, arac_no) DO UPDATE SET "
            + ", ".join(f"{c}=excluded.{c}" for c in cols if c not in ("tarih", "arac_no")),
            [rec[c] for c in cols],
        )
        conn.commit()


def next_batch_no() -> int:
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute("SELECT MAX(batch_no) FROM batch").fetchone()
        return (row[0] or 0) + 1


# --- single-row reads / deletes (used by the edit panel) ------------------- #
def get_batch(batch_no: int) -> dict | None:
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute("SELECT * FROM batch WHERE batch_no = ?", (batch_no,)).fetchone()
        return dict(row) if row else None


def get_truck(tarih: str, arac_no: int) -> dict | None:
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute(
            "SELECT * FROM truck WHERE tarih = ? AND arac_no = ?", (tarih, arac_no)
        ).fetchone()
        return dict(row) if row else None


def delete_batch(batch_no: int) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM batch WHERE batch_no = ?", (batch_no,))
        conn.commit()


def delete_truck(tarih: str, arac_no: int) -> None:
    with connect() as conn:
        ensure_schema(conn)
        conn.execute("DELETE FROM truck WHERE tarih = ? AND arac_no = ?", (tarih, arac_no))
        conn.commit()


def truck_keys() -> list[tuple[str, int]]:
    """(tarih ISO, arac_no) for every truck row, newest first."""
    with connect() as conn:
        ensure_schema(conn)
        return [
            (r[0], r[1])
            for r in conn.execute(
                "SELECT tarih, arac_no FROM truck ORDER BY tarih DESC, arac_no DESC"
            ).fetchall()
        ]


def batch_keys() -> list[int]:
    with connect() as conn:
        ensure_schema(conn)
        return [
            r[0]
            for r in conn.execute("SELECT batch_no FROM batch ORDER BY batch_no DESC").fetchall()
        ]
