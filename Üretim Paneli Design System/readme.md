# Üretim Paneli — Design System

The design guide and manifest for **Üretim Paneli** (Production Dashboard), the
internal production-analytics dashboard of an apple-pressing juice plant.

---

## 1. Product context

Üretim Paneli is a **single Streamlit (Python) web app**, used daily by plant
supervisors and production managers. It is an internal tool: no marketing site, no
mobile app, no public surface. One product, one shell, five sections.

What it answers:

- **Press throughput and yield** — how much fruit each press turned into juice.
- **Mass balance** — the gap between what arrived on trucks and what came out of
  the presses, expressed as pomace/waste percentage.
- **Truck-unloading logistics** — intake volume, waiting time, supplier mix.
- **Manual data entry** — a form that writes back to the source Excel file.

### The five sections (fixed Turkish strings — never translate or reword)

| Section | Contents |
| --- | --- |
| **Genel Bakış** | Plant-wide overview: hero volume metric, KPI row, trend chart, alerts |
| **Pres Performansı** | Per-press throughput and yield; Pres 1 vs Pres 2 comparison |
| **Posa Analizi** | Mass balance and pomace %, against the ±5% tolerance |
| **Araç Lojistiği** | Truck intake, unloading queue, waiting times, supplier breakdown |
| **Veri Girişi** | Manual entry form that writes to the source Excel workbook |

### The two source tables

The user supplied the real workbook structure. **Everything in the panel derives
from exactly two tables** — the batch-level press table and Araç Takip Tablosu.
No other primary data exists; every KPI, chart and analysis sheet is calculated
from these. The press equipment is **Bucher**; the plant's own dashboard title is
*BUCHER PRES — BATCH PERFORMANS GÖSTERGE PANOSU*.

**Table 1 — batch press stats.** One row per batch, column groups exactly as the
workbook has them:

| Group | Columns |
| --- | --- |
| **GENEL** | Pres · Batch No · Tarih · Reçete · Başlangıç · Bitiş · Batch Süresi (dk) |
| **F/P FAZI (DOLUM / PRES)** | F Toplam Dolum Q15 (kg) · F/P Filtrat Miktarı (kg) · F/P Verim Q26 (%) · F/P Performans Q27 (t/sa) · F Tank Sıcaklığı (°C) |
| **NW FAZI (YIKAMA)** | NW Çevrim Sayısı · NW Toplam Su (l) |
| **TOPLAMLAR** | Toplam Verim (%) · Üretim Süresi (%) · Kesinti Süresi (%) · Kalan Süre (%) |
| **YARDIMCI** | Notlar |

**Table 2 — Araç Takip Tablosu.** One row per intake truck:
Tarih · Araç · Ürün · Miktar (kg) · Başlangıç · Bitiş · Süre (dk) · Hız (kg/dk) ·
Bekleme (dk).

### Derived figures the panel shows

- **Headline:** İşlenen Toplam Ürün Miktarı (ton) · Ort. Toplam Verim (%) ·
  Ort. Batch Süresi (dk) · Çıkan Toplam Ürün ortalaması (t/sa) ·
  Saatlik Ortalama Toplam Posa (t/sa).
- **Per press (Press 1 / Press 2):** Toplam Çalışma Süresi (saat) ·
  Giren Toplam Ürün (ton) · Çıkan Toplam Ürün (ton) · Saatlik Ortalama (t/sa) ·
  Saatlik Ortalama Toplam Posa (t/sa).
- **GÜNLÜK PRESS PERFORMANSI TON/SA:** per day — Press 1/2 Performansı (t/h),
  Toplam Performans, per-press Toplam Girdi/Çıktı, Toplam Giren/Çıkan, Verim,
  **Leeching Verimi (%)**, Ortalama Verim (%).
- **ÖN HATLAR ANALİZ — GÜNLÜK ARAÇ vs PRES FARKI:** Araç Toplamı (kg) ·
  Pres Toplamı (kg) · Fark (kg) · **Fark (%)**. This is the mass balance, and the
  workbook calls it **Fark**, not "posa oranı" — use *Fark %* in UI labels.
  `Fark % = (Araç Toplamı − Pres Toplamı) / Araç Toplamı × 100`, tolerance **±5%**,
  red above it (the real data shows 7,0% and 4,0%).
- **Araç istatistikleri:** Kayıtlı Araç Sayısı · Ortalama Bekleme Süresi (dk) ·
  Toplam Kayıp Zaman (dk) · Ortalama Boşaltma Süresi (dk) ·
  Ortalama Boşaltma Hızı (kg/dk) · Toplam Gelen Ürün (ton). Plus a Günlük Tablo
  (Miktar, Bekleme) and Press Başlangıç–Bitiş Arası Geçen Süre per day.

