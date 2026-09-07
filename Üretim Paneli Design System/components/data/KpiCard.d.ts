import * as React from "react";

/**
 * The standard metric tile. Rows of 4 across desktop, 2 across tablet.
 * @startingPoint section="Metrikler" subtitle="KPI kartı, delta ve dipnot" viewport="700x150"
 */
export interface KpiCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Turkish measure name, sentence case: "Toplam pres hacmi". */
  label: string;
  /** Pre-formatted value string — format in Turkish locale (1.234,5) before passing. */
  value: React.ReactNode;
  /** Unit shown small next to the value: "ton", "kg", "%", "araç". */
  unit?: string;
  icon?: string;
  delta?: number | null;
  deltaGoodWhen?: "up" | "down" | "none";
  /** Comparison context line, shown at the bottom. */
  deltaPeriod?: string;
  footnote?: string;
  /** Colours the VALUE. Only for threshold verdicts, never for emphasis. */
  tone?: "default" | "good" | "bad";
  /** Selected state — accent border. Use when the tile filters the page. */
  active?: boolean;
  style?: React.CSSProperties;
}
export function KpiCard(props: KpiCardProps): JSX.Element;
