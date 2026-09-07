One-line: 2–5 mutually exclusive view options in one inset track — granularity, press selection, chart mode.

```jsx
<SegmentedControl value={g} onChange={setG} options={["Günlük","Haftalık","Aylık"]} size="sm" />
```

The selected segment lifts on `--surface-raised` — it is never the accent colour.
