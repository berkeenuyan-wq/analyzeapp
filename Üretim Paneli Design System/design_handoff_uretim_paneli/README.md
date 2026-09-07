# Handoff: Üretim Paneli — production analytics dashboard

## Overview

**Üretim Paneli** is the internal production-analytics dashboard for an
apple-pressing juice plant (Bucher press line). It is used daily by plant
supervisors and production managers to track press throughput and yield, the mass
balance between truck intake and pressed volume, and truck-unloading logistics.
It also has a manual data-entry form that writes back to the source Excel file.

**The UI is entirely in Turkish.** Desktop-first (1440–1920 wide), occasionally
used on a tablet on the plant floor.

Five sections, whose names are **fixed strings — never translate or reword them**:

| id | Section | Purpose |
| --- | --- | --- |
| `genel` | **Genel Bakış** | Plant-wide overview: headline figures, per-press blocks, daily performance trend |
| `pres` | **Pres Performansı** | Batch-level press stats; Pres 1 / Pres 2 |
| `posa` | **Posa Analizi** | Mass balance (Araç vs Pres farkı) against ±5% tolerance |
| `arac` | **Araç Lojistiği** | Truck intake, unloading speed, waiting time |
| `giris` | **Veri Girişi** | Manual batch + truck entry, writes to the Excel workbook |

## Target environment

**The existing app is Streamlit (Python).** The intended outcome is to bring this
visual system to that app — most of it is achievable with `st.markdown(...,
unsafe_allow_html=True)` plus one injected `<style>` block, `st.columns` for the
grids, and a charting layer (Plotly or Altair) themed from the tokens below. See
"Streamlit implementation notes" at the end.

If you are instead starting a fresh app, or replacing Streamlit, pick the
framework that fits the project and implement the same designs there.

## About the design files

Everything in `design_system/` is a **design reference written in HTML/JSX** — a
prototype showing intended look and behaviour. **It is not production code to
copy.** The React components exist to make the prototype real and to pin down
exact values; recreate their appearance using the target codebase's own patterns.

The one file you should treat as near-shippable is **`design_system/styles.css`
and the `tokens/` files it imports** — those are plain CSS custom properties and
can be injected into Streamlit as-is.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, radii, shadows, motion and
interaction states. Recreate pixel-accurately. Every numeric value in this README
is authoritative; do not round or snap to a 4/8px grid.

Two known substitutions, flagged for replacement:

- **Fonts** — Geist + Geist Mono from Google Fonts. No licensed plant face was
  supplied. Swap if one exists.
- **Icons** — Lucide 0.454.0 from CDN, at stroke-width **1.75** (not Lucide's
  default 2). No plant icon set was supplied.
- **Logo** — there is none. The brand slot renders the product name in plain
  type. Do not invent a mark.

---

## The data model

Everything in the panel derives from **exactly two source tables** in the plant's
Excel workbook. There is no other primary data.

### Table 1 — batch press stats (one row per batch)

| Column group | Columns |
| --- | --- |
| **GENEL** | `Pres` (Pres 1 / Pres 2) · `Batch No` · `Tarih` · `Reçete` · `Başlangıç` · `Bitiş` · `Batch Süresi (dk)` |
| **F/P FAZI (DOLUM / PRES)** | `F Toplam Dolum Q15 (kg)` · `F/P Filtrat Miktarı (kg)` · `F/P Verim Q26 (%)` · `F/P Performans Q27 (t/sa)` · `F Tank Sıcaklığı (°C)` |
| **NW FAZI (YIKAMA)** | `NW Çevrim Sayısı` · `NW Toplam Su (l)` |
| **TOPLAMLAR** | `Toplam Verim (%)` · `Üretim Süresi (%)` · `Kesinti Süresi (%)` · `Kalan Süre (%)` |
| **YARDIMCI** | `Notlar` |

Reçete values seen: `Enz. 1 Sld. Elma` (Pres 1), `Enzimli 1 Sld. Elma` (Pres 2).

### Table 2 — Araç Takip Tablosu (one row per intake truck)

