"""Migration runner: apply once, re-run is a no-op, refuse a newer DB."""
from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from backend.core.migrations import MigrationError, discover, run_migrations

_V2_TABLES = {
    "sheet",
    "sheet_column",
    "sheet_cell_format",
    "custom_row",
    "sheet_extra_cell",
    "dashboard_layout",
    "chart_workspace",
    "schema_migrations",
}


def _connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def test_apply_then_rerun_is_idempotent(tmp_path: Path) -> None:
    conn = _connect(tmp_path / "m.db")
    try:
        assert run_migrations(conn) == [1]

        tables = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
        }
        assert tables >= _V2_TABLES

        # second run touches nothing
        assert run_migrations(conn) == []
        recorded = [r[0] for r in conn.execute("SELECT version FROM schema_migrations")]
        assert recorded == [1]
    finally:
        conn.close()


def test_refuses_to_start_when_db_is_newer_than_code(tmp_path: Path) -> None:
    conn = _connect(tmp_path / "m.db")
    try:
        run_migrations(conn)
        conn.execute(
            "INSERT INTO schema_migrations (version, applied_at) "
            "VALUES (999, datetime('now'))"
        )
        conn.commit()
        with pytest.raises(MigrationError):
            run_migrations(conn)
    finally:
        conn.close()


def test_discover_returns_sorted_unique_versions() -> None:
    versions = [m.version for m in discover()]
    assert versions == sorted(versions)
    assert len(versions) == len(set(versions))
    assert versions[0] == 1
