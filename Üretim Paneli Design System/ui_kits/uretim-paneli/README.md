# UI kit — Üretim Paneli

A click-through recreation of the whole panel. Open `index.html`.

**Data model is real.** `data.js` transcribes the two source tables the plant
maintains — the batch-level press table (24 real batches, 31 Ağu / 3 Eyl / 4 Eyl
2026) and Araç Takip Tablosu (9 trucks) — plus the derived sheets: GÜNLÜK PRESS
PERFORMANSI TON/SA, ÖN HATLAR ANALİZ (Araç vs Pres Farkı), the Bucher dashboard
headline figures, and the araç statistics block. Column names, units and
threshold fills match the workbook (see §1 of the root `readme.md`).

**Still not a recreation of the running Streamlit app** — no codebase was
supplied, so which figures the app puts on which of the five pages follows the
workbook's own sheet boundaries, not the app's actual layout. The visual
character comes from the reference dashboard screenshot.

## Files

| File | What |
| --- | --- |
| `index.html` | The shell: sidebar, top bar, theme toggle, sidebar collapse, section routing |
| `data.js` | Mock plant data (`window.UPData`), pre-formatted for Turkish locale |
| `Charts.jsx` | `LineChart`, `BarChart`, `Donut` — data-driven SVG plots |
| `GenelBakis.jsx` | İşlenen toplam ürün hero, headline KPIs, per-press blocks, günlük performans trendi + table |
| `PresPerformansi.jsx` | Batch table (all 19 workbook columns), Pres 1 / Pres 2 tabs, verim + tank-temp charts |
| `PosaAnalizi.jsx` | Ön Hatlar Analiz: Fark % vs ±5%, donut split, low-verim batch table |
| `AracLojistigi.jsx` | Araç Takip Tablosu, istatistikler, günlük tablo, hız/bekleme chart |
| `VeriGirisi.jsx` | Batch and Araç entry tabs with live F/P verim and kg/dk calculation |

## What is interactive

- Sidebar navigation between all five sections; collapse toggle in the top bar.
- **Dark ⇄ light theme toggle** (the sun/moon button) — exercises full token parity.
- Pres Performansı: Tüm presler / Pres 1 / Pres 2 tabs re-scope the hero, KPIs,
  charts and the batch table; free-text search over batch, tarih and reçete.
- Araç Lojistiği: day filter + free-text search over the truck log.
- Veri Girişi: two tabs. Batch tab computes F/P Verim Q26 live from dolum and
  filtrat and rejects `filtrat > dolum`; Araç tab computes süre and kg/dk live from
  the times and rejects a bitiş before başlangıç. Both gate the primary button on
  the confirm checkbox and prepend to "Son kayıtlar" on save.
- Genel Bakış: the posa KPI tile jumps to Posa Analizi; the over-tolerance alert
  links there too.

## Conventions this kit demonstrates

Page rhythm is always `SectionHeader → (Alert) → HeroMetric → KPI row → chart row
→ detail table`; one hero metric per page; charts inside their cards with a dot
legend above; numbers in Turkish locale with tabular figures; colour only where it
carries a verdict.
