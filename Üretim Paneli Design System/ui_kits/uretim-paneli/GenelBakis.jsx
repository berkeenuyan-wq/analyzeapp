const { SectionHeader, HeroMetric, KpiCard, ChartCard, Card, CardGrid, SplitRow, DataTable, Badge, Button, IconButton, ThresholdMeter, StatBar, Alert, SegmentedControl } = window.RetimPaneliDesignSystem_b437a5;

function GenelBakis({ onNavigate }) {
  const d = window.UPData;
  const [gran, setGran] = React.useState("Gün");
  const g = d.genel;
  const sonHat = d.onHatlar[d.onHatlar.length - 1];

  return (
    <>
      <SectionHeader title="Genel Bakış" subtitle="Bucher Pres · Batch performans gösterge panosu · 31 Ağu – 4 Eyl 2026"
        actions={<>
          <SegmentedControl size="sm" value={gran} onChange={setGran} options={["Gün","Vardiya","Batch"]} />
          <Button icon="download">Excel'e Aktar</Button>
        </>} />

      <HeroMetric label="İşlenen toplam ürün miktarı" value={d.nf(g.islenen,1)} unit="ton" icon="gauge"
        status="Ort. toplam verim %91,2" statusTone="good" delta={2.4} deltaGoodWhen="up" deltaPeriod="önceki güne göre"
        note={"24 batch · Pres 1 ve Press 2 toplamı · Ort. batch süresi " + d.nf(g.ortBatchSuresi,1) + " dk"}
        aside={<div style={{ display: "flex", gap: 34 }}>
          {[["Ort. toplam verim", "%" + d.nf(g.ortToplamVerim,1), "var(--signal-good)"],
            ["Çıkan ort.", d.nf(g.cikanOrt,1) + " t/sa", "var(--text-primary)"],
            ["Saatlik ort. posa", d.nf(g.posaOrt,1) + " t/sa", "var(--signal-bad)"]].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{l}</div>
              <div style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", color: c, letterSpacing: "var(--tracking-metric)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>} />

      <CardGrid minWidth={220}>
        <KpiCard label="Ort. toplam verim" value={d.nf(g.ortToplamVerim,1)} unit="%" icon="percent" delta={0.4} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ort. batch süresi" value={d.nf(g.ortBatchSuresi,1)} unit="dk" icon="timer" delta={-3.1} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Çıkan toplam ürün ort." value={d.nf(g.cikanOrt,1)} unit="t/sa" icon="droplet" delta={9.1} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Saatlik ort. toplam posa" value={d.nf(g.posaOrt,1)} unit="t/sa" icon="scale" delta={-4.2} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" onClick={() => onNavigate("posa")} />
      </CardGrid>

      <SplitRow ratio="1fr 1fr">
        {d.presler.map((p, i) => (
          <Card key={p.id} title={p.ad} subtitle="Toplam çalışma, giren / çıkan ürün" icon="factory"
            actions={<Badge tone="neutral" size="sm">{d.nf(p.calisma,2)} saat</Badge>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {[["Giren toplam", d.nf(p.giren,1) + " t"], ["Çıkan toplam", d.nf(p.cikan,1) + " t"], ["Saatlik ort.", d.nf(p.saatlik,1) + " t/sa"]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{l}</div>
                    <div style={{ font: "var(--type-table-num)", fontSize: "var(--text-xl)", color: "var(--text-primary)", marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>
                  <span>Çıkan / giren oranı</span>
                  <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>%{d.nf(p.cikan / p.giren * 100,1)}</span>
                </div>
                <StatBar value={p.cikan} max={p.giren} showValue={false} color={`var(--series-${i + 1})`} height={8} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>Saatlik ortalama toplam posa</span>
                <Badge tone="bad" size="sm">{d.nf(p.posaSaatlik,1)} t/sa</Badge>
              </div>
            </div>
          </Card>
        ))}
      </SplitRow>

      <ChartCard title="Günlük performans trendi" subtitle="Ton/saat" height={252}
        legend={[{ label: "Press 1", color: "var(--series-1)" }, { label: "Press 2", color: "var(--series-2)" }, { label: "Toplam", color: "var(--series-3)" }]}
        actions={<IconButton icon="ellipsis-vertical" label="Daha fazla" variant="ghost" size="sm" />}
        footer="Kaynak: batch performans tablosu · GÜNLÜK PRESS PERFORMANSI TON/SA">
        <LineChart labels={d.gunluk.map(r => d.dShort(r.gun))} height={252}
          series={[{ label: "Press 1", points: d.gunluk.map(r => r.p1Perf), color: "var(--series-1)" },
                   { label: "Press 2", points: d.gunluk.map(r => r.p2Perf), color: "var(--series-2)" },
                   { label: "Toplam", points: d.gunluk.map(r => r.toplamPerf), color: "var(--series-3)" }]} />
      </ChartCard>

      {sonHat.farkPct > 5 && (
        <Alert tone="bad" title="Araç ve pres toplamı arasındaki fark toleransın dışında"
          actions={<Button size="sm" onClick={() => onNavigate("posa")} iconRight="chevron-right">Posa Analizi</Button>}>
          {d.dShort(d.onHatlar[2].tarih)} için fark %{d.nf(d.onHatlar[2].farkPct,1)} ({d.ni(d.onHatlar[2].fark)} kg) — tolerans ±%5.
        </Alert>
      )}

      <Card title="Günlük press performansı" subtitle="Girdi, çıktı ve verim" icon="table-2"
        actions={<Button size="sm" variant="ghost" icon="download">CSV</Button>}>
        <DataTable dense keyField="gun"
          columns={[
            { key: "gun", header: "Gün", emphasis: true, render: r => d.dShort(r.gun) },
            { key: "p1Perf", header: "Press 1 t/sa", numeric: true, align: "right", render: r => d.nf(r.p1Perf,1) },
            { key: "p2Perf", header: "Press 2 t/sa", numeric: true, align: "right", render: r => d.nf(r.p2Perf,1) },
            { key: "toplamPerf", header: "Toplam t/sa", numeric: true, align: "right", emphasis: true, render: r => d.nf(r.toplamPerf,1) },
            { key: "toplamGiren", header: "Toplam giren (t)", numeric: true, align: "right", render: r => d.nf(r.toplamGiren,2) },
            { key: "toplamCikan", header: "Toplam çıkan (t)", numeric: true, align: "right", render: r => d.nf(r.toplamCikan,2) },
            { key: "verim", header: "Verim %", numeric: true, align: "right", sortable: true, render: r => d.nf(r.verim,2) },
            { key: "leeching", header: "Leeching verimi %", numeric: true, align: "right", render: r => d.nf(r.leeching,2) },
            { key: "ortVerim", header: "Ortalama verim", render: r => <Badge tone="good" size="sm" dot>%{r.ortVerim}</Badge> },
          ]}
          rows={d.gunluk}
          footRow={{ gun: "Toplam", toplamGiren: d.nf(d.gunluk.reduce((a,r)=>a+r.toplamGiren,0),2), toplamCikan: d.nf(d.gunluk.reduce((a,r)=>a+r.toplamCikan,0),2), verim: "84,89" }} />
      </Card>
    </>
  );
}

Object.assign(window, { GenelBakis });
