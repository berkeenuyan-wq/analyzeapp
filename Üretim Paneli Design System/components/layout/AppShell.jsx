import React from "react";

export function AppShell({ sidebar, topbar, children, style, contentStyle, ...rest }) {
  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, background: "var(--bg-app)", color: "var(--text-body)", fontFamily: "var(--font-sans)", ...style }} {...rest}>
      {sidebar}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {topbar}
        <main style={{
          flex: 1, minHeight: 0, overflowY: "auto",
          padding: "var(--page-pad-y) var(--page-pad-x) var(--space-11)",
          display: "flex", flexDirection: "column", gap: "var(--section-gap)",
          ...contentStyle,
        }}>
          <div style={{ width: "100%", maxWidth: "var(--content-max)", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--section-gap)" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function CardGrid({ columns = 4, minWidth = 220, gap = "var(--card-gap)", children, style, ...rest }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`,
      gap, ...style,
    }} data-columns={columns} {...rest}>{children}</div>
  );
}

export function SplitRow({ ratio = "2fr 1fr", gap = "var(--card-gap)", children, style, ...rest }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: ratio, gap, alignItems: "stretch", ...style }} {...rest}>{children}</div>
  );
}
