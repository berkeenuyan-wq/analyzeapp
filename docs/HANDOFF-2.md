# Handoff — after Phase 1 build

Continuation brief for a fresh session. The Phase 1 walking skeleton is built,
tested, and CI-green. Read `docs/HANDOFF.md` for the original Phase-1 brief;
this doc records what actually shipped, what's still open, and where Phase 2
starts.

## Read first (unchanged)

1. `docs/RULES.md` — hard guardrails
2. `docs/ARCHITECTURE.md` — process/data model, target layout, library table
3. `docs/CODING_STANDARDS.md` — conventions (updated this session: §1 runtime + carried-over modules)
4. `docs/ROADMAP.md` — Phase 1 boxes ticked; Phase 2 is the next section
5. `docs/DEV.md` — how to run / test / build locally

## Repo state

- Branch **`phase-1-scaffold`**, tip **`6b9e6b4`**, working tree clean. 13 commits
  on top of the original clone (`b5190ce`).
- Remotes:
  - `origin` → `github.com/berkeenuyan-wq/productiondashboard` — has **PR #1**
    ("Phase 1 — scaffold & walking skeleton"), CI green, **not merged**.
  - `analyzeapp` → `github.com/berkeenuyan-wq/analyzeapp` — `phase-1-scaffold`
    was pushed here as **`main`** (default branch), **CI green** (backend +
    frontend + electron all pass).
- **Open decision:** which repo is home. If `analyzeapp`, run
  `git remote set-url origin https://github.com/berkeenuyan-wq/analyzeapp.git`
  and work `main` there; PR #1 on the old repo can be closed.
- Dev servers may still be running from this session: FastAPI on `:8000`
  (`backend/.venv/bin/python -m backend.run`, pid was 280) and Vite on `:5173`.
  Kill with `pkill -f 'backend.run'; pkill -f vite` if stale.

## What shipped in Phase 1

| Area | Notes |
| --- | --- |
| **Backend** (`backend/`) | `core/` = config, db, ports, migrations; `domain/` = v1 metrics/ingest/excel_io/fmt (moved verbatim, imports rewritten, **logic untouched**); `api/` = health + metrics routers; `run.py` = entry (picks ephemeral loopback port, prints `UP_BACKEND_PORT=` on **fd 1**, serves the app object). `main.py` lifespan runs `ensure_schema` → migrations → first-run seed. `GET /health`, `GET /api/metrics/headline`. |
| **Backend tests** | `backend/tests/` — 35 pass. `test_metrics_baseline.py` freezes the reconciled numbers: Ort. Toplam Verim ≈ 91.05, Ort. Batch Süresi ≈ 112.71, `FARK_TOLERANCE == 5.0`, all `tone_*` bands, lab window-match rule (33 of 34 matched), `LAB_SPECS_CONFIRMED is False`. `conftest.py` points `UP_STATE_DIR` at a temp dir and seeds from `data/seed/`. |
| **Migrations** | `backend/core/migrations/_runner.py` — discovers `NNNN_*.py`, runs missing ones one transaction each, records in `schema_migrations`, refuses to start if the DB version > code. `0001_v2_tables.py` creates the ARCHITECTURE §4.2 tables (additive; core tables untouched). |
| **Frontend** (`frontend/`) | Vite 5 + React 18 + TS strict. `src/lib/api.ts` is the **only** `fetch` site — base URL from `window.up.backendPort` (Electron) or the Vite proxy (browser dev), errors normalised to `{code,message}`. TanStack Query, `lib/format.ts` (Intl tr-TR), `lib/theme/` (dark = bare `:root`, light = `[data-theme="light"]`, localStorage, toggle in the rail). Icon rail + 6 **hash** routes (`/`, `/press`, `/lab`, `/trucks`, `/data`, `/charts`); Overview renders one `<KpiTile>` from `/api/metrics/headline`; the other 5 are `PagePlaceholder`. `<ErrorBoundary>` around every route. `src/i18n/tr.ts` = frozen Turkish copy. `styles/tokens.css` is generated from `assets/tokens/*.css` by `scripts/build-tokens.sh`. |
| **Frontend tests** | `KpiTile.test.tsx`, `api.test.ts` (error normalisation + base-URL resolution). 10 vitest pass. No Playwright yet (Phase 1 exit allowed deferring it). |
| **Electron** (`electron/`) | `main.ts` — single-instance lock, sandboxed `BrowserWindow` (contextIsolation on, nodeIntegration off, sandbox on, webSecurity on), dev loads `localhost:5173` / prod loads `process.resourcesPath/renderer/index.html`, external links via `shell.openExternal`, error window with the log path on sidecar failure. `preload.ts` exposes only `up = { backendPort, appVersion, log, openLogDir }` (values from `--up-*` args). `sidecar.ts` — spawn, parse handshake, poll `/health` (15s), restart ≤3× with 1/2/4s backoff then `onFatal`, SIGTERM→SIGKILL(3s), `killSync()` for `process.on("exit")`, records every spawned PID for the orphan check. `run.py` has a **parent-death watchdog** (`UP_PARENT_PID`) so the sidecar self-exits if Electron is force-killed. |
| **Smoke guard** (`electron/src/smoke.ts`) | Headless: start → `/health` → `/api/metrics/headline` → SIGKILL the child → assert auto-restart → `stop()` → assert no spawned PID still alive (`process.kill(pid,0)`, no shell). 90s in-process watchdog. `npm run smoke` → exit 0. Runs in CI under xvfb. |
| **Dev** | `Makefile` (`setup`/`dev-backend`/`dev-frontend`/`dev-electron`/`test`/`lint`/`typecheck`/`smoke`), `docs/DEV.md`. |
| **Packaging** | `build/pyinstaller/uretim-backend.mac.spec` → `make -C build backend-bin` → one-file binary that serves the metric and prints the handshake (**verified working**). `build/electron-builder.yml` + `build/Makefile` → `make -C build dmg` → `build/dist/Üretim Paneli-2.0.0-arm64.dmg` (~141 MB, correct bundle layout). `electronDist` points at `electron/node_modules/electron/dist` on purpose (see gotchas). `build/afterpack-adhoc.cjs` + `build/resources/entitlements.mac.plist` ad-hoc sign with JIT entitlements (groundwork for Phase 7). |
| **CI** | `.github/workflows/ci.yml` — 3 ubuntu jobs: backend (ruff + mypy --strict + pytest), frontend (tsc + eslint + vitest + build), electron (tsc + eslint + build + smoke under xvfb, with `chrome-sandbox` chmod + `timeout-minutes: 5`). `release.yml` is a Phase-7 stub (unsigned .dmg artefact on tag). |

