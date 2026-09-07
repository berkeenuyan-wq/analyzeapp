import React from "react";
import { Icon } from "../core/Icon.jsx";

export function SidebarItem({ icon, label, active = false, onClick, badge, collapsed = false }) {
  const [hot, setHot] = React.useState(false);
  return (
    <button
      type="button" onClick={onClick} title={collapsed ? label : undefined}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: "var(--space-5)",
        width: "100%", height: 38, padding: collapsed ? 0 : "0 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "var(--radius-control)", border: "1px solid transparent", cursor: "pointer",
        background: active ? "var(--nav-item-active-bg)" : hot ? "var(--surface-hover)" : "transparent",
        borderColor: active ? "var(--border-subtle)" : "transparent",
        color: active ? "var(--nav-item-active-fg)" : hot ? "var(--text-body)" : "var(--nav-item-fg)",
        fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
        fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
        letterSpacing: "var(--tracking-tight)", textAlign: "left",
        transition: "var(--transition-control)",
      }}
    >
      {active && <span style={{ position: "absolute", left: -9, top: 9, bottom: 9, width: 2.5, borderRadius: "var(--radius-pill)", background: "var(--nav-indicator)" }} />}
      <Icon name={icon} size={17} color={active ? "var(--accent-base)" : "currentColor"} />
      {!collapsed && <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>}
      {!collapsed && badge}
    </button>
  );
}

export function Sidebar({
  brand = "Üretim Paneli", brandSub, items = [], activeId, onSelect,
  collapsed = false, footer, style, ...rest
}) {
  return (
    <nav
      style={{
        width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
        flex: "0 0 auto", display: "flex", flexDirection: "column", gap: "var(--space-8)",
        padding: collapsed ? "var(--space-7) var(--space-5)" : "var(--space-7) var(--space-6)",
        background: "var(--bg-nav)", borderRight: "1px solid var(--border-subtle)",
        height: "100%", overflow: "hidden", transition: "width var(--dur-base) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", padding: collapsed ? 0 : "0 4px", justifyContent: collapsed ? "center" : "flex-start", minHeight: 32 }}>
        <span style={{
          width: 28, height: 28, flex: "0 0 auto", borderRadius: "var(--radius-sm)",
          background: "var(--accent-tint-14)", border: "1px solid var(--accent-tint-24)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="factory" size={16} color="var(--accent-base)" />
        </span>
        {!collapsed && (
          <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ font: "var(--type-card-title)", color: "var(--text-primary)", letterSpacing: "var(--tracking-tight)", whiteSpace: "nowrap" }}>{brand}</span>
            {brandSub && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>{brandSub}</span>}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minHeight: 0, overflowY: "auto" }}>
        {items.map(it => (
          <SidebarItem key={it.id} {...it} collapsed={collapsed} active={it.id === activeId} onClick={() => onSelect && onSelect(it.id)} />
        ))}
      </div>

      {footer && <div style={{ flex: "0 0 auto" }}>{footer}</div>}
    </nav>
  );
}
