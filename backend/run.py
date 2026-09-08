"""Console entry point for the sidecar.

Picks a free loopback port, prints the ``UP_BACKEND_PORT=<n>`` handshake line
for the Electron main process, then serves the FastAPI app with uvicorn.

    python -m backend.run            # ephemeral port, handshake on stdout
    UP_BACKEND_PORT=8000 python -m backend.run   # fixed port (dev convenience)
"""
from __future__ import annotations

import logging
import os

import uvicorn

from backend.core.ports import LOOPBACK_HOST, announce_port, pick_free_port


def main() -> None:
    log_level = os.environ.get("UP_LOG_LEVEL", "INFO")
    logging.basicConfig(
        level=log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    port_env = os.environ.get("UP_BACKEND_PORT")
    port = int(port_env) if port_env else pick_free_port()
    announce_port(port)
    uvicorn.run(
        "backend.main:app",
        host=LOOPBACK_HOST,
        port=port,
        log_level=log_level.lower(),
        access_log=False,
    )


if __name__ == "__main__":
    main()
