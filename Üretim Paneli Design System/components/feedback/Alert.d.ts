import * as React from "react";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "style"> {
  /** bad = threshold breach or write failure. caution = approaching tolerance. good = write succeeded. */
  tone?: "info" | "good" | "caution" | "bad";
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Override the tone's default Lucide glyph. */
  icon?: string;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export function Alert(props: AlertProps): JSX.Element;
