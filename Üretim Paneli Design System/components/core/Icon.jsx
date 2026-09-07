import React from "react";

/* Renders a real Lucide glyph from the Lucide UMD payload on window.
   No hand-drawn paths: if the library is not loaded yet the component
   reserves the box and re-renders once it arrives. */
function toPascal(name) {
  return String(name).split(/[-_\s]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

export function Icon({ name, size = 16, strokeWidth = 1.75, color = "currentColor", style, ...rest }) {
  const [, tick] = React.useReducer(c => c + 1, 0);
  React.useEffect(() => {
    if (typeof window === "undefined" || window.lucide) return;
    const id = setInterval(() => { if (window.lucide) { clearInterval(id); tick(); } }, 120);
    return () => clearInterval(id);
  }, []);

  const lib = (typeof window !== "undefined" && window.lucide && (window.lucide.icons || window.lucide)) || null;
  const raw = lib ? lib[toPascal(name)] : null;
  const children = !raw ? [] : (typeof raw[0] === "string" ? raw[2] : raw) || [];

  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: "block", flex: "0 0 auto", ...style }} {...rest}
    >
      {children.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