### Threshold rules, mirroring the workbook's conditional fills

| Measure | Green | Amber | Red |
| --- | --- | --- | --- |
| Toplam Verim (%) | ≥ 93 | 90–93 | < 90 |
| F/P Verim Q26 (%) | ≥ 86 | 83–86 | < 83 |
| F Tank Sıcaklığı (°C) | ≤ 23 | 24–28 | > 28 |
| Kesinti Süresi (%) | < 5 | 5–10 | > 10 |
| Fark (%) | \|x\| ≤ 5 | — | \|x\| > 5 |
| Bekleme (dk) | ≤ 15 | 16–60 | > 60 |

These live in code as `UPData.tone` in `ui_kits/uretim-paneli/data.js`.

### Other vocabulary

- **Pres 1 / Pres 2** — the two presses (the dashboard also writes *PRESS 1/2*).
- **Reçete** — the recipe: *Enz. 1 Sld. Elma* (Pres 1), *Enzimli 1 Sld. Elma* (Pres 2).
- **F/P** — the fill/press phase. **NW** — the wash (yıkama) phase.
- **Filtrat** — the pressed juice output. **Posa** — pomace; reported as a
  **t/sa hourly average**, not as a per-batch percentage.
- **Araç** — an intake truck, numbered per day (1, 2, 3…), not by plate.
- **Bekleme** — idle gap before a truck starts unloading; sums to Toplam Kayıp Zaman.
- **Vardiya** — shift.

### Devices

Desktop-first (1440–1920 wide), occasionally a tablet on the plant floor. Tablet
means bigger hit targets (`size="lg"` controls, 44px minimum), a collapsed
sidebar, and single-column forms — not a different design.

### Sources used to build this system

Be honest about what backed this work, in case you have access to more:

- **A written brand/product direction** supplied in the brief (dark, premium,
  calm; deep near-black charcoal; softly rounded elevated cards; one vivid accent
  reserved for primary actions, active nav and headline metrics; colour signals
  meaning only; full light/dark parity).
- **One reference dashboard screenshot** — `uploads/reference-1788619714236-hgo6.webp`,
  a dark AI-content dashboard. It is the source of the visual character:
  near-black page, ~14px card radius, hairline borders, quiet shadows, KPI tiles
  with a glyph top-right and a delta chip beside the value, dot legends above
  charts, a tinted active pill in the sidebar, a pill search field in the top bar,
  vivid magenta primary buttons, green deltas.
- **Domain rules and exact Turkish section names**, supplied by the user in the
  intake form (quoted above verbatim).

**Not available:** the Streamlit codebase, any Figma file, any logo or brand mark,
any font binaries, any icon set. Nothing here was recreated from a codebase or a
Figma file, because none was attached. See §7 for the substitutions this forced.

---

## 2. Content fundamentals

**Language.** Turkish, throughout, without exception — labels, buttons, empty
states, error messages, table headers, tooltips. English appears only in developer
docs (this file, `.prompt.md` files, prop names).

**Casing.** Sentence case everywhere except two places:
- Section and page titles use their fixed title-case forms: *Genel Bakış*,
  *Pres Performansı*, *Veri Girişi*.
- The hero metric's overline and table column headers are UPPERCASE with
  `--tracking-label` (0.06em): *GÜNLÜK PRES HACMİ*, *PLAKA*, *NET (TON)*.

Everything else — form labels, buttons, badges, alerts — is sentence case:
*Araç plakası*, *Excel'e Aktar*, *Tolerans içinde*, *Bu tarihte kayıt yok*.

**Person.** Neither "I" nor "you" in ordinary labels; the UI is impersonal and
nominal. Instructions to the operator use the imperative plural (the polite
*-in* form): *Tarihi değiştirin*, *Araç tartı kayıtlarını kontrol edin*,
*Pres seçin*. Never *senin*, never a first-person *ben*.

**Tone.** Flat and factual. The panel reports; it does not congratulate, warn
dramatically, or apologise. A breach reads *Kütle dengesi toleransın dışında* —
not *Dikkat!* and not *Bir şeyler ters gitti*.

**Length.** Labels 1–3 words. Alert titles one clause. Alert bodies one sentence
that includes the number and the threshold: *12 Eylül için posa oranı %7,4 —
tolerans ±%5.* Footnotes name the source: *Kaynak: uretim.xlsx · Son güncelleme 14:20*.

**Formulas are shown, not hidden.** Where a metric is derived, the derivation goes
in the hero metric's `note`: *(Araç Toplamı − Pres Toplamı) / Araç Toplamı · Tolerans ±%5*.

