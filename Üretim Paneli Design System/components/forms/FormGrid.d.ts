import * as React from "react";

export interface FormGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** 2 on desktop, 1 on the plant tablet. Fields set `span` to widen. */
  columns?: number;
  gap?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function FormGrid(props: FormGridProps): JSX.Element;
