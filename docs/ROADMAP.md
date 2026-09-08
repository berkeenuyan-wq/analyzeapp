# Roadmap — Üretim Paneli v2

**Status:** Phase 0 complete (planning + docs). Phase 1 not started.
**Last updated:** 2026-09-08

Work phases top to bottom. Finish, test, and get user sign-off on a phase before
starting the next. Tick boxes as tasks land. Update the Status line above on every
phase boundary.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked (note why)

---

## Phase 0 — Planning & docs  ✅

- [x] Stack + packaging decided (Electron + FastAPI sidecar + SQLite)
- [x] `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`,
      `docs/CODING_STANDARDS.md`, `docs/RULES.md` written
- [ ] User sign-off on the plan

---

## Phase 1 — Scaffold & walking skeleton

Goal: an Electron window on macOS **and** Windows that boots a FastAPI sidecar
and renders one real KPI from `metrics.py`. A packaged build runs on this Mac.

- [ ] `git init` (repo is currently not under version control); first commit of
      the legacy tree + docs before restructuring
- [ ] Create `backend/`, move `metrics.py` `ingest.py` `excel_io.py` `fmt.py`
      → `backend/domain/`, `config.py` `db.py` → `backend/core/`; fix imports
- [ ] Add the macOS branch to `config.py` `STATE_DIR`
- [ ] `backend/core/ports.py` — pick a free loopback port, hand off to Electron
- [ ] `backend/main.py` — FastAPI app, `/health`, CORS locked to renderer origin
- [ ] `backend/api/metrics.py` — `GET /api/metrics/headline` returns
      `metrics.headline()` as JSON
- [ ] First-run bootstrap: seed `data/seed/*` into SQLite if empty (port the
      logic from the old `app.py` `_bootstrap`)
- [ ] `backend/core/migrations/` runner + `0001_v2_tables.py` creating the
      Section 4.2 tables; `schema_migrations` bookkeeping
- [ ] `backend/tests/test_metrics_baseline.py` — freeze the reconciled values
      (see `docs/RULES.md` § Metric baseline)
- [ ] `frontend/` Vite + React + TS; left icon rail + 6 empty routed pages
- [ ] `frontend/src/lib/api.ts` typed client; Overview shows the headline KPI
- [ ] Design System tokens wired; dark + light toggle switches the palette
- [ ] `electron/` main + preload + `sidecar.ts` (spawn, `/health` poll, restart
      on crash, kill on quit); `contextIsolation` on, `nodeIntegration` off
- [ ] Dev scripts: one command each for backend, frontend, electron; README-dev
- [ ] `build/pyinstaller/uretim-backend.mac.spec` + `electron-builder.yml`;
      produce a `.dmg` that launches on this Mac
- [ ] `.github/workflows/ci.yml` — lint, typecheck, pytest, vitest on push

**Exit:** packaged Mac app opens, shows the real headline KPI, quits cleanly with
no orphaned backend process. CI green.

---

## Phase 2 — Data Entry: core sheets

Goal: edit `batch`, `truck`, `lab` as spreadsheets with formatting, paste, undo.

- [ ] `sheet` / `sheet_column` seeded with the three core sheets from `db.py`
      column metadata
- [ ] `GET /api/sheets`, `GET /api/sheets/{id}` (schema), `GET /api/rows/{id}`
      (paged)
- [ ] Glide Data Grid renders `batch`; virtualised; Turkish number/date display
- [ ] Inline edit → `PATCH /api/rows/{id}/{rowKey}` → Pydantic validate →
      `db.py` typed writer; optimistic update + rollback on error
- [ ] Range **copy** to clipboard as TSV (Google Sheets compatible)
- [ ] Range **paste** from Google Sheets/Excel TSV: preview diff, validate per
      cell, commit on confirm; type coercion + per-cell error surfacing
- [ ] Column header right-click menu: insert extra column, delete extra column,
      reorder (drag), rename (extra only), retype (extra only), resize, hide,
      colour, bold
- [ ] Cell / row right-click: bold, italic, text colour, fill, align → persisted
      in `sheet_cell_format`
- [ ] Extra columns: `sheet_column.is_extra`, values in `sheet_extra_cell`
- [ ] Undo/redo stack (grid edits + column ops + formatting), keyboard bound
- [ ] Autosave with a visible saved/saving indicator; no data loss on quit
- [ ] `truck` and `lab` sheets enabled with the same UX
- [ ] Tests: writeback validation, paste coercion, undo/redo, format persistence
- [ ] Remove legacy `src/data_panel.py`, `src/sections/*` data-entry bits it
      replaces

**Exit:** all three core datasets fully editable with formatting + paste; every
edit round-trips through `db.py`; metric baseline still green.

---

