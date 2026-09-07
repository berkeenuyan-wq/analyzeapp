/* Data-driven SVG plots for the kit. Real charts in the app come from the
   Streamlit chart layer; these mirror their geometry and colours. */

function scale(vals, h, pad = 8) {
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = (hi - lo) || 1;
  return v => h - pad - ((v - lo) / span) * (h - pad * 2);
}

function LineChart({ series = [], labels = [], height = 260, yTicks = 4, area = true }) {
  const W = 1000, H = height;
  const all = series.flatMap(s => s.points);
  const lo = Math.min(...all), hi = Math.max(...all);
  const padT = 10, padB = 26, padL = 44, padR = 8;
  const y = v => padT + (1 - (v - lo) / ((hi - lo) || 1)) * (H - padT - padB);
  const x = i => padL + (i / Math.max(1, labels.length - 1)) * (W - padL - padR);
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => lo + ((hi - lo) / yTicks) * i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fill="var(--chart-axis)" style={{ font: "500 11px var(--font-mono)" }}>{Math.round(t)}</text>
        </g>
      ))}
      {series.map((s, si) => {
        const d = s.points.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join(" ");
        return (
          <g key={s.label}>
            {area && <path d={`${d} L${x(s.points.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z`} fill={s.color} opacity="0.10" />}
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {s.points.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === s.points.length - 1 ? 4 : 2.5} fill={s.color} stroke="var(--surface-card)" strokeWidth="1.5" />)}
          </g>
        );
      })}
      {labels.map((l, i) => <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fill="var(--chart-axis)" style={{ font: "400 11px var(--font-sans)" }}>{l}</text>)}
    </svg>
  );
}

function BarChart({ groups = [], labels = [], height = 260, stacked = false, limitLine }) {
  const W = 1000, H = height, padT = 10, padB = 26, padL = 44, padR = 8;
  const totals = labels.map((_, i) => stacked ? groups.reduce((a, g) => a + g.points[i], 0) : Math.max(...groups.map(g => g.points[i])));
  const hi = Math.max(...totals, limitLine ? limitLine * 1.4 : 0) * 1.08;
  const y = v => padT + (1 - v / hi) * (H - padT - padB);
  const bandW = (W - padL - padR) / labels.length;
  const barW = stacked ? bandW * 0.44 : (bandW * 0.62) / groups.length;
  const ticks = Array.from({ length: 5 }, (_, i) => (hi / 4) * i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fill="var(--chart-axis)" style={{ font: "500 11px var(--font-mono)" }}>{Math.round(t)}</text>
        </g>
      ))}
      {limitLine !== undefined && (
        <g>
          <line x1={padL} x2={W - padR} y1={y(limitLine)} y2={y(limitLine)} stroke="var(--signal-bad)" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.8" />
          <text x={W - padR} y={y(limitLine) - 7} textAnchor="end" fill="var(--signal-bad)" style={{ font: "600 11px var(--font-sans)" }}>Tolerans %{limitLine}</text>
        </g>
      )}
      {labels.map((l, i) => {
        let acc = 0;
        return (
          <g key={l}>
            {groups.map((g, gi) => {
              const v = g.points[i];
              const top = stacked ? y(acc + v) : y(v);
              const hgt = stacked ? y(acc) - y(acc + v) : (H - padB) - y(v);
              const cx = stacked
                ? padL + bandW * i + bandW / 2 - barW / 2
                : padL + bandW * i + (bandW - barW * groups.length) / 2 + barW * gi;
              acc += v;
              return <rect key={g.label} x={cx} y={top} width={barW} height={Math.max(0, hgt)} rx="3" fill={g.color} />;
            })}
            <text x={padL + bandW * i + bandW / 2} y={H - 6} textAnchor="middle" fill="var(--chart-axis)" style={{ font: "400 11px var(--font-sans)" }}>{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ slices = [], size = 168, thickness = 22, centerLabel, centerValue }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth={thickness} />
        {slices.map(s => {
          const len = (s.value / total) * c;
          const el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${len - 2} ${c - len + 2}`} strokeDashoffset={-acc} strokeLinecap="butt" />;
          acc += len;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ font: "var(--type-metric)", fontSize: "var(--text-2xl)", color: "var(--text-primary)", letterSpacing: "var(--tracking-metric)" }}>{centerValue}</span>
        <span style={{ font: "var(--type-caption)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>{centerLabel}</span>
      </div>
    </div>
  );
}

Object.assign(window, { LineChart, BarChart, Donut, scale });
