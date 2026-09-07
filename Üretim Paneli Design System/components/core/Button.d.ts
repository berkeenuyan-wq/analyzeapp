import * as React from "react";

/**
 * Primary action control. Exactly one `primary` button per view — the accent is
 * a scarce resource in this system.
 * @startingPoint section="Kontroller" subtitle="Buton varyantları ve boyutları" viewport="700x150"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: React.ReactNode;
  /** primary = magenta accent (one per view). secondary = default. ghost = toolbar. danger = destructive. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Lucide icon name, rendered leading. */
  icon?: string;
  /** Lucide icon name, rendered trailing (chevrons, external-link). */
  iconRight?: string;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