## THE open Phase 1 item

**The packaged `.app` SIGTRAPs in V8 (`EXC_BREAKPOINT`, `procRole: Background`)
at launch** — before any of our JS runs. The identical Electron binary + `main.js`
run fine **unpackaged** (dev window + `npm run smoke` both verified end to end).
Tried: unsigned, ad-hoc `--deep` sign, minimal ad-hoc sign + JIT entitlements,
`electronDist` pinned to the known-good local copy. Same crash every time.

Likely an unsigned-Electron-bundle × macOS 26 × non-interactive-launch
interaction. **Next actions, in order:**
1. Have the user double-click `build/dist/Üretim Paneli-2.0.0-arm64.dmg` → drag to
   Applications → right-click **Open** in a real GUI login session. If it runs,
   the exit box is ticked.
2. If it still crashes: this is the Phase 7 Developer ID signing +
   notarisation work (needs the user's Apple certs). The entitlements plumbing
   is already in `build/`. Do not sink more time into ad-hoc signing.

Everything else in the Phase 1 exit checklist is done and CI is green.

## Environment (bit us this session — keep pinned)

- **Python 3.12** only (`/opt/homebrew/opt/python@3.12/bin/python3.12`). The
  machine's default `python3` is **3.14**, which has **no working pandas/numpy
  build** (segfaults in `to_datetime`). `backend/.venv` MUST be 3.12.
- `backend/requirements.txt` pins `pandas==2.2.3` + **`numpy==2.2.6`** (numpy
  held just under pandas' ABI bound — 2.5.x also segfaults). `pydantic==2.9.2`.
  `backend/requirements.lock.txt` is the full `pip freeze` (CI installs this).
- **Node 26** on the machine (docs said 20+; it works). Its npm **defers
  package install scripts** — Electron's binary download fails on a fresh
  `npm install`. Fix: `cd electron && npm rebuild electron`, or the
  `allowScripts` entry already in `electron/package.json`. This is why
  `electron-builder.yml` uses `electronDist: node_modules/electron/dist`
  (electron-builder's own re-download of Electron SIGTRAPs).
- CI runs Python **3.12** and Node **20** (clean environment, no deviations).

## Gotchas discovered this session

- The handshake line MUST go to raw fd 1 (`os.write(1, …)`), not
  `sys.stdout.write` — PyInstaller one-file buffering swallowed it. Done in
  `backend/core/ports.py`.
- `uvicorn.run("backend.main:app", …)` (import-string form) cannot be resolved
  from a PyInstaller archive — `run.py` passes the `app` object.
- `sidecar.stop()` had a race with an in-flight restart (killed the old dead
  child, leaked the new one). Fixed: `stop()` awaits `this.starting`; a restart
  that finishes after `shuttingDown` tears itself down.
- Never `execSync`/`pgrep` from the Electron main process for the orphan check —
  it blocked the event loop hard enough that the watchdog never fired (CI hung
  for minutes). The check is now pure `process.kill(pid, 0)` over PIDs the
  Sidecar recorded.
- macOS has no `timeout(1)` (it's `gtimeout`); the CI `timeout 180` wrapper is
  Linux-only and fine there.
- The legacy Streamlit app (`app.py`, `src/theme.py`, `src/ui.py`,
  `src/sections/*`, …) is **no longer runnable** — its `from src import db`
  etc. broke when the core modules moved to `backend/`. Files are kept for
  reference per RULES §19 (moving ≠ deleting); they're removed phase by phase.

## Phase 2 starting point (`docs/ROADMAP.md`)

Data Entry — core sheets: edit `batch`/`truck`/`lab` as spreadsheets with
formatting, paste, undo.

First tasks:
- Seed `sheet` / `sheet_column` with the three core sheets from `db.py` column
  metadata (a new migration `0002_*.py` or a bootstrap step).
- `GET /api/sheets`, `GET /api/sheets/{id}`, `GET /api/rows/{id}` (paged).
- `@glideapps/glide-data-grid` renders `batch`, virtualised, Turkish
  number/date display. Add the dep to `frontend/package.json` (MIT, already in
  the ARCHITECTURE library table) — pin exact, commit the lockfile.
- Inline edit → `PATCH /api/rows/{id}/{rowKey}` → Pydantic validate → `db.py`
  typed writer; optimistic update + rollback.
- Keep the metric baseline test green throughout (edits round-trip through
  `db.py`, `metrics.py` recomputes).

Then: range copy/paste (TSV), column/cell right-click menus, extra columns
(`sheet_column.is_extra` / `sheet_extra_cell`), undo/redo, autosave. Full list
in ROADMAP Phase 2. Exit: all three core datasets editable with formatting +
paste, every edit through `db.py`, baseline still green. Then remove the
legacy `src/data_panel.py` + data-entry bits of `src/sections/*`.
