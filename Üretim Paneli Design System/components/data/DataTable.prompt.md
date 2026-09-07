One-line: the detail table under a chart — uppercase micro headers, hairline rows, optional totals foot.

```jsx
<DataTable dense keyField="id" sortKey="ton" sortDir="desc" onSort={setSort}
  columns={[
    {key:"plaka",header:"Plaka",emphasis:true},
    {key:"ton",header:"Net (ton)",numeric:true,align:"right",sortable:true},
    {key:"durum",header:"Durum",render:r=><Badge tone={r.ok?"good":"bad"}>{r.durum}</Badge>},
  ]}
  rows={rows} footRow={{plaka:"Toplam", ton:"1.284,6"}} />
```

Numeric columns must set both `numeric` and `align:"right"`. Put verdicts in a Badge via `render`, never as coloured text.
