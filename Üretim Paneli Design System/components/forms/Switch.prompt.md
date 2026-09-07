One-line: on/off toggle for view options that take effect immediately (auto-refresh, comparison overlay).

```jsx
<Switch id="oto" checked={auto} onChange={setAuto} label="Otomatik yenileme" />
```

Use a Checkbox, not a Switch, when the change only applies on submit.
