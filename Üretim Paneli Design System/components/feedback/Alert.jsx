import React from "react";
import { Icon } from "../core/Icon.jsx";

const alertTones = {
  info: { color: "var(--text-muted)", background: "var(--signal-neutral-tint)", border: "var(--signal-neutral-border)", icon: "info" },
  good: { color: "var(--signal-good)", background: "var(--signal-good-tint)", border: "var(--signal-good-border)", icon: "circle-check" },
  caution: { color: "var(--signal-caution)", background: "var(--signal-caution-tint)", border: "var(--signal-caution-border)", icon: "triangle-alert" },
  bad: { color: "var(--signal-bad)", background: "var(--signal-bad-tint)", border: "var(--signal-bad-border)", icon: "circle-alert" },
};

export function Alert({ tone = "info", title, children, icon, actions, onDismiss, style, ...rest }) {
  const t = alertTones[tone];
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      style={{
        display: "flex", alignItems: "flex-start", gap: "var(--space-5)",
        padding: "var(--space-5) var(--space-6)", background: t.background,
        border: "1px solid " + t.border, borderRadius: "var(--radius-card-inset)", ...style,
      }}
      {...rest}
    >
      <Icon name={icon || t.icon} size={16} color={t.color} style={{ marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {title && <strong style={{ font: "var(--type-caption)", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: t.color }}>{title}</strong>}
        {children && <div style={{ font: "var(--type-caption)", color: "var(--text-body)" }}>{children}</div>}
        {actions && <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Kapat" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 2, lineHeight: 0 }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
