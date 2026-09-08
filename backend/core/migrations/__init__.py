"""Forward-only schema migrations (docs/RULES.md §2)."""
from __future__ import annotations

from ._runner import Migration, MigrationError, discover, run_migrations

__all__ = ["Migration", "MigrationError", "discover", "run_migrations"]
