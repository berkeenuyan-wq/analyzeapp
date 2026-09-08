"""Tiny forward-only migration runner.

Rules (docs/RULES.md §2, docs/ARCHITECTURE.md §8):

* every migration is a ``NNNN_description.py`` file in this package exposing
  ``VERSION: int`` and ``def upgrade(conn: sqlite3.Connection) -> None``;
* migrations run in ascending order, each in its own transaction, and are
  recorded in ``schema_migrations``;
* an applied migration file is never edited — new needs get a new file;
* the app refuses to start if the DB has a version newer than the code.
"""
from __future__ import annotations

import importlib
import logging
import pkgutil
import re
import sqlite3
from collections.abc import Callable
from dataclasses import dataclass
from typing import cast

logger = logging.getLogger(__name__)

_PKG = __package__ or "backend.core.migrations"

_FILENAME_RE = re.compile(r"^(\d{4})_[a-z0-9_]+$")


class MigrationError(RuntimeError):
    """Raised when the DB cannot be brought to the code's schema version."""


@dataclass(frozen=True)
class Migration:
    version: int
    module_name: str

    def load_upgrade(self) -> Callable[[sqlite3.Connection], None]:
        mod = importlib.import_module(f"{_PKG}.{self.module_name}")
        declared = getattr(mod, "VERSION", None)
        if declared != self.version:
            raise MigrationError(
                f"{self.module_name}: VERSION {declared!r} != filename {self.version}"
            )
        upgrade = getattr(mod, "upgrade", None)
        if not callable(upgrade):
            raise MigrationError(f"{self.module_name}: no upgrade(conn) callable")
        return cast(Callable[[sqlite3.Connection], None], upgrade)


def discover() -> list[Migration]:
    """All migration modules in this package, ascending by version."""
    pkg = importlib.import_module(_PKG)
    found: list[Migration] = []
    for info in pkgutil.iter_modules(list(pkg.__path__)):
        m = _FILENAME_RE.match(info.name)
        if m:
            found.append(Migration(int(m.group(1)), info.name))
    found.sort(key=lambda mig: mig.version)
    versions = [mig.version for mig in found]
    if len(versions) != len(set(versions)):
        raise MigrationError(f"duplicate migration versions: {versions}")
    return found


def _applied_versions(conn: sqlite3.Connection) -> set[int]:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "  version INTEGER PRIMARY KEY,"
        "  applied_at TEXT NOT NULL"
        ")"
    )
    return {r[0] for r in conn.execute("SELECT version FROM schema_migrations")}


def run_migrations(conn: sqlite3.Connection) -> list[int]:
    """Bring ``conn`` up to the latest code migration. Returns versions applied.

    Idempotent: re-running with nothing pending is a no-op.
    """
    migrations = discover()
    code_version = migrations[-1].version if migrations else 0

    applied = _applied_versions(conn)
    conn.commit()

    db_version = max(applied) if applied else 0
    if db_version > code_version:
        raise MigrationError(
            f"database schema version {db_version} is newer than this build "
            f"(knows up to {code_version}); refusing to start"
        )

    ran: list[int] = []
    for mig in migrations:
        if mig.version in applied:
            continue
        upgrade = mig.load_upgrade()
        logger.info("applying migration", extra={"version": mig.version})
        try:
            conn.execute("BEGIN")
            upgrade(conn)
            conn.execute(
                "INSERT INTO schema_migrations (version, applied_at) "
                "VALUES (?, datetime('now'))",
                (mig.version,),
            )
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        ran.append(mig.version)
    return ran
