# assets/

**There is no logo.** The sources supplied for this design system (a written brand
direction plus one reference dashboard screenshot) contained no wordmark, symbol or
brand mark for the plant or for Üretim Paneli. None was drawn or reconstructed.

Wherever a mark would go — the sidebar header, a document header, an export cover —
render the product name in plain type instead:

- Sidebar: a 28px `--radius-sm` tile filled `--accent-tint-14` with the Lucide
  `factory` glyph in `--accent-base`, followed by "Üretim Paneli" in
  `--type-card-title` and the plant name beneath in `--text-2xs`/`--text-subtle`.
  This is what `components/navigation/Sidebar.jsx` ships.
- Larger surfaces: "Üretim" in Geist Semibold with a `--accent-base` full stop
  after it (see `thumbnail.html`).

**Icons are not vendored here.** See the ICONOGRAPHY section of `../readme.md`:
the system uses Lucide from CDN because no icon set came with the sources.

To fix either gap: drop `logo.svg` (and `logo-mark.svg`) into this folder and any
font binaries into `assets/fonts/`, then tell the design agent they exist.
