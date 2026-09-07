import * as React from "react";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  children?: React.ReactNode;
  /** Tone must reflect meaning: good = in tolerance, bad = over threshold, caution = approaching, neutral = state only. */
  tone?: "neutral" | "good" | "bad" | "caution" | "accent";
  icon?: string;
  dot?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
