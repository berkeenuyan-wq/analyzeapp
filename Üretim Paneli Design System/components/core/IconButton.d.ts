import * as React from "react";

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  icon: string;
  /** Required — becomes aria-label and the tooltip. Turkish. */
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "soft" | "ghost" | "accent";
  active?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function IconButton(props: IconButtonProps): JSX.Element;
