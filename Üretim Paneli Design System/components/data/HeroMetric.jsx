import React from "react";
import { Icon } from "../core/Icon.jsx";
import { DeltaChip } from "./DeltaChip.jsx";
import { Badge } from "../core/Badge.jsx";

/* One per page. The single number the page exists to answer. */
export function HeroMetric({
  label, value, unit, delta, deltaGoodWhen = "up", deltaPeriod,
  status, statusTone = "neutral", note, icon, aside, style, ...rest
}) {
  return (
    <div
      style={{
        position: "relative", overflow: "hidden",
        background: "var(--surface-card)", border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-panel)", boxShadow: "var(--shadow-raised)",
        padding: "var(--space-8) var(--card-pad)", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "var(--space-9)", flexWrap: "wrap", ...style,
      }}
      {...rest}
    >
      <div style={{ position: "absolute", inset: "-40% 55% auto -10%", height: "180%", background: "radial-gradient(50% 50% at 50% 50%, var(--accent-tint-08), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          {icon && <Icon name={icon} size={15} color="var(--accent-base)" />}
          <span style={{ font: "var(--type-overline)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>{label}</span>
          {status && <Badge tone={statusTone} size="sm" dot>{status}</Badge>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-5)", flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-hero-metric)", color: "var(--text-primary)", letterSpacing: "var(--tracking-metric)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
          {unit && <span style={{ font: "var(--type-card-title)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>{unit}</span>}
          {delta !== undefined && delta !== null && <DeltaChip value={delta} goodWhen={deltaGoodWhen} period={deltaPeriod} />}
        </div>
        {note && <span style={{ font: "var(--type-caption)", color: "var(--text-subtle)", maxWidth: "56ch" }}>{note}</span>}
      </div>
      {aside && <div style={{ position: "relative", flex: "0 0 auto" }}>{aside}</div>}
    </div>
  );
}
