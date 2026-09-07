import React from "react";
import { Icon } from "../core/Icon.jsx";

export function TopBar({ search, onSearchChange, searchPlaceholder = "Ara…", left, actions, user, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <header
      style={{
        height: "var(--topbar-h)", flex: "0 0 auto", display: "flex", alignItems: "center",
        gap: "var(--space-6)", padding: "0 var(--page-pad-x)",
        borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-nav)", ...style,
      }}
      {...rest}
    >
      {left}
      {onSearchChange !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--space-4)", height: 34, maxWidth: 340, flex: "1 1 240px",
          background: "var(--surface-field)", border: "1px solid " + (focus ? "var(--border-focus)" : "var(--border-field)"),
          borderRadius: "var(--radius-pill)", padding: "0 14px", transition: "var(--transition-control)",
          boxShadow: focus ? "var(--ring-focus)" : "none",
        }}>
          <Icon name="search" size={15} color="var(--text-subtle)" />
          <input
            value={search} placeholder={searchPlaceholder}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)" }}
          />
        </div>
      )}
      <div style={{ flex: 1 }} />
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>{actions}</div>}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", paddingLeft: "var(--space-6)", marginLeft: "var(--space-2)", borderLeft: "1px solid var(--border-subtle)" }}>
          <span style={{
            width: 32, height: 32, borderRadius: "50%", flex: "0 0 auto",
            background: "var(--surface-raised)", border: "1px solid var(--border-strong)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            font: "var(--type-label)", color: "var(--text-muted)", letterSpacing: 0,
          }}>{user.initials}</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span style={{ font: "var(--type-caption)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{user.name}</span>
            {user.role && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>{user.role}</span>}
          </span>
          <Icon name="chevron-down" size={14} color="var(--text-subtle)" />
        </div>
      )}
    </header>
  );
}
