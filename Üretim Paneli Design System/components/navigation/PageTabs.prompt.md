One-line: underlined in-page tabs for splitting one section into views (e.g. Pres 1 / Pres 2 / Karşılaştırma).

```jsx
<PageTabs value={tab} onChange={setTab}
  tabs={[{id:"p1",label:"Pres 1"},{id:"p2",label:"Pres 2"},{id:"kars",label:"Karşılaştırma"}]} />
```

Sidebar = the five app sections. PageTabs = views inside one section. Do not use tabs for navigation between sections.
