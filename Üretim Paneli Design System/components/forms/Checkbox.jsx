import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Checkbox({ checked = false, onChange, label, description, disabled = false, id, style, ...rest }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex", alignItems: description ? "flex-start" : "center", gap: "var(--space-5)",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, minHeight: 24, ...style,
      }}
    >
      <input id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={onChange ? e => onChange(e.target.checked, e) : undefined}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        width: 18, height: 18, flex: "0 0 auto", borderRadius: "var(--radius-xs)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: checked ? "var(--accent-base)" : "var(--surface-field)",
        border: "1px solid " + (checked ? "var(--accent-base)" : "var(--border-field)"),
        transition: "var(--transition-control)", marginTop: description ? 2 : 0,
      }}>
        {checked && <Icon name="check" size={12} strokeWidth={3} color="var(--text-on-accent)" />}
      </span>
      {(label || description) && (
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          {label && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-base)", color: "var(--text-body)" }}>{label}</span>}
          {description && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{description}</span>}
        </span>
      )}
    </label>
  );
}
