import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Field({ label, hint, error, required = false, htmlFor, children, span = 1, style, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0, gridColumn: span > 1 ? `span ${span}` : undefined, ...style }} {...rest}>
      {label && (
        <label htmlFor={htmlFor} style={{ font: "var(--type-label)", color: "var(--text-muted)", letterSpacing: "var(--tracking-tight)", display: "flex", alignItems: "center", gap: 4 }}>
          {label}
          {required && <span style={{ color: "var(--accent-base)" }} aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--signal-bad)" }}>
          <Icon name="circle-alert" size={12} />{error}
        </span>
      ) : hint ? (
        <span style={{ font: "var(--type-caption)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
