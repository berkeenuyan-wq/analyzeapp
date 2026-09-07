import * as React from "react";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name" | "color"> {
  /** Lucide icon name, kebab-case or PascalCase: "gauge", "truck", "chart-line". */
  name: string;
  /** Pixel box. 14 inline with text, 16 default, 18 in nav, 20 in card headers. */
  size?: number;
  /** Lucide default is 2; this system runs slightly lighter at 1.75. */
  strokeWidth?: number;
  color?: string;
}
export function Icon(props: IconProps): JSX.Element;