`Tarih` · `Araç` (numbered per day, not by plate) · `Ürün` · `Miktar (kg)` ·
`Başlangıç` · `Bitiş` · `Süre (dk)` · `Hız (kg/dk)` · `Bekleme (dk)`

### Derived figures

- **Headline:** İşlenen Toplam Ürün Miktarı (ton) · Ort. Toplam Verim (%) ·
  Ort. Batch Süresi (dk) · Çıkan Toplam Ürün ortalaması (t/sa) ·
  Saatlik Ortalama Toplam Posa (t/sa)
- **Per press:** Toplam Çalışma Süresi (saat) · Giren Toplam Ürün (ton) ·
  Çıkan Toplam Ürün (ton) · Saatlik Ortalama (t/sa) · Saatlik Ortalama Toplam Posa (t/sa)
- **GÜNLÜK PRESS PERFORMANSI TON/SA:** per day — Press 1/2 Performansı (t/h),
  Toplam Performans, per-press Toplam Girdi/Çıktı, Toplam Giren/Çıkan, Verim,
  Leeching Verimi (%), Ortalama Verim (%)
- **ÖN HATLAR ANALİZ — GÜNLÜK ARAÇ vs PRES FARKI:** Araç Toplamı (kg) ·
  Pres Toplamı (kg) · Fark (kg) · **Fark (%)**
  `Fark % = (Araç Toplamı − Pres Toplamı) / Araç Toplamı × 100`, tolerance **±5%**
- **Araç istatistikleri:** Kayıtlı Araç Sayısı · Ortalama Bekleme Süresi (dk) ·
  Toplam Kayıp Zaman (dk) · Ortalama Boşaltma Süresi (dk) ·
  Ortalama Boşaltma Hızı (kg/dk) · Toplam Gelen Ürün (ton)

A faithful transcription of real sample data (24 batches, 9 trucks, all derived
sheets) is in **`design_system/ui_kits/uretim-paneli/data.js`** — use it as
fixture data while building.

### Threshold rules (mirroring the workbook's conditional fills)

| Measure | Green | Amber | Red |
| --- | --- | --- | --- |
| Toplam Verim (%) | ≥ 93 | 90–93 | < 90 |
| F/P Verim Q26 (%) | ≥ 86 | 83–86 | < 83 |
| F Tank Sıcaklığı (°C) | ≤ 23 | 24–28 | > 28 |
| Kesinti Süresi (%) | < 5 | 5–10 | > 10 |
| Fark (%) | \|x\| ≤ 5 | — | \|x\| > 5 |
| Bekleme (dk) | ≤ 15 | 16–60 | > 60 |

**Colour rule, absolute:** colour only ever signals meaning. Green = in
tolerance/favourable, red = over threshold, amber = approaching, grey = a state
with no verdict (press name, shift, "no change"). Never colour for emphasis or
decoration.

---

## Design tokens

The authoritative source is `design_system/styles.css` → `design_system/tokens/*.css`.
Dark is the primary theme; **full light parity** is required — every semantic
alias is re-pointed under `[data-theme="light"]`.

### Colour — dark (default)

| Token | Value | Use |
| --- | --- | --- |
| `--bg-app` | `#0b0b0e` | page |
| `--bg-nav` | `#0e0e12` | sidebar, top bar |
| `--surface-card` | `#121216` | card |
| `--surface-inset` | `#17171c` | inner card, form field bg, segmented track |
| `--surface-raised` | `#1d1d23` | selected segment, dropdown |
| `--surface-hover` | `rgba(255,255,255,.035)` | row/nav hover |
| `--border-subtle` | `#212127` | table rows, dividers |
| `--border-card` | `#1e1e25` | card frame |
| `--border-strong` | `#2f2f39` | secondary button, totals row |
| `--border-field` | `#2a2a33` | input border |
| `--text-primary` | `#f4f4f6` | metrics, titles |
| `--text-body` | `#d6d6dc` | body, table cells |
| `--text-muted` | `#a8a8b3` | labels |
| `--text-subtle` | `#6f6f7b` | footnotes, axis |
| `--text-disabled` | `#4b4b57` | disabled, em-dash placeholders |

