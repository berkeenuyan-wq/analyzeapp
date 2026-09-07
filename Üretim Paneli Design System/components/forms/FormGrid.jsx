import React from "react";

export function FormGrid({ columns = 2, gap = "var(--space-6)", children, style, ...rest }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap, alignItems: "start", ...style,
    }} {...rest}>{children}</div>
  );
}
