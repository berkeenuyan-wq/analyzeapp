const { SectionHeader, HeroMetric, KpiCard, ChartCard, Card, CardGrid, SplitRow, DataTable, Badge, Button, IconButton, SegmentedControl, TextInput, EmptyState, StatBar } = window.RetimPaneliDesignSystem_b437a5;

function AracLojistigi() {
  const d = window.UPData;
  const [q, setQ] = React.useState("");
  const [gun, setGun] = React.useState("Tümü");
  const s = d.aracIstatistik;
  const gunler = ["Tümü", ...d.aracGunluk.map(r => d.dShort(r.gun))];
  const rows = d.trucks.filter(t =>
    (gun === "Tümü" || d.dShort(t.tarih) === gun) &&
    (q === "" || (t.arac + " " + t.urun + " " + t.tarih).toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <SectionHeader title="Araç Lojistiği" subtitle={"Araç takip tablosu · " + s.aracSayisi + " kayıtlı araç · 3–4 Eyl 2026"}
        actions={<><SegmentedControl size="sm" value={gun} onChange={setGun} options={gunler} /><Button icon="download">Excel'e Aktar</Button></>} />

      <HeroMetric label="Toplam gelen ürün" value={d.nf(s.toplamGelen,1)} unit="ton" icon="truck"
        status={s.aracSayisi + " araç boşaltıldı"} statusTone="good" delta={-15.6} deltaGoodWhen="none" deltaPeriod="önceki güne göre"
        note={"Ortalama boşaltma hızı " + d.nf(s.ortHiz,2) + " kg/dk · Ortalama boşaltma süresi " + d.nf(s.ortBosaltma,1) + " dk"}
        aside={<div style={{ display: "flex", gap: 32 }}>
          {[["Ortalama bekleme", d.nf(s.ortBekleme,1) + " dk", "var(--text-primary)"],
            ["Toplam kayıp zaman", d.nf(s.toplamKayip,1) + " dk", "var(--signal-bad)"],
            ["Kayıtlı araç", s.aracSayisi + "", "var(--text-primary)"]].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{l}</div>
              <div style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", color: c, letterSpacing: "var(--tracking-metric)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>} />

      <CardGrid minWidth={220}>
        <KpiCard label="Kayıtlı araç sayısı" value={s.aracSayisi} unit="araç" icon="truck" delta={-20.0} deltaGoodWhen="none" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ortalama bekleme süresi" value={d.nf(s.ortBekleme,1)} unit="dk" icon="clock" tone="bad" delta={12.4} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ortalama boşaltma süresi" value={d.nf(s.ortBosaltma,1)} unit="dk" icon="timer" delta={-6.8} deltaGoodWhen="down" deltaPeriod="Önceki güne göre" />
        <KpiCard label="Ortalama boşaltma hızı" value={d.nf(s.ortHiz,2)} unit="kg/dk" icon="gauge" delta={4.1} deltaGoodWhen="up" deltaPeriod="Önceki güne göre" />
      </CardGrid>

      <SplitRow ratio="1.6fr 1fr">
        <ChartCard title="Araç bazında boşaltma hızı ve bekleme" subtitle="kg/dk · dk" height={258}
          legend={[{ label: "Boşaltma hızı (kg/dk)", color: "var(--series-3)" }, { label: "Bekleme (dk)", color: "var(--series-4)" }]}
          footer="Bekleme, önceki aracın bitişi ile bu aracın başlangıcı arasındaki süredir.">
          <BarChart labels={d.trucks.map(t => d.dShort(t.tarih).split(" ")[0] + "/" + t.arac)} height={258}
            groups={[{ label: "Hız", points: d.trucks.map(t => t.hiz), color: "var(--series-3)" },
                     { label: "Bekleme", points: d.trucks.map(t => (t.bekleme || 0) * 4), color: "var(--series-4)" }]} />
        </ChartCard>
        <Card title="Günlük tablo" subtitle="Miktar, bekleme ve press aralığı" icon="calendar">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {d.aracGunluk.map(r => (
              <Card key={r.gun} inset padding="14px 16px">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ font: "var(--type-card-title)", color: "var(--text-primary)" }}>{d.dShort(r.gun)}</span>
                    <Badge tone={r.bekleme > 60 ? "bad" : r.bekleme > 15 ? "caution" : "good"} size="sm" dot>{r.bekleme} dk bekleme</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div><div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>Miktar</div><div style={{ font: "var(--type-table-num)", fontSize: "var(--text-lg)", color: "var(--text-primary)", marginTop: 2 }}>{d.nf(r.miktar,1)} ton</div></div>
                    <div><div style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>Press başlangıç–bitiş arası</div><div style={{ font: "var(--type-table-num)", fontSize: "var(--text-lg)", color: "var(--text-primary)", marginTop: 2 }}>{r.presAralik}</div></div>
                  </div>
                </div>
              </Card>
            ))}
            <Card inset padding="14px 16px">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>Toplam kayıp zaman</span>
                <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-lg)", color: "var(--signal-bad)" }}>{d.nf(s.toplamKayip,1)} dk</span>
              </div>
            </Card>
          </div>
        </Card>
      </SplitRow>

      <Card title="Araç takip tablosu" subtitle="Kaynak tablosunun birebir karşılığı" icon="truck"
        actions={<TextInput size="sm" icon="search" placeholder="Araç no veya tarih ara" value={q} onChange={setQ} style={{ minWidth: 230 }} />}>
        <DataTable dense keyField="key" emptyLabel="Aramanızla eşleşen araç kaydı yok"
          columns={[
            { key: "tarih", header: "Tarih", emphasis: true, render: r => d.dShort(r.tarih) },
            { key: "arac", header: "Araç", numeric: true, align: "right" },
            { key: "urun", header: "Ürün" },
            { key: "miktar", header: "Miktar (kg)", numeric: true, align: "right", sortable: true, render: r => d.ni(r.miktar) },
            { key: "baslangic", header: "Başlangıç", numeric: true, align: "right" },
            { key: "bitis", header: "Bitiş", numeric: true, align: "right" },
            { key: "sure", header: "Süre (dk)", numeric: true, align: "right", render: r => d.nf(r.sure,1) },
            { key: "hiz", header: "Hız (kg/dk)", numeric: true, align: "right", sortable: true, render: r => d.nf(r.hiz,2) },
            { key: "bekleme", header: "Bekleme (dk)", numeric: true, align: "right", render: r => r.bekleme == null
                ? <span style={{ color: "var(--text-disabled)" }}>—</span>
                : <span style={{ color: r.bekleme > 60 ? "var(--signal-bad)" : "var(--text-body)" }}>{d.nf(r.bekleme,1)}</span> },
            { key: "pay", header: "Bekleme payı", width: 150, render: r => <StatBar value={r.bekleme || 0} max={161} showValue={false} color={r.bekleme > 60 ? "var(--signal-bad)" : "var(--series-4)"} /> },
          ]}
          rows={rows.map((r, i) => ({ ...r, key: r.tarih + "-" + r.arac }))}
          sortKey="miktar" sortDir="desc" onSort={() => {}}
          footRow={{ tarih: "Toplam · " + rows.length + " araç", miktar: d.ni(rows.reduce((a,t)=>a+t.miktar,0)), sure: d.nf(rows.reduce((a,t)=>a+t.sure,0),1), bekleme: d.nf(rows.reduce((a,t)=>a+(t.bekleme||0),0),1) }} />
      </Card>
    </>
  );
}

Object.assign(window, { AracLojistigi });
