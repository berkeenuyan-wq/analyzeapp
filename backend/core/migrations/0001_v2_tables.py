"""0001 — v2 additive tables.

Creates the presentation/layout tables from docs/ARCHITECTURE.md §4.2. Purely
additive: the frozen core tables (``batch``, ``truck``, ``lab``, ``meta``,
``alarm_ack``) are untouched. ``schema_migrations`` itself is managed by the
runner.
"""
from __future__ import annotations

import sqlite3

VERSION = 1

_SQL = """
CREATE TABLE IF NOT EXISTS sheet (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL UNIQUE,
    kind          TEXT NOT NULL,              -- 'core' | 'custom'
    source_table  TEXT,                       -- kind='core': 'batch'|'truck'|'lab'
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sheet_column (
    sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
    key           TEXT NOT NULL,
    label         TEXT NOT NULL,
    type          TEXT NOT NULL,              -- text|number|int|date|time|bool
    position      INTEGER NOT NULL,
    width         INTEGER,
    hidden        INTEGER NOT NULL DEFAULT 0,
    is_extra      INTEGER NOT NULL DEFAULT 0,
    format_json   TEXT,
    PRIMARY KEY (sheet_id, key)
);

CREATE TABLE IF NOT EXISTS sheet_cell_format (
    sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
    row_key       TEXT NOT NULL,
    col_key       TEXT NOT NULL,
    format_json   TEXT NOT NULL,
    PRIMARY KEY (sheet_id, row_key, col_key)
);

CREATE TABLE IF NOT EXISTS custom_row (
    id            INTEGER PRIMARY KEY,
    sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL,
    data_json     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sheet_extra_cell (
    sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
    row_key       TEXT NOT NULL,
    col_key       TEXT NOT NULL,
    value         TEXT,
    PRIMARY KEY (sheet_id, row_key, col_key)
);

CREATE TABLE IF NOT EXISTS dashboard_layout (
    page          TEXT NOT NULL,             -- 'overview'|'press'|'lab'|'trucks'
    widget_id     TEXT NOT NULL,
    x INTEGER, y INTEGER, w INTEGER, h INTEGER,
    config_json   TEXT NOT NULL,
    PRIMARY KEY (page, widget_id)
);

CREATE TABLE IF NOT EXISTS chart_workspace (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    layout_json   TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_sheet_column_sheet ON sheet_column (sheet_id, position);
CREATE INDEX IF NOT EXISTS ix_custom_row_sheet   ON custom_row (sheet_id, position);
"""


def upgrade(conn: sqlite3.Connection) -> None:
    # Execute statement-by-statement rather than ``executescript`` — the latter
    # issues an implicit COMMIT that would break the runner's transaction.
    for stmt in filter(str.strip, _SQL.split(";")):
        conn.execute(stmt)
