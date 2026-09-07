One-line: the one big number a page is about, with its threshold verdict and an optional right-hand visual.

```jsx
<HeroMetric label="Posa oranı" value="4,1" unit="%" icon="percent"
  status="Tolerans içinde" statusTone="good" delta={-0.6} deltaGoodWhen="down"
  deltaPeriod="önceki haftaya göre"
  note="(Araç Toplamı − Pres Toplamı) / Araç Toplamı. Tolerans ±5%."
  aside={<Sparkline points={[…]} />} />
```

Never two on one page. The faint accent glow behind it is the only decorative gradient in the system.
