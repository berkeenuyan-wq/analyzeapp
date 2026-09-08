# Developing Üretim Paneli v2

## Prerequisites

- **Python 3.12** (`brew install python@3.12`). The scientific stack has no
  working build on 3.13/3.14 yet; the backend venv must be 3.12.
- **Node 20+** and npm.

## One-time setup

```bash
make setup
```

Creates `backend/.venv` (from `python3.12`), installs
`backend/requirements-dev.txt`, then `npm install` in `frontend/` and
`electron/`.

If Electron's binary fails to download on first install (a newer npm defers
package install scripts), run `cd electron && npm rebuild electron`.

## Run it (three terminals)

```bash
make dev-backend     # FastAPI sidecar on http://127.0.0.1:8000
make dev-frontend    # Vite on http://localhost:5173  (proxies /api, /health)
make dev-electron    # builds electron/ and opens the window
```

- Browser-only work: `dev-backend` + `dev-frontend`, open
  <http://localhost:5173>.
- Electron ignores `:8000` — its `sidecar.ts` spawns its own backend on an
  ephemeral loopback port and passes it to the renderer via `window.up`.

## Checks (run before every commit)

```bash
make lint         # ruff + eslint (frontend, electron)
make typecheck    # mypy --strict + tsc
make test         # pytest (with the metric baseline) + vitest
make smoke        # headless Electron: sidecar up, restart-on-crash, no orphan
```

## Layout

| Path | What |
| --- | --- |
| `backend/` | FastAPI sidecar. `core/` = config, db, ports, migrations; `domain/` = v1 metrics/ingest (frozen); `api/` = routers; `run.py` = entry. |
| `frontend/` | Vite + React + TS. `lib/api.ts` is the only place `fetch` is called. |
| `electron/` | `main.ts` (window + lifecycle), `preload.ts` (the `up` bridge), `sidecar.ts` (backend process), `smoke.ts` (guard). |
| `build/` | `pyinstaller/*.spec`, `electron-builder.yml`. |
| `data/seed/` | First-run seed — unchanged from v1. |

## State / data

The SQLite DB and Excel exports live in a per-user dir, never in the repo or
the bundle:

- macOS: `~/Library/Application Support/UretimPaneli`
- Windows: `%LOCALAPPDATA%\UretimPaneli`
- override with `UP_STATE_DIR=/some/path` (the test suite and CI do this).

In dev from source, without `UP_STATE_DIR`, it defaults to `./data/` (git
-ignored).

## Packaging (macOS)

```bash
make -C build dmg      # PyInstaller backend binary + electron-builder .dmg
```

Output: `build/dist/Üretim Paneli-2.0.0-arm64.dmg`. Launch it and confirm the
KPI shows and quitting leaves `pgrep -fl uretim` empty.
