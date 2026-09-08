"""Console entry point for the sidecar.

Picks a free loopback port, prints the ``UP_BACKEND_PORT=<n>`` handshake line
for the Electron main process, then serves the FastAPI app with uvicorn.

    python -m backend.run            # ephemeral port, handshake on stdout
    UP_BACKEND_PORT=8000 python -m backend.run   # fixed port (dev convenience)
"""
from __future__ import annotations

import logging
import os
import threading
import time

import uvicorn

from backend.core.ports import LOOPBACK_HOST, announce_port, pick_free_port


def _watch_parent(parent_pid: int, interval: float = 2.0) -> None:
    """Exit if the launching process dies (e.g. Electron force-quit).

    Guards docs/RULES.md §13's "no orphaned backend process, ever" for the one
    path the Electron teardown can't cover — ``SIGKILL`` of the main process.
    """
    while True:
        time.sleep(interval)
        if os.getppid() != parent_pid:
            os._exit(0)


def _start_parent_watchdog() -> None:
    raw = os.environ.get("UP_PARENT_PID")
    if not raw:
        return
    try:
        parent_pid = int(raw)
    except ValueError:
        return
    threading.Thread(
        target=_watch_parent, args=(parent_pid,), daemon=True
    ).start()


def main() -> None:
    log_level = os.environ.get("UP_LOG_LEVEL", "INFO")
    logging.basicConfig(
        level=log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    _start_parent_watchdog()

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
