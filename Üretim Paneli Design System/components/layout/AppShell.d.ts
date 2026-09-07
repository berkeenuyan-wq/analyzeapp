import * as React from "react";

/**
 * Sidebar + top bar + scrolling content column. Every screen in the panel uses it.
 * @startingPoint section="Yerleşim" subtitle="Tam uygulama kabuğu" viewport="1440x900"
 */
export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** A `<Sidebar>`. */
  sidebar?: React.ReactNode;
  /** A `<TopBar>`. */
  topbar?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}
export function AppShell(props: AppShellProps): JSX.Element;

export interface CardGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Intended column count on desktop; the grid auto-fits below that. */
  columns?: number;
  /** Minimum tile width before wrapping — 220 for KPI rows. */
  minWidth?: number;
  gap?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function CardGrid(props: CardGridProps): JSX.Element;

export interface SplitRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** CSS grid-template-columns, e.g. "2fr 1fr" or "1fr 1fr". */
  ratio?: string;
  gap?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function SplitRow(props: SplitRowProps): JSX.Element;
