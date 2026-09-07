import * as React from "react";

export interface SidebarNavItem {
  id: string;
  /** Lucide glyph name. */
  icon: string;
  /** Turkish section name, exactly as in the app: "Genel Bakış". */
  label: string;
  badge?: React.ReactNode;
}

export interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  collapsed?: boolean;
}
export function SidebarItem(props: SidebarItemProps): JSX.Element;

/**
 * The persistent left rail. 232px expanded, 64px collapsed on the tablet.
 * @startingPoint section="Yerleşim" subtitle="Sol gezinme rayı" viewport="260x560"
 */
export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  brand?: string;
  /** Small line under the brand — plant or line name. */
  brandSub?: string;
  items: SidebarNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
  /** Bottom slot — data-freshness card, user, logout. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Sidebar(props: SidebarProps): JSX.Element;
