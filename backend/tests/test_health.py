"""The endpoint the Electron sidecar polls before showing the window."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_headline_endpoint_returns_real_numbers(client: TestClient) -> None:
    resp = client.get("/api/metrics/headline")
    assert resp.status_code == 200
    body = resp.json()
    assert body["batch_count"] == 24
    assert body["ort_toplam_verim"] == pytest.approx(91.05, abs=0.02)


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    resp = client.options(
        "/api/metrics/headline",
        headers={
            "Origin": "http://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.status_code == 400
