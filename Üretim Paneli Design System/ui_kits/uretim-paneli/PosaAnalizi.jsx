const { SectionHeader, HeroMetric, KpiCard, ChartCard, Card, CardGrid, SplitRow, DataTable, Badge, Button, Alert, ThresholdMeter, SegmentedControl, StatBar } = window.RetimPaneliDesignSystem_b437a5;

function PosaAnalizi() {
  const d = window.UPData;
  const [gran, setGran] = React.useState("Gün");
  const aktif = d.onHatlar.filter(r => r.aracToplam > 0);
  const son = aktif[aktif.length - 1];
  const asan = aktif.filter(r => Math.abs(r.farkPct) > 5);

  return (
    <>
      <SectionHeader title="Posa Analizi" subtitle="Ön hatlar analiz · Günlük araç vs pres farkı · Tolerans ±%5"
        actions={<><SegmentedControl size="sm" value={gran} onChange={setGran} options={["Gün","Batch","Pres"]} /><Button icon="download">Excel'e Aktar</Button></>} />

      {asan.length > 0 && (
        <Alert tone="bad" title={asan.length + " gün toleransın dışında"}>
          {d.dShort(asan[0].tarih)} için araç ve pres toplamı arasındaki fark %{d.nf(asan[0].farkPct,1)} ({d.ni(asan[0].fark)} kg) — tolerans ±%5. Kantar ve batch kayıtlarını karşılaştırın.
        </Alert>
      )}

      <HeroMetric label="Araç vs pres farkı" value={d.nf(son.farkPct,1)} unit="%" icon="percent"
        status={Math.abs(son.farkPct) > 5 ? "Tolerans dışı" : "Tolerans içinde"} statusTone={Math.abs(son.farkPct) > 5 ? "bad" : "good"}
        delta={-3.0} deltaGoodWhen="down" deltaPeriod="önceki güne göre"
        note="(Araç Toplamı − Pres Toplamı) / Araç Toplamı · Tolerans ±%5"
        aside={<div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 320 }}>
          <ThresholdMeter label={d.dShort(son.tarih) + " kütle dengesi"} value={son.farkPct} limit={5} min={-10} max={10} />
          <div style={{ display: "flex", gap: 26 }}>
            {[["Araç toplamı", d.ni(son.aracToplam) + " kg"], ["Pres toplamı", d.ni(son.presToplam) + " kg"], ["Fark", d.ni(son.fark) + " kg"]].map(([l, v]) => (
              <div key={l}>
                <div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{l}</div>
                <div style={{ font: "var(--type-table-num)", fontSize: "var(--text-md)", color: "var(--text-primary)", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>} />

      <CardGrid minWidth={220}>
        <KpiCard label="Saatlik ort. toplam posa" value={d.nf(d.genel.posaOrt,1)} unit="t/sa" icon="scale" delta={-4.2} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Press 1 saatlik posa" value={d.nf(d.presler[0].posaSaatlik,1)} unit="t/sa" icon="factory" delta={-2.8} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Press 2 saatlik posa" value={d.nf(d.presler[1].posaSaatlik,1)} unit="t/sa" icon="factory" delta={1.4} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ort. leeching verimi" value={d.nf(d.gunluk.reduce((a,r)=>a+r.leeching,0)/d.gunluk.length,2)} unit="%" icon="droplet" delta={-0.5} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
      </CardGrid>

      <SplitRow ratio="1.6fr 1fr">
        <ChartCard title="Günlük araç vs pres farkı" subtitle="Fark · %" height={258}
          legend={[{ label: "Fark %", color: "var(--series-1)" }, { label: "Tolerans ±%5", color: "var(--signal-bad)" }]}
          footer="Kaynak: ÖN HATLAR ANALİZ tablosu · Kayıt olmayan günler grafiğe dahil edilmez.">
          <BarChart labels={aktif.map(r => d.dShort(r.tarih))} height={258} limitLine={5}
            groups={[{ label: "Fark %", points: aktif.map(r => r.farkPct), color: "var(--series-1)" }]} />
        </ChartCard>
        <Card title="Giren ürünün dağılımı" subtitle={d.dShort(son.tarih) + " · kg"} icon="scale">
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Donut size={156} thickness={20} centerValue={"%" + d.nf(son.farkPct,1)} centerLabel="fark"
              slices={[{ label: "Preslenen", value: son.presToplam, color: "var(--series-2)" }, { label: "Fark / posa", value: son.fark, color: "var(--series-1)" }]} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              {[["Pres toplamı", son.presToplam, "var(--series-2)"], ["Fark", son.fark, "var(--series-1)"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />{l}
                  </span>
                  <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-lg)", color: "var(--text-primary)" }}>{d.ni(v)} kg</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </SplitRow>

      <Card title="Ön hatlar analiz — günlük araç vs pres farkı" subtitle="Kaynak tablosunun birebir karşılığı" icon="scale">
        <DataTable keyField="tarih"
          columns={[
            { key: "tarih", header: "Tarih", emphasis: true, render: r => d.dShort(r.tarih) },
            { key: "aracToplam", header: "Araç toplamı (kg)", numeric: true, align: "right", render: r => d.ni(r.aracToplam) },
            { key: "presToplam", header: "Pres toplamı (kg)", numeric: true, align: "right", render: r => d.ni(r.presToplam) },
            { key: "fark", header: "Fark (kg)", numeric: true, align: "right", emphasis: true, render: r => r.aracToplam ? d.ni(r.fark) : <span style={{ color: "var(--text-disabled)" }}>—</span> },
            { key: "farkPct", header: "Fark %", numeric: true, align: "right", sortable: true, render: r => r.aracToplam
                ? <span style={{ color: Math.abs(r.farkPct) > 5 ? "var(--signal-bad)" : "var(--text-body)" }}>{d.nf(r.farkPct,1)}</span>
                : <span style={{ color: "var(--text-disabled)" }}>—</span> },
            { key: "durum", header: "Durum", render: r => !r.aracToplam
                ? <Badge tone="neutral" size="sm">Kayıt yok</Badge>
                : <Badge tone={Math.abs(r.farkPct) > 5 ? "bad" : "good"} size="sm" dot>{Math.abs(r.farkPct) > 5 ? "Tolerans dışı" : "Tolerans içinde"}</Badge> },
          ]}
          rows={d.onHatlar}
          footRow={{ tarih: "Toplam", aracToplam: d.ni(d.onHatlar.reduce((a,r)=>a+r.aracToplam,0)), presToplam: d.ni(d.onHatlar.reduce((a,r)=>a+r.presToplam,0)), fark: d.ni(d.onHatlar.reduce((a,r)=>a+r.fark,0)), farkPct: "5,6" }} />
      </Card>

      <Card title="Batch bazında kesinti ve verim kaybı" subtitle="Toplam verim %90'ın altındaki batch'ler" icon="triangle-alert">
        <DataTable dense keyField="batch"
          columns={[
            { key: "pres", header: "Pres", emphasis: true },
            { key: "batch", header: "Batch", numeric: true, align: "right" },
            { key: "tarih", header: "Tarih", render: r => d.dShort(r.tarih) },
            { key: "fpVerim", header: "F/P verim %", numeric: true, align: "right", render: r => d.nf(r.fpVerim,1) },
            { key: "toplamVerim", header: "Toplam verim %", numeric: true, align: "right", render: r => <span style={{ color: "var(--signal-bad)" }}>{d.nf(r.toplamVerim,1)}</span> },
            { key: "kesintiSuresi", header: "Kesinti %", numeric: true, align: "right", render: r => d.nf(r.kesintiSuresi,1) },
            { key: "kayip", header: "Verim kaybı", width: 160, render: r => <StatBar value={91 - r.toplamVerim} max={10} valueLabel={"−" + d.nf(91 - r.toplamVerim,1) + " p"} color="var(--signal-bad)" /> },
            { key: "notlar", header: "Notlar", wrap: true, render: r => r.notlar || <span style={{ color: "var(--text-disabled)" }}>—</span> },
          ]}
          rows={d.batches.filter(b => b.toplamVerim < 90)} />
      </Card>
    </>
  );
}

Object.assign(window, { PosaAnalizi });
