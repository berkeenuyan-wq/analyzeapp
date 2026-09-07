const { SectionHeader, PageTabs, HeroMetric, KpiCard, ChartCard, Card, CardGrid, SplitRow, DataTable, Badge, Button, SegmentedControl, StatBar, Sparkline, TextInput } = window.RetimPaneliDesignSystem_b437a5;

function PresPerformansi() {
  const d = window.UPData;
  const [tab, setTab] = React.useState("hepsi");
  const [q, setQ] = React.useState("");
  const presAd = tab === "p1" ? "Pres 1" : tab === "p2" ? "Pres 2" : null;
  const rows = d.batches.filter(b => (!presAd || b.pres === presAd) && (q === "" || (b.batch + " " + b.tarih + " " + b.recete).toLowerCase().includes(q.toLowerCase())));

  const avg = (arr, k) => arr.reduce((a, r) => a + r[k], 0) / (arr.length || 1);
  const p = tab === "p2" ? d.presler[1] : d.presler[0];
  const scoped = presAd ? d.batches.filter(b => b.pres === presAd) : d.batches;

  return (
    <>
      <SectionHeader title="Pres Performansı" subtitle={"Batch bazında · " + d.batches.length + " batch · 31 Ağu – 4 Eyl 2026"}
        actions={<><SegmentedControl size="sm" value="Batch" onChange={() => {}} options={["Batch","Gün","Reçete"]} /><Button icon="download">Excel'e Aktar</Button></>} />
      <PageTabs value={tab} onChange={setTab} tabs={[
        { id: "hepsi", label: "Tüm presler", count: d.batches.length },
        { id: "p1", label: "Pres 1", icon: "gauge", count: d.batches.filter(b => b.pres === "Pres 1").length },
        { id: "p2", label: "Pres 2", icon: "gauge", count: d.batches.filter(b => b.pres === "Pres 2").length }]} />

      {presAd ? (
        <HeroMetric label={presAd + " toplam verimi"} value={d.nf(avg(scoped,"toplamVerim"),1)} unit="%" icon="gauge"
          status={avg(scoped,"toplamVerim") >= 91 ? "Hedefin üzerinde" : "Hedefin altında"} statusTone={avg(scoped,"toplamVerim") >= 91 ? "good" : "caution"}
          delta={tab === "p1" ? 0.6 : -0.9} deltaGoodWhen="up" deltaPeriod="önceki güne göre"
          note={"Toplam çalışma " + d.nf(p.calisma,2) + " saat · Giren " + d.nf(p.giren,1) + " t · Çıkan " + d.nf(p.cikan,1) + " t · Hedef %91"}
          aside={<Sparkline points={scoped.map(b => b.toplamVerim)} width={260} height={64} color={tab === "p1" ? "var(--series-1)" : "var(--series-2)"} />} />
      ) : (
        <HeroMetric label="Ortalama toplam verim" value={d.nf(avg(d.batches,"toplamVerim"),1)} unit="%" icon="gauge"
          status="24 batch tamamlandı" statusTone="good" delta={0.4} deltaGoodWhen="up" deltaPeriod="önceki güne göre"
          note={"Ort. F/P verim %" + d.nf(avg(d.batches,"fpVerim"),1) + " · Ort. F/P performans " + d.nf(avg(d.batches,"fpPerf"),1) + " t/sa · Ort. batch süresi " + d.nf(avg(d.batches,"sure"),1) + " dk"}
          aside={<Sparkline points={d.batches.map(b => b.toplamVerim)} width={280} height={64} />} />
      )}

      <CardGrid minWidth={220}>
        <KpiCard label="Ort. F/P verim Q26" value={d.nf(avg(scoped,"fpVerim"),1)} unit="%" icon="percent" delta={0.8} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ort. F/P performans Q27" value={d.nf(avg(scoped,"fpPerf"),1)} unit="t/sa" icon="trending-up" delta={-2.4} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ort. batch süresi" value={d.nf(avg(scoped,"sure"),1)} unit="dk" icon="timer" delta={-3.1} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ort. kesinti süresi" value={d.nf(avg(scoped,"kesintiSuresi"),1)} unit="%" icon="octagon-pause" tone={avg(scoped,"kesintiSuresi") > 5 ? "bad" : "default"} delta={18.2} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
      </CardGrid>

      <SplitRow ratio="1.5fr 1fr">
        <ChartCard title="Batch bazında toplam verim" subtitle="%" height={264}
          legend={[{ label: "Toplam verim", color: "var(--series-1)" }, { label: "F/P verim Q26", color: "var(--series-2)" }]}
          footer="Hedef %91. Toplam verim %90'ın altındaki batch'ler incelenmelidir.">
          <BarChart labels={scoped.map(b => "#" + b.batch)} height={264} limitLine={91}
            groups={[{ label: "Toplam verim", points: scoped.map(b => b.toplamVerim), color: "var(--series-1)" },
                     { label: "F/P verim", points: scoped.map(b => b.fpVerim), color: "var(--series-2)" }]} />
        </ChartCard>
        <ChartCard title="F/P performans ve tank sıcaklığı" subtitle="t/sa · °C" height={264}
          legend={[{ label: "F/P performans", color: "var(--series-4)" }, { label: "F tank sıcaklığı", color: "var(--series-6)" }]}>
          <LineChart labels={scoped.map(b => "#" + b.batch)} height={264} area={false}
            series={[{ label: "F/P performans", points: scoped.map(b => b.fpPerf), color: "var(--series-4)" },
                     { label: "Tank sıcaklığı", points: scoped.map(b => b.tank), color: "var(--series-6)" }]} />
        </ChartCard>
      </SplitRow>

      <Card title="Batch kayıtları" subtitle="GENEL · F/P FAZI (DOLUM / PRES) · NW FAZI (YIKAMA) · TOPLAMLAR" icon="table-2"
        actions={<TextInput size="sm" icon="search" placeholder="Batch, tarih veya reçete ara" value={q} onChange={setQ} style={{ minWidth: 250 }} />}>
        <DataTable dense keyField="batch" emptyLabel="Aramanızla eşleşen batch kaydı yok"
          columns={[
            { key: "pres", header: "Pres", emphasis: true },
            { key: "batch", header: "Batch", numeric: true, align: "right" },
            { key: "tarih", header: "Tarih", render: r => d.dShort(r.tarih) },
            { key: "recete", header: "Reçete" },
            { key: "baslangic", header: "Başlangıç", numeric: true, align: "right" },
            { key: "bitis", header: "Bitiş", numeric: true, align: "right" },
            { key: "sure", header: "Süre (dk)", numeric: true, align: "right", sortable: true, render: r => d.nf(r.sure,1) },
            { key: "dolum", header: "F dolum Q15 (kg)", numeric: true, align: "right", render: r => d.ni(r.dolum) },
            { key: "filtrat", header: "Filtrat (kg)", numeric: true, align: "right", render: r => d.ni(r.filtrat) },
            { key: "fpVerim", header: "F/P verim %", numeric: true, align: "right", render: r => <span style={{ color: "var(--signal-" + (d.tone.fpVerim(r.fpVerim) === "bad" ? "bad" : d.tone.fpVerim(r.fpVerim) === "caution" ? "caution" : "good") + ")" }}>{d.nf(r.fpVerim,1)}</span> },
            { key: "fpPerf", header: "F/P perf. t/sa", numeric: true, align: "right", render: r => d.nf(r.fpPerf,1) },
            { key: "tank", header: "Tank °C", numeric: true, align: "right", render: r => <Badge tone={d.tone.tank(r.tank)} size="sm">{d.nf(r.tank,1)}</Badge> },
            { key: "nwCevrim", header: "NW çevrim", numeric: true, align: "right" },
            { key: "nwSu", header: "NW su (l)", numeric: true, align: "right", render: r => d.ni(r.nwSu) },
            { key: "toplamVerim", header: "Toplam verim %", numeric: true, align: "right", sortable: true, render: r => <Badge tone={d.tone.toplamVerim(r.toplamVerim)} size="sm" dot>{d.nf(r.toplamVerim,1)}</Badge> },
            { key: "kesintiSuresi", header: "Kesinti %", numeric: true, align: "right", render: r => <span style={{ color: d.tone.kesinti(r.kesintiSuresi) === "bad" ? "var(--signal-bad)" : d.tone.kesinti(r.kesintiSuresi) === "caution" ? "var(--signal-caution)" : "var(--text-body)" }}>{d.nf(r.kesintiSuresi,1)}</span> },
            { key: "notlar", header: "Notlar", wrap: true, render: r => r.notlar ? <span style={{ color: "var(--text-link)" }}>{r.notlar}</span> : <span style={{ color: "var(--text-disabled)" }}>—</span> },
          ]}
          rows={rows} sortKey="batch" sortDir="asc" onSort={() => {}}
          footRow={{ pres: "Toplam · " + rows.length + " batch", dolum: d.ni(rows.reduce((a,r)=>a+r.dolum,0)), filtrat: d.ni(rows.reduce((a,r)=>a+r.filtrat,0)), toplamVerim: d.nf(avg(rows,"toplamVerim"),1) }} />
      </Card>
    </>
  );
}

Object.assign(window, { PresPerformansi });
