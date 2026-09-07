const { SectionHeader, Card, SplitRow, FormGrid, Field, TextInput, Select, Checkbox, Button, Alert, Badge, DataTable, PageTabs, ThresholdMeter } = window.RetimPaneliDesignSystem_b437a5;

const BOS_BATCH = { pres: "Pres 1", batch: "", tarih: "2026-09-04", recete: "Enz. 1 Sld. Elma", baslangic: "", bitis: "", dolum: "", filtrat: "", tank: "", nwCevrim: "1", nwSu: "1800", notlar: "" };
const BOS_ARAC = { tarih: "2026-09-04", arac: "", urun: "Elma", miktar: "", baslangic: "", bitis: "" };

function VeriGirisi() {
  const d = window.UPData;
  const [tab, setTab] = React.useState("batch");
  const [b, setB] = React.useState(BOS_BATCH);
  const [a, setA] = React.useState(BOS_ARAC);
  const [onay, setOnay] = React.useState(false);
  const [sonuc, setSonuc] = React.useState(null);
  const [kayitlar, setKayitlar] = React.useState(d.batches.slice(-5).reverse());
  const [aracKayit, setAracKayit] = React.useState(d.trucks.slice(-4).reverse());

  const setBk = k => v => { setB(f => ({ ...f, [k]: v })); setSonuc(null); };
  const setAk = k => v => { setA(f => ({ ...f, [k]: v })); setSonuc(null); };

  /* batch türetilmiş alanlar */
  const dolum = parseFloat(b.dolum), filtrat = parseFloat(b.filtrat);
  const gecerliB = isFinite(dolum) && isFinite(filtrat) && dolum > 0;
  const fpVerim = gecerliB ? (filtrat / dolum) * 100 : null;
  const filtratHata = gecerliB && filtrat > dolum ? "Filtrat miktarı toplam dolumdan büyük olamaz" : null;
  const gonderB = onay && gecerliB && !filtratHata && b.batch !== "" && b.baslangic !== "" && b.bitis !== "";

  /* araç türetilmiş alanlar */
  const miktar = parseFloat(a.miktar);
  const mins = t => { const [h, m] = (t || "").split(":").map(Number); return isFinite(h) && isFinite(m) ? h * 60 + m : null; };
  const sure = mins(a.bitis) !== null && mins(a.baslangic) !== null ? mins(a.bitis) - mins(a.baslangic) : null;
  const hiz = sure > 0 && isFinite(miktar) ? miktar / sure : null;
  const sureHata = sure !== null && sure <= 0 ? "Bitiş saati başlangıçtan sonra olmalıdır" : null;
  const gonderA = onay && isFinite(miktar) && sure > 0 && !sureHata && a.arac !== "";

  const kaydetBatch = () => {
    setKayitlar(k => [{ ...b, batch: +b.batch, tarih: "04/09/2026", dolum: dolum, filtrat: filtrat, fpVerim: +fpVerim.toFixed(1), toplamVerim: +(fpVerim + 7).toFixed(1), sure: 0, kesintiSuresi: 0 }, ...k]);
    setSonuc({ tone: "good", title: "Batch kaydı eklendi", body: "Batch #" + b.batch + " · " + d.ni(dolum) + " kg dolum · F/P verim %" + d.nf(fpVerim,1) + ". uretim.xlsx güncellendi." });
    setB(BOS_BATCH); setOnay(false);
  };
  const kaydetArac = () => {
    setAracKayit(k => [{ ...a, tarih: "04/09/2026", arac: +a.arac, miktar: miktar, sure: sure, hiz: +hiz.toFixed(2), bekleme: null }, ...k]);
    setSonuc({ tone: "good", title: "Araç kaydı eklendi", body: "Araç " + a.arac + " · " + d.ni(miktar) + " kg · " + d.nf(hiz,2) + " kg/dk. Araç Takip Tablosu güncellendi." });
    setA(BOS_ARAC); setOnay(false);
  };

  return (
    <>
      <SectionHeader title="Veri Girişi" subtitle="Manuel kayıt · uretim.xlsx dosyasına yazar"
        actions={<Button icon="file-spreadsheet">Dosyayı Aç</Button>} />
      <PageTabs value={tab} onChange={t => { setTab(t); setOnay(false); setSonuc(null); }} tabs={[
        { id: "batch", label: "Batch kaydı", icon: "gauge" },
        { id: "arac", label: "Araç kaydı", icon: "truck" }]} />

      {sonuc && <Alert tone={sonuc.tone} title={sonuc.title} onDismiss={() => setSonuc(null)}>{sonuc.body}</Alert>}

      <SplitRow ratio="1.5fr 1fr">
        {tab === "batch" ? (
          <Card title="Yeni batch kaydı" subtitle="GENEL · F/P FAZI (DOLUM / PRES) · NW FAZI (YIKAMA)" icon="square-pen">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <FormGrid columns={3}>
                <Field label="Pres" required><Select value={b.pres} onChange={setBk("pres")} options={["Pres 1","Pres 2"]} icon="factory" /></Field>
                <Field label="Batch no" required><TextInput type="number" placeholder="25" value={b.batch} onChange={setBk("batch")} /></Field>
                <Field label="Tarih" required><TextInput type="date" value={b.tarih} onChange={setBk("tarih")} /></Field>
                <Field label="Reçete" required span={3}><Select value={b.recete} onChange={setBk("recete")} options={["Enz. 1 Sld. Elma","Enzimli 1 Sld. Elma"]} /></Field>
                <Field label="Başlangıç" required hint="ss:dd:ss"><TextInput placeholder="18:20:00" value={b.baslangic} onChange={setBk("baslangic")} icon="clock" /></Field>
                <Field label="Bitiş" required hint="ss:dd:ss"><TextInput placeholder="20:05:00" value={b.bitis} onChange={setBk("bitis")} icon="clock" /></Field>
                <Field label="F tank sıcaklığı"><TextInput type="number" step="0.1" placeholder="0,0" suffix="°C" value={b.tank} onChange={setBk("tank")} /></Field>
                <Field label="F toplam dolum Q15" required hint="Kantar / dolum kaydı"><TextInput type="number" placeholder="0" suffix="kg" value={b.dolum} onChange={setBk("dolum")} /></Field>
                <Field label="F/P filtrat miktarı" required error={filtratHata}><TextInput type="number" placeholder="0" suffix="kg" value={b.filtrat} onChange={setBk("filtrat")} invalid={!!filtratHata} /></Field>
                <Field label="NW çevrim sayısı"><TextInput type="number" value={b.nwCevrim} onChange={setBk("nwCevrim")} /></Field>
                <Field label="NW toplam su" span={3}><TextInput type="number" suffix="l" value={b.nwSu} onChange={setBk("nwSu")} /></Field>
                <Field label="Notlar" span={3} hint="İsteğe bağlı. Arıza, duruş veya sapma açıklaması."><TextInput placeholder="Örn. Termik arızası oldu" value={b.notlar} onChange={setBk("notlar")} /></Field>
              </FormGrid>

              <Card inset padding="14px 16px">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>Hesaplanan F/P verim Q26</span>
                    <span style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-metric)", color: fpVerim === null ? "var(--text-disabled)" : "var(--signal-" + d.tone.fpVerim(fpVerim) + ")" }}>
                      {fpVerim === null ? "—" : "%" + d.nf(fpVerim,1)}
                    </span>
                  </div>
                  {fpVerim !== null && !filtratHata && <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>Posa (fark)</span>
                      <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-xl)", color: "var(--text-primary)" }}>{d.ni(dolum - filtrat)} kg</span>
                    </div>
                    <Badge tone={d.tone.fpVerim(fpVerim)} dot>{d.tone.fpVerim(fpVerim) === "good" ? "Hedefin üzerinde" : d.tone.fpVerim(fpVerim) === "caution" ? "Hedefe yakın" : "Hedefin altında"}</Badge>
                  </>}
                </div>
              </Card>

              {fpVerim !== null && fpVerim < 83 && !filtratHata && (
                <Alert tone="caution" title="F/P verim hedefin altında">
                  Kayıt eklenebilir, ancak Pres Performansı sayfasında düşük verim olarak işaretlenir.
                </Alert>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid var(--border-subtle)" }}>
                <Checkbox id="onayB" checked={onay} onChange={setOnay} label="Kaydı onaylıyorum" description="Veriler uretim.xlsx dosyasına yazılır ve geri alınamaz." />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => { setB(BOS_BATCH); setOnay(false); setSonuc(null); }}>Temizle</Button>
                  <Button variant="primary" icon="save" disabled={!gonderB} onClick={kaydetBatch}>Kaydet</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Yeni araç kaydı" subtitle="Araç takip tablosu" icon="truck">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <FormGrid columns={3}>
                <Field label="Tarih" required><TextInput type="date" value={a.tarih} onChange={setAk("tarih")} /></Field>
                <Field label="Araç no" required><TextInput type="number" placeholder="5" value={a.arac} onChange={setAk("arac")} icon="truck" /></Field>
                <Field label="Ürün" required><Select value={a.urun} onChange={setAk("urun")} options={["Elma"]} /></Field>
                <Field label="Miktar" required hint="Kantar brüt kaydı"><TextInput type="number" placeholder="0" suffix="kg" value={a.miktar} onChange={setAk("miktar")} /></Field>
                <Field label="Başlangıç" required hint="ss:dd"><TextInput placeholder="15:40" value={a.baslangic} onChange={setAk("baslangic")} icon="clock" /></Field>
                <Field label="Bitiş" required error={sureHata}><TextInput placeholder="16:22" value={a.bitis} onChange={setAk("bitis")} icon="clock" invalid={!!sureHata} /></Field>
              </FormGrid>

              <Card inset padding="14px 16px">
                <div style={{ display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>Hesaplanan süre</span>
                    <span style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-metric)", color: sure === null || sure <= 0 ? "var(--text-disabled)" : "var(--text-primary)" }}>{sure === null || sure <= 0 ? "—" : d.nf(sure,1) + " dk"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--type-label)", color: "var(--text-muted)" }}>Boşaltma hızı</span>
                    <span style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-metric)", color: hiz === null ? "var(--text-disabled)" : "var(--text-primary)" }}>{hiz === null ? "—" : d.nf(hiz,2) + " kg/dk"}</span>
                  </div>
                  {hiz !== null && <Badge tone={hiz >= 392.52 ? "good" : "caution"} dot>{hiz >= 392.52 ? "Ortalamanın üzerinde" : "Ortalamanın altında"}</Badge>}
                </div>
              </Card>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid var(--border-subtle)" }}>
                <Checkbox id="onayA" checked={onay} onChange={setOnay} label="Kaydı onaylıyorum" description="Veriler uretim.xlsx dosyasına yazılır ve geri alınamaz." />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => { setA(BOS_ARAC); setOnay(false); setSonuc(null); }}>Temizle</Button>
                  <Button variant="primary" icon="save" disabled={!gonderA} onClick={kaydetArac}>Kaydet</Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Dosya durumu" subtitle="uretim.xlsx" icon="file-spreadsheet">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Son okuma","14:20"],["Batch kaydı",d.batches.length + " satır"],["Araç kaydı",d.trucks.length + " satır"],["Yazma izni","Var"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--type-caption)" }}>
                  <span style={{ color: "var(--text-subtle)" }}>{k}</span>
                  <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{v}</span>
                </div>
              ))}
              <Alert tone="info" title="Dosya paylaşımlı">Kayıt sırasında dosya başka bir kullanıcı tarafından açık olmamalıdır.</Alert>
            </div>
          </Card>
          <Card title="Son kayıtlar" subtitle={tab === "batch" ? "Batch" : "Araç"} icon="history">
            {tab === "batch" ? (
              <DataTable dense keyField="batch"
                columns={[
                  { key: "batch", header: "Batch", numeric: true, align: "right", emphasis: true },
                  { key: "pres", header: "Pres" },
                  { key: "dolum", header: "Dolum (kg)", numeric: true, align: "right", render: r => d.ni(r.dolum) },
                  { key: "toplamVerim", header: "Verim %", numeric: true, align: "right", render: r => <Badge tone={d.tone.toplamVerim(r.toplamVerim)} size="sm">{d.nf(r.toplamVerim,1)}</Badge> },
                ]}
                rows={kayitlar.slice(0, 6)} />
            ) : (
              <DataTable dense keyField="k"
                columns={[
                  { key: "arac", header: "Araç", numeric: true, align: "right", emphasis: true },
                  { key: "tarih", header: "Tarih", render: r => d.dShort(r.tarih) },
                  { key: "miktar", header: "Miktar (kg)", numeric: true, align: "right", render: r => d.ni(r.miktar) },
                  { key: "hiz", header: "kg/dk", numeric: true, align: "right", render: r => d.nf(r.hiz,2) },
                ]}
                rows={aracKayit.slice(0, 6).map(r => ({ ...r, k: r.tarih + "-" + r.arac }))} />
            )}
          </Card>
        </div>
      </SplitRow>
    </>
  );
}

Object.assign(window, { VeriGirisi });
