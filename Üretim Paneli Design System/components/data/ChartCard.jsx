import React from "react";
import { Card } from "../core/Card.jsx";

export function ChartCard({ title, subtitle, actions, legend = [], height = 260, children, footer, style, ...rest }) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions} style={style} {...rest}>
      {legend.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
          {legend.map(s => (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color || "var(--series-1)" }} />
              {s.label}
              {s.value !== undefined && <span style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums" }}>{s.value}</span>}
            </span>
          ))}
        </div>
      )}
      <div style={{ height, minWidth: 0, position: "relative" }}>{children}</div>
      {footer && <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-5)", borderTop: "1px solid var(--border-subtle)", font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{footer}</div>}
    </Card>
  );
}
