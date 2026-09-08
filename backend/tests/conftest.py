"""Shared fixtures.

``UP_STATE_DIR`` is redirected to a throwaway directory **before** any backend
module is imported, so tests never touch the developer's real DB. The state
dir is seeded once per session from ``data/seed/``.
"""
from __future__ import annotations

import os
import tempfile
from collections.abc import Iterator
from pathlib import Path
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient

_STATE_DIR = Path(tempfile.mkdtemp(prefix="uretim-test-state-"))
os.environ["UP_STATE_DIR"] = str(_STATE_DIR)

REPO_ROOT = Path(__file__).resolve().parents[2]
SEED_DIR = REPO_ROOT / "data" / "seed"


@pytest.fixture(scope="session", autouse=True)
def _seeded_state() -> None:
    """Run the first-run bootstrap once for the whole session."""
    from backend.main import bootstrap

    bootstrap()


@pytest.fixture
def client() -> Iterator[TestClient]:
    """A FastAPI ``TestClient`` (its lifespan re-runs bootstrap, idempotently)."""
    from fastapi.testclient import TestClient

    from backend.main import app

    with TestClient(app) as test_client:
        yield test_client
