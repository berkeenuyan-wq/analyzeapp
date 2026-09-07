import React from "react";
import { Icon } from "./Icon.jsx";

export function Card({
  title, subtitle, icon, actions, children, tone = "default",
  padding = "var(--card-pad)", inset = false, style, bodyStyle, ...rest
}) {
  const toneBorder = {
    default: "var(--border-card)",
    good: "var(--signal-good-border)",
    bad: "var(--signal-bad-border)",
    accent: "var(--accent-tint-24)",
  }[tone];
  const hasHeader = title || subtitle || actions || icon;
  return (
    <section
      style={{
        background: inset ? "var(--surface-inset)" : "var(--surface-card)",
        border: `1px solid ${toneBorder}`,
        borderRadius: inset ? "var(--radius-card-inset)" : "var(--radius-card)",
        boxShadow: inset ? "none" : "var(--shadow-card)",
        padding, display: "flex", flexDirection: "column", minWidth: 0, ...style,
      }}
      {...rest}
    >
      {hasHeader && (
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-5)", marginBottom: children ? "var(--space-6)" : 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              {icon && <Icon name={icon} size={16} color="var(--text-subtle)" />}
              {title && <h3 style={{ margin: 0, font: "var(--type-card-title)", color: "var(--text-primary)", letterSpacing: "var(--tracking-tight)" }}>{title}</h3>}
            </div>
            {subtitle && <p style={{ margin: "4px 0 0", font: "var(--type-caption)", color: "var(--text-subtle)" }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "0 0 auto" }}>{actions}</div>}
        </header>
      )}
      {children && <div style={{ flex: 1, minWidth: 0, ...bodyStyle }}>{children}</div>}
    </section>
  );
}
