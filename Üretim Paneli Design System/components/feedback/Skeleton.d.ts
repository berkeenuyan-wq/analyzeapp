import * as React from "react";

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  width?: string | number;
  height?: string | number;
  radius?: string;
  /** >1 renders a stack of bars, the last one short. */
  lines?: number;
  gap?: string;
  style?: React.CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
