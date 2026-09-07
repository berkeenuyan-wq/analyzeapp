import React from "react";
import { Icon } from "../core/Icon.jsx";
import { DeltaChip } from "./DeltaChip.jsx";

export function KpiCard({
  label, value, unit, icon, delta, deltaGoodWhen = "up", deltaPeriod,
  footnote, tone = "default", active = false, onClick, style, ...rest
}) {
  const [hot, setHot] = React.useState(false);
  const valueColor = tone === "good" ? "var(--signal-good)" : tone === "bad" ? "var(--signal-bad)" : "var(--text-primary)";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid " + (active ? "var(--accent-tint-24)" : tone === "bad" ? "var(--signal-bad-border)" : "var(--border-card)"),
        borderRadius: "var(--radius-card)", boxShadow: active ? "var(--glow-accent)" : "var(--shadow-card)",
        padding: "var(--card-pad)", display: "flex", flexDirection: "column", gap: "var(--space-5)",
        minWidth: 0, cursor: onClick ? "pointer" : "default",
        transition: "border-color var(--dur-fast) var(--ease-standard),background-color var(--dur-fast) var(--ease-standard)",
        ...(hot && onClick ? { background: "var(--surface-inset)" } : null),
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", letterSpacing: "var(--tracking-tight)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        {icon && <Icon name={icon} size={16} color="var(--text-subtle)" />}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <span style={{ font: "var(--type-metric)", color: valueColor, letterSpacing: "var(--tracking-metric)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {unit && <span style={{ font: "var(--type-caption)", color: "var(--text-subtle)" }}>{unit}</span>}
        {delta !== undefined && delta !== null && <DeltaChip value={delta} goodWhen={deltaGoodWhen} size="sm" />}
      </div>
      {(footnote || deltaPeriod) && (
        <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)", marginTop: "auto" }}>
          {footnote || deltaPeriod}
        </span>
      )}
    </div>
  );
}
