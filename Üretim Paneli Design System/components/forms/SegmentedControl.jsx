import React from "react";
import { Icon } from "../core/Icon.jsx";

export function SegmentedControl({ value, onChange, options = [], size = "md", block = false, style, ...rest }) {
  const h = size === "sm" ? "var(--control-h-sm)" : "var(--control-h)";
  return (
    <div role="tablist" style={{
      display: "inline-flex", alignItems: "center", gap: 2, height: h, padding: 3,
      background: "var(--surface-inset)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-control)", width: block ? "100%" : undefined, ...style,
    }} {...rest}>
      {options.map(o => {
        const val = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const on = val === value;
        return (
          <button
            key={val} type="button" role="tab" aria-selected={on}
            onClick={() => onChange && onChange(val)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              flex: block ? 1 : "0 0 auto", height: "100%", padding: "0 12px",
              borderRadius: "var(--radius-xs)", border: "none", cursor: "pointer",
              background: on ? "var(--surface-raised)" : "transparent",
              boxShadow: on ? "var(--shadow-card)" : "none",
              color: on ? "var(--text-primary)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)", fontWeight: "var(--weight-medium)",
              fontSize: size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
              letterSpacing: "var(--tracking-tight)", whiteSpace: "nowrap",
              transition: "var(--transition-control)",
            }}
          >
            {typeof o !== "string" && o.icon && <Icon name={o.icon} size={13} />}
            {lbl}
          </button>
        );
      })}
    </div>
  );
}
