import * as React from "react";

export interface StatBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  /** Override the trailing label, e.g. "412 ton" instead of "34%". */
  valueLabel?: React.ReactNode;
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}
export function StatBar(props: StatBarProps): JSX.Element;