**No emoji.** Not in labels, not in alerts, not in empty states. The reference
dashboard uses a waving hand in its greeting; this system does not — there is no
greeting, and the plant floor is not a place for tone-of-voice flourishes.

**Numbers are Turkish-locale.** Dot thousands, comma decimal, unit outside the
value: `1.284,6 ton`, `4,1%`, `142 araç`, `38 dk`. Dates short-month: `12 Eyl 2026`.
Times 24-hour: `14:20`. Percent sign sits tight against the number (`%7,4` in
running Turkish prose, `7,4%` in a metric slot — both appear; follow the
surrounding pattern).

**Examples, good and bad:**

| Write | Not |
| --- | --- |
| Tolerans içinde | ✅ Harika! Her şey yolunda |
| Eşik aşıldı | Dikkat!!! Sorun var |
| Bu tarihte kayıt yok | Burada henüz bir şey yok :( |
| Kaynak: uretim.xlsx · Son güncelleme 14:20 | Veriler güncel |
| Preslenen tonaj brüt tonajdan büyük olamaz | Geçersiz giriş |

---

## 3. Visual foundations

**The overall feel.** Dark, premium, calm. Near-black charcoal surfaces, generous
air, and one vivid accent that appears perhaps four times per screen. Data-dense
but never crowded: the density comes from how much information fits legibly, not
from how tightly it is packed.

### Colour

Five stacked near-blacks carry the whole interface: page `#0b0b0e`, nav `#0e0e12`,
card `#121216`, inset `#17171c`, raised `#1d1d23`. Steps are small on purpose —
the hairline border does the separating, not a big tonal jump.

**One accent: magenta `#e0409e`.** It appears on primary buttons, the active
sidebar item's icon and its 2.5px indicator bar, the hero metric's overline glyph
and background glow, the sort indicator on the active table column, and the
required-field asterisk. That is the complete list. Magenta was kept from the
reference dashboard partly because it is semantically inert in this domain — it
cannot be mistaken for a good/bad verdict, which leaves green and red free to
carry meaning.

**Colour signals meaning, never decoration.** Green = in tolerance / favourable.
Red = over threshold. Amber = approaching the limit. Grey = a state with no
verdict attached (shift number, press name, "no change"). A rising number is not
green because rising is nice — `DeltaChip`'s `goodWhen` prop decides colour from
the measure's own semantics, which is why a *falling* posa % renders green.

Chart series are a separate, ordered palette (`--series-1…6`) that is not signal
colour: a proportion or a category is not a verdict.

Full light parity: every semantic alias is re-pointed under `[data-theme="light"]`,
and the accent and signal hues darken to hold 4.5:1 on white.

### Type

**Geist** for everything, **Geist Mono** for numeric table cells. Tabular figures
are on globally (`font-feature-settings: "tnum"`) — columns of numbers must align
down the page, and a metric must not reflow as it ticks.

Metrics are large, semibold and tightly tracked (`--tracking-metric`, −0.025em):
64px for the one hero metric, 30px for KPI values, 24px for page titles. Body is
14px/1.5, captions 13px, labels 12px medium, overlines 11px semibold at 0.06em.
Nothing informational below 11px.

### Spacing and layout

A 2/4/6/8/12/16/20/24/32/40/48/64 scale. Card padding 20px (14px tight), gap
between cards 16px, gap between page sections 24px, page padding 28/24. Sidebar
232px, collapsed 64px. Top bar 64px. Content column capped at 1560px and centred,
so a 21:9 monitor gets margins rather than 3000px-wide tables.

**Page rhythm is fixed** and every section follows it:
`SectionHeader → (Alert) → HeroMetric → KPI row of 4 → chart row → detail table`.
Exactly one hero metric per page. KPI tiles run 4 across, auto-fitting to 2 on a
tablet.

### Backgrounds

Flat. No imagery, no photography, no illustration, no pattern, no texture, no
grain. The plant has no image library and none was invented. There is exactly one
gradient in the entire system: a barely-there radial accent glow behind the hero
metric (`--accent-tint-08`, ~8% alpha, fading to nothing) — the reference
dashboard's one atmospheric touch, kept once and used once. Everything else is a
solid token.

### Cards

Solid `--surface-card`, a 1px `--border-card` hairline, 14px radius, and
`--shadow-card` (`0 1px 1px` + a wide `10px 28px -18px` spread). The shadow only
lifts the card off the near-black page; the border does the visual work. A card
inside a card uses `inset`: flat, no shadow, 10px radius, `--surface-inset`. Never
nest deeper than that. A card's border turns `--signal-bad-border` only when the
card's own metric breached tolerance — never for emphasis.

Charts always sit *inside* their card, with a fixed plot height, and never bleed
to the page edge.

### Borders and radii

Three border weights: `--border-subtle` (table rows, dividers, nav edge),
`--border-card` (card frame), `--border-strong` (secondary buttons, totals row).
Radii: 5px small chips, 8px controls and inputs, 10px inset cards, 14px cards,
18px the hero panel, full pill for badges, search field and icon buttons. Icon
buttons are always circular.

### States

- **Hover** — lighten by a step, never darken: buttons move to the `bright`
  accent or `--action-secondary-bg-hover`; nav items and rows pick up
  `--surface-hover` (a 3.5% white wash). Text goes from muted to primary. No
  scaling, no lifting, no shadow change.
- **Press** — the accent's `deep` step (`#c22f85`). No shrink transform.
- **Focus** — `--ring-focus`: a 3px accent-at-40% ring plus an accent border. Keyboard
  focus is always visible; it is never removed.
- **Active/selected** — nav: tinted pill (`--nav-item-active-bg`) + accent icon +
  2.5px accent indicator bar. Segmented control: the segment lifts onto
  `--surface-raised` with a card shadow — *not* the accent. Selected KPI tile:
  accent border plus `--glow-accent`.
- **Disabled** — 45% opacity, `not-allowed` cursor. No greyscale filter.

### Motion

Restrained and short. 140ms for control-level changes (hover, focus, background),
200ms for panels and the sidebar collapse, 320ms for a threshold marker or bar
sliding to a new value, 600ms for a chart's first draw. One easing for everything:
`cubic-bezier(.2,0,.2,1)`. **No bounce, no spring, no overshoot, no attention
animation, no skeleton pulse beyond a plain left-to-right shimmer.** Numbers do
not count up. `prefers-reduced-motion` sets every duration to zero.

### Transparency and blur

Sparingly, and only two jobs: tinted state washes (signal tints at 8–14% alpha,
`--surface-hover`) and modal scrims (`--surface-scrim` at 72% + 8px blur). No
frosted-glass panels, no translucent cards, no blurred headers — text sits on
solid ground so contrast is predictable. There are no protection gradients
anywhere, because there is no imagery to protect text against; a label that needs
separation gets a capsule (badge, chip) instead.

### Fixed elements

Sidebar and top bar are fixed; only the content column scrolls. Tables scroll
horizontally inside their card rather than widening the page. Alerts are inline
at the top of the content column — nothing floats, and there are no toasts.

---

## 4. Iconography

**Lucide**, at 1.75 stroke weight (lighter than Lucide's own default of 2),
`currentColor`, `round` caps and joins. Sizes: 14 inline with text, 15 in fields,
16 default and in card headers, 17 in the sidebar, 18–20 for a large control.

**⚠️ Substitution, flagged.** No icon set came with the sources, and no icon
assets could be vendored into `assets/`. Lucide is a substitute chosen for its
match to the reference dashboard's thin, rounded, outline glyphs. It is loaded
from CDN:

```html
<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.min.js"></script>
```

**Never hand-roll SVG paths.** The `Icon` component reads the real Lucide payload
off `window.lucide` and renders it; that is the only sanctioned way to draw a
glyph. If the plant has its own icon set, drop the SVGs into `assets/icons/` and
point `Icon` at them instead.

**No emoji, ever** — not as icons, not as decoration. **No Unicode glyphs as
icons** either, with two deliberate exceptions used as *typography*, not
iconography: the minus sign `−` (U+2212, not a hyphen) in negative deltas so it
aligns with tabular figures, and the middle dot `·` as a metadata separator
(*12 Eylül 2026 · Vardiya 2*).

**The working set** — the glyphs this product actually uses:

| Where | Glyphs |
| --- | --- |
| Sections | `layout-dashboard`, `gauge`, `percent`, `truck`, `square-pen` |
| Brand slot | `factory` |
| Metrics | `gauge`, `percent`, `scale`, `clock`, `droplet`, `weight`, `trending-up` |
| Deltas | `arrow-up`, `arrow-down` |
| Verdicts | `circle-check`, `triangle-alert`, `circle-alert`, `info` |
| Actions | `save`, `download`, `refresh-cw`, `plus`, `trash-2`, `check`, `x` |
| Controls | `search`, `funnel`, `sliders-horizontal`, `calendar`, `chevron-down`, `chevron-up`, `chevron-right`, `chevrons-up-down`, `ellipsis-vertical` |
| Utility | `sun`, `moon`, `bell`, `file-spreadsheet`, `calendar-x`, `inbox` |

Avatars are **initials only** (`MK`), never a photo or a photo placeholder — the
plant has no user images.

---

## 5. Components

All under `components/<group>/`. Import from the compiled bundle;
each has a sibling `.d.ts` (props contract) and `.prompt.md` (what & when).

**core/** — `Icon`, `Button`, `IconButton`, `Card`, `Badge`, `SectionHeader`

**data/** — `KpiCard`, `HeroMetric`, `DeltaChip`, `ThresholdMeter`, `Sparkline`,
`ChartCard`, `DataTable`, `StatBar`

**forms/** — `Field`, `TextInput`, `Select`, `Checkbox`, `Switch`,
`SegmentedControl`, `FormGrid`

**navigation/** — `Sidebar`, `SidebarItem`, `TopBar`, `PageTabs`

**feedback/** — `Alert`, `EmptyState`, `Skeleton`

**layout/** — `AppShell`, `CardGrid`, `SplitRow`

### Intentional additions

No source defined a component inventory (no codebase, no Figma), so this is an
authored set, sized to what the five sections actually need. Two entries are worth
calling out explicitly:

- **`Icon`** — a wrapper over the Lucide payload, so no one is tempted to paste
  SVG paths into a screen.
- **`ThresholdMeter`** — not a generic primitive. It exists because the mass
  balance against ±5% is the product's central question and deserves a
  first-class way to be drawn.

Deliberately **not** built, despite being design-system staples: Toast (nothing
floats — alerts are inline), Dialog/Modal (no modal flows in the five sections),
Avatar (initials only), Tooltip (title attributes suffice), Tabs beyond
`PageTabs`, Accordion, Breadcrumb. Add them when a real screen needs them.

---

## 6. Index — what is in this folder

| Path | What |
| --- | --- |
| `readme.md` | This file: context, content, visual foundations, iconography, index |
| `SKILL.md` | Agent-Skills front matter, for use as a downloadable skill |
| `styles.css` | The single stylesheet consumers link — `@import` list only |
| `tokens/colors.css` | Neutrals, accent, signal colours, chart series, semantic aliases, light theme |
| `tokens/typography.css` | Font stacks, size ramp, weights, tracking, type-role aliases |
| `tokens/spacing.css` | Spacing scale and layout constants (sidebar, top bar, page padding) |
| `tokens/radius.css` | Corner radii |
| `tokens/elevation.css` | Shadows, accent glow, blur |
| `tokens/motion.css` | Durations and easing |
| `tokens/fonts.css` | Geist / Geist Mono webfont loading (⚠️ CDN, see §7) |
| `tokens/base.css` | Element resets, link colours, focus ring, scrollbars |
| `guidelines/*.card.html` | 17 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `components/<group>/` | Reusable primitives + `.d.ts` + `.prompt.md` + one card per group |
| `ui_kits/uretim-paneli/` | The five-screen click-through recreation of the panel |
| `assets/README.md` | Why there is no logo, and where to put one |
| `thumbnail.html` | The homepage tile for this design system |

---

## 7. Substitutions and gaps — read before trusting this system

Three things were substituted because the sources did not contain them. Each needs
the user's confirmation:

1. **Fonts.** No binaries supplied. **Geist + Geist Mono** loaded from Google
   Fonts as the nearest neutral grotesque with true tabular figures. If the plant
   has a licensed face, drop the `.woff2` files into `assets/fonts/` and replace
   the `@import` in `tokens/fonts.css` with local `@font-face` rules.
2. **Icons.** No icon set supplied. **Lucide 0.454.0** from CDN, restroked to
   1.75. See §4.
3. **Logo.** None supplied, and none was drawn. The brand name is rendered in
   plain type wherever a mark would go. See `assets/README.md`.

**Resolved since the first pass:** the user supplied screenshots of the real
workbook — the batch press table, Araç Takip Tablosu, the Bucher dashboard sheet,
Ön Hatlar Analiz, and the araç statistics block. §1 and the UI kit now use those
actual column names, units, figures and threshold fills. The reference screenshot
is still a *different product* — its layout logic and visual character were
followed, its content was not.

Still inferred: the exact wording of any in-app microcopy that isn't a column
header, and which of these figures the Streamlit app currently surfaces on which
of the five pages (the workbook's own sheet boundaries were used as the guide).
The Streamlit source would settle that.

One naming note worth a decision: the plant's workbook calls the mass balance
**Fark (%)** while the section is named **Posa Analizi**. The UI kit uses *Fark %*
for the metric and keeps *Posa Analizi* as the section name, and reports posa
separately as a t/sa rate — confirm that split reads right to your supervisors.
