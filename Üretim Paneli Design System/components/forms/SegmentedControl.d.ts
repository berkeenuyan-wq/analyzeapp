import * as React from "react";

export interface SegmentOption { value: string; label: string; icon?: string }

/**
 * @startingPoint section="Kontroller" subtitle="Zaman aralığı / görünüm değiştirici" viewport="700x120"
 */
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "style"> {
  value: string;
  onChange?: (value: string) => void;
  options: (string | SegmentOption)[];
  size?: "sm" | "md";
  block?: boolean;
  style?: React.CSSProperties;
}
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