**Accent — one vivid magenta:**
`--accent-base #e0409e` · hover `--accent-bright #ea5cae` · press `--accent-deep #c22f85`
· tints at 8/14/24/40% alpha.

The accent appears in exactly these places and nowhere else: primary buttons; the
active sidebar item's icon + its 2.5px indicator bar; the hero metric's overline
glyph and its faint background glow; the active table column's sort indicator;
the required-field asterisk.

**Signal colours:**
`--signal-good #3ecf8e` · `--signal-caution #e8b53f` · `--signal-bad #f0525b` ·
`--signal-neutral #8f8f9b`, each with a `-tint` at ~14% alpha and a `-border` at
~30% alpha.

**Chart series (ordered; series 1 is always the primary measure):**
`#e0409e` `#3ecf8e` `#5b8def` `#e8b53f` `#a06ce8` `#4bc2c7`.
Gridlines `rgba(255,255,255,.055)`, axis text `#6f6f7b`.

### Colour — light

`--bg-app #f6f6f8` · card `#ffffff` · inset `#f7f7f9` · borders `#e7e7ec` /
`#e4e4ea` / `#d3d3dc` · text `#141419` / `#2c2c35` / `#5c5c69` / `#84848f`.
Accent darkens to `#c8318a`; signals to `#1d9c67` / `#b8860c` / `#d23a44`;
series to `#c8318a` `#1d9c67` `#3a6fd8` `#b8860c` `#7d47c4` `#1e9ba1`.

### Typography

Geist (UI) / Geist Mono (numeric table cells). **Tabular figures on globally:**
`font-feature-settings: "tnum" 1, "cv01" 1`.

| Role | Spec |
| --- | --- |
| Hero metric | 64px / 600 / line-height 1 / letter-spacing −0.025em |
| KPI metric | 30px / 600 / 1 / −0.025em |
| Page title | 24px / 600 / 1.2 / −0.012em |
| Card title | 15px / 600 / 1.35 / −0.012em |
| Body | 14px / 400 / 1.5 |
| Caption / footnote | 13px / 400 / 1.35 |
| Form label | 12px / 500 / 1.35 |
| Overline & table header | 11px / 600 / uppercase / letter-spacing 0.06em |
| Numeric table cell | Geist Mono 13px / 500 / tabular |

Nothing informational below 11px.

### Spacing

Scale: `2 4 6 8 12 16 20 24 32 40 48 64 80`.

Layout constants: card padding **20px** (tight 14px) · gap between cards **16px**
· gap between page sections **24px** · page padding **28px / 24px** · sidebar
**232px** (collapsed **64px**) · top bar **64px** · content column max **1560px**,
centred · control heights **30 / 36 / 42px** · minimum hit target **44px** (tablet).

### Radii

`5px` chips · `8px` controls and inputs · `10px` inset cards · **`14px` cards** ·
`18px` the hero panel · full pill for badges, search field, icon buttons (icon
buttons are always circular).

### Shadows

```
--shadow-card:   0 1px 1px rgba(0,0,0,.30), 0 10px 28px -18px rgba(0,0,0,.70)
--shadow-raised: 0 2px 4px rgba(0,0,0,.34), 0 18px 44px -22px rgba(0,0,0,.78)
--shadow-pop:    0 8px 12px -6px rgba(0,0,0,.44), 0 26px 60px -24px rgba(0,0,0,.82)
--glow-accent:   0 0 0 1px rgba(224,64,158,.24), 0 8px 24px -10px rgba(224,64,158,.40)
--ring-focus:    0 0 0 3px rgba(224,64,158,.40)
```

Light theme: `0 1px 2px rgba(20,20,26,.05), 0 6px 18px -12px rgba(20,20,26,.14)` etc.

The hairline border does the separating; the shadow only lifts the card off the
near-black page.

### Motion

140ms control-level changes (hover, focus, background) · 200ms panels and sidebar
collapse · 320ms a threshold marker or bar sliding to a new value · 600ms a
chart's first draw. **One easing for everything:** `cubic-bezier(.2,0,.2,1)`.

No bounce, no spring, no overshoot, no counting-up numbers, no attention
animation. `prefers-reduced-motion` sets every duration to 0.

---

## Layout system

