# Coding Standards — Üretim Paneli v2

Conventions Claude follows when writing code in this repo. When in doubt, match
the surrounding file.

## 0. Principles

1. **Stability over cleverness.** Boring, explicit, well-tested code. No
   speculative abstraction — build the second use case before generalising.
2. **Types are the spec.** Full type coverage both sides. A `mypy` / `tsc` error
   is a build failure, not a warning.
3. **Small, reviewable changes.** One concern per commit. A phase is many
   commits, not one.
4. **Every feature ships with tests.** No "tests later."
5. **The user-facing Turkish strings are frozen.** Never translate or reword.

---

## 1. Python (backend)

- **Version:** 3.11+. `from __future__ import annotations` at the top of every
  module (matches the existing codebase).
- **Style:** Black (line length 88) + Ruff. Ruff rules: `E,F,I,UP,B,SIM,TID`.
  `mypy --strict` on `backend/` except the carried-over v1 modules —
  `backend/domain/*` plus `backend/core/db.py` and `backend/core/config.py`
  (moved verbatim) — which stay at the current typing level until a phase
  touches them. Config for both lives in the repo-root `pyproject.toml`; run
  `ruff`/`mypy`/`pytest` from the repo root.
- **Runtime:** CPython **3.12** for the backend venv (`brew install
  python@3.12`). 3.13/3.14 have no working pandas/numpy build yet. `numpy` is
  pinned just under pandas' ABI bound in `backend/requirements.txt`.
- **Imports:** stdlib / third-party / local, blank-line separated, `isort`
  ordering via Ruff `I`.
- **FastAPI:**
  - One `APIRouter` per resource file in `backend/api/`, mounted in `main.py`.
  - **Every** request body and query set is a Pydantic v2 model. No raw `dict`
    in, no raw `dict` out — response models too.
  - Endpoints are thin: validate → call a `domain/` or `core/` function →
    serialise. No business logic in the route function.
  - Errors: raise `HTTPException` with a stable machine `code` string in
    `detail`, plus a Turkish `message` for display. Never leak tracebacks to
    the renderer; log them server-side with the request id.
- **Database:**
  - All SQL goes through `core/db.py`. No SQL string-building in `api/` or
    `domain/`.
  - Parameterised queries only — never f-string a value into SQL.
  - Writes run in an explicit transaction; one writer at a time. Reads use a
    short-lived connection.
  - Schema changes = a new `core/migrations/NNNN_*.py`, forward-only, one
    transaction, appended to `schema_migrations`. Never edit an applied
    migration. Never `DROP` or rewrite a core-table column.
- **`domain/` (metrics, ingest, excel_io):** treat as load-bearing legacy. Keep
  the public function signatures stable — `api/` depends on them and
  `test_metrics_baseline.py` locks their output. Refactors need the baseline
  test green before and after.
- **Naming:** `snake_case` functions/vars, `PascalCase` classes, `UPPER_SNAKE`
  constants. Turkish domain terms stay in their Turkish form in identifiers
  where the existing code already does (`toplam_verim`, `bekleme`, `sikim_brix`).
- **Docstrings:** module-level docstring saying what the module is for; function
  docstrings when the name isn't self-evident. Match the terse style already in
  `metrics.py`.
- **Logging:** `logging` module, not `print`. Structured-ish: `logger.info("row
  write", extra={"sheet": id, "row": key})`.
- **Tests:** `pytest`, files `backend/tests/test_*.py`. Use a temp SQLite file
  per test (fixture), seeded from `data/seed/`. Name tests
  `test_<unit>_<condition>_<expectation>`.

---

## 2. TypeScript / React (frontend)

- **Version:** TS 5.x, `strict: true`, `noUncheckedIndexedAccess: true`,
  `exactOptionalPropertyTypes: true`. React 18, function components only.
- **Style:** ESLint (`@typescript-eslint`, `react-hooks`, `react-refresh`) +
  Prettier. No `any` — use `unknown` and narrow. No non-null `!` except in tests.
- **Files:** one component per file, `PascalCase.tsx`. Co-locate
  `Component.tsx`, `Component.module.css`, `Component.test.tsx`. Hooks in
  `useThing.ts`. Barrel `index.ts` only at `pages/` and `components/` roots.
- **State:**
  - Server data: **TanStack Query** only. No fetch-in-`useEffect`, no Redux.
    Query keys are typed arrays from `lib/queryKeys.ts`.
  - The WS channel calls `queryClient.invalidateQueries` — components never read
    the socket directly.
  - Local UI state: `useState` / `useReducer`. Cross-page persistent UI state
    (theme, last sheet) via a small typed context + `localStorage`, guarded with
    try/catch.
