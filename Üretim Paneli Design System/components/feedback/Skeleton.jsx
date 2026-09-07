import React from "react";

export function Skeleton({ width = "100%", height = 14, radius = "var(--radius-xs)", lines = 1, gap = "var(--space-4)", style, ...rest }) {
  const bar = i => (
    <span key={i} style={{
      display: "block",
      width: lines > 1 && i === lines - 1 ? "62%" : width,
      height, borderRadius: radius,
      background: "linear-gradient(90deg,var(--surface-inset) 0%,var(--surface-raised) 50%,var(--surface-inset) 100%)",
      backgroundSize: "200% 100%", animation: "dsShimmer 1.4s linear infinite",
    }} />
  );
  return (
    <span style={{ display: "flex", flexDirection: "column", gap, ...style }} {...rest}>
      <style>{"@keyframes dsShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      {Array.from({ length: lines }, (_, i) => bar(i))}
    </span>
  );
}
