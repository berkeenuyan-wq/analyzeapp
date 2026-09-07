import React from "react";
import { Icon } from "../core/Icon.jsx";

const fieldShell = {
  display: "flex", alignItems: "center", gap: "var(--space-4)",
  background: "var(--surface-field)", border: "1px solid var(--border-field)",
  borderRadius: "var(--radius-control)", padding: "0 12px",
  boxShadow: "var(--shadow-inset-field)", transition: "var(--transition-control)",
};

export function TextInput({
  value, onChange, placeholder, icon, suffix, type = "text", size = "md",
  invalid = false, disabled = false, readOnly = false, align, id, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return (
    <div style={{
      ...fieldShell, height: h,
      borderColor: invalid ? "var(--signal-bad)" : focus ? "var(--border-focus)" : "var(--border-field)",
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-inset-field)",
      opacity: disabled ? 0.5 : 1, ...style,
    }}>
      {icon && <Icon name={icon} size={15} color="var(--text-subtle)" />}
      <input
        id={id} type={type} value={value} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
        onChange={onChange ? e => onChange(e.target.value, e) : undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
          color: "var(--text-primary)", fontFamily: type === "number" ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
          textAlign: align || (type === "number" ? "right" : "left"),
          fontVariantNumeric: "tabular-nums",
        }}
        {...rest}
      />
      {suffix && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)", flex: "0 0 auto" }}>{suffix}</span>}
    </div>
  );
}
