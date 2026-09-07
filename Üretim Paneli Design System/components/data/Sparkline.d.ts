import * as React from "react";

export interface SparklineProps extends Omit<React.SVGProps<SVGSVGElement>, "points" | "color" | "fill" | "style"> {
  /** Ordered series, oldest first. Needs at least 2 points. */
  points: number[];
  width?: number;
  height?: number;
  /** Defaults to --series-1. Use --signal-bad only when the trend itself is the alarm. */
  color?: string;
  fill?: boolean;
  showLast?: boolean;
  style?: React.CSSProperties;
}
export function Sparkline(props: SparklineProps): JSX.Element;