**Page rhythm is fixed. Every section follows it:**

```
SectionHeader  →  (Alert, if any)  →  HeroMetric  →  KPI row of 4  →  chart row  →  detail table
```

**Exactly one hero metric per page.** KPI tiles run 4 across desktop, auto-fitting
to 2 at tablet width (`repeat(auto-fit, minmax(min(220px,100%), 1fr))`, gap 16).
Chart rows are a 2-column grid, typically `1.6fr 1fr` or `1fr 1fr`, gap 16.

**Fixed elements:** sidebar and top bar are fixed; only the content column
scrolls. Tables scroll horizontally *inside their card* rather than widening the
page. Alerts are inline at the top of the content column — **nothing floats, and
there are no toasts.**

**Backgrounds are flat.** No imagery, no illustration, no pattern, no texture, no
grain. There is exactly **one** gradient in the whole system: a barely-there
radial accent glow behind the hero metric (`rgba(224,64,158,.08)` fading to
transparent, positioned `inset: -40% 55% auto -10%`).

---

## Screens

Reference implementations, one file each, in
`design_system/ui_kits/uretim-paneli/`. Open `index.html` in a browser to click
through all five with a working dark/light toggle.

### Shell (`index.html`)

- **Sidebar** 232px, bg `--bg-nav`, right border `--border-subtle`, padding
  20px/16px. Brand block: a 28px `8px`-radius tile filled `--accent-tint-14` with
  a `1px --accent-tint-24` border holding the Lucide `factory` glyph in
  `--accent-base`; then "Üretim Paneli" (15/600) and "Elma Presleme Tesisi"
  (11px, `--text-subtle`). Nav items 38px tall, 8px radius, 12px horizontal
  padding, 3px vertical gap. **Active item:** background `--surface-raised`,
  border `--border-subtle`, icon in `--accent-base`, text `--text-primary` 500,
  plus a 2.5px × (height−18px) accent bar pinned 9px from the left edge, pill
  radius. **Hover:** `--surface-hover`, text → `--text-body`. Footer: an inset
  card showing a green 6px dot, `uretim.xlsx`, and "Son okuma 14:20 · N satır".
- **Top bar** 64px, bg `--bg-nav`, bottom border `--border-subtle`, 28px
  horizontal padding, 16px gap. Left: a ghost icon button toggling sidebar
  collapse. Then a **pill search field** — 34px tall, max-width 340px,
  `--surface-field` bg, `--border-field` border, full pill radius, 14px padding,
  Lucide `search` at 15px in `--text-subtle`, placeholder "Plaka veya tedarikçi
  ara". Right: circular 34px soft icon buttons (theme toggle sun/moon, refresh,
  bell), then a divider, then the user block — a 32px circular
  `--surface-raised` avatar with **initials only** ("MK"), name (13/500) and role
  (11px `--text-subtle`) stacked, and a 14px chevron-down.
- **Content** scrolls; padding 24px / 28px / 48px bottom; children stacked with
  24px gap; inner wrapper max-width 1560px, centred.

### 1. Genel Bakış (`GenelBakis.jsx`)

Hero: **İşlenen toplam ürün miktarı** (349,6 ton) with the ort.-toplam-verim
verdict badge, and an aside of three stacked figures (ort. toplam verim, çıkan
ort., saatlik ort. posa). KPI row: Ort. toplam verim / Ort. batch süresi / Çıkan
toplam ürün ort. / Saatlik ort. toplam posa. Then two side-by-side **per-press
cards** (Press 1, Press 2) each showing çalışma saat badge, giren / çıkan /
saatlik ort. as three figures, a çıkan-över-giren proportion bar, and a
hairline-separated saatlik posa row. Then a full-width **Günlük performans
trendi** line chart (Press 1 / Press 2 / Toplam, t/sa). Then the over-tolerance
alert if any day breaches ±5%, linking to Posa Analizi. Then the **Günlük press
performansı** table with a totals foot.

### 2. Pres Performansı (`PresPerformansi.jsx`)

