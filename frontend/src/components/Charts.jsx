import { useState } from "react";
import { fmt } from "../utils";

/* ── Bar Chart ────────────────────────────────────────────────────────────── */
export function BarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        No trend data available
      </div>
    );
  }

  const allVals = data.flatMap(d => [Number(d.income || 0), Number(d.expenses || 0)]);
  const maxVal  = Math.max(...allVals, 1);
  const W = 500, H = 160;
  const groupW  = (W - 32) / data.length;
  const barW    = Math.min(22, groupW * 0.38);
  const gap     = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H + 34}`} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="barInc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green)" />
          <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="barExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--red)" />
          <stop offset="100%" stopColor="var(--red)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f}
          x1="14" y1={H * (1 - f)}
          x2={W - 8} y2={H * (1 - f)}
          stroke="var(--glass-border)" strokeWidth="0.5" strokeDasharray="4 4"
        />
      ))}

      {data.map((d, i) => {
        const inc  = Number(d.income   || 0);
        const exp  = Number(d.expenses || 0);
        const incH = (inc / maxVal) * H;
        const expH = (exp / maxVal) * H;
        const cx   = 16 + i * groupW + groupW / 2;
        const x1   = cx - barW - gap / 2;
        const x2   = cx + gap / 2;
        // Month label: "2025-06" → "Jun"
        const raw   = d.month || `M${i + 1}`;
        const parts = raw.split("-");
        const label = parts.length === 2
          ? new Date(+parts[0], +parts[1] - 1).toLocaleString("default", { month: "short" })
          : raw;

        return (
          <g key={i}>
            <rect
              x={x1} y={H - incH} width={barW} height={Math.max(incH, 1)} rx="4"
              fill="url(#barInc)"
              style={{ transformOrigin: `${x1}px ${H}px`, animation: `fillBar 0.75s ${i * 0.07}s cubic-bezier(.22,.68,0,1) both` }}
            />
            <rect
              x={x2} y={H - expH} width={barW} height={Math.max(expH, 1)} rx="4"
              fill="url(#barExp)"
              style={{ transformOrigin: `${x2}px ${H}px`, animation: `fillBar 0.75s ${i * 0.07 + 0.04}s cubic-bezier(.22,.68,0,1) both` }}
            />
            <text x={cx} y={H + 20} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Outfit,sans-serif">
              {label}
            </text>
          </g>
        );
      })}

      <line x1="14" y1={H} x2={W - 8} y2={H} stroke="var(--glass-border)" strokeWidth="1" />
    </svg>
  );
}

/* ── Donut Chart ──────────────────────────────────────────────────────────── */
export function DonutChart({ data = [], total = 0 }) {
  const [hov, setHov] = useState(null);

  if (!data.length) {
    return (
      <div style={{ width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
        No data
      </div>
    );
  }

  const R = 72, r = 46, cx = 90, cy = 90;
  let angle = -Math.PI / 2;

  const slices = data.map((d, idx) => {
    const val   = Number(d.total || d.value || 0);
    const sweep = total > 0 ? (val / total) * 2 * Math.PI : 0.001;
    const sa    = angle;
    angle += sweep;
    const ea = angle;

    const x1  = cx + R * Math.cos(sa), y1  = cy + R * Math.sin(sa);
    const x2  = cx + R * Math.cos(ea), y2  = cy + R * Math.sin(ea);
    const ix1 = cx + r * Math.cos(sa), iy1 = cy + r * Math.sin(sa);
    const ix2 = cx + r * Math.cos(ea), iy2 = cy + r * Math.sin(ea);
    const large = sweep > Math.PI ? 1 : 0;

    const path =
      `M${x1.toFixed(2)} ${y1.toFixed(2)} ` +
      `A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} ` +
      `L${ix2.toFixed(2)} ${iy2.toFixed(2)} ` +
      `A${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;

    return {
      ...d,
      path,
      val,
      pct: total > 0 ? Math.round((val / total) * 100) : 0,
      idx,
    };
  });

  const active = hov !== null ? slices[hov] : null;

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" style={{ flexShrink: 0 }}>
      <defs>
        {slices.map(s => (
          <filter key={s.idx} id={`dg${s.idx}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={s.color || "#6d8cff"} floodOpacity="0.65" />
          </filter>
        ))}
      </defs>

      {slices.map(s => (
        <path
          key={s.idx}
          d={s.path}
          fill={s.color || "#6d8cff"}
          opacity={hov === null || hov === s.idx ? 0.92 : 0.28}
          filter={hov === s.idx ? `url(#dg${s.idx})` : undefined}
          style={{ cursor: "pointer", transition: "opacity .2s, filter .2s" }}
          onMouseEnter={() => setHov(s.idx)}
          onMouseLeave={() => setHov(null)}
        />
      ))}

      <circle cx={cx} cy={cy} r={r - 2} fill="var(--glass)" />

      {active ? (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fill={active.color || "var(--accent)"} fontSize="12" fontWeight="700" fontFamily="Outfit,sans-serif">
            {active.name || active.category_name || ""}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-primary)" fontSize="15" fontWeight="700" fontFamily="JetBrains Mono,monospace">
            {fmt(active.val)}
          </text>
          <text x={cx} y={cy + 24} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Outfit,sans-serif">
            {active.pct}%
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-primary)" fontSize="17" fontWeight="700" fontFamily="JetBrains Mono,monospace">
            {fmt(total)}
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Outfit,sans-serif">
            total spend
          </text>
        </>
      )}
    </svg>
  );
}
