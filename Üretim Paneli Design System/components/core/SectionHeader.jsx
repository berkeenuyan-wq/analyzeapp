import React from "react";

export function SectionHeader({ title, subtitle, actions, level = 1, style, ...rest }) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-6)", flexWrap: "wrap", ...style }} {...rest}>
      <div style={{ minWidth: 0 }}>
        <Tag style={{
          margin: 0,
          font: level === 1 ? "var(--type-page-title)" : "var(--type-card-title)",
          color: "var(--text-primary)", letterSpacing: "var(--tracking-tight)",
        }}>{title}</Tag>
        {subtitle && <p style={{ margin: "5px 0 0", font: "var(--type-caption)", color: "var(--text-subtle)" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>{actions}</div>}
    </div>
  );
}
