import * as React from "react";

export interface ChartLegendItem {
  label: string;
  /** A --series-* token. Keep series order stable across a page. */
  color?: string;
  /** Optional current/total value shown bold after the label. */
  value?: React.ReactNode;
}

/**
 * A chart always lives inside its card, never bleeding to the page edge.
 * @startingPoint section="Grafikler" subtitle="Efsaneli grafik kartı" viewport="700x340"
 */
export interface ChartCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "style" | "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Dot legend above the plot — mirrors the reference dashboard. */
  legend?: ChartLegendItem[];
  /** Plot area height in px. 260 default, 320 for a full-width chart. */
  height?: number;
  /** The plot itself — Plotly/Vega container, or an inline SVG. */
  children?: React.ReactNode;
  /** Hairline-separated note: data source, sample size, last refresh. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ChartCard(props: ChartCardProps): JSX.Element;
