One-line: Card wrapper that reserves a fixed plot height and renders a dot legend above it.

```jsx
<ChartCard title="Pres hacmi trendi" subtitle="Günlük, ton"
  legend={[{label:"Pres 1",color:"var(--series-1)"},{label:"Pres 2",color:"var(--series-2)"}]}
  footer="Kaynak: uretim.xlsx · Son güncelleme 14:20">
  <div id="plot" />
</ChartCard>
```

Chart colours come from `--series-1…6` in order. Gridlines use `--chart-grid`, axis text `--chart-axis`.
