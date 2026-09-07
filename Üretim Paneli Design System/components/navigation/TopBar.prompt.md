One-line: 64px app bar with a pill search, utility icon buttons and the user block.

```jsx
<TopBar search={q} onSearchChange={setQ} searchPlaceholder="Plaka veya tedarikçi ara"
  actions={<><IconButton icon="sun" label="Tema" /><IconButton icon="refresh-cw" label="Yenile" /></>}
  user={{initials:"MK", name:"Murat Kaya", role:"Üretim Müdürü"}} />
```

Avatars are initials only — never a photo placeholder.
