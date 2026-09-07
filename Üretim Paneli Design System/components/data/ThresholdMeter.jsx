import React from "react";

/* Horizontal track showing a value against a tolerance band.
   Used for posa % vs ±5%, and for press utilisation vs target. */
export function ThresholdMeter({
  value, min = -10, max = 10, limit = 5, unit = "%", label, showScale = true, height = 8, style, ...rest
}) {
  const clamp = v => Math.max(min, Math.min(max, v));
  const pct = v => ((clamp(v) - min) / (max - min)) * 100;
  const over = Math.abs(value) > limit;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 200, ...style }} {...rest}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>
          <span>{label}</span>
          <span style={{ color: over ? "var(--signal-bad)" : "var(--signal-good)", fontVariantNumeric: "tabular-nums", fontWeight: "var(--weight-medium)" }}>
            {value > 0 ? "+" : value < 0 ? "−" : ""}{Math.abs(value).toFixed(1)}{unit}
          </span>
        </div>
      )}
      <div style={{ position: "relative", height, borderRadius: "var(--radius-pill)", background: "var(--surface-inset)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: pct(-limit) + "%", right: 100 - pct(limit) + "%", background: "var(--signal-good-tint)", borderLeft: "1px solid var(--signal-good-border)", borderRight: "1px solid var(--signal-good-border)" }} />
        <div style={{ position: "absolute", top: -3, bottom: -3, left: pct(value) + "%", width: 3, marginLeft: -1.5, borderRadius: "var(--radius-pill)", background: over ? "var(--signal-bad)" : "var(--signal-good)", boxShadow: over ? "0 0 0 3px var(--signal-bad-tint)" : "0 0 0 3px var(--signal-good-tint)", transition: "left var(--dur-slow) var(--ease-out)" }} />
      </div>
      {showScale && (
        <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", fontSize: "var(--text-2xs)", color: "var(--text-disabled)", fontVariantNumeric: "tabular-nums" }}>
          <span>{min}{unit}</span><span>−{limit}{unit}</span><span>+{limit}{unit}</span><span>+{max}{unit}</span>
        </div>
      )}
    </div>
  );
}
