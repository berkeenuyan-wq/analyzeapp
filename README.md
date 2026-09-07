# Üretim Paneli

Production-analytics dashboard for the Bucher apple-press line. Streamlit + SQLite,
styled from the **Üretim Paneli Design System**. Turkish UI, dark theme with full
light parity.

## Run

```bash
pip install -r requirements.txt
streamlit run app.py
```

First launch loads `data/seed/Production_Stats.xlsx` into `data/uretim.db`
automatically. Open <http://localhost:8501>.

## How data flows

```
Production_Stats.xlsx ──▶ src/ingest.py (clean) ──▶ data/uretim.db ──▶ src/metrics.py ──▶ sections
                                                          ▲                                   │
                          Excel'den İçe Aktar ────────────┘         Excel'e Aktar ◀───────────┘
```

* **SQLite is the live database.** Only the two *source* tables are stored —
  `batch` (Press Batch Kayıtları) and `truck` (Araç Takip). Every derived figure
  (Press Analiz, Ön Hatlar Analiz, İstatistikler) is recomputed at query time, so
  there is one source of truth. The workbook's own pre-computed cells are treated
  as stale output and never read.
### Veri Girişi

* **Add** — pick "Yeni batch" / "Yeni araç kaydı" in the record selector, fill the
  form (Süre / F/P Verim / kg/dk calculate live), tick the confirm box, **Kaydet**.
* **Edit** — pick an existing record from the selector; the form loads its values.
  Change what's wrong, tick confirm, **Güncelle**. The key fields (`batch_no`;
  `tarih + arac_no`) are locked while editing.
* **Delete** — while a record is selected, **Sil** removes it.
* After any save / delete the form resets to "Yeni…" and the caches clear.

The form uses a per-form nonce in the widget keys so a reset never writes to a
widget-backed `session_state` key (Streamlit forbids that once the widget exists).

* **Excel import** (Veri Girişi → Excel) accepts an updated workbook, runs the
  same cleaning pipeline, shows a preview (`X batch · Y araç · fixes · warnings ·
  rejected rows`) and only writes on confirm. Default merge is upsert by key
  (`batch_no`; `tarih + arac_no`) so manual entries are not lost; "Tümünü
  değiştir" does a full replace.
* **Excel export** regenerates a clean `.xlsx` from the current database — two
  source sheets plus the recomputed derived sheets.

### Cleaning the import applies

| Problem in the workbook | Fix |
| --- | --- |
| `Üretim Süresi (%)` stored as a fraction (`0.963` vs `96.3`) | ×100 when `0 < v < 1.5` (production time is always tens of %); logged |
| `#REF!` cells, `#DIV/0!`, blank strings | → NULL |
| Mixed date types (Excel datetime vs `"03.09.2026"`) | parsed to ISO `YYYY-MM-DD` |
| Two-row header band vs one-row (app export) | header row located by its labels, not a fixed offset |
| `Bekleme (dk)` blank for the first truck of a day | kept NULL, rendered as an em-dash |
| `filtrat > dolum` | kept, raised as a warning |

## Layout

```
src/
  config.py       paths, section registry, threshold rules
  fmt.py          Turkish-locale number / date / duration formatting
  db.py           SQLite schema + typed reads/writes
  ingest.py       workbook → cleaned frames → SQLite  (also `python -m src.ingest`)
  metrics.py      every derived figure, reconciled against the workbook
  theme.py        flattens tokens + components.css, injects; light re-scope; chart palette
  icons.py        Lucide 0.454.0 glyphs, inlined (Streamlit strips <script>)
  ui.py           HTML component helpers (hero, KPI, badge, delta chip, table, alert, meter)
  charts.py       Plotly builders themed from the tokens
  excel_io.py     import preview/commit + workbook export
  sections/       genel_bakis · pres_performansi · posa_analizi · arac_lojistigi · veri_girisi
assets/
  tokens/*.css    copied from the design system
  components.css  component + Streamlit-chrome styling
```

## Threshold rules

| Measure | Green | Amber | Red |
| --- | --- | --- | --- |
| Toplam Verim % | ≥ 93 | 90–93 | < 90 |
| F/P Verim Q26 % | ≥ 86 | 83–86 | < 83 |
| F Tank Sıcaklığı °C | ≤ 23 | 24–28 | > 28 |
| Kesinti Süresi % | < 5 | 5–10 | > 10 |
| Fark % | \|x\| ≤ 5 | — | \|x\| > 5 |
| Bekleme dk | ≤ 15 | 16–60 | > 60 |

`DeltaChip` colour comes from the measure's own semantics (`good_when`), not the
arrow direction — a falling Fark % renders green.

## Known deviations from the source workbook

* `Press Analiz` sheet cells for **Ort. Toplam Verim** (91.24) and **Ort. Batch
  Süresi** (115.06) disagree with a fresh mean over the 24 batch rows (91.05 /
  112.71). The sheet cells are stale; the panel shows the recomputed values.
* **Leeching Verimi %** — the workbook's exact formula is unconfirmed; computed
  here as `mean(Toplam Verim) − mean(F/P Verim)` for the day (the incremental
  yield the NW wash phase adds). Confirm with the plant.
* **Saatlik Ortalama Toplam Posa** — reported as the sum of the two presses'
  hourly posa rates (~2,3 t/sa), matching the design kit; the workbook cell shows
  the mean (~1,2). Uses the "Toplam" reading.
* CIP sheets (`CIP EKİPMAN LİSTESİ`, `CIP Geçmiş`, `Reçeteler`) are out of scope.