- **API client:** all calls go through `lib/api.ts`. It owns base URL (from the
  Electron port handshake), typed request/response, and error normalisation to
  `{ code, message }`. No `fetch` anywhere else.
- **Errors:** an `<ErrorBoundary>` wraps every route element and every dashboard
  widget. Fallback is a compact card with the Turkish message + a retry, never a
  blank screen. Log the error to the main process via the preload bridge.
- **Styling:**
  - Design System tokens are CSS custom properties in `styles/tokens.css`.
    Components read `var(--…)` — no hard-coded hex, no magic px for anything the
    tokens cover (spacing, radius, colour, typography).
  - CSS Modules per component. No CSS-in-JS runtime. No Tailwind.
  - Dark is the base; light is a `:root[data-theme="light"]` re-scope. Every
    colour must resolve in both. Check both before calling a component done.
  - Never set visibility via `display` toggling in JS where a class will do.
- **Charts:** ECharts option objects built by typed factory functions in
  `components/widgets/charts/`. Palette from tokens. lightweight-charts setup
  isolated in `pages/ChartAnalysis/` — its drawing layer is its own module with
  its own tests.
- **Grid (Data Entry):** all Glide Data Grid glue lives under
  `components/SheetGrid/`. Column-menu, paste, format-overlay, and undo are
  separate modules there, each unit-tested. The grid component takes a typed
  `SheetModel` and emits typed edit events — no API calls inside it.
- **Naming:** components `PascalCase`, hooks `useCamelCase`, other functions
  `camelCase`, types/interfaces `PascalCase` (no `I` prefix), constants
  `UPPER_SNAKE`. Event handlers `handleX`; props that are callbacks `onX`.
- **Turkish:** all user-facing copy from a single `frontend/src/i18n/tr.ts`
  map — no inline string literals in JSX for visible text. Values are frozen
  copy; keys are English.
- **Tests:** Vitest + Testing Library for units/components
  (`*.test.tsx`, behaviour not implementation). Playwright for the flows called
  out in the roadmap (`frontend/tests/e2e/*.spec.ts`).

---

## 3. Electron

- **TS**, same lint/prettier config. `electron/` is its own tsconfig.
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
  `preload.ts` exposes a **minimal, typed** API via `contextBridge` — log,
  open-log-dir, backend port, app version. Nothing else.
- `sidecar.ts` owns the backend lifecycle: pick binary path (dev = `python -m
  uvicorn`, prod = bundled binary), spawn, read the port line, poll `/health`
  with a timeout, restart on non-zero exit up to N times with backoff, then show
  an error window naming the log path. `SIGTERM` on `before-quit`, `SIGKILL`
  fallback — **no orphaned backend process, ever.**
- No remote content. `webSecurity` stays on. External links open in the OS
  browser via `shell.openExternal`, never in-app.
- Single instance lock on.

---

## 4. Git & process

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `build:`, `chore:`. Scope optional: `feat(data-entry): …`.
- Branch per phase or per sub-feature; never commit straight to `main` once
  `main` exists. Rebase, don't merge-commit, for small branches.
- A commit must build and pass lint + typecheck + the fast test suite locally.
- End commit messages with the Co-Authored-By trailer per repo policy.
- Never `git push`, force-push, or open a PR unless the user asks.
- Update `docs/ROADMAP.md` checkboxes in the same commit as the work.

## 5. Dependencies

- Pin exact versions (`==` / no `^`) in `requirements.txt` and `package.json`.
- Adding a dependency: justify it in the roadmap/PR, check the licence is in the
  approved set (MIT / Apache-2.0 / BSD / ISC / PSF), prefer one already pulled in
  transitively. No GPL/AGPL runtime deps in the shipped app (PyInstaller's
  runtime exception is fine).
- Lockfiles (`package-lock.json`, and a pinned `requirements.txt`) committed.

## 6. Performance budgets

- Data Entry grid: smooth scroll/edit at 50k rows. Virtualised always.
- Chart Analysis: interactive pan/zoom at 50k points per series (decimate on
  zoom-out).
- App cold start (packaged) to first interactive page: < 4 s on a mid spec
  machine.
- No main-thread block > 100 ms during interaction — move heavy transforms to a
  web worker or the backend.

## 7. Accessibility (baseline, not exhaustive)

- Keyboard reachable: nav rail, grid cells, dialogs, drawing-tool selection.
- Focus visible, focus trapped in modals, `Esc` closes.
- Colour is never the only signal — pair threshold colour with an icon or label.
- Respect `prefers-reduced-motion` for the drag/resize/chart animations.
