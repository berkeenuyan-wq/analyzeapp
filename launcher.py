"""Frozen-app entry point.

Double-clicking the built ``UretimPaneli.exe`` runs this: it starts Streamlit
in-process (no child ``python`` needed), which serves the dashboard on
http://localhost:8536 and opens the default browser. Closing the console window
stops the server.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

PORT = "8536"


def _bundle_root() -> Path:
    # PyInstaller extracts data files to sys._MEIPASS; from source this is the repo.
    return Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))


def _silence_first_run() -> None:
    """Streamlit blocks on an 'Email:' stdin prompt on first ever run unless a
    credentials file exists. Write an empty one so the exe never stalls."""
    cred = Path.home() / ".streamlit" / "credentials.toml"
    try:
        if not cred.exists():
            cred.parent.mkdir(parents=True, exist_ok=True)
            cred.write_text('[general]\nemail = ""\n', encoding="utf-8")
    except OSError:
        pass


def main() -> int:
    root = _bundle_root()
    app_path = str(root / "app.py")
    _silence_first_run()

    # Make the bundled `src` / `assets` importable and discoverable.
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    os.chdir(root)

    os.environ.setdefault("STREAMLIT_GLOBAL_DEVELOPMENT_MODE", "false")
    os.environ.setdefault("STREAMLIT_BROWSER_GATHER_USAGE_STATS", "false")
    os.environ.setdefault("STREAMLIT_SERVER_PORT", PORT)
    os.environ.setdefault("STREAMLIT_SERVER_HEADLESS", "false")
    os.environ.setdefault("STREAMLIT_SERVER_FILE_WATCHER_TYPE", "none")
    os.environ.setdefault("STREAMLIT_SERVER_RUN_ON_SAVE", "false")

    from streamlit.web import cli as stcli

    sys.argv = [
        "streamlit", "run", app_path,
        f"--server.port={PORT}",
        "--server.headless=false",          # let Streamlit open the browser
        "--server.fileWatcherType=none",
        "--global.developmentMode=false",
        "--logger.hideWelcomeMessage=true",  # no banner, no "install skills" nudge
        "--client.toolbarMode=minimal",      # hide Deploy / dev menu for end users
    ]
    return stcli.main()


if __name__ == "__main__":
    raise SystemExit(main())
