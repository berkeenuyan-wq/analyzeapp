# Roadmap — Üretim Paneli v2

**Status:** Phase 1 in progress — walking skeleton wired end to end
(backend + frontend + Electron all verified unpackaged); PR #1 open with
**CI green** (backend + frontend + electron smoke). One blocker left: the
packaged `.dmg` builds but the `.app` SIGTRAPs in V8 on launch in the
build session; needs a real GUI-login retest or Phase-7 Developer ID
signing to confirm. Phase 2 not started.
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

- [x] `git`: repo already had history (fresh clone); first commit adds
      `docs/` + widened `.gitignore`. Legacy tree kept, not deleted.
- [x] Create `backend/`, move `metrics.py` `ingest.py` `excel_io.py` `fmt.py`
      → `backend/domain/`, `config.py` `db.py` → `backend/core/`; imports fixed
- [x] Add the macOS branch to `config.py` `STATE_DIR` (+ `$UP_STATE_DIR`
      override for tests/Electron)
- [x] `backend/core/ports.py` — ephemeral loopback port + `UP_BACKEND_PORT=`
      handshake on fd 1
- [x] `backend/main.py` — FastAPI app, `/health`, CORS locked to renderer origin
- [x] `backend/api/metrics.py` — `GET /api/metrics/headline`, Pydantic model
- [x] First-run bootstrap ported from `app.py::_bootstrap` (lifespan)
- [x] `backend/core/migrations/` runner + `0001_v2_tables.py`;
      `schema_migrations`; refuses a DB newer than the code
- [x] `backend/tests/` — `test_metrics_baseline.py` freezes the reconciled
      values (91.05 / 112.71, `tone_*`, lab window rule 33/34,
      `LAB_SPECS_CONFIRMED False`); `test_health`, `test_migrations`. 35 pass.
- [x] `frontend/` Vite + React + TS; icon rail + 6 hash routes (5 placeholder)
- [x] `frontend/src/lib/api.ts` typed client; Overview shows the headline KPI
      (verified in-browser: 91,05)
- [x] Design System tokens wired (`scripts/build-tokens.sh`); dark ⇄ light
      toggle in the rail (both verified)
- [x] `electron/` main + preload + `sidecar.ts` (spawn, `/health` poll, restart
      ≤3× on crash, SIGTERM→SIGKILL on quit, parent-death watchdog);
      sandboxed renderer. `smoke.ts` guards it. Verified unpackaged.
- [x] Dev scripts: `Makefile` + `docs/DEV.md`
- [x] `build/pyinstaller/uretim-backend.mac.spec` + `electron-builder.yml`;
      `.dmg` builds. **Launch of the packaged .app not yet confirmed** —
      V8 SIGTRAP under this headless session; retest with a GUI login /
      Phase-7 signing.
- [x] `.github/workflows/ci.yml` — ruff, mypy, pytest, tsc, eslint, vitest,
      electron smoke (xvfb); `release.yml` stub. **Green on PR #1.**

**Exit:** packaged Mac app opens, shows the real headline KPI, quits cleanly with
no orphaned backend process. CI green.
*Outstanding:* confirm the packaged `.app` launches (see above) — everything
else is done and CI is green.

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