Underlined in-page tabs: **Tüm presler / Pres 1 / Pres 2** with counts. Tabs
re-scope everything below. Hero: average Toplam Verim for the scope, with a
sparkline aside. KPI row: Ort. F/P verim Q26 / Ort. F/P performans Q27 / Ort.
batch süresi / Ort. kesinti süresi. Charts: a grouped bar of Toplam Verim + F/P
Verim per batch with a dashed red limit line at 91, and a line chart of F/P
Performans + F Tank Sıcaklığı. Then the **full batch table — all 19 workbook
columns**, with a free-text search over batch/tarih/reçete, threshold-coloured
F/P verim, tank temp as a coloured badge, Toplam Verim as a dotted badge,
kesinti coloured, and Notlar rendered as link-coloured text when present, an
em-dash otherwise. Totals foot sums dolum and filtrat.

### 3. Posa Analizi (`PosaAnalizi.jsx`)

Top alert when any day breaches. Hero: **Araç vs pres farkı** as a percentage,
verdict badge, and an aside carrying a **ThresholdMeter** (the ±5% tolerance
band) plus araç toplamı / pres toplamı / fark in kg. KPI row: saatlik ort. toplam
posa, per-press saatlik posa, ort. leeching verimi. Charts: daily Fark % bars
with the ±5 limit line (days with no records are excluded from the plot but shown
as "Kayıt yok" in the table), and a donut splitting the day's intake into
preslenen vs fark. Then the **Ön Hatlar Analiz table** (a 1:1 rendering of the
workbook sheet, zero-rows included), then a **low-verim batch table** listing
every batch under 90% Toplam Verim with a "verim kaybı" bar in points.

### 4. Araç Lojistiği (`AracLojistigi.jsx`)

Hero: **Toplam gelen ürün** (255,9 ton) with ort. bekleme / toplam kayıp zaman /
kayıtlı araç as the aside. KPI row: kayıtlı araç sayısı / ort. bekleme süresi
(red — over target) / ort. boşaltma süresi / ort. boşaltma hızı. Charts: grouped
bars of boşaltma hızı and bekleme per truck, and a **Günlük tablo** panel of
inset cards (one per day: miktar, press başlangıç–bitiş arası geçen süre, and a
bekleme badge) closing with a toplam kayıp zaman row. Then the **Araç Takip
Tablosu** 1:1, with a day segmented filter, free-text search, `null` bekleme
rendered as a disabled em-dash, and a bekleme-payı bar.

### 5. Veri Girişi (`VeriGirisi.jsx`)

Two tabs: **Batch kaydı** and **Araç kaydı**.

