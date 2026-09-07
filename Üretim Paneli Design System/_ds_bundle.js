/* @ds-bundle: {"format":4,"namespace":"RetimPaneliDesignSystem_b437a5","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"ChartCard","sourcePath":"components/data/ChartCard.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"DeltaChip","sourcePath":"components/data/DeltaChip.jsx"},{"name":"HeroMetric","sourcePath":"components/data/HeroMetric.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"StatBar","sourcePath":"components/data/StatBar.jsx"},{"name":"ThresholdMeter","sourcePath":"components/data/ThresholdMeter.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"FormGrid","sourcePath":"components/forms/FormGrid.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"AppShell","sourcePath":"components/layout/AppShell.jsx"},{"name":"CardGrid","sourcePath":"components/layout/AppShell.jsx"},{"name":"SplitRow","sourcePath":"components/layout/AppShell.jsx"},{"name":"PageTabs","sourcePath":"components/navigation/PageTabs.jsx"},{"name":"SidebarItem","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"16811995cdcf","components/core/Button.jsx":"16eae06e9976","components/core/Card.jsx":"048e1b5e8d3b","components/core/Icon.jsx":"9c5adfd94430","components/core/IconButton.jsx":"c5ed3dbb1373","components/core/SectionHeader.jsx":"a69561b261dd","components/data/ChartCard.jsx":"873c7d60a05b","components/data/DataTable.jsx":"4f9e8d5bca8a","components/data/DeltaChip.jsx":"99351e47b289","components/data/HeroMetric.jsx":"845047d6f536","components/data/KpiCard.jsx":"506e9621af57","components/data/Sparkline.jsx":"a1c70dbc46a1","components/data/StatBar.jsx":"e3777f43500b","components/data/ThresholdMeter.jsx":"fb2dad5f54db","components/feedback/Alert.jsx":"68a6e1990b6a","components/feedback/EmptyState.jsx":"f8d80de40591","components/feedback/Skeleton.jsx":"f0924488c8c2","components/forms/Checkbox.jsx":"2787abe2a96d","components/forms/Field.jsx":"c1c488c7a5ea","components/forms/FormGrid.jsx":"b68d00a4d167","components/forms/SegmentedControl.jsx":"ecd092696fa8","components/forms/Select.jsx":"ad8a8a1948ab","components/forms/Switch.jsx":"74ef3fa9d3f1","components/forms/TextInput.jsx":"dd97794475eb","components/layout/AppShell.jsx":"af8170c3bae0","components/navigation/PageTabs.jsx":"9d13b956bcaa","components/navigation/Sidebar.jsx":"bf7d4584bdbe","components/navigation/TopBar.jsx":"89843025efc9","ui_kits/uretim-paneli/AracLojistigi.jsx":"fad44f3369bf","ui_kits/uretim-paneli/Charts.jsx":"db856a6406b8","ui_kits/uretim-paneli/GenelBakis.jsx":"716f827b79b4","ui_kits/uretim-paneli/PosaAnalizi.jsx":"95136b5ec9d2","ui_kits/uretim-paneli/PresPerformansi.jsx":"8e5442087037","ui_kits/uretim-paneli/VeriGirisi.jsx":"8dc8605224cd","ui_kits/uretim-paneli/data.js":"59825e4014e4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RetimPaneliDesignSystem_b437a5 = window.RetimPaneliDesignSystem_b437a5 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Renders a real Lucide glyph from the Lucide UMD payload on window.
   No hand-drawn paths: if the library is not loaded yet the component
   reserves the box and re-renders once it arrives. */
function toPascal(name) {
  return String(name).split(/[-_\s]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}
function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
  ...rest
}) {
  const [, tick] = React.useReducer(c => c + 1, 0);
  React.useEffect(() => {
    if (typeof window === "undefined" || window.lucide) return;
    const id = setInterval(() => {
      if (window.lucide) {
        clearInterval(id);
        tick();
      }
    }, 120);
    return () => clearInterval(id);
  }, []);
  const lib = typeof window !== "undefined" && window.lucide && (window.lucide.icons || window.lucide) || null;
  const raw = lib ? lib[toPascal(name)] : null;
  const children = !raw ? [] : (typeof raw[0] === "string" ? raw[2] : raw) || [];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: "block",
      flex: "0 0 auto",
      ...style
    }
  }, rest), children.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const badgeTones = {
  neutral: {
    color: "var(--signal-neutral)",
    background: "var(--signal-neutral-tint)",
    borderColor: "var(--signal-neutral-border)"
  },
  good: {
    color: "var(--signal-good)",
    background: "var(--signal-good-tint)",
    borderColor: "var(--signal-good-border)"
  },
  bad: {
    color: "var(--signal-bad)",
    background: "var(--signal-bad-tint)",
    borderColor: "var(--signal-bad-border)"
  },
  caution: {
    color: "var(--signal-caution)",
    background: "var(--signal-caution-tint)",
    borderColor: "var(--signal-caution-border)"
  },
  accent: {
    color: "var(--accent-bright)",
    background: "var(--accent-tint-14)",
    borderColor: "var(--accent-tint-24)"
  }
};
function Badge({
  children,
  tone = "neutral",
  icon,
  dot = false,
  size = "md",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: size === "sm" ? 4 : 5,
      height: size === "sm" ? 18 : 22,
      padding: size === "sm" ? "0 7px" : "0 9px",
      borderRadius: "var(--radius-chip)",
      border: "1px solid",
      font: "var(--type-label)",
      fontSize: size === "sm" ? "var(--text-2xs)" : "var(--text-xs)",
      letterSpacing: "var(--tracking-tight)",
      whiteSpace: "nowrap",
      ...badgeTones[tone],
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor"
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 11 : 12
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-4)",
  fontFamily: "var(--font-sans)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-tight)",
  borderRadius: "var(--radius-control)",
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "var(--transition-control)",
  textDecoration: "none"
};
const btnSizes = {
  sm: {
    height: "var(--control-h-sm)",
    padding: "0 10px",
    fontSize: "var(--text-xs)"
  },
  md: {
    height: "var(--control-h)",
    padding: "0 14px",
    fontSize: "var(--text-base)"
  },
  lg: {
    height: "var(--control-h-lg)",
    padding: "0 18px",
    fontSize: "var(--text-md)"
  }
};
const btnVariants = {
  primary: {
    background: "var(--action-primary-bg)",
    color: "var(--text-on-accent)",
    boxShadow: "var(--glow-accent)"
  },
  secondary: {
    background: "var(--action-secondary-bg)",
    color: "var(--text-primary)",
    borderColor: "var(--border-strong)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)"
  },
  danger: {
    background: "var(--signal-bad-tint)",
    color: "var(--signal-bad)",
    borderColor: "var(--signal-bad-border)"
  }
};
const btnHover = {
  primary: {
    background: "var(--action-primary-bg-hover)"
  },
  secondary: {
    background: "var(--action-secondary-bg-hover)"
  },
  ghost: {
    background: "var(--action-ghost-bg-hover)",
    color: "var(--text-primary)"
  },
  danger: {
    background: "rgba(240,82,91,.22)"
  }
};
function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  block = false,
  disabled = false,
  loading = false,
  type = "button",
  style,
  onClick,
  ...rest
}) {
  const [hot, setHot] = React.useState(false);
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const css = {
    ...btnBase,
    ...btnSizes[size],
    ...btnVariants[variant],
    ...(hot && !disabled ? btnHover[variant] : null),
    width: block ? "100%" : undefined,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    onClick: onClick,
    style: css,
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false)
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: iconSize,
    style: {
      animation: "none",
      opacity: 0.7
    }
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iconSize
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  title,
  subtitle,
  icon,
  actions,
  children,
  tone = "default",
  padding = "var(--card-pad)",
  inset = false,
  style,
  bodyStyle,
  ...rest
}) {
  const toneBorder = {
    default: "var(--border-card)",
    good: "var(--signal-good-border)",
    bad: "var(--signal-bad-border)",
    accent: "var(--accent-tint-24)"
  }[tone];
  const hasHeader = title || subtitle || actions || icon;
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: inset ? "var(--surface-inset)" : "var(--surface-card)",
      border: `1px solid ${toneBorder}`,
      borderRadius: inset ? "var(--radius-card-inset)" : "var(--radius-card)",
      boxShadow: inset ? "none" : "var(--shadow-card)",
      padding,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      ...style
    }
  }, rest), hasHeader && /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-5)",
      marginBottom: children ? "var(--space-6)" : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    color: "var(--text-subtle)"
  }), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "var(--type-card-title)",
      color: "var(--text-primary)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, title)), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      font: "var(--type-caption)",
      color: "var(--text-subtle)"
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flex: "0 0 auto"
    }
  }, actions)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ibSizes = {
  sm: 28,
  md: 34,
  lg: 40
};
function IconButton({
  icon,
  label,
  size = "md",
  variant = "soft",
  active = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hot, setHot] = React.useState(false);
  const px = ibSizes[size];
  const tone = {
    soft: {
      background: "var(--surface-inset)",
      border: "1px solid var(--border-subtle)"
    },
    ghost: {
      background: "transparent",
      border: "1px solid transparent"
    },
    accent: {
      background: "var(--accent-tint-14)",
      border: "1px solid var(--accent-tint-24)"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    style: {
      width: px,
      height: px,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      color: active || variant === "accent" ? "var(--accent-base)" : hot ? "var(--text-primary)" : "var(--text-muted)",
      transition: "var(--transition-control)",
      opacity: disabled ? 0.45 : 1,
      ...tone,
      ...(hot && !disabled ? {
        background: variant === "accent" ? "var(--accent-tint-24)" : "var(--surface-raised)"
      } : null),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 14 : size === "lg" ? 18 : 16
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHeader({
  title,
  subtitle,
  actions,
  level = 1,
  style,
  ...rest
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      flexWrap: "wrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    style: {
      margin: 0,
      font: level === 1 ? "var(--type-page-title)" : "var(--type-card-title)",
      color: "var(--text-primary)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "5px 0 0",
      font: "var(--type-caption)",
      color: "var(--text-subtle)"
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, actions));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/data/ChartCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ChartCard({
  title,
  subtitle,
  actions,
  legend = [],
  height = 260,
  children,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    title: title,
    subtitle: subtitle,
    actions: actions,
    style: style
  }, rest), legend.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-6)",
      marginBottom: "var(--space-6)"
    }
  }, legend.map(s => /*#__PURE__*/React.createElement("span", {
    key: s.label,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: s.color || "var(--series-1)"
    }
  }), s.label, s.value !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      fontWeight: "var(--weight-medium)",
      fontVariantNumeric: "tabular-nums"
    }
  }, s.value)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      minWidth: 0,
      position: "relative"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)",
      paddingTop: "var(--space-5)",
      borderTop: "1px solid var(--border-subtle)",
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, footer));
}
Object.assign(__ds_scope, { ChartCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ChartCard.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  keyField,
  dense = false,
  zebra = false,
  sortKey,
  sortDir = "asc",
  onSort,
  emptyLabel = "Kayıt bulunamadı",
  footRow,
  style,
  ...rest
}) {
  const cellPad = dense ? "8px 12px" : "12px 14px";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: "100%",
      overflowX: "auto",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => {
    const sorted = sortKey === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      onClick: c.sortable && onSort ? () => onSort(c.key) : undefined,
      style: {
        textAlign: c.align || "left",
        padding: cellPad,
        font: "var(--type-label)",
        color: sorted ? "var(--text-primary)" : "var(--text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-label)",
        borderBottom: "1px solid var(--border-subtle)",
        whiteSpace: "nowrap",
        cursor: c.sortable && onSort ? "pointer" : "default",
        userSelect: "none",
        width: c.width
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        verticalAlign: "middle"
      }
    }, c.header, c.sortable && onSort && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: sorted ? sortDir === "asc" ? "chevron-up" : "chevron-down" : "chevrons-up-down",
      size: 12,
      color: sorted ? "var(--accent-base)" : "var(--text-disabled)"
    })));
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: "var(--space-9)",
      textAlign: "center",
      font: "var(--type-caption)",
      color: "var(--text-subtle)"
    }
  }, emptyLabel)), rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: keyField ? row[keyField] : i,
    style: {
      background: zebra && i % 2 ? "var(--surface-hover)" : "transparent"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: cellPad,
      textAlign: c.align || "left",
      borderBottom: "1px solid var(--border-subtle)",
      font: c.numeric ? "var(--type-table-num)" : "var(--type-caption)",
      fontSize: "var(--text-sm)",
      color: c.emphasis ? "var(--text-primary)" : "var(--text-body)",
      fontVariantNumeric: c.numeric ? "tabular-nums" : undefined,
      whiteSpace: c.wrap ? "normal" : "nowrap"
    }
  }, c.render ? c.render(row, i) : row[c.key]))))), footRow && /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: cellPad,
      textAlign: c.align || "left",
      font: c.numeric ? "var(--type-table-num)" : "var(--type-label)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)",
      background: "var(--surface-inset)",
      borderTop: "1px solid var(--border-strong)",
      fontVariantNumeric: c.numeric ? "tabular-nums" : undefined,
      whiteSpace: "nowrap"
    }
  }, footRow[c.key]))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/DeltaChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* A period-over-period delta. Direction decides the arrow; `goodWhen`
   decides the colour, because "down" is good for posa % and bad for verim. */
