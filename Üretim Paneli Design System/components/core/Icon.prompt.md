One-line: renders a Lucide glyph by name — the only sanctioned way to draw an icon in this system.

```jsx
<Icon name="truck" size={18} />
<Icon name="triangle-alert" size={14} color="var(--signal-bad)" />
```

Requires the Lucide UMD script on the page: `<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.min.js"></script>`.
Default stroke is 1.75, not Lucide's 2. Never inline your own SVG paths instead of this.
