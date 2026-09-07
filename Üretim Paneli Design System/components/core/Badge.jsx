import React from "react";
import { Icon } from "./Icon.jsx";

const badgeTones = {
  neutral: { color: "var(--signal-neutral)", background: "var(--signal-neutral-tint)", borderColor: "var(--signal-neutral-border)" },
  good: { color: "var(--signal-good)", background: "var(--signal-good-tint)", borderColor: "var(--signal-good-border)" },
  bad: { color: "var(--signal-bad)", background: "var(--signal-bad-tint)", borderColor: "var(--signal-bad-border)" },
  caution: { color: "var(--signal-caution)", background: "var(--signal-caution-tint)", borderColor: "var(--signal-caution-border)" },
  accent: { color: "var(--accent-bright)", background: "var(--accent-tint-14)", borderColor: "var(--accent-tint-24)" },
};

export function Badge({ children, tone = "neutral", icon, dot = false, size = "md", style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: size === "sm" ? 4 : 5,
        height: size === "sm" ? 18 : 22, padding: size === "sm" ? "0 7px" : "0 9px",
        borderRadius: "var(--radius-chip)", border: "1px solid",
        font: "var(--type-label)", fontSize: size === "sm" ? "var(--text-2xs)" : "var(--text-xs)",
        letterSpacing: "var(--tracking-tight)", whiteSpace: "nowrap",
        ...badgeTones[tone], ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
      {icon && <Icon name={icon} size={size === "sm" ? 11 : 12} />}
      {children}
    </span>
  );
}
