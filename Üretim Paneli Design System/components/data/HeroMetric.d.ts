import * as React from "react";

/**
 * The featured metric banner — exactly one per page, always the top row.
 * @startingPoint section="Metrikler" subtitle="Sayfa başına tek öne çıkan metrik" viewport="700x200"
 */
export interface HeroMetricProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Uppercase overline label, e.g. "GÜNLÜK PRES HACMİ". Pass sentence case; the component uppercases. */
  label: string;
  value: React.ReactNode;
  unit?: string;
  delta?: number | null;
  deltaGoodWhen?: "up" | "down" | "none";
  deltaPeriod?: string;
  /** Threshold verdict badge text, e.g. "Tolerans içinde". */
  status?: string;
  statusTone?: "neutral" | "good" | "bad" | "caution" | "accent";
  /** One sentence of context or the formula behind the number. */
  note?: string;
  icon?: string;
  /** Right-hand slot — a sparkline, a ThresholdMeter, or a small stat stack. */
  aside?: React.ReactNode;
  style?: React.CSSProperties;
}
export function HeroMetric(props: HeroMetricProps): JSX.Element;
