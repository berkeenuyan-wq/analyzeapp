One-line: a value plotted against a symmetric tolerance band — the mass-balance workhorse.

```jsx
<ThresholdMeter label="Posa oranı (tolerans ±5%)" value={4.1} limit={5} min={-10} max={10} />
```

The marker turns red the moment |value| > limit; nothing else in the component carries colour.
