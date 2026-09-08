"""Liveness endpoint the Electron sidecar polls before showing the window."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class Health(BaseModel):
    status: str


@router.get("/health", response_model=Health)
def get_health() -> Health:
    return Health(status="ok")
