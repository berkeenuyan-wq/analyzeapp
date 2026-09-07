import React from "react";
import { Icon } from "./Icon.jsx";

const ibSizes = { sm: 28, md: 34, lg: 40 };

export function IconButton({ icon, label, size = "md", variant = "soft", active = false, disabled = false, onClick, style, ...rest }) {
  const [hot, setHot] = React.useState(false);
  const px = ibSizes[size];
  const tone = {
    soft: { background: "var(--surface-inset)", border: "1px solid var(--border-subtle)" },
    ghost: { background: "transparent", border: "1px solid transparent" },
    accent: { background: "var(--accent-tint-14)", border: "1px solid var(--accent-tint-24)" },
  }[variant];
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      style={{
        width: px, height: px, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--radius-pill)", cursor: disabled ? "not-allowed" : "pointer",
        color: active || variant === "accent" ? "var(--accent-base)" : hot ? "var(--text-primary)" : "var(--text-muted)",
        transition: "var(--transition-control)", opacity: disabled ? 0.45 : 1,
        ...tone,
        ...(hot && !disabled ? { background: variant === "accent" ? "var(--accent-tint-24)" : "var(--surface-raised)" } : null),
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
    </button>
  );
}
