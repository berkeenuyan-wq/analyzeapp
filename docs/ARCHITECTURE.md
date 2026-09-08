# Architecture — Üretim Paneli v2

## 1. Goal

Replace the Streamlit dashboard with a native-feeling cross-platform desktop app
whose interactions work like a professional application: drag to move, drag to
resize, right-click context menus, inline editing, direct manipulation — no
button-and-rerun flow. Six pages, one editable data layer, one charting
workspace.

## 2. Process model

```
┌─────────────────────────── Electron (main process) ───────────────────────────┐
│  • creates the BrowserWindow (bundled Chromium — identical on macOS & Windows) │
│  • spawns the backend as a child process (sidecar)                            │
│  • polls GET /health until ready, then loads the renderer                      │
│  • restarts the sidecar on unexpected exit; kills it on app quit              │
│                                                                              │
│   renderer (React + TS, Vite build)      sidecar (FastAPI + uvicorn)          │
│   ┌───────────────────────────┐          ┌────────────────────────────────┐   │
│   │ 6 pages, TanStack Query   │◀────────▶│ /health                        │   │
│   │ react-grid-layout         │  HTTP    │ /api/sheets/*    data + schema  │   │
│   │ Glide Data Grid           │  + WS    │ /api/rows/*      cell edits     │   │
│   │ ECharts / lightweight-... │          │ /api/metrics/*   derived figs   │   │
│   │ error boundaries per page │          │ /api/dashboard/* layouts       │   │
│   └───────────────────────────┘          │ /api/charts/*    workspaces     │   │
│                                          │ /api/import/*    Excel / paste  │   │
│                                          │ /ws              invalidations  │   │
│                                          └───────────────┬────────────────┘   │
│                                                          ▼                    │
│                                                    SQLite (WAL)               │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Backend binds `127.0.0.1` on an ephemeral free port chosen at startup and
  written to a handshake file / stdout line the Electron main process reads.
  Never a fixed port (avoids collisions, avoids other machines reaching it).
- All backend responses are JSON. DataFrames never cross the boundary.
- The WS channel carries only lightweight `{resource, id}` invalidation events;
  the renderer refetches through TanStack Query. No business data over WS.

## 3. Pages

| # | Route | Contents | Interaction model |
| --- | --- | --- | --- |
| 1 | `/` Overview | KPI tiles (small + large) and chart widgets on a free grid | drag to move, drag corner to resize; right-click canvas to add a widget; layout persisted in `dashboard_layout` |
| 2 | `/press` Press Analysis | KPIs + charts from `metrics.press_*`, `metrics.headline`, threshold colours from `config.tone_*` | widgets rearrangeable; layout persisted |
| 3 | `/lab` Lab Reports | KPIs + charts from `metrics.lab_*` | as above |
| 4 | `/trucks` Truck Delivery | KPIs + charts from `metrics.truck_*` | as above |
| 5 | `/data` Data Entry | One Glide Data Grid per sheet; sheet switcher; create/rename/delete sheet | inline edit, range copy/paste from Google Sheets/Excel, right-click column → insert / delete / reorder / rename / retype / resize / colour / bold; right-click cell/row → format; undo/redo; autosave |
| 6 | `/charts` Chart Analysis | TradingView-style time-series workspace over any sheet column | pan/zoom, crosshair, multi-series compare, two synced panels side by side, drawing tools (trend line, horizontal, vertical, ray, measure), save/load named workspaces |

Navigation is a left icon rail, not buttons in flow. Global dark theme with full
light parity, driven by the Design System tokens.

## 4. Data model

### 4.1 Core tables — FIXED, carried over unchanged

`batch`, `truck`, `lab`, `meta`, `alarm_ack` keep their current schemas
(`src/db.py`). `metrics.py` reads these directly and must keep working without
modification. Meaning of every column is frozen; see the previous README's
"How data flows" and "Threshold rules" sections.

### 4.2 New tables — v2 additions (additive migrations only)

```sql
sheet (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,       -- user-visible sheet name
  kind          TEXT NOT NULL,              -- 'core' | 'custom'
  source_table  TEXT,                       -- for kind='core': 'batch'|'truck'|'lab'
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

sheet_column (
  sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,              -- stable column id
  label         TEXT NOT NULL,              -- header text (Turkish, user-editable for custom)
  type          TEXT NOT NULL,              -- 'text'|'number'|'int'|'date'|'time'|'bool'
  position      INTEGER NOT NULL,
  width         INTEGER,
  hidden        INTEGER NOT NULL DEFAULT 0,
  is_extra      INTEGER NOT NULL DEFAULT 0, -- user-added column on a core sheet
  format_json   TEXT,                       -- default cell format for the column
  PRIMARY KEY (sheet_id, key)
);

sheet_cell_format (
  sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
  row_key       TEXT NOT NULL,              -- core: PK value; custom: custom_row.id
  col_key       TEXT NOT NULL,
  format_json   TEXT NOT NULL,              -- { bold, italic, color, bg, align }
  PRIMARY KEY (sheet_id, row_key, col_key)
);

custom_row (
  id            INTEGER PRIMARY KEY,
  sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  data_json     TEXT NOT NULL              -- { col_key: value, ... }
);

sheet_extra_cell (                          -- values for is_extra columns on core sheets
  sheet_id      INTEGER NOT NULL REFERENCES sheet(id) ON DELETE CASCADE,
  row_key       TEXT NOT NULL,
  col_key       TEXT NOT NULL,
  value         TEXT,
  PRIMARY KEY (sheet_id, row_key, col_key)
);

dashboard_layout (
  page          TEXT NOT NULL,              -- 'overview'|'press'|'lab'|'trucks'
  widget_id     TEXT NOT NULL,
  x INTEGER, y INTEGER, w INTEGER, h INTEGER,
  config_json   TEXT NOT NULL,              -- widget type + its params
  PRIMARY KEY (page, widget_id)
);

chart_workspace (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  layout_json   TEXT NOT NULL,              -- panels, series, drawings, view range
  updated_at    TEXT NOT NULL
);

schema_migrations (
  version       INTEGER PRIMARY KEY,
  applied_at    TEXT NOT NULL
);
```

- **Core sheets** (`kind='core'`) map 1:1 onto `batch`/`truck`/`lab`. Editing a
  non-extra cell writes through to the real table via `db.py`'s typed writers
  (validation first). Column reorder/resize/hide/format and extra columns are
  presentation state only — they never alter the core table.
- **Custom sheets** (`kind='custom'`) are fully generic (`custom_row.data_json`).
  They feed the Chart Analysis page but not the fixed KPI pages unless a mapping
  is added later.

### 4.3 Storage location

Unchanged from `config.py`: read-only resources in the bundle, the SQLite DB and
exports in a per-user writable dir (`%LOCALAPPDATA%/UretimPaneli` on Windows,
`~/Library/Application Support/UretimPaneli` on macOS — update `config.py`
`STATE_DIR` for the mac branch). Data survives reinstall.

## 5. Repository layout (target)

```
backend/
  main.py                 FastAPI app, static mount, port handshake
  core/
    config.py             ← moved from src/, mac STATE_DIR branch added
    db.py                 ← moved from src/, extended with v2 tables
    migrations/            NNNN_description.py, run in order, tracked in schema_migrations
    ports.py              free-port pick + handshake
  domain/
    metrics.py            ← moved from src/, unchanged logic
    ingest.py             ← moved from src/
    excel_io.py           ← moved from src/
    fmt.py                ← moved from src/ (server-side formatting only)
  api/
    sheets.py  rows.py  metrics.py  dashboard.py  charts.py  importer.py  health.py
  tests/
    test_metrics_baseline.py   asserts the reconciled values (see docs/RULES.md)
    test_rows_writeback.py  test_migrations.py  ...
frontend/
  index.html
  vite.config.ts
  src/
    main.tsx  App.tsx  routes.tsx
    pages/        Overview/  PressAnalysis/  LabReports/  TruckDelivery/  DataEntry/  ChartAnalysis/
    components/   widgets/  SheetGrid/  ChartCanvas/  ContextMenu/  KpiTile/  ErrorBoundary/
    lib/          api.ts (typed client)  ws.ts  query.ts  tokens.ts  format.ts (Intl tr-TR)
    styles/       tokens.css (from Design System)  components.css
  tests/          unit (vitest)  e2e (playwright)
electron/
  main.ts               window, lifecycle, menu
  preload.ts            contextBridge — no nodeIntegration in renderer
  sidecar.ts            spawn backend, /health poll, restart policy, teardown
  tsconfig.json
build/
  pyinstaller/uretim-backend.mac.spec
  pyinstaller/uretim-backend.win.spec
  electron-builder.yml
.github/workflows/
  ci.yml               lint + typecheck + pytest + vitest + playwright on push
  release.yml          matrix {macos-latest, windows-latest} → dmg + nsis on tag
data/seed/             Production_Stats.xlsx, pres_kalite_kontrolleri.csv  (unchanged)
docs/                  this folder
```

The legacy Streamlit files (`app.py`, `launcher.py`, `src/theme.py`, `src/ui.py`,
`src/icons.py`, `src/charts.py`, `src/sections/*`, `src/data_panel.py`,
`src/canvas.py`, `src/marks.py`, `src/custom.py`, `src/alarms.py`,
`src/kpi_panel.py`, `UretimPaneli.spec`, `.streamlit/`) are removed once the
phase that replaces each one lands — not before. Track removals in the roadmap.

## 6. Reuse

| Keep (move to `backend/`) | Why |
| --- | --- |
| `src/metrics.py` | every derived figure, already reconciled against the workbook |
| `src/ingest.py` | workbook cleaning pipeline + edge-case fixes |
| `src/excel_io.py` | import preview/commit + workbook export |
| `src/config.py` | paths, section registry, `tone_*` threshold rules, `LAB_*` specs |
| `src/db.py` | SQLite schema + typed reads/writes for core tables |
| `src/fmt.py` | Turkish-locale formatting (server side; renderer uses `Intl` for its own) |
| `assets/tokens/*.css`, `Üretim Paneli Design System/styles.css` | the visual language — dark + light parity |

| Drop / rewrite | Replaced by |
| --- | --- |
| `app.py`, `launcher.py` | `backend/main.py` + `electron/` |
| `src/theme.py`, `src/ui.py`, `src/icons.py` | React components + `styles/` |
| `src/charts.py` (Plotly) | ECharts + lightweight-charts |
| `src/sections/*` | `frontend/src/pages/*` |
| `src/data_panel.py`, `src/canvas.py`, `src/marks.py`, `src/custom.py`, `src/kpi_panel.py` | Data Entry page + dashboard widgets |
| `UretimPaneli.spec`, `.streamlit/` | `build/pyinstaller/*`, `build/electron-builder.yml` |

## 7. Library choices (pinned versions set at scaffold time)

| Concern | Choice | Licence | Notes |
| --- | --- | --- | --- |
| Renderer framework | React 18 + TypeScript + Vite | MIT | |
| Routing | React Router v6 | MIT | 6 static routes |
| Server state | TanStack Query v5 | MIT | + WS-driven invalidation |
| Dashboard grid | react-grid-layout | MIT | drag + resize, responsive off (fixed canvas) |
| Data grid | @glideapps/glide-data-grid | MIT | canvas; best Sheets copy/paste; custom header menu + cell-format overlay built on top |
| KPI/page charts | ECharts (echarts + echarts-for-react) | Apache-2.0 | |
| Chart Analysis | TradingView lightweight-charts v5 | Apache-2.0 | engine only; drawing-tools layer is custom, synced to the time scale |
| Backend | FastAPI + uvicorn + Pydantic v2 | MIT | |
| Packaging (backend) | PyInstaller | GPL w/ exception | per-OS specs |
| Packaging (app) | Electron + electron-builder | MIT | dmg + nsis |
| Backend tests | pytest | MIT | |
| Frontend tests | Vitest + Playwright | MIT | |

If a choice needs to change, update this table and note why in the roadmap
before switching.

## 8. Security / stability posture

- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`; all
  privileged calls go through `preload.ts` `contextBridge`.
- Backend listens on loopback only; rejects `Origin`/`Host` values other than
  the renderer's.
- Every write endpoint validates with a Pydantic model before touching SQLite.
- SQLite in WAL mode, one writer; long reads never block the writer.
- Migrations are forward-only, one transaction each, recorded in
  `schema_migrations`; the app refuses to start if the DB is newer than the code.
- Renderer: an error boundary around every page and every dashboard widget, so a
  single failing widget degrades to a placeholder instead of a white screen.
- Sidecar crash → Electron restarts it (capped retries, then a friendly error
  window with the log path).
