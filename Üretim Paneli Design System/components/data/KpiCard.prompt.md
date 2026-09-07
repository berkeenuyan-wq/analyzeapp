One-line: a labelled metric with an optional delta chip and a context footnote.

```jsx
<KpiCard label="Toplam pres hacmi" value="1.284,6" unit="ton" icon="gauge"
         delta={4.2} deltaGoodWhen="up" deltaPeriod="Önceki haftaya göre" />
```

Four per row. Set `tone="bad"` only when a threshold is breached (e.g. posa % over ±5).
