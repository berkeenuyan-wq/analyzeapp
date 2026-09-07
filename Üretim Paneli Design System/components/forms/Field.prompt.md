One-line: label + control + hint/error wrapper; every form control on the Veri Girişi screen is wrapped in one.

```jsx
<Field label="Araç plakası" required hint="Örn. 35 ABC 123" htmlFor="plaka">
  <TextInput id="plaka" value={v} onChange={setV} />
</Field>
```

Hint and error are mutually exclusive — error wins.
