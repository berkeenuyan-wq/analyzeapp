# Rules — Üretim Paneli v2

Hard guardrails. These override convenience, speed, and any casual instruction in
chat. If a request conflicts with a rule here, **stop and surface the conflict**
before acting.

## Data integrity

1. **Core table schemas are frozen.** `batch`, `truck`, `lab`, `meta`,
   `alarm_ack` keep their columns, types, and meaning. No renaming, no dropping,
   no type changes. New needs → a new v2 table or an `is_extra` column, never a
   change to a core table.
2. **All schema changes are forward-only migrations.** One numbered file in
   `backend/core/migrations/`, one transaction, recorded in `schema_migrations`.
   Never edit a migration that has shipped. No `Base.metadata.create_all`-style
   auto-schema against a real DB.
3. **No destructive operation without an explicit, specific user "yes"** in the
   current session: dropping a table, deleting rows in bulk, truncating,
   `git clean`, `rm -rf` outside the scratchpad, rewriting history, emptying the
   exports dir.
4. **Every write is validated before it reaches SQLite** — a Pydantic model on
   the way in, `db.py` typed writers at the boundary. No pass-through of raw
   client JSON into a query.
5. **The SQLite file is the source of truth and lives in the per-user state
   dir**, never inside the app bundle. Never point the app at a DB inside
   `data/seed/`. Seed data is copied in on first run, never written back.
6. **Excel is import/export, not storage.** The workbook's own pre-computed
   cells are treated as stale — derived figures are always recomputed by
   `metrics.py`. (Carried over from v1.)

## Metric baseline

7. `backend/tests/test_metrics_baseline.py` locks the reconciled values from the
   v1 README's "Known deviations" section and the current `metrics.py` output on
   the seed data. Examples that must stay stable unless the user approves a
   change:
   - Ort. Toplam Verim ≈ 91.05, Ort. Batch Süresi ≈ 112.71 (recomputed, not the
     workbook's stale 91.24 / 115.06)
   - `FARK_TOLERANCE = 5.0`; `tone_*` bands exactly as in `config.py`
   - Lab reading → batch window matching rule (same day, same press, control
     time inside `başlangıç–bitiş`, tightest window wins; unmatched = *eşleşmedi*)
   - `LAB_SPECS_CONFIRMED = False` and the "eşikler doğrulanmadı" footnote stay
     until the user says the plant lab signed off
8. A refactor that changes any baseline value is a bug until the user confirms
   the new number is correct. Run the baseline test before and after.

## UI / copy

9. **Turkish user-facing strings are fixed.** Section labels, KPI names, table
   headers, button/menu text — do not translate, localise to another dialect,
   reword, or "clarify". They live in `frontend/src/i18n/tr.ts` and
   `config.py`. New strings get written once, in Turkish, and then frozen.
10. **Dark and light must both work.** No colour defined only for one theme. A
    page/component isn't done until checked in both.
11. **No button-and-rerun interaction.** Editing, moving, resizing, and drawing
    are direct manipulation. Navigation is the icon rail. Modal dialogs only for
    genuinely blocking confirmations (delete sheet, replace-all import).
12. **Threshold colour is never the only signal** and is driven by the measure's
    semantics (`good_when` / `tone_*`), not by arrow direction.

## Process & runtime

13. **No orphaned backend process.** Electron must terminate the sidecar on
    every exit path, including crash and force-quit. A test/CI check guards this.
14. **Backend binds loopback only**, on an ephemeral port. Never `0.0.0.0`,
    never a fixed public port, no auth-free endpoint reachable off-machine.
15. **Renderer stays sandboxed:** `contextIsolation` on, `nodeIntegration` off,
    `sandbox` on, `webSecurity` on. Privileged calls only through the typed
    `preload` bridge.
16. **Tests pass before a task is done.** Lint + typecheck + unit suite locally;
    CI green on push. A failing test is never "expected" without a written
    reason in the roadmap.
17. **Pinned dependencies only.** Exact versions, committed lockfiles, approved
    licences (MIT / Apache-2.0 / BSD / ISC / PSF). No new runtime GPL/AGPL dep.
18. **Cross-platform or documented.** Code targets macOS and Windows. If
    something can only be built/tested on one right now (signing, the Windows
    installer), say so in the roadmap — don't pretend it's done.
19. **Don't delete legacy files early.** A v1 file is removed only in the phase
    whose exit criteria replace it, and the removal is listed in the roadmap.

## Working style for Claude

20. **Follow the roadmap order.** Current phase only, unless told otherwise.
21. **Ask before outward-facing or irreversible actions** — pushing, publishing,
    installing global tooling, changing CI secrets, touching certificates.
22. **Surface uncertainty.** If a plant-domain fact (a threshold, a formula, a
    unit) is unconfirmed, keep it neutral/provisional and flag it — as v1 did
    with Sıkım Asitlik and the lab bands. Don't guess a number into the product.
23. **Keep the docs true.** Update `docs/ROADMAP.md` status and checkboxes with
    the work. If reality diverges from `ARCHITECTURE.md`, fix the doc in the
    same change.
