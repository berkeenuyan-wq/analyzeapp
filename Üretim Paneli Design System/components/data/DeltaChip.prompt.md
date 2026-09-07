One-line: the signed period-over-period change that sits next to every KPI value.

```jsx
<DeltaChip value={4.2} goodWhen="up" period="önceki haftaya göre" />
<DeltaChip value={1.8} goodWhen="down" />   {/* posa % rising = red */}
```

`goodWhen` is the whole point: it decouples arrow direction from colour so a falling posa % reads green.
