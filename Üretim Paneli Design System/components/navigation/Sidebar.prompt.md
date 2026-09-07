One-line: the five-section left rail; the active item gets the tinted pill plus a 2.5px accent bar.

```jsx
<Sidebar brand="Üretim Paneli" brandSub="Elma Presleme Tesisi" activeId={page} onSelect={setPage}
  items={[
    {id:"genel",icon:"layout-dashboard",label:"Genel Bakış"},
    {id:"pres",icon:"gauge",label:"Pres Performansı"},
    {id:"posa",icon:"percent",label:"Posa Analizi"},
    {id:"arac",icon:"truck",label:"Araç Lojistiği"},
    {id:"giris",icon:"square-pen",label:"Veri Girişi"},
  ]} />
```

Section labels are fixed Turkish strings — never translate or reword them.
