import * as React from "react";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style" | "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** 1 = page title (24px), 2 = in-page group heading (15px). */
  level?: 1 | 2;
  style?: React.CSSProperties;
}
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
