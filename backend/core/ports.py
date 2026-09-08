"""Ephemeral loopback port selection + the Electron handshake.

The backend must never bind a fixed or public port (docs/RULES.md §14). It
asks the OS for a free port on ``127.0.0.1``, then prints a single
``UP_BACKEND_PORT=<n>`` line to stdout that the Electron sidecar parses.
"""
from __future__ import annotations

import os
import socket
import sys

HANDSHAKE_PREFIX = "UP_BACKEND_PORT="
LOOPBACK_HOST = "127.0.0.1"


def pick_free_port(host: str = LOOPBACK_HOST) -> int:
    """Bind ``host:0``, read back the assigned port, release it.

    There is a small TOCTOU window between releasing the socket here and
    uvicorn re-binding the port; in practice the OS does not hand the same
    ephemeral port to another process in that window on a desktop machine.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((host, 0))
        return int(sock.getsockname()[1])


def announce_port(port: int) -> None:
    """Emit the handshake line the Electron main process waits for.

    Written straight to fd 1 as well as ``sys.stdout``: in a PyInstaller
    one-file build ``sys.stdout`` buffering can swallow the line, and Electron
    parses it from the child's raw stdout.
    """
    line = f"{HANDSHAKE_PREFIX}{port}\n"
    try:
        os.write(1, line.encode("ascii"))
    except OSError:
        # Fall back to the Python stream if fd 1 is unavailable.
        sys.stdout.write(line)
        sys.stdout.flush()


def parse_port_line(line: str) -> int | None:
    """Return the port from a handshake line, or ``None`` if it is not one."""
    line = line.strip()
    if not line.startswith(HANDSHAKE_PREFIX):
        return None
    try:
        return int(line[len(HANDSHAKE_PREFIX) :])
    except ValueError:
        return None