## Phase 3 — Data Entry: custom sheets

- [ ] `POST /api/sheets` (kind='custom'), `PATCH`/`DELETE`; name validation
- [ ] Custom columns + rows via `custom_row.data_json`; add/delete/reorder rows
- [ ] Sheet switcher UI: list, create, rename, delete (confirm on delete)
- [ ] Same grid UX (formatting, paste, undo) on custom sheets
- [ ] Type system per column drives editors + validation + chart eligibility
- [ ] Tests: sheet lifecycle, cascade delete, custom-row CRUD

**Exit:** user can create an independent sheet (e.g. a second lab log), fill it,
format it, and it persists across restarts.

---

## Phase 4 — Overview dashboard

- [ ] `GET/PUT /api/dashboard/{page}` — layout + per-widget config
- [ ] react-grid-layout canvas: drag to move, resize handles, collision, snap
- [ ] Widget types: KPI tile (size S/M/L), line/bar/area chart, table, note
- [ ] Right-click canvas → add widget; right-click widget → configure / remove
- [ ] Widget data sources: any `metrics.*` endpoint or any sheet column
- [ ] Per-widget error boundary → placeholder card on failure
- [ ] Layout persisted transactionally; per-user; survives restart
- [ ] Tests (playwright): move, resize, add, remove, reload keeps layout

**Exit:** Overview is a user-arrangeable board of live KPIs and charts.

---

## Phase 5 — Press Analysis / Lab Reports / Truck Delivery

- [ ] `backend/api/metrics.py` endpoints for every figure each page needs
      (press rollups, daily performance, mass balance, posa summary, truck
      stats, lab summary/daily/completeness, breaches, pareto…)
- [ ] Each page ships a sensible default widget layout, still rearrangeable
- [ ] Threshold colours from `config.tone_*` / `LAB_MEASURES`; the "eşikler
      doğrulanmadı" footnote stays until `LAB_SPECS_CONFIRMED`
- [ ] Delta chips coloured by `good_when`, not arrow direction
- [ ] Charts themed from tokens; dark + light parity checked
- [ ] Tests: endpoint values vs `metrics.py`, page renders, threshold mapping
- [ ] Remove legacy `src/sections/pres_performansi.py`, `laboratuvar.py`,
      `arac_lojistigi.py`, `posa_analizi.py`, `genel_bakis.py`, `src/charts.py`,
      `src/ui.py`, `src/icons.py`, `src/theme.py`

**Exit:** the four analysis pages match or beat the old app's information, with
better interaction and identical numbers.

---

## Phase 6 — Chart Analysis (TradingView-style)

- [ ] lightweight-charts panel: time axis, pan, zoom, crosshair, tooltip
- [ ] Series picker: add/remove any sheet column or metric series; colour + axis
- [ ] Compare mode: multiple series on shared or split scales
- [ ] Two panels side by side with synced (or independent) time range
- [ ] Drawing tools layer: trend line, horizontal line, vertical line, ray,
      measure; select/move/delete; snap to points; persists per workspace
- [ ] `GET/POST/PUT/DELETE /api/charts` — named workspaces
      (panels + series + drawings + view range) in `chart_workspace`
- [ ] Save / load / rename / delete workspace UI
- [ ] Performance: smooth with tens of thousands of points (decimate on zoom-out)
- [ ] Tests: add series, draw + persist + reload, dual-panel sync

**Exit:** a working charting workspace over the real dataset with the core
TradingView interactions and saved layouts.

---

## Phase 7 — Polish, hardening, release

- [ ] Full dark/light parity pass on every page
- [ ] Turkish formatting everywhere (`Intl` tr-TR + `fmt.py` parity)
- [ ] Excel import/export UI (reuse `excel_io.py`): preview, merge vs replace
- [ ] Empty / loading / error states on every page and widget
- [ ] Keyboard shortcuts + focus management + basic a11y pass
- [ ] Crash telemetry to a local log file; "report a problem" opens the log dir
- [ ] Windows build on a Windows machine / CI; smoke-test both installers
- [ ] Code signing + notarisation (mac) and Authenticode (win) — needs certs
      from the user
- [ ] `release.yml` matrix build produces `.dmg` + `.exe` on tag
- [ ] Update `README.md` for v2; archive/delete the last legacy files and the
      old `UretimPaneli.spec`, `.streamlit/`
- [ ] User acceptance pass on the plant's real workbook

**Exit:** signed installers for both platforms, all legacy Streamlit code gone,
docs current.

---

## Parked / later

- Multi-user or networked mode (currently single desktop, single writer)
- Mapping custom sheets into the fixed KPI pages
- Auth / roles
- Auto-update channel
- Alarmlar page port (fold into Overview widgets first; decide in Phase 4/5)
