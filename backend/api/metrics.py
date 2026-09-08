"""Derived-figure endpoints. Thin wrappers over :mod:`backend.domain.metrics`.

Phase 1 exposes only ``headline()`` — the six figures on the Bucher dashboard
sheet. The numbers are recomputed from the source tables, never read from the
workbook's stale cells (docs/RULES.md §6).
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.domain import metrics

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


class Headline(BaseModel):
    """Response model mirroring :class:`backend.domain.metrics.Headline`."""

    islenen_ton: float = Field(description="sum of dolum / 1000")
    ort_toplam_verim: float | None = Field(description="mean toplam verim %")
    ort_batch_suresi_dk: float | None = Field(description="mean batch suresi (min)")
    cikan_ort_t_sa: float | None = Field(description="press 1 + press 2 hourly (t/h)")
    posa_saatlik_toplam_t_sa: float | None = Field(
        description="posa per working hour (t/h)"
    )
    batch_count: int


@router.get("/headline", response_model=Headline)
def get_headline() -> Headline:
    h = metrics.headline()
    return Headline(
        islenen_ton=h.islenen_ton,
        ort_toplam_verim=h.ort_toplam_verim,
        ort_batch_suresi_dk=h.ort_batch_suresi_dk,
        cikan_ort_t_sa=h.cikan_ort_t_sa,
        posa_saatlik_toplam_t_sa=h.posa_saatlik_toplam_t_sa,
        batch_count=h.batch_count,
    )
