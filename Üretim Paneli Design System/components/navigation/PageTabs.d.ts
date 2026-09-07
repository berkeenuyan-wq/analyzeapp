import * as React from "react";

export interface PageTab { id: string; label: string; icon?: string; count?: number }

export interface PageTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "style"> {
  value: string;
  onChange?: (id: string) => void;
  tabs: PageTab[];
  style?: React.CSSProperties;
}
export function PageTabs(props: PageTabsProps): JSX.Element;
