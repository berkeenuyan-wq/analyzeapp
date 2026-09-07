import React from "react";

export function Switch({ checked = false, onChange, label, disabled = false, size = "md", id, style, ...rest }) {
  const w = size === "sm" ? 32 : 40, h = size === "sm" ? 18 : 22, knob = h - 6;
  return (
    <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-5)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled}
        onChange={onChange ? e => onChange(e.target.checked, e) : undefined}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        width: w, height: h, borderRadius: "var(--radius-pill)", flex: "0 0 auto", position: "relative",
        background: checked ? "var(--accent-base)" : "var(--surface-raised)",
        border: "1px solid " + (checked ? "var(--accent-base)" : "var(--border-field)"),
        transition: "var(--transition-control)",
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? w - knob - 4 : 2, width: knob, height: knob,
          borderRadius: "50%", background: checked ? "var(--text-on-accent)" : "var(--text-muted)",
          transition: "left var(--dur-fast) var(--ease-standard)",
        }} />
      </span>
      {label && <span style={{ font: "var(--type-caption)", fontSize: "var(--text-base)", color: "var(--text-body)" }}>{label}</span>}
    </label>
  );
}
