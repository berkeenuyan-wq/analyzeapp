import React from "react";
import { Icon } from "../core/Icon.jsx";

export function EmptyState({ icon = "inbox", title, description, action, compact = false, style, ...rest }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: "var(--space-5)", textAlign: "center",
      padding: compact ? "var(--space-8) var(--space-6)" : "var(--space-11) var(--space-8)", ...style,
    }} {...rest}>
      <span style={{
        width: 40, height: 40, borderRadius: "var(--radius-md)", display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--surface-inset)", border: "1px solid var(--border-subtle)",
      }}>
        <Icon name={icon} size={19} color="var(--text-subtle)" />
      </span>
      {title && <strong style={{ font: "var(--type-card-title)", color: "var(--text-primary)" }}>{title}</strong>}
      {description && <p style={{ margin: 0, font: "var(--type-caption)", color: "var(--text-subtle)", maxWidth: "44ch" }}>{description}</p>}
      {action}
    </div>
  );
}
