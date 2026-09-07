/* Real data model, transcribed from the two source tables the plant maintains:
   (1) the batch-level press table, (2) Araç Takip Tablosu.
   Everything else in the panel is derived from these two. */
window.UPData = (function () {

  /* --- Table 1: batch-level press stats ---------------------------------- */
  const B = [
    ["Pres 1", 1,"31/08/2026","Enz. 1 Sld. Elma","10:17:22","12:27:54",130.6,14903,12847,86.2,14.1,26.4,0,   0,94.0,35.1, 3.7,61.2,""],
    ["Pres 2", 2,"31/08/2026","Enzimli 1 Sld. Elma","11:37:03","13:22:56",105.9,15306,13099,85.6,14.3,26.9,1,2200,93.7,12.1, 0.5,87.4,""],
    ["Pres 1", 3,"31/08/2026","Enz. 1 Sld. Elma","12:29:22","14:11:12",101.9,13533,11095,82.0,12.5,26.8,1,2200,91.9,98.6, 0.0, 1.4,""],
    ["Pres 2", 4,"31/08/2026","Enzimli 1 Sld. Elma","13:22:56","15:02:48", 99.8,14110,11643,82.5,13.4,27.1,1,2200,92.3,100.0,0.0, 0.0,""],
    ["Pres 1", 5,"31/08/2026","Enz. 1 Sld. Elma","14:12:09","15:33:06", 81.0,14632,12409,84.8,11.6,27.7,0,   0,84.8,98.9, 0.0, 1.1,""],
    ["Pres 2", 6,"31/08/2026","Enzimli 1 Sld. Elma","15:04:18","17:12:51",128.6,17687,15517,87.7,10.4,33.0,1,2200,95.0,97.8, 1.0, 1.2,""],
    ["Pres 1", 7,"31/08/2026","Enz. 1 Sld. Elma","15:33:12","17:19:19",106.1,17921,15214,84.9,11.3,29.3,0,   0,84.9,92.3, 7.6, 0.1,""],
    ["Pres 1", 8,"03/09/2026","Enz. 1 Sld. Elma", "9:37:43","11:17:19", 99.6,14420,11971,83.0,13.8,25.8,1,2200,91.9,96.3, 0.0,96.3,""],
    ["Pres 1", 9,"03/09/2026","Enz. 1 Sld. Elma","11:25:51","13:56:02",150.2,14047,11679,83.1,13.5,24.9,1,2200,92.3,62.4,32.2, 5.4,""],
    ["Pres 2",10,"03/09/2026","Enzimli 1 Sld. Elma","11:50:16","13:50:23",120.1,12042,12460,84.3,14.0,19.9,1,2200,93.3, 2.5, 0.5,97.0,""],
    ["Pres 2",11,"03/09/2026","Enzimli 1 Sld. Elma","13:50:40","16:00:31",129.8,11415, 9633,84.4,11.1,26.1,1,2200,93.5,76.1,23.7, 0.2,""],
    ["Pres 1",12,"03/09/2026","Enz. 1 Sld. Elma","13:56:28","15:45:47",109.3,13787,11314,82.1,13.2,26.2,1,2200,91.8,90.2, 9.4, 0.4,""],
    ["Pres 1",13,"03/09/2026","Enz. 1 Sld. Elma","15:45:53","17:25:14", 99.3,13710,11231,81.9,13.1,27.0,1,2200,91.7,99.8, 0.1, 0.1,""],
    ["Pres 2",14,"03/09/2026","Enzimli 1 Sld. Elma","16:00:56","17:40:58",100.0,14714,12062,82.0,14.0,27.6,1,2200,91.9,99.6, 0.0, 0.4,""],
    ["Pres 1",15,"03/09/2026","Enz. 1 Sld. Elma","17:25:20","19:06:01",100.7,14402,12159,84.4,13.6,29.7,1,2200,92.8,99.1, 0.7, 0.2,""],
    ["Pres 2",16,"03/09/2026","Enzimli 1 Sld. Elma","17:43:18","20:41:20",178.0,20603,17308,84.0, 7.1,28.4,0,   0,84.0,99.3, 0.4, 1.3,""],
    ["Pres 1",17,"04/09/2026","Enz. 1 Sld. Elma","10:50:59","12:39:11",108.2,16702,14484,86.7,16.0,23.0,1,1800,93.8,20.1, 2.0,78.0,""],
    ["Pres 2",18,"04/09/2026","Enzimli 1 Sld. Elma","10:54:08","12:46:02",111.9,15367,13130,85.4,14.5,19.5,1,1800,93.5,10.4, 1.3,88.3,""],
    ["Pres 1",19,"04/09/2026","Enz. 1 Sld. Elma","12:40:40","14:22:22",101.7,13638,11450,84.0,12.9,21.2,1,1800,92.6,96.0, 2.5, 1.5,""],
    ["Pres 2",20,"04/09/2026","Enzimli 1 Sld. Elma","12:47:48","14:27:31",100.1,14438,11989,83.0,13.8,23.9,1,1800,92.2,97.2, 1.1, 1.7,""],
    ["Pres 1",21,"04/09/2026","Enz. 1 Sld. Elma","14:22:28","16:37:51",135.5,15858,13295,83.8, 9.8,24.7,1,1800,84.1,98.9, 1.0, 0.1,""],
    ["Pres 2",22,"04/09/2026","Enzimli 1 Sld. Elma","14:27:56","16:28:33",120.6,13834,11486,83.0,13.2,25.1,1,1800,91.8,81.7,17.9, 0.4,"Termik arızası oldu"],
    ["Pres 2",23,"04/09/2026","Enzimli 1 Sld. Elma","16:30:17","18:01:27", 91.2, 9799, 8240,84.1, 9.7,26.6,1,1800,88.8,94.9, 3.2, 1.9,""],
    ["Pres 1",24,"04/09/2026","Enz. 1 Sld. Elma","16:38:06","18:13:08", 95.0,12775,11126,87.1,10.9,27.5,1, 900,88.5,97.3, 2.4, 0.3,""],
  ];
  const KEYS = ["pres","batch","tarih","recete","baslangic","bitis","sure","dolum","filtrat","fpVerim","fpPerf","tank","nwCevrim","nwSu","toplamVerim","uretimSuresi","kesintiSuresi","kalanSure","notlar"];
  const batches = B.map(r => Object.fromEntries(KEYS.map((k, i) => [k, r[i]])));

  /* --- Table 2: Araç Takip Tablosu -------------------------------------- */
  const T = [
    ["03/09/2026",1,"Elma",25660,"8:22", "9:19", 57.0,450.18,null],
    ["03/09/2026",2,"Elma",29040,"9:50","10:52", 62.0,468.39,31.0],
    ["03/09/2026",3,"Elma",28460,"10:54","11:42",48.0,592.92, 2.0],
    ["03/09/2026",4,"Elma",26460,"14:23","15:35",72.0,367.50,161.0],
    ["03/09/2026",5,"Elma",29180,"15:40","16:22",42.0,694.76, 5.0],
    ["04/09/2026",1,"Elma",27640,"8:00", "9:13",73.0,378.63,null],
    ["04/09/2026",2,"Elma",30360,"9:15","11:18",123.0,246.83, 2.0],
    ["04/09/2026",3,"Elma",28540,"11:20","12:25",65.0,439.08, 2.0],
    ["04/09/2026",4,"Elma",30580,"12:54","14:44",110.0,278.00,29.0],
  ];
  const TKEYS = ["tarih","arac","urun","miktar","baslangic","bitis","sure","hiz","bekleme"];
  const trucks = T.map(r => Object.fromEntries(TKEYS.map((k, i) => [k, r[i]])));

  /* --- Derived: GÜNLÜK PERFORMANS TREND (TON/SAAT) ---------------------- */
  const gunluk = [
    { gun:"31/08/2026", p1Perf:7.4, p2Perf:7.2, toplamPerf:14.6, p1Girdi:60.99, p1Cikti:51.57, p2Girdi:47.10, p2Cikti:40.26, toplamGiren:108.09, toplamCikan:91.82,  verim:84.95, leeching:5.99, ortVerim:91 },
    { gun:"03/09/2026", p1Perf:6.3, p2Perf:5.8, toplamPerf:12.1, p1Girdi:70.37, p1Cikti:58.35, p2Girdi:58.77, p2Cikti:51.46, toplamGiren:129.14, toplamCikan:109.82, verim:85.04, leeching:6.43, ortVerim:91 },
    { gun:"04/09/2026", p1Perf:6.9, p2Perf:6.3, toplamPerf:13.2, p1Girdi:58.97, p1Cikti:50.36, p2Girdi:53.44, p2Cikti:44.85, toplamGiren:112.41, toplamCikan:95.20,  verim:84.69, leeching:5.97, ortVerim:91 },
  ];

  /* --- Derived: ÖN HATLAR ANALİZ — GÜNLÜK ARAÇ vs PRES FARKI ------------ */
  const onHatlar = [
    { tarih:"01/09/2026", aracToplam:0,      presToplam:0,      fark:0,    farkPct:0 },
    { tarih:"02/09/2026", aracToplam:0,      presToplam:0,      fark:0,    farkPct:0 },
    { tarih:"03/09/2026", aracToplam:138800, presToplam:129140, fark:9660, farkPct:7.0 },
    { tarih:"04/09/2026", aracToplam:117120, presToplam:112411, fark:4709, farkPct:4.0 },
  ];

  /* --- Derived: dashboard headline figures ------------------------------ */
  const genel = { islenen:349.6, ortToplamVerim:91.2, ortBatchSuresi:115.1, cikanOrt:13.1, posaOrt:2.3 };
  const presler = [
    { id:"p1", ad:"Press 1", calisma:23.65, giren:190.3, cikan:160.3, saatlik:6.8, posaSaatlik:1.3 },
    { id:"p2", ad:"Press 2", calisma:21.43, giren:159.3, cikan:136.6, saatlik:6.4, posaSaatlik:1.1 },
  ];

  /* --- Derived: araç istatistikleri ------------------------------------- */
  const aracIstatistik = { aracSayisi:9, ortBekleme:33.1, toplamKayip:232.0, ortBosaltma:72.4, ortHiz:392.52, toplamGelen:255.9 };
  const aracGunluk = [
    { gun:"03/09/2026", miktar:138.8, bekleme:199, presAralik:"11:03:37" },
    { gun:"04/09/2026", miktar:117.1, bekleme:33,  presAralik:"7:22:09" },
  ];

  /* --- Threshold rules, mirroring the workbook's conditional fills ------ */
  const tone = {
    toplamVerim: v => v >= 93 ? "good" : v >= 90 ? "caution" : "bad",
    kesinti:     v => v > 10 ? "bad" : v >= 5 ? "caution" : "good",
    tank:        v => v <= 23 ? "good" : v <= 28 ? "caution" : "bad",
    fark:        v => Math.abs(v) > 5 ? "bad" : "good",
    fpVerim:     v => v >= 86 ? "good" : v >= 83 ? "caution" : "bad",
    bekleme:     v => v == null ? "neutral" : v > 60 ? "bad" : v > 15 ? "caution" : "good",
  };

  const nf = (v, d = 1) => (v == null ? "—" : Number(v).toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const ni = v => (v == null ? "—" : Number(v).toLocaleString("tr-TR"));
  const dShort = t => { const [g, a] = t.split("/"); return g + " " + ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"][+a - 1]; };

  return { batches, trucks, gunluk, onHatlar, genel, presler, aracIstatistik, aracGunluk, tone, nf, ni, dShort };
})();
