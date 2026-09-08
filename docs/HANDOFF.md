# Handoff — start coding (Phase 1)

This is the "start here" doc for the first build session. The spike was skipped;
we're building the real app.

## Before anything, read

1. [`CLAUDE.md`](../CLAUDE.md) — operating rules
2. [`docs/RULES.md`](RULES.md) — hard guardrails (frozen schemas, migrations,
   metric baseline, frozen Turkish copy, no orphaned backend process)
3. [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — process model, data model, target
   repo layout, library table
4. [`docs/ROADMAP.md`](ROADMAP.md) — Phase 1 task list is authoritative; this
   doc just sequences it and fills in concrete decisions

## Repo state right now

- Cloned from `github.com/berkeenuyan-wq/productiondashboard`, **not** under git
  locally yet.
- Legacy Streamlit app is intact and stays until each phase's exit criteria
  replace it (`app.py`, `launcher.py`, `src/**`, `UretimPaneli.spec`,
  `.streamlit/`). Do not delete legacy files in Phase 1.
- Reusable core to move into `backend/`: `src/metrics.py`, `src/ingest.py`,
  `src/excel_io.py`, `src/fmt.py` → `backend/domain/`; `src/config.py`,
  `src/db.py` → `backend/core/`.
- Seed data: `data/seed/Production_Stats.xlsx`,
  `data/seed/pres_kalite_kontrolleri.csv` — unchanged, still the first-run seed.

## Environment

- Python **3.11+**, Node **20+**, on macOS now (Windows parity checked later in
  the phase / CI).
- Use a venv for the backend (`backend/.venv`), npm for `frontend/` and
  `electron/`.

## Phase 1 target ("walking skeleton")

An Electron window that boots the FastAPI sidecar on an ephemeral loopback port
and renders **one real KPI** (`metrics.headline()`) fetched over HTTP. A
packaged `.dmg` launches on this Mac and quits with no orphaned backend process.
CI runs lint + typecheck + pytest + vitest.

### Order of work

1. **Git.** `git init`, add a sane `.gitignore` (extend the existing one:
   `.venv/`, `node_modules/`, `dist/`, `out/`, `build/`, `*.spec` output,
   `data/uretim.db`, `data/exports/`). First commit = legacy tree + `docs/` as-is.
2. **Backend skeleton.**
   - `backend/core/` ← move `config.py`, `db.py`. Add the macOS branch to
     `STATE_DIR` (`~/Library/Application Support/UretimPaneli`). Keep the frozen
     `_MEIPASS` branch.
   - `backend/domain/` ← move `metrics.py`, `ingest.py`, `excel_io.py`,
     `fmt.py`. Fix imports (`from src.x` → `from backend.domain.x` /
     `backend.core.x`). Do **not** touch metric logic.
   - `backend/core/ports.py` — bind `127.0.0.1:0`, read back the port, print
     `UP_BACKEND_PORT=<n>` on stdout for Electron to parse.
   - `backend/core/migrations/` — a tiny runner (list `NNNN_*.py`, run missing
     ones in a transaction, insert into `schema_migrations`). Refuse start if DB
     version > code.
   - `backend/core/migrations/0001_v2_tables.py` — create the tables in
     ARCHITECTURE.md § 4.2. Additive only.
   - `backend/main.py` — FastAPI app; `GET /health` → `{status:"ok"}`; CORS
     locked to the renderer origin; on startup run migrations + first-run seed
     (port `app.py::_bootstrap`: seed workbook if `not db.is_ready()`, seed lab
     CSV if `db.lab_count()==0`).
   - `backend/api/metrics.py` — `GET /api/metrics/headline`, Pydantic response
     model, returns `metrics.headline()` fields.
3. **Backend tests.**
   - `backend/tests/conftest.py` — temp SQLite seeded from `data/seed/`.
   - `backend/tests/test_metrics_baseline.py` — freeze the values in
     RULES.md § Metric baseline (Ort. Toplam Verim ≈ 91.05, Ort. Batch Süresi
     ≈ 112.71, `FARK_TOLERANCE == 5.0`, `tone_*` bands, `LAB_SPECS_CONFIRMED is
     False`). Use `pytest.approx`.
   - `test_health.py`, `test_migrations.py` (idempotent re-run).
4. **Frontend skeleton.**
   - Vite + React + TS (`strict`, `noUncheckedIndexedAccess`).
   - `src/lib/api.ts` — base URL from `window.up.backendPort` (preload bridge),
     typed client, error → `{code,message}`.
   - `src/lib/queryClient.ts` — TanStack Query.
   - Left icon rail + 6 routed pages (`/`, `/press`, `/lab`, `/trucks`,
     `/data`, `/charts`), five of them placeholder.
   - Overview page: fetch `/api/metrics/headline`, render one `<KpiTile>`.
   - `src/styles/tokens.css` from `assets/tokens/*.css` +
     `Üretim Paneli Design System/styles.css`; dark base, `:root[data-theme=
     "light"]` re-scope; a theme toggle in the rail.
   - `<ErrorBoundary>` around each route element.
   - `src/i18n/tr.ts` — start the frozen Turkish string map (rail labels =
     `config.SECTIONS` labels + "Grafik Analiz" / "Veri Girişi").
5. **Frontend tests.** Vitest + Testing Library: `KpiTile` renders a value;
   `api.ts` error normalisation. One Playwright smoke test can wait for Phase 1
   exit.
6. **Electron.**
   - `electron/main.ts` — `BrowserWindow` with `contextIsolation:true`,
     `nodeIntegration:false`, `sandbox:true`, `webSecurity:true`; single-instance
     lock; dev loads `http://localhost:5173`, prod loads built `index.html`.
   - `electron/preload.ts` — `contextBridge.exposeInMainWorld("up", { backendPort,
     appVersion, log, openLogDir })` — nothing more.
   - `electron/sidecar.ts` — spawn backend (dev: `.venv/bin/python -m uvicorn
     backend.main:app`; prod: bundled binary), parse `UP_BACKEND_PORT=`, poll
     `/health` (timeout ~15s), restart on non-zero exit ≤3× with backoff then
     error window, `SIGTERM`→`SIGKILL` on `before-quit`.
7. **Dev ergonomics.** Root `package.json` scripts or a `Makefile`:
   `dev:backend`, `dev:frontend`, `dev:electron`, `test`, `lint`, `typecheck`.
   A `docs/DEV.md` with the three commands to run locally.
8. **Packaging (Mac).**
   - `build/pyinstaller/uretim-backend.mac.spec` — one-file backend binary;
     bundle `data/seed/`; hidden imports for `backend.*`, pandas/openpyxl libs
     (crib from the existing `UretimPaneli.spec`).
   - `build/electron-builder.yml` — mac target `dmg`, `extraResources` = the
     backend binary; `asar` on.
   - Produce a `.dmg`, launch it, confirm the KPI shows and quit leaves no
     `uvicorn`/backend process (`pgrep -fl uretim` clean).
9. **CI.** `.github/workflows/ci.yml` on push/PR: matrix isn't required yet —
   `ubuntu-latest` for backend (pytest, ruff, mypy) + frontend (`tsc --noEmit`,
   eslint, vitest). `release.yml` (mac+win matrix) can be stubbed, wired in
   Phase 7.

### Phase 1 exit checklist

- [ ] `git` initialised, `.gitignore` sane, first commit made
- [ ] `backend/` runs: `uvicorn backend.main:app` → `/health` ok,
      `/api/metrics/headline` returns real numbers
- [ ] Migrations create the v2 tables; re-running is a no-op
- [ ] First-run seed works against an empty state dir
- [ ] `pytest` green, **metric baseline green**
- [ ] `frontend/` dev server shows the icon rail + Overview KPI, theme toggle
      flips dark/light
- [ ] `tsc --noEmit`, eslint, vitest green
- [ ] Electron dev: window opens, sidecar on ephemeral port, KPI loads
- [ ] Electron quit / crash: no orphaned backend process (guard test or script)
- [ ] `.dmg` builds and launches on this Mac
- [ ] CI green on push
- [ ] `docs/ROADMAP.md` Phase 1 boxes ticked, Status line → "Phase 2 not started"

## Suggested versions (pin exact at install; bump patch as needed)

**Backend** — `fastapi 0.115.*`, `uvicorn[standard] 0.32.*`, `pydantic 2.9.*`,
`pandas 2.2.*`, `openpyxl 3.1.*`, `pytest 8.*`, `ruff`, `mypy`. Keep
`pyinstaller` for packaging only.

**Frontend** — `react 18.3.1`, `react-dom 18.3.1`, `typescript 5.5.*`,
`vite 5.*`, `@vitejs/plugin-react`, `react-router-dom 6.26.*`,
`@tanstack/react-query 5.*`, `vitest 2.*`, `@testing-library/react`,
`eslint` + `@typescript-eslint`. (Phase 2+: `@glideapps/glide-data-grid 6.*`,
`react-grid-layout 1.4.*`, `echarts 5.5.*` + `echarts-for-react`,
`lightweight-charts` — confirm v5 vs v4 at install and set ARCHITECTURE.md
accordingly.)

**Electron** — `electron 33.*`, `electron-builder 25.*`, `typescript`.

## Gotchas carried over from v1

- `config.STATE_DIR` must resolve to a writable per-user dir on **both** OSes and
  never inside the bundle; the DB and exports live there.
- First run blocks nothing — no stdin prompts (the old `launcher._silence_first_run`
  was a Streamlit-only fix; not needed, but don't reintroduce a blocking prompt).
- Turkish section strings are fixed — copy them verbatim from `config.SECTIONS`.
- `metrics.py` deliberately recomputes and **ignores** the workbook's stale
  precomputed cells. Don't "fix" it to match the sheet.
- Lab reading → batch window matching rule is subtle (same day, same press,
  control time inside `başlangıç–bitiş`, tightest wins, else *eşleşmedi*). It's
  in `metrics.lab_readings`; the baseline test must cover it.

## Not in Phase 1

Data Entry grid, custom sheets, dashboard drag/resize, the analysis pages, the
Chart Analysis page, Windows build, code signing. Those are Phases 2–7.
