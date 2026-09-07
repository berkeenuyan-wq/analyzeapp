import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ value, onChange, options = [], placeholder, size = "md", invalid = false, disabled = false, icon, id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return (
    <div style={{
      position: "relative", display: "flex", alignItems: "center", gap: "var(--space-4)", height: h,
      background: "var(--surface-field)", border: "1px solid " + (invalid ? "var(--signal-bad)" : focus ? "var(--border-focus)" : "var(--border-field)"),
      borderRadius: "var(--radius-control)", padding: "0 10px 0 12px",
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-inset-field)",
      transition: "var(--transition-control)", opacity: disabled ? 0.5 : 1, ...style,
    }}>
      {icon && <Icon name={icon} size={15} color="var(--text-subtle)" />}
      <select
        id={id} value={value} disabled={disabled}
        onChange={onChange ? e => onChange(e.target.value, e) : undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, appearance: "none", background: "transparent", border: "none", outline: "none",
          color: value === "" || value == null ? "var(--text-subtle)" : "var(--text-primary)",
          fontFamily: "var(--font-sans)", fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
          cursor: disabled ? "not-allowed" : "pointer", paddingRight: 4,
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => {
          const val = typeof o === "string" ? o : o.value;
          const lbl = typeof o === "string" ? o : o.label;
          return <option key={val} value={val} style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}>{lbl}</option>;
        })}
      </select>
      <Icon name="chevron-down" size={15} color="var(--text-subtle)" />
    </div>
  );
}
