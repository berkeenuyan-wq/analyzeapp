import React from "react";

/* Inline proportion bar for table cells and compact breakdowns. */
export function StatBar({ value, max = 100, color = "var(--series-1)", showValue = true, valueLabel, width = "100%", height = 6, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", width, ...style }} {...rest}>
      <div style={{ flex: 1, minWidth: 40, height, borderRadius: "var(--radius-pill)", background: "var(--surface-raised)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: "var(--radius-pill)", background: color, transition: "width var(--dur-slow) var(--ease-out)" }} />
      </div>
      {showValue && (
        <span style={{ font: "var(--type-table-num)", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", minWidth: 38, textAlign: "right" }}>
          {valueLabel ?? Math.round(pct) + "%"}
        </span>
      )}
    </div>
  );
}
