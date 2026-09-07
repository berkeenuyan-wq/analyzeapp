import React from "react";
import { Icon } from "../core/Icon.jsx";

export function PageTabs({ value, onChange, tabs = [], style, ...rest }) {
  return (
    <div role="tablist" style={{ display: "flex", alignItems: "center", gap: "var(--space-7)", borderBottom: "1px solid var(--border-subtle)", ...style }} {...rest}>
      {tabs.map(t => {
        const on = t.id === value;
        return (
          <button
            key={t.id} type="button" role="tab" aria-selected={on}
            onClick={() => onChange && onChange(t.id)}
            style={{
              position: "relative", display: "inline-flex", alignItems: "center", gap: "var(--space-4)",
              padding: "0 2px 11px", background: "none", border: "none", cursor: "pointer",
              color: on ? "var(--text-primary)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
              fontWeight: on ? "var(--weight-medium)" : "var(--weight-regular)",
              letterSpacing: "var(--tracking-tight)", transition: "var(--transition-control)",
            }}
          >
            {t.icon && <Icon name={t.icon} size={15} />}
            {t.label}
            {t.count !== undefined && (
              <span style={{ font: "var(--type-label)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)", background: "var(--surface-inset)", borderRadius: "var(--radius-pill)", padding: "1px 6px" }}>{t.count}</span>
            )}
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, borderRadius: "var(--radius-pill)", background: on ? "var(--accent-base)" : "transparent" }} />
          </button>
        );
      })}
    </div>
  );
}
