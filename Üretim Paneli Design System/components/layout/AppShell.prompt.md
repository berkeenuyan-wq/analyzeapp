One-line: the page frame — fixed sidebar, fixed top bar, scrolling content capped at 1560px.

```jsx
<AppShell sidebar={<Sidebar … />} topbar={<TopBar … />}>
  <SectionHeader title="Genel Bakış" />
  <HeroMetric … />
  <CardGrid minWidth={220}><KpiCard … /><KpiCard … /><KpiCard … /><KpiCard … /></CardGrid>
  <SplitRow ratio="2fr 1fr"><ChartCard … /><Card … /></SplitRow>
</AppShell>
```

Page rhythm is always: header → hero → KPI row → charts → detail table. `CardGrid` and `SplitRow` ship from this file too.
