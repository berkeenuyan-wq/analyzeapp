import * as React from "react";

export interface ThresholdMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Signed measured value. */
  value: number;
  min?: number;
  max?: number;
  /** Symmetric tolerance limit. The band between −limit and +limit renders green. */
  limit?: number;
  unit?: string;
  label?: string;
  showScale?: boolean;
  height?: number;
  style?: React.CSSProperties;
}
export function ThresholdMeter(props: ThresholdMeterProps): JSX.Element;
