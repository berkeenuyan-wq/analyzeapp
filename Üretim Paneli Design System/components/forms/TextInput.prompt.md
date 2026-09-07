One-line: the single-line input; `type="number"` switches to the mono face and right-aligns automatically.

```jsx
<TextInput icon="search" placeholder="Plaka veya tedarikçi ara" value={q} onChange={setQ} />
<TextInput type="number" value={net} onChange={setNet} suffix="ton" />
```

Use `size="lg"` for the plant-floor tablet forms. `invalid` pairs with `<Field error>`.
