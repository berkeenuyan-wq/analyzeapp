import React from "react";
import { Icon } from "../core/Icon.jsx";

export function DataTable({
  columns = [], rows = [], keyField, dense = false, zebra = false,
  sortKey, sortDir = "asc", onSort, emptyLabel = "Kayıt bulunamadı", footRow, style, ...rest
}) {
  const cellPad = dense ? "8px 12px" : "12px 14px";
  return (
    <div style={{ width: "100%", overflowX: "auto", ...style }} {...rest}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr>
            {columns.map(c => {
              const sorted = sortKey === c.key;
              return (
                <th
                  key={c.key}
                  onClick={c.sortable && onSort ? () => onSort(c.key) : undefined}
                  style={{
                    textAlign: c.align || "left", padding: cellPad,
                    font: "var(--type-label)", color: sorted ? "var(--text-primary)" : "var(--text-subtle)",
                    textTransform: "uppercase", letterSpacing: "var(--tracking-label)",
                    borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap",
                    cursor: c.sortable && onSort ? "pointer" : "default", userSelect: "none",
                    width: c.width,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}>
                    {c.header}
                    {c.sortable && onSort && <Icon name={sorted ? (sortDir === "asc" ? "chevron-up" : "chevron-down") : "chevrons-up-down"} size={12} color={sorted ? "var(--accent-base)" : "var(--text-disabled)"} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: "var(--space-9)", textAlign: "center", font: "var(--type-caption)", color: "var(--text-subtle)" }}>{emptyLabel}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={keyField ? row[keyField] : i} style={{ background: zebra && i % 2 ? "var(--surface-hover)" : "transparent" }}>
              {columns.map(c => (
                <td key={c.key} style={{
                  padding: cellPad, textAlign: c.align || "left",
                  borderBottom: "1px solid var(--border-subtle)",
                  font: c.numeric ? "var(--type-table-num)" : "var(--type-caption)",
                  fontSize: "var(--text-sm)",
                  color: c.emphasis ? "var(--text-primary)" : "var(--text-body)",
                  fontVariantNumeric: c.numeric ? "tabular-nums" : undefined,
                  whiteSpace: c.wrap ? "normal" : "nowrap",
                }}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footRow && (
          <tfoot>
            <tr>
              {columns.map(c => (
                <td key={c.key} style={{
                  padding: cellPad, textAlign: c.align || "left",
                  font: c.numeric ? "var(--type-table-num)" : "var(--type-label)",
                  fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)",
                  color: "var(--text-primary)", background: "var(--surface-inset)",
                  borderTop: "1px solid var(--border-strong)",
                  fontVariantNumeric: c.numeric ? "tabular-nums" : undefined, whiteSpace: "nowrap",
                }}>
                  {footRow[c.key]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
