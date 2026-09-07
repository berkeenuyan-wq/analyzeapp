import React from "react";
import { Icon } from "./Icon.jsx";

const btnBase = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-4)",
  fontFamily: "var(--font-sans)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-tight)",
  borderRadius: "var(--radius-control)", border: "1px solid transparent", cursor: "pointer",
  whiteSpace: "nowrap", transition: "var(--transition-control)", textDecoration: "none",
};
const btnSizes = {
  sm: { height: "var(--control-h-sm)", padding: "0 10px", fontSize: "var(--text-xs)" },
  md: { height: "var(--control-h)", padding: "0 14px", fontSize: "var(--text-base)" },
  lg: { height: "var(--control-h-lg)", padding: "0 18px", fontSize: "var(--text-md)" },
};
const btnVariants = {
  primary: { background: "var(--action-primary-bg)", color: "var(--text-on-accent)", boxShadow: "var(--glow-accent)" },
  secondary: { background: "var(--action-secondary-bg)", color: "var(--text-primary)", borderColor: "var(--border-strong)" },
  ghost: { background: "transparent", color: "var(--text-muted)" },
  danger: { background: "var(--signal-bad-tint)", color: "var(--signal-bad)", borderColor: "var(--signal-bad-border)" },
};
const btnHover = {
  primary: { background: "var(--action-primary-bg-hover)" },
  secondary: { background: "var(--action-secondary-bg-hover)" },
  ghost: { background: "var(--action-ghost-bg-hover)", color: "var(--text-primary)" },
  danger: { background: "rgba(240,82,91,.22)" },
};

export function Button({
  children, variant = "secondary", size = "md", icon, iconRight, block = false,
  disabled = false, loading = false, type = "button", style, onClick, ...rest
}) {
  const [hot, setHot] = React.useState(false);
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const css = {
    ...btnBase, ...btnSizes[size], ...btnVariants[variant],
    ...(hot && !disabled ? btnHover[variant] : null),
    width: block ? "100%" : undefined,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    ...style,
  };
  return (
    <button
      type={type} disabled={disabled || loading} onClick={onClick} style={css}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)} {...rest}
    >
      {loading ? <Icon name="loader-circle" size={iconSize} style={{ animation: "none", opacity: 0.7 }} />
        : icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={iconSize} /> : null}
    </button>
  );
}
