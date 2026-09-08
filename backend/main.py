"""FastAPI application for the Üretim Paneli v2 sidecar.

Started by the Electron main process on an ephemeral loopback port
(see :mod:`backend.core.ports`). On startup it ensures the core schema,
runs forward-only migrations, and performs the first-run seed so the panel
is never empty. Binds ``127.0.0.1`` only.
"""
from __future__ import annotations

import logging
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import health, metrics
from backend.core import db
from backend.core.config import SEED_LAB_CSV, SEED_XLSX
from backend.core.migrations import run_migrations

logger = logging.getLogger("uretim.backend")

# The renderer's origin. Dev = the Vite server; packaged Electron loads the
# built files over a custom/file origin and sends ``Origin: null`` — allowed
# below. Overridable so a packaged build can pin its exact origin.
_DEV_ORIGIN = os.environ.get("UP_RENDERER_ORIGIN", "http://localhost:5173")
ALLOWED_ORIGINS = [_DEV_ORIGIN, "http://127.0.0.1:5173", "null"]


def bootstrap() -> None:
    """Idempotent: schema + migrations + first-run seed."""
    db.ensure_schema()
    with db.connect() as conn:
        applied = run_migrations(conn)
    if applied:
        logger.info("migrations applied", extra={"versions": applied})

    if not db.is_ready() and SEED_XLSX.exists():
        logger.info("seeding from workbook", extra={"path": str(SEED_XLSX)})
        from backend.domain.ingest import run as run_ingest

        run_ingest(SEED_XLSX, mode="replace")

    if db.lab_count() == 0 and SEED_LAB_CSV.exists():
        logger.info("seeding lab CSV", extra={"path": str(SEED_LAB_CSV)})
        from backend.domain.ingest import seed_lab_if_empty

        seed_lab_if_empty(SEED_LAB_CSV)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    bootstrap()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Üretim Paneli", version="2.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(metrics.router)
    return app


app = create_app()
