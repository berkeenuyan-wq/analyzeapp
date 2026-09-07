import React from "react";

export function Sparkline({ points = [], width = 180, height = 48, color = "var(--series-1)", fill = true, showLast = true, style, ...rest }) {
  const vals = points.map(Number).filter(n => isFinite(n));
  if (vals.length < 2) return <div style={{ width, height, ...style }} />;
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const pad = 3;
  const xy = vals.map((v, i) => [pad + (i / (vals.length - 1)) * (width - pad * 2), height - pad - ((v - lo) / span) * (height - pad * 2)]);
  const line = xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const area = line + ` L${xy[xy.length - 1][0].toFixed(1)} ${height} L${xy[0][0].toFixed(1)} ${height} Z`;
  const gid = "spark" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const last = xy[xy.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible", ...style }} {...rest}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      {showLast && <circle cx={last[0]} cy={last[1]} r="2.75" fill={color} stroke="var(--surface-card)" strokeWidth="1.5" />}
    </svg>
  );
}
