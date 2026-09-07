import * as React from "react";

export interface DeltaChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Signed percentage change. Negative renders a down arrow. */
  value: number;
  unit?: string;
  /**
   * Which direction is favourable. `up` for verim/throughput, `down` for posa %
   * and downtime, `none` for a measure with no good direction (renders neutral).
   */
  goodWhen?: "up" | "down" | "none";
  /** Comparison label, e.g. "önceki haftaya göre". */
  period?: string;
  precision?: number;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function DeltaChip(props: DeltaChipProps): JSX.Element;
