One-line: the surface every piece of content sits on — 14px radius, hairline border, quiet shadow.

```jsx
<Card title="Pres Verimi" subtitle="Son 30 gün" actions={<IconButton icon="ellipsis-vertical" label="Daha fazla" variant="ghost" />}>
  …chart…
</Card>
```

Use `inset` for a card inside a card (flat, 10px radius). `tone="bad"` only when the card's own metric breached tolerance.
