import * as React from "react";

export interface TopBarUser {
  /** 2 letters, uppercase. No photo avatars — the plant has no user images. */
  initials: string;
  name: string;
  role?: string;
}

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  search?: string;
  /** Providing this (even a no-op) renders the pill search field. */
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Slot before the search — a collapse toggle, breadcrumb. */
  left?: React.ReactNode;
  /** Right cluster: IconButtons for theme, refresh, export. */
  actions?: React.ReactNode;
  user?: TopBarUser;
  style?: React.CSSProperties;
}
export function TopBar(props: TopBarProps): JSX.Element;