- **Batch tab:** a 3-column form grid over the workbook's own fields (Pres, Batch
  no, Tarih, Reçete, Başlangıç, Bitiş, F tank sıcaklığı, F toplam dolum Q15, F/P
  filtrat miktarı, NW çevrim sayısı, NW toplam su, Notlar). Below it, an inset
  **live-calculation card** showing derived **F/P Verim Q26** (`filtrat / dolum ×
  100`), the posa in kg (`dolum − filtrat`), and a verdict badge on the F/P verim
  thresholds. Validation: `filtrat > dolum` is an error on the field.
  Sub-83% verim raises a caution alert but does not block. Confirm-checkbox
  ("Kaydı onaylıyorum" / "Veriler uretim.xlsx dosyasına yazılır ve geri
  alınamaz.") gates the primary Kaydet button; save prepends to "Son kayıtlar".
- **Araç tab:** Tarih, Araç no, Ürün, Miktar, Başlangıç, Bitiş. Live-calculates
  **süre** (dk) and **hız** (kg/dk), badges against the 392,52 kg/dk average, and
  errors when bitiş ≤ başlangıç.
- Right rail: a **Dosya durumu** card (son okuma, row counts, yazma izni, and an
  info alert that the workbook must not be open elsewhere during a write) and a
  **Son kayıtlar** table that switches with the tab.

---

## Components

`design_system/components/<group>/` — each has `<Name>.jsx` (reference
implementation), `<Name>.d.ts` (the exact props contract) and `<Name>.prompt.md`
(what & when). **Read the `.d.ts` files** — they carry the prop semantics that
matter, especially:

- **`DeltaChip.goodWhen`** (`"up" | "down" | "none"`) — decouples arrow direction
  from colour, so a *falling* Fark % renders green and a *rising* one red. This is
  the single most important behavioural detail in the system.
- **`Card.tone`** — set `good`/`bad` **only** when the card's own metric breached
  a threshold, never for emphasis.
- **`DataTable` columns** — numeric columns must set both `numeric: true` and
  `align: "right"`; verdicts go in a `Badge` via `render`, never as coloured text.

Inventory: **core** Icon, Button, IconButton, Card, Badge, SectionHeader ·
**data** KpiCard, HeroMetric, DeltaChip, ThresholdMeter, Sparkline, ChartCard,
DataTable, StatBar · **forms** Field, TextInput, Select, Checkbox, Switch,
SegmentedControl, FormGrid · **navigation** Sidebar, SidebarItem, TopBar,
PageTabs · **feedback** Alert, EmptyState, Skeleton · **layout** AppShell,
CardGrid, SplitRow.

Deliberately **not** built (do not add them speculatively): Toast, Dialog/Modal,
Avatar, Tooltip, Accordion, Breadcrumb.

## Interaction states

- **Hover** — lighten by a step, never darken. Buttons → the `bright` accent or
  `--action-secondary-bg-hover`; nav items and rows pick up `--surface-hover`;
  text goes muted → primary. **No scaling, no lifting, no shadow change.**
- **Press** — `--accent-deep #c22f85`. No shrink transform.
- **Focus** — `--ring-focus` (3px accent at 40%) plus an accent border. Always
  visible; never removed.
- **Active/selected** — nav: tinted pill + accent icon + 2.5px accent bar.
  Segmented control: the segment lifts onto `--surface-raised` with
  `--shadow-card` — **not** the accent. Selected KPI tile: accent border +
  `--glow-accent`.
- **Disabled** — 45% opacity, `not-allowed` cursor. No greyscale filter.
- **Loading** — `Skeleton` shimmer, height-matched to the real element (30px for
  a KPI value, ~260px for a plot). A plain left-to-right shimmer; no pulse.
- **Empty** — `EmptyState` inside the card: a 40px inset icon tile, a Turkish
  title, one sentence of why/what next, optional action.

## State

Per the reference shell: `page` (one of the five ids), `theme` (`dark` | `light`,
written to `data-theme` on the root), `collapsed` (sidebar), `search` (top bar).
Per screen: the active tab, local filters (day, supplier, status), sort key +
direction, and — on Veri Girişi — the form object, the confirm checkbox, the
result alert, and the optimistic "Son kayıtlar" list.

Data fetching: read the two source tables; derive everything else. The panel
shows a **last-read timestamp** and row counts in the sidebar footer and on the
Dosya durumu card, so the read time needs to be part of state. Writes go back to
the workbook and are described to the user as irreversible.

## Copy rules

- Turkish throughout, without exception. English only in developer docs.
- Sentence case everywhere, except the five section titles (fixed title-case) and
  the hero overline + table headers (UPPERCASE, letter-spacing 0.06em).
- Impersonal and nominal; instructions use the polite imperative plural
  (*Tarihi değiştirin*, *Araç tartı kayıtlarını kontrol edin*).
- Flat and factual. A breach reads *Kütle dengesi toleransın dışında* — not
  *Dikkat!*, not *Bir şeyler ters gitti*.
- Alert bodies are one sentence containing the number and the threshold.
- Footnotes name the source: *Kaynak: uretim.xlsx · Son güncelleme 14:20*.
- **No emoji, anywhere.**
- **Numbers are Turkish-locale:** dot thousands, comma decimal, unit outside the
  value — `1.284,6 ton`, `%7,4`, `142 araç`, `38 dk`. Dates `12 Eyl 2026`, times
  24-hour `14:20`. Use `−` (U+2212) for negatives, not a hyphen, so it aligns
  with tabular figures. `·` is the metadata separator.

## Assets

- **No logo, and none should be created.** Render the product name in type where a
  mark would go — see `design_system/assets/README.md`.
- **Icons:** Lucide 0.454.0 via CDN
  (`https://unpkg.com/lucide@0.454.0/dist/umd/lucide.min.js`), stroke-width 1.75.
  Sizes: 14 inline, 15 in fields, 16 default, 17 sidebar, 18–20 large controls.
  The working glyph set is listed in `DESIGN_GUIDE.md` §4. **Never hand-roll SVG
  paths.**
- **Fonts:** Geist + Geist Mono, Google Fonts, weights 400/500/600/700.
- **No imagery of any kind** is used or needed.

## Streamlit implementation notes

- Inject `design_system/styles.css` (and its `tokens/` imports, flattened) once
  via `st.markdown("<style>…</style>", unsafe_allow_html=True)`. The tokens are
  plain custom properties and need no build step.
- Streamlit's own theme should be set to dark in `.streamlit/config.toml` with
  `backgroundColor = "#0b0b0e"`, `secondaryBackgroundColor = "#121216"`,
  `textColor = "#d6d6dc"`, `primaryColor = "#e0409e"` so native widgets don't
  fight the CSS. The light theme needs a second config or a runtime theme switch.
- `st.metric` will **not** give you the KPI card or the delta-colour semantics
  (`goodWhen`) — render KPI tiles and the hero as HTML blocks.
- Sidebar: `st.sidebar` with `st.radio`/buttons restyled, or a custom HTML nav
  with query-param routing. The 2.5px accent indicator needs custom CSS either way.
- Charts: theme Plotly or Altair from the `--series-*` palette in order,
  `--chart-grid` for gridlines, `--chart-axis` for axis text, and a transparent
  paper/plot background so the card surface shows through. Keep the plot **inside**
  its card with a fixed height; never full-bleed.
- Tables: `st.dataframe` cannot produce the uppercase micro-headers, badge cells
  or totals foot. Either render detail tables as HTML, or accept `st.dataframe`
  with `column_config` and document the divergence.
- The Veri Girişi live calculations must update as the user types — use
  `st.form` only if you are willing to lose that; otherwise plain widgets with
  reruns, and keep the confirm-checkbox gate on the submit button.

## Files in this bundle

```
design_system/
  DESIGN_GUIDE.md            ← the full design guide: context, content rules,
                               visual foundations, iconography, substitutions
  styles.css                 ← the one stylesheet; @import list only
  tokens/                    colors, typography, spacing, radius, elevation,
                             motion, fonts, base
  components/<group>/        Icon, Button, IconButton, Card, Badge,
                             SectionHeader, KpiCard, HeroMetric, DeltaChip,
                             ThresholdMeter, Sparkline, ChartCard, DataTable,
                             StatBar, Field, TextInput, Select, Checkbox,
                             Switch, SegmentedControl, FormGrid, Sidebar,
                             TopBar, PageTabs, Alert, EmptyState, Skeleton,
                             AppShell + CardGrid + SplitRow
                             (each: .jsx reference, .d.ts props contract,
                              .prompt.md usage note, one *.card.html specimen)
  guidelines/*.card.html     17 foundation specimen cards — open any in a
                             browser to see the real tokens rendered
  ui_kits/uretim-paneli/
    index.html               ← START HERE: click through all five screens
    data.js                  real sample data from the two source tables
    Charts.jsx               LineChart / BarChart / Donut reference plots
    GenelBakis.jsx  PresPerformansi.jsx  PosaAnalizi.jsx
    AracLojistigi.jsx  VeriGirisi.jsx
    README.md                what is interactive, and what is still inferred
  assets/README.md           why there is no logo, and where to put one
```

## Open questions for the plant

Two things the design could not settle and a developer should not guess at:

1. **The workbook calls the mass balance `Fark (%)`, but the section is named
   `Posa Analizi`.** The design uses *Fark %* for the metric and reports posa
   separately as its t/sa rate. If supervisors say "posa oranı" for that number,
   relabel it.
2. **`Üretim Süresi (%)` and `Kalan Süre (%)`** are carried in the batch table but
   nothing is built on them — no KPI, no chart. Confirm whether they should be
   surfaced.

Also unverified: **which figures the existing Streamlit app puts on which of the
five pages.** The assignment above follows the workbook's own sheet boundaries.
Check against the running app before building.
