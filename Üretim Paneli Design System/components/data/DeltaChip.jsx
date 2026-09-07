import React from "react";
import { Icon } from "../core/Icon.jsx";

/* A period-over-period delta. Direction decides the arrow; `goodWhen`
   decides the colour, because "down" is good for posa % and bad for verim. */
export function DeltaChip({ value, unit = "%", goodWhen = "up", period, precision = 1, size = "md", style, ...rest }) {
  const num = typeof value === "number" ? value : parseFloat(value);
  const flat = !isFinite(num) || Math.abs(num) < 0.05;
  const up = num > 0;
  const isGood = goodWhen === "none" ? null : (up === (goodWhen === "up"));
  const tone = flat || isGood === null
    ? { color: "var(--signal-neutral)", background: "var(--signal-neutral-tint)" }
    : isGood
      ? { color: "var(--signal-good)", background: "var(--signal-good-tint)" }
      : { color: "var(--signal-bad)", background: "var(--signal-bad-tint)" };
  const label = flat ? "0" + unit : (up ? "+" : "−") + Math.abs(num).toFixed(precision) + unit;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", ...style }} {...rest}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        height: size === "sm" ? 18 : 21, padding: "0 7px", borderRadius: "var(--radius-chip)",
        fontFamily: "var(--font-sans)", fontWeight: "var(--weight-medium)",
        fontSize: size === "sm" ? "var(--text-2xs)" : "var(--text-xs)",
        fontVariantNumeric: "tabular-nums", ...tone,
      }}>
        {!flat && <Icon name={up ? "arrow-up" : "arrow-down"} size={size === "sm" ? 10 : 11} strokeWidth={2.25} />}
        {label}
      </span>
      {period && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{period}</span>}
    </span>
  );
}