function DeltaChip({
  value,
  unit = "%",
  goodWhen = "up",
  period,
  precision = 1,
  size = "md",
  style,
  ...rest
}) {
  const num = typeof value === "number" ? value : parseFloat(value);
  const flat = !isFinite(num) || Math.abs(num) < 0.05;
  const up = num > 0;
  const isGood = goodWhen === "none" ? null : up === (goodWhen === "up");
  const tone = flat || isGood === null ? {
    color: "var(--signal-neutral)",
    background: "var(--signal-neutral-tint)"
  } : isGood ? {
    color: "var(--signal-good)",
    background: "var(--signal-good-tint)"
  } : {
    color: "var(--signal-bad)",
    background: "var(--signal-bad-tint)"
  };
  const label = flat ? "0" + unit : (up ? "+" : "−") + Math.abs(num).toFixed(precision) + unit;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      height: size === "sm" ? 18 : 21,
      padding: "0 7px",
      borderRadius: "var(--radius-chip)",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-medium)",
      fontSize: size === "sm" ? "var(--text-2xs)" : "var(--text-xs)",
      fontVariantNumeric: "tabular-nums",
      ...tone
    }
  }, !flat && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: up ? "arrow-up" : "arrow-down",
    size: size === "sm" ? 10 : 11,
    strokeWidth: 2.25
  }), label), period && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, period));
}
Object.assign(__ds_scope, { DeltaChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DeltaChip.jsx", error: String((e && e.message) || e) }); }

// components/data/HeroMetric.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* One per page. The single number the page exists to answer. */
function HeroMetric({
  label,
  value,
  unit,
  delta,
  deltaGoodWhen = "up",
  deltaPeriod,
  status,
  statusTone = "neutral",
  note,
  icon,
  aside,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      overflow: "hidden",
      background: "var(--surface-card)",
      border: "1px solid var(--border-card)",
      borderRadius: "var(--radius-panel)",
      boxShadow: "var(--shadow-raised)",
      padding: "var(--space-8) var(--card-pad)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-9)",
      flexWrap: "wrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: "-40% 55% auto -10%",
      height: "180%",
      background: "radial-gradient(50% 50% at 50% 50%, var(--accent-tint-08), transparent 70%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15,
    color: "var(--accent-base)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-overline)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-label)",
      color: "var(--text-muted)"
    }
  }, label), status && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: statusTone,
    size: "sm",
    dot: true
  }, status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-5)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-hero-metric)",
      color: "var(--text-primary)",
      letterSpacing: "var(--tracking-metric)",
      fontVariantNumeric: "tabular-nums"
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-card-title)",
      fontWeight: "var(--weight-regular)",
      color: "var(--text-muted)"
    }
  }, unit), delta !== undefined && delta !== null && /*#__PURE__*/React.createElement(__ds_scope.DeltaChip, {
    value: delta,
    goodWhen: deltaGoodWhen,
    period: deltaPeriod
  })), note && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-subtle)",
      maxWidth: "56ch"
    }
  }, note)), aside && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: "0 0 auto"
    }
  }, aside));
}
Object.assign(__ds_scope, { HeroMetric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/HeroMetric.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function KpiCard({
  label,
  value,
  unit,
  icon,
  delta,
  deltaGoodWhen = "up",
  deltaPeriod,
  footnote,
  tone = "default",
  active = false,
  onClick,
  style,
  ...rest
}) {
  const [hot, setHot] = React.useState(false);
  const valueColor = tone === "good" ? "var(--signal-good)" : tone === "bad" ? "var(--signal-bad)" : "var(--text-primary)";
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    style: {
      background: "var(--surface-card)",
      border: "1px solid " + (active ? "var(--accent-tint-24)" : tone === "bad" ? "var(--signal-bad-border)" : "var(--border-card)"),
      borderRadius: "var(--radius-card)",
      boxShadow: active ? "var(--glow-accent)" : "var(--shadow-card)",
      padding: "var(--card-pad)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      minWidth: 0,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color var(--dur-fast) var(--ease-standard),background-color var(--dur-fast) var(--ease-standard)",
      ...(hot && onClick ? {
        background: "var(--surface-inset)"
      } : null),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      letterSpacing: "var(--tracking-tight)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, label), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    color: "var(--text-subtle)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-4)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)",
      color: valueColor,
      letterSpacing: "var(--tracking-metric)",
      fontVariantNumeric: "tabular-nums"
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-subtle)"
    }
  }, unit), delta !== undefined && delta !== null && /*#__PURE__*/React.createElement(__ds_scope.DeltaChip, {
    value: delta,
    goodWhen: deltaGoodWhen,
    size: "sm"
  })), (footnote || deltaPeriod) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)",
      marginTop: "auto"
    }
  }, footnote || deltaPeriod));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Sparkline({
  points = [],
  width = 180,
  height = 48,
  color = "var(--series-1)",
  fill = true,
  showLast = true,
  style,
  ...rest
}) {
  const vals = points.map(Number).filter(n => isFinite(n));
  if (vals.length < 2) return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      ...style
    }
  });
  const lo = Math.min(...vals),
    hi = Math.max(...vals),
    span = hi - lo || 1;
  const pad = 3;
  const xy = vals.map((v, i) => [pad + i / (vals.length - 1) * (width - pad * 2), height - pad - (v - lo) / span * (height - pad * 2)]);
  const line = xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const area = line + ` L${xy[xy.length - 1][0].toFixed(1)} ${height} L${xy[0][0].toFixed(1)} ${height} Z`;
  const gid = "spark" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const last = xy[xy.length - 1];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: "block",
      overflow: "visible",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), fill && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${gid})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), showLast && /*#__PURE__*/React.createElement("circle", {
    cx: last[0],
    cy: last[1],
    r: "2.75",
    fill: color,
    stroke: "var(--surface-card)",
    strokeWidth: "1.5"
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/StatBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Inline proportion bar for table cells and compact breakdowns. */
function StatBar({
  value,
  max = 100,
  color = "var(--series-1)",
  showValue = true,
  valueLabel,
  width = "100%",
  height = 6,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      width,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 40,
      height,
      borderRadius: "var(--radius-pill)",
      background: "var(--surface-raised)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      borderRadius: "var(--radius-pill)",
      background: color,
      transition: "width var(--dur-slow) var(--ease-out)"
    }
  })), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)",
      fontVariantNumeric: "tabular-nums",
      minWidth: 38,
      textAlign: "right"
    }
  }, valueLabel ?? Math.round(pct) + "%"));
}
Object.assign(__ds_scope, { StatBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatBar.jsx", error: String((e && e.message) || e) }); }

// components/data/ThresholdMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Horizontal track showing a value against a tolerance band.
   Used for posa % vs ±5%, and for press utilisation vs target. */
function ThresholdMeter({
  value,
  min = -10,
  max = 10,
  limit = 5,
  unit = "%",
  label,
  showScale = true,
  height = 8,
  style,
  ...rest
}) {
  const clamp = v => Math.max(min, Math.min(max, v));
  const pct = v => (clamp(v) - min) / (max - min) * 100;
  const over = Math.abs(value) > limit;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      minWidth: 200,
      ...style
    }
  }, rest), label && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: over ? "var(--signal-bad)" : "var(--signal-good)",
      fontVariantNumeric: "tabular-nums",
      fontWeight: "var(--weight-medium)"
    }
  }, value > 0 ? "+" : value < 0 ? "−" : "", Math.abs(value).toFixed(1), unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height,
      borderRadius: "var(--radius-pill)",
      background: "var(--surface-inset)",
      border: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: pct(-limit) + "%",
      right: 100 - pct(limit) + "%",
      background: "var(--signal-good-tint)",
      borderLeft: "1px solid var(--signal-good-border)",
      borderRight: "1px solid var(--signal-good-border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -3,
      bottom: -3,
      left: pct(value) + "%",
      width: 3,
      marginLeft: -1.5,
      borderRadius: "var(--radius-pill)",
      background: over ? "var(--signal-bad)" : "var(--signal-good)",
      boxShadow: over ? "0 0 0 3px var(--signal-bad-tint)" : "0 0 0 3px var(--signal-good-tint)",
      transition: "left var(--dur-slow) var(--ease-out)"
    }
  })), showScale && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--type-caption)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-disabled)",
      fontVariantNumeric: "tabular-nums"
    }
  }, /*#__PURE__*/React.createElement("span", null, min, unit), /*#__PURE__*/React.createElement("span", null, "\u2212", limit, unit), /*#__PURE__*/React.createElement("span", null, "+", limit, unit), /*#__PURE__*/React.createElement("span", null, "+", max, unit)));
}
Object.assign(__ds_scope, { ThresholdMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ThresholdMeter.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const alertTones = {
  info: {
    color: "var(--text-muted)",
    background: "var(--signal-neutral-tint)",
    border: "var(--signal-neutral-border)",
    icon: "info"
  },
  good: {
    color: "var(--signal-good)",
    background: "var(--signal-good-tint)",
    border: "var(--signal-good-border)",
    icon: "circle-check"
  },
  caution: {
    color: "var(--signal-caution)",
    background: "var(--signal-caution-tint)",
    border: "var(--signal-caution-border)",
    icon: "triangle-alert"
  },
  bad: {
    color: "var(--signal-bad)",
    background: "var(--signal-bad-tint)",
    border: "var(--signal-bad-border)",
    icon: "circle-alert"
  }
};
function Alert({
  tone = "info",
  title,
  children,
  icon,
  actions,
  onDismiss,
  style,
  ...rest
}) {
  const t = alertTones[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: tone === "bad" ? "alert" : "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-5)",
      padding: "var(--space-5) var(--space-6)",
      background: t.background,
      border: "1px solid " + t.border,
      borderRadius: "var(--radius-card-inset)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || t.icon,
    size: 16,
    color: t.color,
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-semibold)",
      color: t.color
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-body)"
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      marginTop: "var(--space-4)"
    }
  }, actions)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Kapat",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text-subtle)",
      padding: 2,
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14
  })));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-5)",
      textAlign: "center",
      padding: compact ? "var(--space-8) var(--space-6)" : "var(--space-11) var(--space-8)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--radius-md)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--surface-inset)",
      border: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 19,
    color: "var(--text-subtle)"
  })), title && /*#__PURE__*/React.createElement("strong", {
    style: {
      font: "var(--type-card-title)",
      color: "var(--text-primary)"
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--type-caption)",
      color: "var(--text-subtle)",
      maxWidth: "44ch"
    }
  }, description), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Skeleton({
  width = "100%",
  height = 14,
  radius = "var(--radius-xs)",
  lines = 1,
  gap = "var(--space-4)",
  style,
  ...rest
}) {
  const bar = i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "block",
      width: lines > 1 && i === lines - 1 ? "62%" : width,
      height,
      borderRadius: radius,
      background: "linear-gradient(90deg,var(--surface-inset) 0%,var(--surface-raised) 50%,var(--surface-inset) 100%)",
      backgroundSize: "200% 100%",
      animation: "dsShimmer 1.4s linear infinite"
    }
  });
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("style", null, "@keyframes dsShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"), Array.from({
    length: lines
  }, (_, i) => bar(i)));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "flex",
      alignItems: description ? "flex-start" : "center",
      gap: "var(--space-5)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      minHeight: 24,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange ? e => onChange(e.target.checked, e) : undefined,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      flex: "0 0 auto",
      borderRadius: "var(--radius-xs)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: checked ? "var(--accent-base)" : "var(--surface-field)",
      border: "1px solid " + (checked ? "var(--accent-base)" : "var(--border-field)"),
      transition: "var(--transition-control)",
      marginTop: description ? 2 : 0
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12,
    strokeWidth: 3,
    color: "var(--text-on-accent)"
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  span = 1,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      minWidth: 0,
      gridColumn: span > 1 ? `span ${span}` : undefined,
      ...style
    }
  }, rest), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: "var(--type-label)",
      color: "var(--text-muted)",
      letterSpacing: "var(--tracking-tight)",
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-base)"
    },
    "aria-hidden": "true"
  }, "*")), children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--signal-bad)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 12
  }), error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormGrid.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FormGrid({
  columns = 2,
  gap = "var(--space-6)",
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap,
      alignItems: "start",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { FormGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormGrid.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SegmentedControl({
  value,
  onChange,
  options = [],
  size = "md",
  block = false,
  style,
  ...rest
}) {
  const h = size === "sm" ? "var(--control-h-sm)" : "var(--control-h)";
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      height: h,
      padding: 3,
      background: "var(--surface-inset)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-control)",
      width: block ? "100%" : undefined,
      ...style
    }
  }, rest), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    const on = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(val),
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        flex: block ? 1 : "0 0 auto",
        height: "100%",
        padding: "0 12px",
        borderRadius: "var(--radius-xs)",
        border: "none",
        cursor: "pointer",
        background: on ? "var(--surface-raised)" : "transparent",
        boxShadow: on ? "var(--shadow-card)" : "none",
        color: on ? "var(--text-primary)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-medium)",
        fontSize: size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
        letterSpacing: "var(--tracking-tight)",
        whiteSpace: "nowrap",
        transition: "var(--transition-control)"
      }
    }, typeof o !== "string" && o.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: o.icon,
      size: 13
    }), lbl);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  value,
  onChange,
  options = [],
  placeholder,
  size = "md",
  invalid = false,
  disabled = false,
  icon,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      height: h,
      background: "var(--surface-field)",
      border: "1px solid " + (invalid ? "var(--signal-bad)" : focus ? "var(--border-focus)" : "var(--border-field)"),
      borderRadius: "var(--radius-control)",
      padding: "0 10px 0 12px",
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-inset-field)",
      transition: "var(--transition-control)",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15,
    color: "var(--text-subtle)"
  }), /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    value: value,
    disabled: disabled,
    onChange: onChange ? e => onChange(e.target.value, e) : undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      appearance: "none",
      background: "transparent",
      border: "none",
      outline: "none",
      color: value === "" || value == null ? "var(--text-subtle)" : "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
      cursor: disabled ? "not-allowed" : "pointer",
      paddingRight: 4
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val,
      style: {
        background: "var(--surface-raised)",
        color: "var(--text-primary)"
      }
    }, lbl);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 15,
    color: "var(--text-subtle)"
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = "md",
  id,
  style,
  ...rest
}) {
  const w = size === "sm" ? 32 : 40,
    h = size === "sm" ? 18 : 22,
    knob = h - 6;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-5)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange ? e => onChange(e.target.checked, e) : undefined,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: w,
      height: h,
      borderRadius: "var(--radius-pill)",
      flex: "0 0 auto",
      position: "relative",
      background: checked ? "var(--accent-base)" : "var(--surface-raised)",
      border: "1px solid " + (checked ? "var(--accent-base)" : "var(--border-field)"),
      transition: "var(--transition-control)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? w - knob - 4 : 2,
      width: knob,
      height: knob,
      borderRadius: "50%",
      background: checked ? "var(--text-on-accent)" : "var(--text-muted)",
      transition: "left var(--dur-fast) var(--ease-standard)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldShell = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  background: "var(--surface-field)",
  border: "1px solid var(--border-field)",
  borderRadius: "var(--radius-control)",
  padding: "0 12px",
  boxShadow: "var(--shadow-inset-field)",
  transition: "var(--transition-control)"
};
function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  suffix,
  type = "text",
  size = "md",
  invalid = false,
  disabled = false,
  readOnly = false,
  align,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...fieldShell,
      height: h,
      borderColor: invalid ? "var(--signal-bad)" : focus ? "var(--border-focus)" : "var(--border-field)",
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-inset-field)",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15,
    color: "var(--text-subtle)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    readOnly: readOnly,
    onChange: onChange ? e => onChange(e.target.value, e) : undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text-primary)",
      fontFamily: type === "number" ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
      textAlign: align || (type === "number" ? "right" : "left"),
      fontVariantNumeric: "tabular-nums"
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)",
      flex: "0 0 auto"
    }
  }, suffix));
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/layout/AppShell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AppShell({
  sidebar,
  topbar,
  children,
  style,
  contentStyle,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      height: "100%",
      minHeight: 0,
      background: "var(--bg-app)",
      color: "var(--text-body)",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), sidebar, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, topbar, /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "var(--page-pad-y) var(--page-pad-x) var(--space-11)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--section-gap)",
      ...contentStyle
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: "var(--content-max)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--section-gap)"
    }
  }, children))));
}
function CardGrid({
  columns = 4,
  minWidth = 220,
  gap = "var(--card-gap)",
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`,
      gap,
      ...style
    },
    "data-columns": columns
  }, rest), children);
}
function SplitRow({
  ratio = "2fr 1fr",
  gap = "var(--card-gap)",
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "grid",
      gridTemplateColumns: ratio,
      gap,
      alignItems: "stretch",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { AppShell, CardGrid, SplitRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/AppShell.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageTabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PageTabs({
  value,
  onChange,
  tabs = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-7)",
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, rest), tabs.map(t => {
    const on = t.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(t.id),
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "0 2px 11px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: on ? "var(--text-primary)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: on ? "var(--weight-medium)" : "var(--weight-regular)",
        letterSpacing: "var(--tracking-tight)",
        transition: "var(--transition-control)"
      }
    }, t.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 15
    }), t.label, t.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontSize: "var(--text-2xs)",
        color: "var(--text-subtle)",
        background: "var(--surface-inset)",
        borderRadius: "var(--radius-pill)",
        padding: "1px 6px"
      }
    }, t.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        borderRadius: "var(--radius-pill)",
        background: on ? "var(--accent-base)" : "transparent"
      }
    }));
  }));
}
Object.assign(__ds_scope, { PageTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageTabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
  badge,
  collapsed = false
}) {
  const [hot, setHot] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    title: collapsed ? label : undefined,
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      width: "100%",
      height: 38,
      padding: collapsed ? 0 : "0 12px",
      justifyContent: collapsed ? "center" : "flex-start",
      borderRadius: "var(--radius-control)",
      border: "1px solid transparent",
      cursor: "pointer",
      background: active ? "var(--nav-item-active-bg)" : hot ? "var(--surface-hover)" : "transparent",
      borderColor: active ? "var(--border-subtle)" : "transparent",
      color: active ? "var(--nav-item-active-fg)" : hot ? "var(--text-body)" : "var(--nav-item-fg)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
      letterSpacing: "var(--tracking-tight)",
      textAlign: "left",
      transition: "var(--transition-control)"
    }
  }, active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: -9,
      top: 9,
      bottom: 9,
      width: 2.5,
      borderRadius: "var(--radius-pill)",
      background: "var(--nav-indicator)"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17,
    color: active ? "var(--accent-base)" : "currentColor"
  }), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, label), !collapsed && badge);
}
function Sidebar({
  brand = "Üretim Paneli",
  brandSub,
  items = [],
  activeId,
  onSelect,
  collapsed = false,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      padding: collapsed ? "var(--space-7) var(--space-5)" : "var(--space-7) var(--space-6)",
      background: "var(--bg-nav)",
      borderRight: "1px solid var(--border-subtle)",
      height: "100%",
      overflow: "hidden",
      transition: "width var(--dur-base) var(--ease-standard)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      padding: collapsed ? 0 : "0 4px",
      justifyContent: collapsed ? "center" : "flex-start",
      minHeight: 32
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      flex: "0 0 auto",
      borderRadius: "var(--radius-sm)",
      background: "var(--accent-tint-14)",
      border: "1px solid var(--accent-tint-24)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "factory",
    size: 16,
    color: "var(--accent-base)"
  })), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-card-title)",
      color: "var(--text-primary)",
      letterSpacing: "var(--tracking-tight)",
      whiteSpace: "nowrap"
    }
  }, brand), brandSub && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-subtle)",
      whiteSpace: "nowrap"
    }
  }, brandSub))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      flex: 1,
      minHeight: 0,
      overflowY: "auto"
    }
  }, items.map(it => /*#__PURE__*/React.createElement(SidebarItem, _extends({
    key: it.id
  }, it, {
    collapsed: collapsed,
    active: it.id === activeId,
    onClick: () => onSelect && onSelect(it.id)
  })))), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto"
    }
  }, footer));
}
Object.assign(__ds_scope, { SidebarItem, Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TopBar({
  search,
  onSearchChange,
  searchPlaceholder = "Ara…",
  left,
  actions,
  user,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      height: "var(--topbar-h)",
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)",
      padding: "0 var(--page-pad-x)",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-nav)",
      ...style
    }
  }, rest), left, onSearchChange !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      height: 34,
      maxWidth: 340,
      flex: "1 1 240px",
      background: "var(--surface-field)",
      border: "1px solid " + (focus ? "var(--border-focus)" : "var(--border-field)"),
      borderRadius: "var(--radius-pill)",
      padding: "0 14px",
      transition: "var(--transition-control)",
      boxShadow: focus ? "var(--ring-focus)" : "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 15,
    color: "var(--text-subtle)"
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    placeholder: searchPlaceholder,
    onChange: e => onSearchChange && onSearchChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, actions), user && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      paddingLeft: "var(--space-6)",
      marginLeft: "var(--space-2)",
      borderLeft: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      flex: "0 0 auto",
      background: "var(--surface-raised)",
      border: "1px solid var(--border-strong)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "var(--type-label)",
      color: "var(--text-muted)",
      letterSpacing: 0
    }
  }, user.initials), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-primary)",
      whiteSpace: "nowrap"
    }
  }, user.name), user.role && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-subtle)",
      whiteSpace: "nowrap"
    }
  }, user.role)), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14,
    color: "var(--text-subtle)"
  })));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/AracLojistigi.jsx
try { (() => {
const {
  SectionHeader,
  HeroMetric,
  KpiCard,
  ChartCard,
  Card,
  CardGrid,
  SplitRow,
  DataTable,
  Badge,
  Button,
  IconButton,
  SegmentedControl,
  TextInput,
  EmptyState,
  StatBar
} = window.RetimPaneliDesignSystem_b437a5;
function AracLojistigi() {
  const d = window.UPData;
  const [q, setQ] = React.useState("");
  const [gun, setGun] = React.useState("Tümü");
  const s = d.aracIstatistik;
  const gunler = ["Tümü", ...d.aracGunluk.map(r => d.dShort(r.gun))];
  const rows = d.trucks.filter(t => (gun === "Tümü" || d.dShort(t.tarih) === gun) && (q === "" || (t.arac + " " + t.urun + " " + t.tarih).toLowerCase().includes(q.toLowerCase())));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Ara\xE7 Lojisti\u011Fi",
    subtitle: "Araç takip tablosu · " + s.aracSayisi + " kayıtlı araç · 3–4 Eyl 2026",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SegmentedControl, {
      size: "sm",
      value: gun,
      onChange: setGun,
      options: gunler
    }), /*#__PURE__*/React.createElement(Button, {
      icon: "download"
    }, "Excel'e Aktar"))
  }), /*#__PURE__*/React.createElement(HeroMetric, {
    label: "Toplam gelen \xFCr\xFCn",
    value: d.nf(s.toplamGelen, 1),
    unit: "ton",
    icon: "truck",
    status: s.aracSayisi + " araç boşaltıldı",
    statusTone: "good",
    delta: -15.6,
    deltaGoodWhen: "none",
    deltaPeriod: "\xF6nceki g\xFCne g\xF6re",
    note: "Ortalama boşaltma hızı " + d.nf(s.ortHiz, 2) + " kg/dk · Ortalama boşaltma süresi " + d.nf(s.ortBosaltma, 1) + " dk",
    aside: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 32
      }
    }, [["Ortalama bekleme", d.nf(s.ortBekleme, 1) + " dk", "var(--text-primary)"], ["Toplam kayıp zaman", d.nf(s.toplamKayip, 1) + " dk", "var(--signal-bad)"], ["Kayıtlı araç", s.aracSayisi + "", "var(--text-primary)"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        fontSize: "var(--text-xs)",
        color: "var(--text-subtle)"
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-metric)",
        fontSize: "var(--text-2xl)",
        color: c,
        letterSpacing: "var(--tracking-metric)",
        marginTop: 4
      }
    }, v))))
  }), /*#__PURE__*/React.createElement(CardGrid, {
    minWidth: 220
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Kay\u0131tl\u0131 ara\xE7 say\u0131s\u0131",
    value: s.aracSayisi,
    unit: "ara\xE7",
    icon: "truck",
    delta: -20.0,
    deltaGoodWhen: "none",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ortalama bekleme s\xFCresi",
    value: d.nf(s.ortBekleme, 1),
    unit: "dk",
    icon: "clock",
    tone: "bad",
    delta: 12.4,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ortalama bo\u015Faltma s\xFCresi",
    value: d.nf(s.ortBosaltma, 1),
    unit: "dk",
    icon: "timer",
    delta: -6.8,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ortalama bo\u015Faltma h\u0131z\u0131",
    value: d.nf(s.ortHiz, 2),
    unit: "kg/dk",
    icon: "gauge",
    delta: 4.1,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  })), /*#__PURE__*/React.createElement(SplitRow, {
    ratio: "1.6fr 1fr"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Ara\xE7 baz\u0131nda bo\u015Faltma h\u0131z\u0131 ve bekleme",
    subtitle: "kg/dk \xB7 dk",
    height: 258,
    legend: [{
      label: "Boşaltma hızı (kg/dk)",
      color: "var(--series-3)"
    }, {
      label: "Bekleme (dk)",
      color: "var(--series-4)"
    }],
    footer: "Bekleme, \xF6nceki arac\u0131n biti\u015Fi ile bu arac\u0131n ba\u015Flang\u0131c\u0131 aras\u0131ndaki s\xFCredir."
  }, /*#__PURE__*/React.createElement(BarChart, {
    labels: d.trucks.map(t => d.dShort(t.tarih).split(" ")[0] + "/" + t.arac),
    height: 258,
    groups: [{
      label: "Hız",
      points: d.trucks.map(t => t.hiz),
      color: "var(--series-3)"
    }, {
      label: "Bekleme",
      points: d.trucks.map(t => (t.bekleme || 0) * 4),
      color: "var(--series-4)"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    title: "G\xFCnl\xFCk tablo",
    subtitle: "Miktar, bekleme ve press aral\u0131\u011F\u0131",
    icon: "calendar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, d.aracGunluk.map(r => /*#__PURE__*/React.createElement(Card, {
    key: r.gun,
    inset: true,
    padding: "14px 16px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-card-title)",
      color: "var(--text-primary)"
    }
  }, d.dShort(r.gun)), /*#__PURE__*/React.createElement(Badge, {
    tone: r.bekleme > 60 ? "bad" : r.bekleme > 15 ? "caution" : "good",
    size: "sm",
    dot: true
  }, r.bekleme, " dk bekleme")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, "Miktar"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-lg)",
      color: "var(--text-primary)",
      marginTop: 2
    }
  }, d.nf(r.miktar, 1), " ton")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, "Press ba\u015Flang\u0131\xE7\u2013biti\u015F aras\u0131"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-lg)",
      color: "var(--text-primary)",
      marginTop: 2
    }
  }, r.presAralik)))))), /*#__PURE__*/React.createElement(Card, {
    inset: true,
    padding: "14px 16px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, "Toplam kay\u0131p zaman"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-lg)",
      color: "var(--signal-bad)"
    }
  }, d.nf(s.toplamKayip, 1), " dk")))))), /*#__PURE__*/React.createElement(Card, {
    title: "Ara\xE7 takip tablosu",
    subtitle: "Kaynak tablosunun birebir kar\u015F\u0131l\u0131\u011F\u0131",
    icon: "truck",
    actions: /*#__PURE__*/React.createElement(TextInput, {
      size: "sm",
      icon: "search",
      placeholder: "Ara\xE7 no veya tarih ara",
      value: q,
      onChange: setQ,
      style: {
        minWidth: 230
      }
    })
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "key",
    emptyLabel: "Araman\u0131zla e\u015Fle\u015Fen ara\xE7 kayd\u0131 yok",
    columns: [{
      key: "tarih",
      header: "Tarih",
      emphasis: true,
      render: r => d.dShort(r.tarih)
    }, {
      key: "arac",
      header: "Araç",
      numeric: true,
      align: "right"
    }, {
      key: "urun",
      header: "Ürün"
    }, {
      key: "miktar",
      header: "Miktar (kg)",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => d.ni(r.miktar)
    }, {
      key: "baslangic",
      header: "Başlangıç",
      numeric: true,
      align: "right"
    }, {
      key: "bitis",
      header: "Bitiş",
      numeric: true,
      align: "right"
    }, {
      key: "sure",
      header: "Süre (dk)",
      numeric: true,
      align: "right",
      render: r => d.nf(r.sure, 1)
    }, {
      key: "hiz",
      header: "Hız (kg/dk)",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => d.nf(r.hiz, 2)
    }, {
      key: "bekleme",
      header: "Bekleme (dk)",
      numeric: true,
      align: "right",
      render: r => r.bekleme == null ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-disabled)"
        }
      }, "\u2014") : /*#__PURE__*/React.createElement("span", {
        style: {
          color: r.bekleme > 60 ? "var(--signal-bad)" : "var(--text-body)"
        }
      }, d.nf(r.bekleme, 1))
    }, {
      key: "pay",
      header: "Bekleme payı",
      width: 150,
      render: r => /*#__PURE__*/React.createElement(StatBar, {
        value: r.bekleme || 0,
        max: 161,
        showValue: false,
        color: r.bekleme > 60 ? "var(--signal-bad)" : "var(--series-4)"
      })
    }],
    rows: rows.map((r, i) => ({
      ...r,
      key: r.tarih + "-" + r.arac
    })),
    sortKey: "miktar",
    sortDir: "desc",
    onSort: () => {},
    footRow: {
      tarih: "Toplam · " + rows.length + " araç",
      miktar: d.ni(rows.reduce((a, t) => a + t.miktar, 0)),
      sure: d.nf(rows.reduce((a, t) => a + t.sure, 0), 1),
      bekleme: d.nf(rows.reduce((a, t) => a + (t.bekleme || 0), 0), 1)
    }
  })));
}
Object.assign(window, {
  AracLojistigi
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/AracLojistigi.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/Charts.jsx
try { (() => {
/* Data-driven SVG plots for the kit. Real charts in the app come from the
   Streamlit chart layer; these mirror their geometry and colours. */

function scale(vals, h, pad = 8) {
  const lo = Math.min(...vals),
    hi = Math.max(...vals);
  const span = hi - lo || 1;
  return v => h - pad - (v - lo) / span * (h - pad * 2);
}
function LineChart({
  series = [],
  labels = [],
  height = 260,
  yTicks = 4,
  area = true
}) {
  const W = 1000,
    H = height;
  const all = series.flatMap(s => s.points);
  const lo = Math.min(...all),
    hi = Math.max(...all);
  const padT = 10,
    padB = 26,
    padL = 44,
    padR = 8;
  const y = v => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);
  const x = i => padL + i / Math.max(1, labels.length - 1) * (W - padL - padR);
  const ticks = Array.from({
    length: yTicks + 1
  }, (_, i) => lo + (hi - lo) / yTicks * i);
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height: "100%",
      display: "block",
      overflow: "visible"
    }
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: W - padR,
    y1: y(t),
    y2: y(t),
    stroke: "var(--chart-grid)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 8,
    y: y(t) + 4,
    textAnchor: "end",
    fill: "var(--chart-axis)",
    style: {
      font: "500 11px var(--font-mono)"
    }
  }, Math.round(t)))), series.map((s, si) => {
    const d = s.points.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join(" ");
    return /*#__PURE__*/React.createElement("g", {
      key: s.label
    }, area && /*#__PURE__*/React.createElement("path", {
      d: `${d} L${x(s.points.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z`,
      fill: s.color,
      opacity: "0.10"
    }), /*#__PURE__*/React.createElement("path", {
      d: d,
      fill: "none",
      stroke: s.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), s.points.map((v, i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: x(i),
      cy: y(v),
      r: i === s.points.length - 1 ? 4 : 2.5,
      fill: s.color,
      stroke: "var(--surface-card)",
      strokeWidth: "1.5"
    })));
  }), labels.map((l, i) => /*#__PURE__*/React.createElement("text", {
    key: l,
    x: x(i),
    y: H - 6,
    textAnchor: "middle",
    fill: "var(--chart-axis)",
    style: {
      font: "400 11px var(--font-sans)"
    }
  }, l)));
}
function BarChart({
  groups = [],
  labels = [],
  height = 260,
  stacked = false,
  limitLine
}) {
  const W = 1000,
    H = height,
    padT = 10,
    padB = 26,
    padL = 44,
    padR = 8;
  const totals = labels.map((_, i) => stacked ? groups.reduce((a, g) => a + g.points[i], 0) : Math.max(...groups.map(g => g.points[i])));
  const hi = Math.max(...totals, limitLine ? limitLine * 1.4 : 0) * 1.08;
  const y = v => padT + (1 - v / hi) * (H - padT - padB);
  const bandW = (W - padL - padR) / labels.length;
  const barW = stacked ? bandW * 0.44 : bandW * 0.62 / groups.length;
  const ticks = Array.from({
    length: 5
  }, (_, i) => hi / 4 * i);
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height: "100%",
      display: "block",
      overflow: "visible"
    }
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: W - padR,
    y1: y(t),
    y2: y(t),
    stroke: "var(--chart-grid)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 8,
    y: y(t) + 4,
    textAnchor: "end",
    fill: "var(--chart-axis)",
    style: {
      font: "500 11px var(--font-mono)"
    }
  }, Math.round(t)))), limitLine !== undefined && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: W - padR,
    y1: y(limitLine),
    y2: y(limitLine),
    stroke: "var(--signal-bad)",
    strokeWidth: "1.5",
    strokeDasharray: "6 5",
    opacity: "0.8"
  }), /*#__PURE__*/React.createElement("text", {
    x: W - padR,
    y: y(limitLine) - 7,
    textAnchor: "end",
    fill: "var(--signal-bad)",
    style: {
      font: "600 11px var(--font-sans)"
    }
  }, "Tolerans %", limitLine)), labels.map((l, i) => {
    let acc = 0;
    return /*#__PURE__*/React.createElement("g", {
      key: l
    }, groups.map((g, gi) => {
      const v = g.points[i];
      const top = stacked ? y(acc + v) : y(v);
      const hgt = stacked ? y(acc) - y(acc + v) : H - padB - y(v);
      const cx = stacked ? padL + bandW * i + bandW / 2 - barW / 2 : padL + bandW * i + (bandW - barW * groups.length) / 2 + barW * gi;
      acc += v;
      return /*#__PURE__*/React.createElement("rect", {
        key: g.label,
        x: cx,
        y: top,
        width: barW,
        height: Math.max(0, hgt),
        rx: "3",
        fill: g.color
      });
    }), /*#__PURE__*/React.createElement("text", {
      x: padL + bandW * i + bandW / 2,
      y: H - 6,
      textAnchor: "middle",
      fill: "var(--chart-axis)",
      style: {
        font: "400 11px var(--font-sans)"
      }
    }, l));
  }));
}
function Donut({
  slices = [],
  size = 168,
  thickness = 22,
  centerLabel,
  centerValue
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2,
    c = 2 * Math.PI * r;
  let acc = 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size,
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      display: "block",
      transform: "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-inset)",
    strokeWidth: thickness
  }), slices.map(s => {
    const len = s.value / total * c;
    const el = /*#__PURE__*/React.createElement("circle", {
      key: s.label,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: s.color,
      strokeWidth: thickness,
      strokeDasharray: `${len - 2} ${c - len + 2}`,
      strokeDashoffset: -acc,
      strokeLinecap: "butt"
    });
    acc += len;
    return el;
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)",
      fontSize: "var(--text-2xl)",
      color: "var(--text-primary)",
      letterSpacing: "var(--tracking-metric)"
    }
  }, centerValue), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-subtle)"
    }
  }, centerLabel)));
}
Object.assign(window, {
  LineChart,
  BarChart,
  Donut,
  scale
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/Charts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/GenelBakis.jsx
try { (() => {
const {
  SectionHeader,
  HeroMetric,
  KpiCard,
  ChartCard,
  Card,
  CardGrid,
  SplitRow,
  DataTable,
  Badge,
  Button,
  IconButton,
  ThresholdMeter,
  StatBar,
  Alert,
  SegmentedControl
} = window.RetimPaneliDesignSystem_b437a5;
function GenelBakis({
  onNavigate
}) {
  const d = window.UPData;
  const [gran, setGran] = React.useState("Gün");
  const g = d.genel;
  const sonHat = d.onHatlar[d.onHatlar.length - 1];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Genel Bak\u0131\u015F",
    subtitle: "Bucher Pres \xB7 Batch performans g\xF6sterge panosu \xB7 31 A\u011Fu \u2013 4 Eyl 2026",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SegmentedControl, {
      size: "sm",
      value: gran,
      onChange: setGran,
      options: ["Gün", "Vardiya", "Batch"]
    }), /*#__PURE__*/React.createElement(Button, {
      icon: "download"
    }, "Excel'e Aktar"))
  }), /*#__PURE__*/React.createElement(HeroMetric, {
    label: "\u0130\u015Flenen toplam \xFCr\xFCn miktar\u0131",
    value: d.nf(g.islenen, 1),
    unit: "ton",
    icon: "gauge",
    status: "Ort. toplam verim %91,2",
    statusTone: "good",
    delta: 2.4,
    deltaGoodWhen: "up",
    deltaPeriod: "\xF6nceki g\xFCne g\xF6re",
    note: "24 batch · Pres 1 ve Press 2 toplamı · Ort. batch süresi " + d.nf(g.ortBatchSuresi, 1) + " dk",
    aside: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 34
      }
    }, [["Ort. toplam verim", "%" + d.nf(g.ortToplamVerim, 1), "var(--signal-good)"], ["Çıkan ort.", d.nf(g.cikanOrt, 1) + " t/sa", "var(--text-primary)"], ["Saatlik ort. posa", d.nf(g.posaOrt, 1) + " t/sa", "var(--signal-bad)"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        fontSize: "var(--text-xs)",
        color: "var(--text-subtle)"
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-metric)",
        fontSize: "var(--text-2xl)",
        color: c,
        letterSpacing: "var(--tracking-metric)",
        marginTop: 4
      }
    }, v))))
  }), /*#__PURE__*/React.createElement(CardGrid, {
    minWidth: 220
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. toplam verim",
    value: d.nf(g.ortToplamVerim, 1),
    unit: "%",
    icon: "percent",
    delta: 0.4,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. batch s\xFCresi",
    value: d.nf(g.ortBatchSuresi, 1),
    unit: "dk",
    icon: "timer",
    delta: -3.1,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "\xC7\u0131kan toplam \xFCr\xFCn ort.",
    value: d.nf(g.cikanOrt, 1),
    unit: "t/sa",
    icon: "droplet",
    delta: 9.1,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Saatlik ort. toplam posa",
    value: d.nf(g.posaOrt, 1),
    unit: "t/sa",
    icon: "scale",
    delta: -4.2,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re",
    onClick: () => onNavigate("posa")
  })), /*#__PURE__*/React.createElement(SplitRow, {
    ratio: "1fr 1fr"
  }, d.presler.map((p, i) => /*#__PURE__*/React.createElement(Card, {
    key: p.id,
    title: p.ad,
    subtitle: "Toplam \xE7al\u0131\u015Fma, giren / \xE7\u0131kan \xFCr\xFCn",
    icon: "factory",
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, d.nf(p.calisma, 2), " saat")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 14
    }
  }, [["Giren toplam", d.nf(p.giren, 1) + " t"], ["Çıkan toplam", d.nf(p.cikan, 1) + " t"], ["Saatlik ort.", d.nf(p.saatlik, 1) + " t/sa"]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-xl)",
      color: "var(--text-primary)",
      marginTop: 3
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xC7\u0131kan / giren oran\u0131"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-xs)",
      color: "var(--text-primary)"
    }
  }, "%", d.nf(p.cikan / p.giren * 100, 1))), /*#__PURE__*/React.createElement(StatBar, {
    value: p.cikan,
    max: p.giren,
    showValue: false,
    color: `var(--series-${i + 1})`,
    height: 8
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, "Saatlik ortalama toplam posa"), /*#__PURE__*/React.createElement(Badge, {
    tone: "bad",
    size: "sm"
  }, d.nf(p.posaSaatlik, 1), " t/sa")))))), /*#__PURE__*/React.createElement(ChartCard, {
    title: "G\xFCnl\xFCk performans trendi",
    subtitle: "Ton/saat",
    height: 252,
    legend: [{
      label: "Press 1",
      color: "var(--series-1)"
    }, {
      label: "Press 2",
      color: "var(--series-2)"
    }, {
      label: "Toplam",
      color: "var(--series-3)"
    }],
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "ellipsis-vertical",
      label: "Daha fazla",
      variant: "ghost",
      size: "sm"
    }),
    footer: "Kaynak: batch performans tablosu \xB7 G\xDCNL\xDCK PRESS PERFORMANSI TON/SA"
  }, /*#__PURE__*/React.createElement(LineChart, {
    labels: d.gunluk.map(r => d.dShort(r.gun)),
    height: 252,
    series: [{
      label: "Press 1",
      points: d.gunluk.map(r => r.p1Perf),
      color: "var(--series-1)"
    }, {
      label: "Press 2",
      points: d.gunluk.map(r => r.p2Perf),
      color: "var(--series-2)"
    }, {
      label: "Toplam",
      points: d.gunluk.map(r => r.toplamPerf),
      color: "var(--series-3)"
    }]
  })), sonHat.farkPct > 5 && /*#__PURE__*/React.createElement(Alert, {
    tone: "bad",
    title: "Ara\xE7 ve pres toplam\u0131 aras\u0131ndaki fark tolerans\u0131n d\u0131\u015F\u0131nda",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => onNavigate("posa"),
      iconRight: "chevron-right"
    }, "Posa Analizi")
  }, d.dShort(d.onHatlar[2].tarih), " i\xE7in fark %", d.nf(d.onHatlar[2].farkPct, 1), " (", d.ni(d.onHatlar[2].fark), " kg) \u2014 tolerans \xB1%5."), /*#__PURE__*/React.createElement(Card, {
    title: "G\xFCnl\xFCk press performans\u0131",
    subtitle: "Girdi, \xE7\u0131kt\u0131 ve verim",
    icon: "table-2",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      icon: "download"
    }, "CSV")
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "gun",
    columns: [{
      key: "gun",
      header: "Gün",
      emphasis: true,
      render: r => d.dShort(r.gun)
    }, {
      key: "p1Perf",
      header: "Press 1 t/sa",
      numeric: true,
      align: "right",
      render: r => d.nf(r.p1Perf, 1)
    }, {
      key: "p2Perf",
      header: "Press 2 t/sa",
      numeric: true,
      align: "right",
      render: r => d.nf(r.p2Perf, 1)
    }, {
      key: "toplamPerf",
      header: "Toplam t/sa",
      numeric: true,
      align: "right",
      emphasis: true,
      render: r => d.nf(r.toplamPerf, 1)
    }, {
      key: "toplamGiren",
      header: "Toplam giren (t)",
      numeric: true,
      align: "right",
      render: r => d.nf(r.toplamGiren, 2)
    }, {
      key: "toplamCikan",
      header: "Toplam çıkan (t)",
      numeric: true,
      align: "right",
      render: r => d.nf(r.toplamCikan, 2)
    }, {
      key: "verim",
      header: "Verim %",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => d.nf(r.verim, 2)
    }, {
      key: "leeching",
      header: "Leeching verimi %",
      numeric: true,
      align: "right",
      render: r => d.nf(r.leeching, 2)
    }, {
      key: "ortVerim",
      header: "Ortalama verim",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: "good",
        size: "sm",
        dot: true
      }, "%", r.ortVerim)
    }],
    rows: d.gunluk,
    footRow: {
      gun: "Toplam",
      toplamGiren: d.nf(d.gunluk.reduce((a, r) => a + r.toplamGiren, 0), 2),
      toplamCikan: d.nf(d.gunluk.reduce((a, r) => a + r.toplamCikan, 0), 2),
      verim: "84,89"
    }
  })));
}
Object.assign(window, {
  GenelBakis
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/GenelBakis.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/PosaAnalizi.jsx
try { (() => {
const {
  SectionHeader,
  HeroMetric,
  KpiCard,
  ChartCard,
  Card,
  CardGrid,
  SplitRow,
  DataTable,
  Badge,
  Button,
  Alert,
  ThresholdMeter,
  SegmentedControl,
  StatBar
} = window.RetimPaneliDesignSystem_b437a5;
function PosaAnalizi() {
  const d = window.UPData;
  const [gran, setGran] = React.useState("Gün");
  const aktif = d.onHatlar.filter(r => r.aracToplam > 0);
  const son = aktif[aktif.length - 1];
  const asan = aktif.filter(r => Math.abs(r.farkPct) > 5);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Posa Analizi",
    subtitle: "\xD6n hatlar analiz \xB7 G\xFCnl\xFCk ara\xE7 vs pres fark\u0131 \xB7 Tolerans \xB1%5",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SegmentedControl, {
      size: "sm",
      value: gran,
      onChange: setGran,
      options: ["Gün", "Batch", "Pres"]
    }), /*#__PURE__*/React.createElement(Button, {
      icon: "download"
    }, "Excel'e Aktar"))
  }), asan.length > 0 && /*#__PURE__*/React.createElement(Alert, {
    tone: "bad",
    title: asan.length + " gün toleransın dışında"
  }, d.dShort(asan[0].tarih), " i\xE7in ara\xE7 ve pres toplam\u0131 aras\u0131ndaki fark %", d.nf(asan[0].farkPct, 1), " (", d.ni(asan[0].fark), " kg) \u2014 tolerans \xB1%5. Kantar ve batch kay\u0131tlar\u0131n\u0131 kar\u015F\u0131la\u015Ft\u0131r\u0131n."), /*#__PURE__*/React.createElement(HeroMetric, {
    label: "Ara\xE7 vs pres fark\u0131",
    value: d.nf(son.farkPct, 1),
    unit: "%",
    icon: "percent",
    status: Math.abs(son.farkPct) > 5 ? "Tolerans dışı" : "Tolerans içinde",
    statusTone: Math.abs(son.farkPct) > 5 ? "bad" : "good",
    delta: -3.0,
    deltaGoodWhen: "down",
    deltaPeriod: "\xF6nceki g\xFCne g\xF6re",
    note: "(Ara\xE7 Toplam\u0131 \u2212 Pres Toplam\u0131) / Ara\xE7 Toplam\u0131 \xB7 Tolerans \xB1%5",
    aside: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 320
      }
    }, /*#__PURE__*/React.createElement(ThresholdMeter, {
      label: d.dShort(son.tarih) + " kütle dengesi",
      value: son.farkPct,
      limit: 5,
      min: -10,
      max: 10
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 26
      }
    }, [["Araç toplamı", d.ni(son.aracToplam) + " kg"], ["Pres toplamı", d.ni(son.presToplam) + " kg"], ["Fark", d.ni(son.fark) + " kg"]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        fontSize: "var(--text-xs)",
        color: "var(--text-subtle)"
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-table-num)",
        fontSize: "var(--text-md)",
        color: "var(--text-primary)",
        marginTop: 2
      }
    }, v)))))
  }), /*#__PURE__*/React.createElement(CardGrid, {
    minWidth: 220
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Saatlik ort. toplam posa",
    value: d.nf(d.genel.posaOrt, 1),
    unit: "t/sa",
    icon: "scale",
    delta: -4.2,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Press 1 saatlik posa",
    value: d.nf(d.presler[0].posaSaatlik, 1),
    unit: "t/sa",
    icon: "factory",
    delta: -2.8,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Press 2 saatlik posa",
    value: d.nf(d.presler[1].posaSaatlik, 1),
    unit: "t/sa",
    icon: "factory",
    delta: 1.4,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. leeching verimi",
    value: d.nf(d.gunluk.reduce((a, r) => a + r.leeching, 0) / d.gunluk.length, 2),
    unit: "%",
    icon: "droplet",
    delta: -0.5,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  })), /*#__PURE__*/React.createElement(SplitRow, {
    ratio: "1.6fr 1fr"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "G\xFCnl\xFCk ara\xE7 vs pres fark\u0131",
    subtitle: "Fark \xB7 %",
    height: 258,
    legend: [{
      label: "Fark %",
      color: "var(--series-1)"
    }, {
      label: "Tolerans ±%5",
      color: "var(--signal-bad)"
    }],
    footer: "Kaynak: \xD6N HATLAR ANAL\u0130Z tablosu \xB7 Kay\u0131t olmayan g\xFCnler grafi\u011Fe dahil edilmez."
  }, /*#__PURE__*/React.createElement(BarChart, {
    labels: aktif.map(r => d.dShort(r.tarih)),
    height: 258,
    limitLine: 5,
    groups: [{
      label: "Fark %",
      points: aktif.map(r => r.farkPct),
      color: "var(--series-1)"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Giren \xFCr\xFCn\xFCn da\u011F\u0131l\u0131m\u0131",
    subtitle: d.dShort(son.tarih) + " · kg",
    icon: "scale"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    size: 156,
    thickness: 20,
    centerValue: "%" + d.nf(son.farkPct, 1),
    centerLabel: "fark",
    slices: [{
      label: "Preslenen",
      value: son.presToplam,
      color: "var(--series-2)"
    }, {
      label: "Fark / posa",
      value: son.fark,
      color: "var(--series-1)"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      minWidth: 0
    }
  }, [["Pres toplamı", son.presToplam, "var(--series-2)"], ["Fark", son.fark, "var(--series-1)"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      font: "var(--type-caption)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: c
    }
  }), l), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-lg)",
      color: "var(--text-primary)"
    }
  }, d.ni(v), " kg"))))))), /*#__PURE__*/React.createElement(Card, {
    title: "\xD6n hatlar analiz \u2014 g\xFCnl\xFCk ara\xE7 vs pres fark\u0131",
    subtitle: "Kaynak tablosunun birebir kar\u015F\u0131l\u0131\u011F\u0131",
    icon: "scale"
  }, /*#__PURE__*/React.createElement(DataTable, {
    keyField: "tarih",
    columns: [{
      key: "tarih",
      header: "Tarih",
      emphasis: true,
      render: r => d.dShort(r.tarih)
    }, {
      key: "aracToplam",
      header: "Araç toplamı (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.aracToplam)
    }, {
      key: "presToplam",
      header: "Pres toplamı (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.presToplam)
    }, {
      key: "fark",
      header: "Fark (kg)",
      numeric: true,
      align: "right",
      emphasis: true,
      render: r => r.aracToplam ? d.ni(r.fark) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-disabled)"
        }
      }, "\u2014")
    }, {
      key: "farkPct",
      header: "Fark %",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => r.aracToplam ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: Math.abs(r.farkPct) > 5 ? "var(--signal-bad)" : "var(--text-body)"
        }
      }, d.nf(r.farkPct, 1)) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-disabled)"
        }
      }, "\u2014")
    }, {
      key: "durum",
      header: "Durum",
      render: r => !r.aracToplam ? /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral",
        size: "sm"
      }, "Kay\u0131t yok") : /*#__PURE__*/React.createElement(Badge, {
        tone: Math.abs(r.farkPct) > 5 ? "bad" : "good",
        size: "sm",
        dot: true
      }, Math.abs(r.farkPct) > 5 ? "Tolerans dışı" : "Tolerans içinde")
    }],
    rows: d.onHatlar,
    footRow: {
      tarih: "Toplam",
      aracToplam: d.ni(d.onHatlar.reduce((a, r) => a + r.aracToplam, 0)),
      presToplam: d.ni(d.onHatlar.reduce((a, r) => a + r.presToplam, 0)),
      fark: d.ni(d.onHatlar.reduce((a, r) => a + r.fark, 0)),
      farkPct: "5,6"
    }
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Batch baz\u0131nda kesinti ve verim kayb\u0131",
    subtitle: "Toplam verim %90'\u0131n alt\u0131ndaki batch'ler",
    icon: "triangle-alert"
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "batch",
    columns: [{
      key: "pres",
      header: "Pres",
      emphasis: true
    }, {
      key: "batch",
      header: "Batch",
      numeric: true,
      align: "right"
    }, {
      key: "tarih",
      header: "Tarih",
      render: r => d.dShort(r.tarih)
    }, {
      key: "fpVerim",
      header: "F/P verim %",
      numeric: true,
      align: "right",
      render: r => d.nf(r.fpVerim, 1)
    }, {
      key: "toplamVerim",
      header: "Toplam verim %",
      numeric: true,
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--signal-bad)"
        }
      }, d.nf(r.toplamVerim, 1))
    }, {
      key: "kesintiSuresi",
      header: "Kesinti %",
      numeric: true,
      align: "right",
      render: r => d.nf(r.kesintiSuresi, 1)
    }, {
      key: "kayip",
      header: "Verim kaybı",
      width: 160,
      render: r => /*#__PURE__*/React.createElement(StatBar, {
        value: 91 - r.toplamVerim,
        max: 10,
        valueLabel: "−" + d.nf(91 - r.toplamVerim, 1) + " p",
        color: "var(--signal-bad)"
      })
    }, {
      key: "notlar",
      header: "Notlar",
      wrap: true,
      render: r => r.notlar || /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-disabled)"
        }
      }, "\u2014")
    }],
    rows: d.batches.filter(b => b.toplamVerim < 90)
  })));
}
Object.assign(window, {
  PosaAnalizi
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/PosaAnalizi.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/PresPerformansi.jsx
try { (() => {
const {
  SectionHeader,
  PageTabs,
  HeroMetric,
  KpiCard,
  ChartCard,
  Card,
  CardGrid,
  SplitRow,
  DataTable,
  Badge,
  Button,
  SegmentedControl,
  StatBar,
  Sparkline,
  TextInput
} = window.RetimPaneliDesignSystem_b437a5;
function PresPerformansi() {
  const d = window.UPData;
  const [tab, setTab] = React.useState("hepsi");
  const [q, setQ] = React.useState("");
  const presAd = tab === "p1" ? "Pres 1" : tab === "p2" ? "Pres 2" : null;
  const rows = d.batches.filter(b => (!presAd || b.pres === presAd) && (q === "" || (b.batch + " " + b.tarih + " " + b.recete).toLowerCase().includes(q.toLowerCase())));
  const avg = (arr, k) => arr.reduce((a, r) => a + r[k], 0) / (arr.length || 1);
  const p = tab === "p2" ? d.presler[1] : d.presler[0];
  const scoped = presAd ? d.batches.filter(b => b.pres === presAd) : d.batches;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Pres Performans\u0131",
    subtitle: "Batch bazında · " + d.batches.length + " batch · 31 Ağu – 4 Eyl 2026",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SegmentedControl, {
      size: "sm",
      value: "Batch",
      onChange: () => {},
      options: ["Batch", "Gün", "Reçete"]
    }), /*#__PURE__*/React.createElement(Button, {
      icon: "download"
    }, "Excel'e Aktar"))
  }), /*#__PURE__*/React.createElement(PageTabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      id: "hepsi",
      label: "Tüm presler",
      count: d.batches.length
    }, {
      id: "p1",
      label: "Pres 1",
      icon: "gauge",
      count: d.batches.filter(b => b.pres === "Pres 1").length
    }, {
      id: "p2",
      label: "Pres 2",
      icon: "gauge",
      count: d.batches.filter(b => b.pres === "Pres 2").length
    }]
  }), presAd ? /*#__PURE__*/React.createElement(HeroMetric, {
    label: presAd + " toplam verimi",
    value: d.nf(avg(scoped, "toplamVerim"), 1),
    unit: "%",
    icon: "gauge",
    status: avg(scoped, "toplamVerim") >= 91 ? "Hedefin üzerinde" : "Hedefin altında",
    statusTone: avg(scoped, "toplamVerim") >= 91 ? "good" : "caution",
    delta: tab === "p1" ? 0.6 : -0.9,
    deltaGoodWhen: "up",
    deltaPeriod: "\xF6nceki g\xFCne g\xF6re",
    note: "Toplam çalışma " + d.nf(p.calisma, 2) + " saat · Giren " + d.nf(p.giren, 1) + " t · Çıkan " + d.nf(p.cikan, 1) + " t · Hedef %91",
    aside: /*#__PURE__*/React.createElement(Sparkline, {
      points: scoped.map(b => b.toplamVerim),
      width: 260,
      height: 64,
      color: tab === "p1" ? "var(--series-1)" : "var(--series-2)"
    })
  }) : /*#__PURE__*/React.createElement(HeroMetric, {
    label: "Ortalama toplam verim",
    value: d.nf(avg(d.batches, "toplamVerim"), 1),
    unit: "%",
    icon: "gauge",
    status: "24 batch tamamland\u0131",
    statusTone: "good",
    delta: 0.4,
    deltaGoodWhen: "up",
    deltaPeriod: "\xF6nceki g\xFCne g\xF6re",
    note: "Ort. F/P verim %" + d.nf(avg(d.batches, "fpVerim"), 1) + " · Ort. F/P performans " + d.nf(avg(d.batches, "fpPerf"), 1) + " t/sa · Ort. batch süresi " + d.nf(avg(d.batches, "sure"), 1) + " dk",
    aside: /*#__PURE__*/React.createElement(Sparkline, {
      points: d.batches.map(b => b.toplamVerim),
      width: 280,
      height: 64
    })
  }), /*#__PURE__*/React.createElement(CardGrid, {
    minWidth: 220
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. F/P verim Q26",
    value: d.nf(avg(scoped, "fpVerim"), 1),
    unit: "%",
    icon: "percent",
    delta: 0.8,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. F/P performans Q27",
    value: d.nf(avg(scoped, "fpPerf"), 1),
    unit: "t/sa",
    icon: "trending-up",
    delta: -2.4,
    deltaGoodWhen: "up",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. batch s\xFCresi",
    value: d.nf(avg(scoped, "sure"), 1),
    unit: "dk",
    icon: "timer",
    delta: -3.1,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ort. kesinti s\xFCresi",
    value: d.nf(avg(scoped, "kesintiSuresi"), 1),
    unit: "%",
    icon: "octagon-pause",
    tone: avg(scoped, "kesintiSuresi") > 5 ? "bad" : "default",
    delta: 18.2,
    deltaGoodWhen: "down",
    deltaPeriod: "\xD6nceki g\xFCne g\xF6re"
  })), /*#__PURE__*/React.createElement(SplitRow, {
    ratio: "1.5fr 1fr"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Batch baz\u0131nda toplam verim",
    subtitle: "%",
    height: 264,
    legend: [{
      label: "Toplam verim",
      color: "var(--series-1)"
    }, {
      label: "F/P verim Q26",
      color: "var(--series-2)"
    }],
    footer: "Hedef %91. Toplam verim %90'\u0131n alt\u0131ndaki batch'ler incelenmelidir."
  }, /*#__PURE__*/React.createElement(BarChart, {
    labels: scoped.map(b => "#" + b.batch),
    height: 264,
    limitLine: 91,
    groups: [{
      label: "Toplam verim",
      points: scoped.map(b => b.toplamVerim),
      color: "var(--series-1)"
    }, {
      label: "F/P verim",
      points: scoped.map(b => b.fpVerim),
      color: "var(--series-2)"
    }]
  })), /*#__PURE__*/React.createElement(ChartCard, {
    title: "F/P performans ve tank s\u0131cakl\u0131\u011F\u0131",
    subtitle: "t/sa \xB7 \xB0C",
    height: 264,
    legend: [{
      label: "F/P performans",
      color: "var(--series-4)"
    }, {
      label: "F tank sıcaklığı",
      color: "var(--series-6)"
    }]
  }, /*#__PURE__*/React.createElement(LineChart, {
    labels: scoped.map(b => "#" + b.batch),
    height: 264,
    area: false,
    series: [{
      label: "F/P performans",
      points: scoped.map(b => b.fpPerf),
      color: "var(--series-4)"
    }, {
      label: "Tank sıcaklığı",
      points: scoped.map(b => b.tank),
      color: "var(--series-6)"
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Batch kay\u0131tlar\u0131",
    subtitle: "GENEL \xB7 F/P FAZI (DOLUM / PRES) \xB7 NW FAZI (YIKAMA) \xB7 TOPLAMLAR",
    icon: "table-2",
    actions: /*#__PURE__*/React.createElement(TextInput, {
      size: "sm",
      icon: "search",
      placeholder: "Batch, tarih veya re\xE7ete ara",
      value: q,
      onChange: setQ,
      style: {
        minWidth: 250
      }
    })
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "batch",
    emptyLabel: "Araman\u0131zla e\u015Fle\u015Fen batch kayd\u0131 yok",
    columns: [{
      key: "pres",
      header: "Pres",
      emphasis: true
    }, {
      key: "batch",
      header: "Batch",
      numeric: true,
      align: "right"
    }, {
      key: "tarih",
      header: "Tarih",
      render: r => d.dShort(r.tarih)
    }, {
      key: "recete",
      header: "Reçete"
    }, {
      key: "baslangic",
      header: "Başlangıç",
      numeric: true,
      align: "right"
    }, {
      key: "bitis",
      header: "Bitiş",
      numeric: true,
      align: "right"
    }, {
      key: "sure",
      header: "Süre (dk)",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => d.nf(r.sure, 1)
    }, {
      key: "dolum",
      header: "F dolum Q15 (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.dolum)
    }, {
      key: "filtrat",
      header: "Filtrat (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.filtrat)
    }, {
      key: "fpVerim",
      header: "F/P verim %",
      numeric: true,
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--signal-" + (d.tone.fpVerim(r.fpVerim) === "bad" ? "bad" : d.tone.fpVerim(r.fpVerim) === "caution" ? "caution" : "good") + ")"
        }
      }, d.nf(r.fpVerim, 1))
    }, {
      key: "fpPerf",
      header: "F/P perf. t/sa",
      numeric: true,
      align: "right",
      render: r => d.nf(r.fpPerf, 1)
    }, {
      key: "tank",
      header: "Tank °C",
      numeric: true,
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: d.tone.tank(r.tank),
        size: "sm"
      }, d.nf(r.tank, 1))
    }, {
      key: "nwCevrim",
      header: "NW çevrim",
      numeric: true,
      align: "right"
    }, {
      key: "nwSu",
      header: "NW su (l)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.nwSu)
    }, {
      key: "toplamVerim",
      header: "Toplam verim %",
      numeric: true,
      align: "right",
      sortable: true,
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: d.tone.toplamVerim(r.toplamVerim),
        size: "sm",
        dot: true
      }, d.nf(r.toplamVerim, 1))
    }, {
      key: "kesintiSuresi",
      header: "Kesinti %",
      numeric: true,
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: d.tone.kesinti(r.kesintiSuresi) === "bad" ? "var(--signal-bad)" : d.tone.kesinti(r.kesintiSuresi) === "caution" ? "var(--signal-caution)" : "var(--text-body)"
        }
      }, d.nf(r.kesintiSuresi, 1))
    }, {
      key: "notlar",
      header: "Notlar",
      wrap: true,
      render: r => r.notlar ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-link)"
        }
      }, r.notlar) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-disabled)"
        }
      }, "\u2014")
    }],
    rows: rows,
    sortKey: "batch",
    sortDir: "asc",
    onSort: () => {},
    footRow: {
      pres: "Toplam · " + rows.length + " batch",
      dolum: d.ni(rows.reduce((a, r) => a + r.dolum, 0)),
      filtrat: d.ni(rows.reduce((a, r) => a + r.filtrat, 0)),
      toplamVerim: d.nf(avg(rows, "toplamVerim"), 1)
    }
  })));
}
Object.assign(window, {
  PresPerformansi
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/PresPerformansi.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/VeriGirisi.jsx
try { (() => {
const {
  SectionHeader,
  Card,
  SplitRow,
  FormGrid,
  Field,
  TextInput,
  Select,
  Checkbox,
  Button,
  Alert,
  Badge,
  DataTable,
  PageTabs,
  ThresholdMeter
} = window.RetimPaneliDesignSystem_b437a5;
const BOS_BATCH = {
  pres: "Pres 1",
  batch: "",
  tarih: "2026-09-04",
  recete: "Enz. 1 Sld. Elma",
  baslangic: "",
  bitis: "",
  dolum: "",
  filtrat: "",
  tank: "",
  nwCevrim: "1",
  nwSu: "1800",
  notlar: ""
};
const BOS_ARAC = {
  tarih: "2026-09-04",
  arac: "",
  urun: "Elma",
  miktar: "",
  baslangic: "",
  bitis: ""
};
function VeriGirisi() {
  const d = window.UPData;
  const [tab, setTab] = React.useState("batch");
  const [b, setB] = React.useState(BOS_BATCH);
  const [a, setA] = React.useState(BOS_ARAC);
  const [onay, setOnay] = React.useState(false);
  const [sonuc, setSonuc] = React.useState(null);
  const [kayitlar, setKayitlar] = React.useState(d.batches.slice(-5).reverse());
  const [aracKayit, setAracKayit] = React.useState(d.trucks.slice(-4).reverse());
  const setBk = k => v => {
    setB(f => ({
      ...f,
      [k]: v
    }));
    setSonuc(null);
  };
  const setAk = k => v => {
    setA(f => ({
      ...f,
      [k]: v
    }));
    setSonuc(null);
  };

  /* batch türetilmiş alanlar */
  const dolum = parseFloat(b.dolum),
    filtrat = parseFloat(b.filtrat);
  const gecerliB = isFinite(dolum) && isFinite(filtrat) && dolum > 0;
  const fpVerim = gecerliB ? filtrat / dolum * 100 : null;
  const filtratHata = gecerliB && filtrat > dolum ? "Filtrat miktarı toplam dolumdan büyük olamaz" : null;
  const gonderB = onay && gecerliB && !filtratHata && b.batch !== "" && b.baslangic !== "" && b.bitis !== "";

  /* araç türetilmiş alanlar */
  const miktar = parseFloat(a.miktar);
  const mins = t => {
    const [h, m] = (t || "").split(":").map(Number);
    return isFinite(h) && isFinite(m) ? h * 60 + m : null;
  };
  const sure = mins(a.bitis) !== null && mins(a.baslangic) !== null ? mins(a.bitis) - mins(a.baslangic) : null;
  const hiz = sure > 0 && isFinite(miktar) ? miktar / sure : null;
  const sureHata = sure !== null && sure <= 0 ? "Bitiş saati başlangıçtan sonra olmalıdır" : null;
  const gonderA = onay && isFinite(miktar) && sure > 0 && !sureHata && a.arac !== "";
  const kaydetBatch = () => {
    setKayitlar(k => [{
      ...b,
      batch: +b.batch,
      tarih: "04/09/2026",
      dolum: dolum,
      filtrat: filtrat,
      fpVerim: +fpVerim.toFixed(1),
      toplamVerim: +(fpVerim + 7).toFixed(1),
      sure: 0,
      kesintiSuresi: 0
    }, ...k]);
    setSonuc({
      tone: "good",
      title: "Batch kaydı eklendi",
      body: "Batch #" + b.batch + " · " + d.ni(dolum) + " kg dolum · F/P verim %" + d.nf(fpVerim, 1) + ". uretim.xlsx güncellendi."
    });
    setB(BOS_BATCH);
    setOnay(false);
  };
  const kaydetArac = () => {
    setAracKayit(k => [{
      ...a,
      tarih: "04/09/2026",
      arac: +a.arac,
      miktar: miktar,
      sure: sure,
      hiz: +hiz.toFixed(2),
      bekleme: null
    }, ...k]);
    setSonuc({
      tone: "good",
      title: "Araç kaydı eklendi",
      body: "Araç " + a.arac + " · " + d.ni(miktar) + " kg · " + d.nf(hiz, 2) + " kg/dk. Araç Takip Tablosu güncellendi."
    });
    setA(BOS_ARAC);
    setOnay(false);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Veri Giri\u015Fi",
    subtitle: "Manuel kay\u0131t \xB7 uretim.xlsx dosyas\u0131na yazar",
    actions: /*#__PURE__*/React.createElement(Button, {
      icon: "file-spreadsheet"
    }, "Dosyay\u0131 A\xE7")
  }), /*#__PURE__*/React.createElement(PageTabs, {
    value: tab,
    onChange: t => {
      setTab(t);
      setOnay(false);
      setSonuc(null);
    },
    tabs: [{
      id: "batch",
      label: "Batch kaydı",
      icon: "gauge"
    }, {
      id: "arac",
      label: "Araç kaydı",
      icon: "truck"
    }]
  }), sonuc && /*#__PURE__*/React.createElement(Alert, {
    tone: sonuc.tone,
    title: sonuc.title,
    onDismiss: () => setSonuc(null)
  }, sonuc.body), /*#__PURE__*/React.createElement(SplitRow, {
    ratio: "1.5fr 1fr"
  }, tab === "batch" ? /*#__PURE__*/React.createElement(Card, {
    title: "Yeni batch kayd\u0131",
    subtitle: "GENEL \xB7 F/P FAZI (DOLUM / PRES) \xB7 NW FAZI (YIKAMA)",
    icon: "square-pen"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(FormGrid, {
    columns: 3
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Pres",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    value: b.pres,
    onChange: setBk("pres"),
    options: ["Pres 1", "Pres 2"],
    icon: "factory"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Batch no",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    placeholder: "25",
    value: b.batch,
    onChange: setBk("batch")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Tarih",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "date",
    value: b.tarih,
    onChange: setBk("tarih")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Re\xE7ete",
    required: true,
    span: 3
  }, /*#__PURE__*/React.createElement(Select, {
    value: b.recete,
    onChange: setBk("recete"),
    options: ["Enz. 1 Sld. Elma", "Enzimli 1 Sld. Elma"]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Ba\u015Flang\u0131\xE7",
    required: true,
    hint: "ss:dd:ss"
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "18:20:00",
    value: b.baslangic,
    onChange: setBk("baslangic"),
    icon: "clock"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Biti\u015F",
    required: true,
    hint: "ss:dd:ss"
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "20:05:00",
    value: b.bitis,
    onChange: setBk("bitis"),
    icon: "clock"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "F tank s\u0131cakl\u0131\u011F\u0131"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    step: "0.1",
    placeholder: "0,0",
    suffix: "\xB0C",
    value: b.tank,
    onChange: setBk("tank")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "F toplam dolum Q15",
    required: true,
    hint: "Kantar / dolum kayd\u0131"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    placeholder: "0",
    suffix: "kg",
    value: b.dolum,
    onChange: setBk("dolum")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "F/P filtrat miktar\u0131",
    required: true,
    error: filtratHata
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    placeholder: "0",
    suffix: "kg",
    value: b.filtrat,
    onChange: setBk("filtrat"),
    invalid: !!filtratHata
  })), /*#__PURE__*/React.createElement(Field, {
    label: "NW \xE7evrim say\u0131s\u0131"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    value: b.nwCevrim,
    onChange: setBk("nwCevrim")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "NW toplam su",
    span: 3
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    suffix: "l",
    value: b.nwSu,
    onChange: setBk("nwSu")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Notlar",
    span: 3,
    hint: "\u0130ste\u011Fe ba\u011Fl\u0131. Ar\u0131za, duru\u015F veya sapma a\xE7\u0131klamas\u0131."
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "\xD6rn. Termik ar\u0131zas\u0131 oldu",
    value: b.notlar,
    onChange: setBk("notlar")
  }))), /*#__PURE__*/React.createElement(Card, {
    inset: true,
    padding: "14px 16px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-muted)"
    }
  }, "Hesaplanan F/P verim Q26"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)",
      fontSize: "var(--text-2xl)",
      letterSpacing: "var(--tracking-metric)",
      color: fpVerim === null ? "var(--text-disabled)" : "var(--signal-" + d.tone.fpVerim(fpVerim) + ")"
    }
  }, fpVerim === null ? "—" : "%" + d.nf(fpVerim, 1))), fpVerim !== null && !filtratHata && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-muted)"
    }
  }, "Posa (fark)"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-xl)",
      color: "var(--text-primary)"
    }
  }, d.ni(dolum - filtrat), " kg")), /*#__PURE__*/React.createElement(Badge, {
    tone: d.tone.fpVerim(fpVerim),
    dot: true
  }, d.tone.fpVerim(fpVerim) === "good" ? "Hedefin üzerinde" : d.tone.fpVerim(fpVerim) === "caution" ? "Hedefe yakın" : "Hedefin altında")))), fpVerim !== null && fpVerim < 83 && !filtratHata && /*#__PURE__*/React.createElement(Alert, {
    tone: "caution",
    title: "F/P verim hedefin alt\u0131nda"
  }, "Kay\u0131t eklenebilir, ancak Pres Performans\u0131 sayfas\u0131nda d\xFC\u015F\xFCk verim olarak i\u015Faretlenir."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      paddingTop: 4,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    id: "onayB",
    checked: onay,
    onChange: setOnay,
    label: "Kayd\u0131 onayl\u0131yorum",
    description: "Veriler uretim.xlsx dosyas\u0131na yaz\u0131l\u0131r ve geri al\u0131namaz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      setB(BOS_BATCH);
      setOnay(false);
      setSonuc(null);
    }
  }, "Temizle"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "save",
    disabled: !gonderB,
    onClick: kaydetBatch
  }, "Kaydet"))))) : /*#__PURE__*/React.createElement(Card, {
    title: "Yeni ara\xE7 kayd\u0131",
    subtitle: "Ara\xE7 takip tablosu",
    icon: "truck"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(FormGrid, {
    columns: 3
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tarih",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "date",
    value: a.tarih,
    onChange: setAk("tarih")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Ara\xE7 no",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    placeholder: "5",
    value: a.arac,
    onChange: setAk("arac"),
    icon: "truck"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\xDCr\xFCn",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    value: a.urun,
    onChange: setAk("urun"),
    options: ["Elma"]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Miktar",
    required: true,
    hint: "Kantar br\xFCt kayd\u0131"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    placeholder: "0",
    suffix: "kg",
    value: a.miktar,
    onChange: setAk("miktar")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Ba\u015Flang\u0131\xE7",
    required: true,
    hint: "ss:dd"
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "15:40",
    value: a.baslangic,
    onChange: setAk("baslangic"),
    icon: "clock"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Biti\u015F",
    required: true,
    error: sureHata
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "16:22",
    value: a.bitis,
    onChange: setAk("bitis"),
    icon: "clock",
    invalid: !!sureHata
  }))), /*#__PURE__*/React.createElement(Card, {
    inset: true,
    padding: "14px 16px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 34,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-muted)"
    }
  }, "Hesaplanan s\xFCre"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)",
      fontSize: "var(--text-2xl)",
      letterSpacing: "var(--tracking-metric)",
      color: sure === null || sure <= 0 ? "var(--text-disabled)" : "var(--text-primary)"
    }
  }, sure === null || sure <= 0 ? "—" : d.nf(sure, 1) + " dk")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-muted)"
    }
  }, "Bo\u015Faltma h\u0131z\u0131"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)",
      fontSize: "var(--text-2xl)",
      letterSpacing: "var(--tracking-metric)",
      color: hiz === null ? "var(--text-disabled)" : "var(--text-primary)"
    }
  }, hiz === null ? "—" : d.nf(hiz, 2) + " kg/dk")), hiz !== null && /*#__PURE__*/React.createElement(Badge, {
    tone: hiz >= 392.52 ? "good" : "caution",
    dot: true
  }, hiz >= 392.52 ? "Ortalamanın üzerinde" : "Ortalamanın altında"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      paddingTop: 4,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    id: "onayA",
    checked: onay,
    onChange: setOnay,
    label: "Kayd\u0131 onayl\u0131yorum",
    description: "Veriler uretim.xlsx dosyas\u0131na yaz\u0131l\u0131r ve geri al\u0131namaz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      setA(BOS_ARAC);
      setOnay(false);
      setSonuc(null);
    }
  }, "Temizle"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "save",
    disabled: !gonderA,
    onClick: kaydetArac
  }, "Kaydet"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dosya durumu",
    subtitle: "uretim.xlsx",
    icon: "file-spreadsheet"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, [["Son okuma", "14:20"], ["Batch kaydı", d.batches.length + " satır"], ["Araç kaydı", d.trucks.length + " satır"], ["Yazma izni", "Var"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      font: "var(--type-caption)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-subtle)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-table-num)",
      fontSize: "var(--text-sm)",
      color: "var(--text-primary)"
    }
  }, v))), /*#__PURE__*/React.createElement(Alert, {
    tone: "info",
    title: "Dosya payla\u015F\u0131ml\u0131"
  }, "Kay\u0131t s\u0131ras\u0131nda dosya ba\u015Fka bir kullan\u0131c\u0131 taraf\u0131ndan a\xE7\u0131k olmamal\u0131d\u0131r."))), /*#__PURE__*/React.createElement(Card, {
    title: "Son kay\u0131tlar",
    subtitle: tab === "batch" ? "Batch" : "Araç",
    icon: "history"
  }, tab === "batch" ? /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "batch",
    columns: [{
      key: "batch",
      header: "Batch",
      numeric: true,
      align: "right",
      emphasis: true
    }, {
      key: "pres",
      header: "Pres"
    }, {
      key: "dolum",
      header: "Dolum (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.dolum)
    }, {
      key: "toplamVerim",
      header: "Verim %",
      numeric: true,
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: d.tone.toplamVerim(r.toplamVerim),
        size: "sm"
      }, d.nf(r.toplamVerim, 1))
    }],
    rows: kayitlar.slice(0, 6)
  }) : /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    keyField: "k",
    columns: [{
      key: "arac",
      header: "Araç",
      numeric: true,
      align: "right",
      emphasis: true
    }, {
      key: "tarih",
      header: "Tarih",
      render: r => d.dShort(r.tarih)
    }, {
      key: "miktar",
      header: "Miktar (kg)",
      numeric: true,
      align: "right",
      render: r => d.ni(r.miktar)
    }, {
      key: "hiz",
      header: "kg/dk",
      numeric: true,
      align: "right",
      render: r => d.nf(r.hiz, 2)
    }],
    rows: aracKayit.slice(0, 6).map(r => ({
      ...r,
      k: r.tarih + "-" + r.arac
    }))
  })))));
}
Object.assign(window, {
  VeriGirisi
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/VeriGirisi.jsx", error: String((e && e.message) || e) }); }

// ui_kits/uretim-paneli/data.js
try { (() => {
/* Real data model, transcribed from the two source tables the plant maintains:
   (1) the batch-level press table, (2) Araç Takip Tablosu.
   Everything else in the panel is derived from these two. */
window.UPData = function () {
  /* --- Table 1: batch-level press stats ---------------------------------- */
  const B = [["Pres 1", 1, "31/08/2026", "Enz. 1 Sld. Elma", "10:17:22", "12:27:54", 130.6, 14903, 12847, 86.2, 14.1, 26.4, 0, 0, 94.0, 35.1, 3.7, 61.2, ""], ["Pres 2", 2, "31/08/2026", "Enzimli 1 Sld. Elma", "11:37:03", "13:22:56", 105.9, 15306, 13099, 85.6, 14.3, 26.9, 1, 2200, 93.7, 12.1, 0.5, 87.4, ""], ["Pres 1", 3, "31/08/2026", "Enz. 1 Sld. Elma", "12:29:22", "14:11:12", 101.9, 13533, 11095, 82.0, 12.5, 26.8, 1, 2200, 91.9, 98.6, 0.0, 1.4, ""], ["Pres 2", 4, "31/08/2026", "Enzimli 1 Sld. Elma", "13:22:56", "15:02:48", 99.8, 14110, 11643, 82.5, 13.4, 27.1, 1, 2200, 92.3, 100.0, 0.0, 0.0, ""], ["Pres 1", 5, "31/08/2026", "Enz. 1 Sld. Elma", "14:12:09", "15:33:06", 81.0, 14632, 12409, 84.8, 11.6, 27.7, 0, 0, 84.8, 98.9, 0.0, 1.1, ""], ["Pres 2", 6, "31/08/2026", "Enzimli 1 Sld. Elma", "15:04:18", "17:12:51", 128.6, 17687, 15517, 87.7, 10.4, 33.0, 1, 2200, 95.0, 97.8, 1.0, 1.2, ""], ["Pres 1", 7, "31/08/2026", "Enz. 1 Sld. Elma", "15:33:12", "17:19:19", 106.1, 17921, 15214, 84.9, 11.3, 29.3, 0, 0, 84.9, 92.3, 7.6, 0.1, ""], ["Pres 1", 8, "03/09/2026", "Enz. 1 Sld. Elma", "9:37:43", "11:17:19", 99.6, 14420, 11971, 83.0, 13.8, 25.8, 1, 2200, 91.9, 96.3, 0.0, 96.3, ""], ["Pres 1", 9, "03/09/2026", "Enz. 1 Sld. Elma", "11:25:51", "13:56:02", 150.2, 14047, 11679, 83.1, 13.5, 24.9, 1, 2200, 92.3, 62.4, 32.2, 5.4, ""], ["Pres 2", 10, "03/09/2026", "Enzimli 1 Sld. Elma", "11:50:16", "13:50:23", 120.1, 12042, 12460, 84.3, 14.0, 19.9, 1, 2200, 93.3, 2.5, 0.5, 97.0, ""], ["Pres 2", 11, "03/09/2026", "Enzimli 1 Sld. Elma", "13:50:40", "16:00:31", 129.8, 11415, 9633, 84.4, 11.1, 26.1, 1, 2200, 93.5, 76.1, 23.7, 0.2, ""], ["Pres 1", 12, "03/09/2026", "Enz. 1 Sld. Elma", "13:56:28", "15:45:47", 109.3, 13787, 11314, 82.1, 13.2, 26.2, 1, 2200, 91.8, 90.2, 9.4, 0.4, ""], ["Pres 1", 13, "03/09/2026", "Enz. 1 Sld. Elma", "15:45:53", "17:25:14", 99.3, 13710, 11231, 81.9, 13.1, 27.0, 1, 2200, 91.7, 99.8, 0.1, 0.1, ""], ["Pres 2", 14, "03/09/2026", "Enzimli 1 Sld. Elma", "16:00:56", "17:40:58", 100.0, 14714, 12062, 82.0, 14.0, 27.6, 1, 2200, 91.9, 99.6, 0.0, 0.4, ""], ["Pres 1", 15, "03/09/2026", "Enz. 1 Sld. Elma", "17:25:20", "19:06:01", 100.7, 14402, 12159, 84.4, 13.6, 29.7, 1, 2200, 92.8, 99.1, 0.7, 0.2, ""], ["Pres 2", 16, "03/09/2026", "Enzimli 1 Sld. Elma", "17:43:18", "20:41:20", 178.0, 20603, 17308, 84.0, 7.1, 28.4, 0, 0, 84.0, 99.3, 0.4, 1.3, ""], ["Pres 1", 17, "04/09/2026", "Enz. 1 Sld. Elma", "10:50:59", "12:39:11", 108.2, 16702, 14484, 86.7, 16.0, 23.0, 1, 1800, 93.8, 20.1, 2.0, 78.0, ""], ["Pres 2", 18, "04/09/2026", "Enzimli 1 Sld. Elma", "10:54:08", "12:46:02", 111.9, 15367, 13130, 85.4, 14.5, 19.5, 1, 1800, 93.5, 10.4, 1.3, 88.3, ""], ["Pres 1", 19, "04/09/2026", "Enz. 1 Sld. Elma", "12:40:40", "14:22:22", 101.7, 13638, 11450, 84.0, 12.9, 21.2, 1, 1800, 92.6, 96.0, 2.5, 1.5, ""], ["Pres 2", 20, "04/09/2026", "Enzimli 1 Sld. Elma", "12:47:48", "14:27:31", 100.1, 14438, 11989, 83.0, 13.8, 23.9, 1, 1800, 92.2, 97.2, 1.1, 1.7, ""], ["Pres 1", 21, "04/09/2026", "Enz. 1 Sld. Elma", "14:22:28", "16:37:51", 135.5, 15858, 13295, 83.8, 9.8, 24.7, 1, 1800, 84.1, 98.9, 1.0, 0.1, ""], ["Pres 2", 22, "04/09/2026", "Enzimli 1 Sld. Elma", "14:27:56", "16:28:33", 120.6, 13834, 11486, 83.0, 13.2, 25.1, 1, 1800, 91.8, 81.7, 17.9, 0.4, "Termik arızası oldu"], ["Pres 2", 23, "04/09/2026", "Enzimli 1 Sld. Elma", "16:30:17", "18:01:27", 91.2, 9799, 8240, 84.1, 9.7, 26.6, 1, 1800, 88.8, 94.9, 3.2, 1.9, ""], ["Pres 1", 24, "04/09/2026", "Enz. 1 Sld. Elma", "16:38:06", "18:13:08", 95.0, 12775, 11126, 87.1, 10.9, 27.5, 1, 900, 88.5, 97.3, 2.4, 0.3, ""]];
  const KEYS = ["pres", "batch", "tarih", "recete", "baslangic", "bitis", "sure", "dolum", "filtrat", "fpVerim", "fpPerf", "tank", "nwCevrim", "nwSu", "toplamVerim", "uretimSuresi", "kesintiSuresi", "kalanSure", "notlar"];
  const batches = B.map(r => Object.fromEntries(KEYS.map((k, i) => [k, r[i]])));

  /* --- Table 2: Araç Takip Tablosu -------------------------------------- */
  const T = [["03/09/2026", 1, "Elma", 25660, "8:22", "9:19", 57.0, 450.18, null], ["03/09/2026", 2, "Elma", 29040, "9:50", "10:52", 62.0, 468.39, 31.0], ["03/09/2026", 3, "Elma", 28460, "10:54", "11:42", 48.0, 592.92, 2.0], ["03/09/2026", 4, "Elma", 26460, "14:23", "15:35", 72.0, 367.50, 161.0], ["03/09/2026", 5, "Elma", 29180, "15:40", "16:22", 42.0, 694.76, 5.0], ["04/09/2026", 1, "Elma", 27640, "8:00", "9:13", 73.0, 378.63, null], ["04/09/2026", 2, "Elma", 30360, "9:15", "11:18", 123.0, 246.83, 2.0], ["04/09/2026", 3, "Elma", 28540, "11:20", "12:25", 65.0, 439.08, 2.0], ["04/09/2026", 4, "Elma", 30580, "12:54", "14:44", 110.0, 278.00, 29.0]];
  const TKEYS = ["tarih", "arac", "urun", "miktar", "baslangic", "bitis", "sure", "hiz", "bekleme"];
  const trucks = T.map(r => Object.fromEntries(TKEYS.map((k, i) => [k, r[i]])));

  /* --- Derived: GÜNLÜK PERFORMANS TREND (TON/SAAT) ---------------------- */
  const gunluk = [{
    gun: "31/08/2026",
    p1Perf: 7.4,
    p2Perf: 7.2,
    toplamPerf: 14.6,
    p1Girdi: 60.99,
    p1Cikti: 51.57,
    p2Girdi: 47.10,
    p2Cikti: 40.26,
    toplamGiren: 108.09,
    toplamCikan: 91.82,
    verim: 84.95,
    leeching: 5.99,
    ortVerim: 91
  }, {
    gun: "03/09/2026",
    p1Perf: 6.3,
    p2Perf: 5.8,
    toplamPerf: 12.1,
    p1Girdi: 70.37,
    p1Cikti: 58.35,
    p2Girdi: 58.77,
    p2Cikti: 51.46,
    toplamGiren: 129.14,
    toplamCikan: 109.82,
    verim: 85.04,
    leeching: 6.43,
    ortVerim: 91
  }, {
    gun: "04/09/2026",
    p1Perf: 6.9,
    p2Perf: 6.3,
    toplamPerf: 13.2,
    p1Girdi: 58.97,
    p1Cikti: 50.36,
    p2Girdi: 53.44,
    p2Cikti: 44.85,
    toplamGiren: 112.41,
    toplamCikan: 95.20,
    verim: 84.69,
    leeching: 5.97,
    ortVerim: 91
  }];

  /* --- Derived: ÖN HATLAR ANALİZ — GÜNLÜK ARAÇ vs PRES FARKI ------------ */
  const onHatlar = [{
    tarih: "01/09/2026",
    aracToplam: 0,
    presToplam: 0,
    fark: 0,
    farkPct: 0
  }, {
    tarih: "02/09/2026",
    aracToplam: 0,
    presToplam: 0,
    fark: 0,
    farkPct: 0
  }, {
    tarih: "03/09/2026",
    aracToplam: 138800,
    presToplam: 129140,
    fark: 9660,
    farkPct: 7.0
  }, {
    tarih: "04/09/2026",
    aracToplam: 117120,
    presToplam: 112411,
    fark: 4709,
    farkPct: 4.0
  }];

  /* --- Derived: dashboard headline figures ------------------------------ */
  const genel = {
    islenen: 349.6,
    ortToplamVerim: 91.2,
    ortBatchSuresi: 115.1,
    cikanOrt: 13.1,
    posaOrt: 2.3
  };
  const presler = [{
    id: "p1",
    ad: "Press 1",
    calisma: 23.65,
    giren: 190.3,
    cikan: 160.3,
    saatlik: 6.8,
    posaSaatlik: 1.3
  }, {
    id: "p2",
    ad: "Press 2",
    calisma: 21.43,
    giren: 159.3,
    cikan: 136.6,
    saatlik: 6.4,
    posaSaatlik: 1.1
  }];

  /* --- Derived: araç istatistikleri ------------------------------------- */
  const aracIstatistik = {
    aracSayisi: 9,
    ortBekleme: 33.1,
    toplamKayip: 232.0,
    ortBosaltma: 72.4,
    ortHiz: 392.52,
    toplamGelen: 255.9
  };
  const aracGunluk = [{
    gun: "03/09/2026",
    miktar: 138.8,
    bekleme: 199,
    presAralik: "11:03:37"
  }, {
    gun: "04/09/2026",
    miktar: 117.1,
    bekleme: 33,
    presAralik: "7:22:09"
  }];

  /* --- Threshold rules, mirroring the workbook's conditional fills ------ */
  const tone = {
    toplamVerim: v => v >= 93 ? "good" : v >= 90 ? "caution" : "bad",
    kesinti: v => v > 10 ? "bad" : v >= 5 ? "caution" : "good",
    tank: v => v <= 23 ? "good" : v <= 28 ? "caution" : "bad",
    fark: v => Math.abs(v) > 5 ? "bad" : "good",
    fpVerim: v => v >= 86 ? "good" : v >= 83 ? "caution" : "bad",
    bekleme: v => v == null ? "neutral" : v > 60 ? "bad" : v > 15 ? "caution" : "good"
  };
  const nf = (v, d = 1) => v == null ? "—" : Number(v).toLocaleString("tr-TR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });
  const ni = v => v == null ? "—" : Number(v).toLocaleString("tr-TR");
  const dShort = t => {
    const [g, a] = t.split("/");
    return g + " " + ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][+a - 1];
  };
  return {
    batches,
    trucks,
    gunluk,
    onHatlar,
    genel,
    presler,
    aracIstatistik,
    aracGunluk,
    tone,
    nf,
    ni,
    dShort
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/uretim-paneli/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.ChartCard = __ds_scope.ChartCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.DeltaChip = __ds_scope.DeltaChip;

__ds_ns.HeroMetric = __ds_scope.HeroMetric;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.StatBar = __ds_scope.StatBar;

__ds_ns.ThresholdMeter = __ds_scope.ThresholdMeter;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.FormGrid = __ds_scope.FormGrid;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.CardGrid = __ds_scope.CardGrid;

__ds_ns.SplitRow = __ds_scope.SplitRow;

__ds_ns.PageTabs = __ds_scope.PageTabs;

__ds_ns.SidebarItem = __ds_scope.SidebarItem;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
