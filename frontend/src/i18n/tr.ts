/**
 * The single source of user-facing copy (docs/CODING_STANDARDS.md §2,
 * docs/RULES.md §9). Keys are English; values are frozen Turkish. Never
 * translate, reword, or "clarify" a value — new strings are written once here.
 *
 * Nav labels reuse `config.SECTIONS` labels verbatim where a v2 route
 * corresponds to a v1 section, plus two new labels for the new pages.
 */
export const tr = {
  app: {
    name: "Üretim Paneli",
    subtitle: "Elma Presleme Tesisi",
  },
  nav: {
    overview: "Genel Bakış",
    press: "Pres Performansı",
    lab: "Laboratuvar",
    trucks: "Araç Lojistiği",
    data: "Veri Girişi",
    charts: "Grafik Analiz",
    toggleTheme: "Tema değiştir",
  },
  overview: {
    title: "Genel Bakış",
  },
  placeholder: {
    comingSoon: "Bu bölüm sonraki fazlarda gelecek.",
  },
  kpi: {
    ortToplamVerim: "Ort. Toplam Verim",
    unitPct: "%",
    noData: "veri yok",
  },
  error: {
    title: "Bir şeyler ters gitti",
    retry: "Yeniden dene",
    loadFailed: "Veriler yüklenemedi.",
  },
} as const;

export type Tr = typeof tr;
