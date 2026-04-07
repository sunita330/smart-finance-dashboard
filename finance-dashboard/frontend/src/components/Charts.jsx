import { useState } from "react";
import { fmt } from "../utils";

/* ── Bar chart ────────────────────────────────────────────────────────────── */
export function BarChart({ data = [] }) {
  // data: [{ month, income, expenses }]
  if (!data.length) return <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:13 }}>No trend data</div>;

  const maxVal = Math.max(...data.flatMap(d => [Number(d.income), Number(d.expenses)])) || 1;
  const W = 500, H = 160, barW = 22, gap = 6;
  const groupW = (W - 32) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H + 34}`} width="100%" style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="bInc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green)"/>
          <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.55"/>
        </linearGradient>
        <linearGradient id="bExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--red)"/>
          <stop offset="100%" stopColor="var(--red)" stopOpacity="0.45"/>
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1="16" y1={H * (1 - f)} x2={W - 8} y2={H * (1 - f)}
          stroke="var(--glass-border)" strokeWidth="0.5" strokeDasharray="4 4"/>
      ))}

      {data.map((d, i) => {
        const inc = Number(d.income || 0);
        const exp = Number(d.expenses || 0);
        const incH = (inc / maxVal) * H;
        const expH = (exp / maxVal) * H;
        const cx   = 16 + i * groupW + groupW / 2;
        const x1   = cx - barW - gap / 2;
        const x2   = cx + gap / 2;
        const label = d.month || d.label || `M${i + 1}`;

        return (
          <g key={i}>
            <rect x={x1} y={H - incH} width={barW} height={incH} rx="4" fill="url(#bInc)"
              style={{ transformOrigin:`${x1}px ${H}px`, animation:`fillBar 0.75s ${i*0.07}s cubic-bezier(.22,.68,0,1) both` }}/>
            <rect x={x2} y={H - expH} width={barW} height={expH} rx="4" fill="url(#bExp)"
              style={{ transformOrigin:`${x2}px ${H}px`, animation:`fillBar 0.75s ${i*0.07+0.04}s cubic-bezier(.22,.68,0,1) both` }}/>
            <text x={cx} y={H + 20} textAnchor="middle"
              fill="var(--text-muted)" fontSize="11" fontFamily="Outfit,sans-serif">{label}</text>
          </g>
        );
      })}

      <line x1="14" y1={H} x2={W - 6} y2={H} stroke="var(--glass-border)" strokeWidth="1"/>
    </svg>
  );
}

/* ── Donut chart ─────────────────────────────────────────────────────────── */
export function DonutChart({ data = [], total = 0 }) {
  const [hov, setHov] = useState(null);
  if (!data.length) return (
    <div style={{ width:170, height:170, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>No data</div>
  );

  const R = 72, r = 46, cx = 90, cy = 90;
  let angle = -Math.PI / 2;

  const slices = data.map((d, idx) => {
    const val   = Number(d.total || d.value || 0);
    const sweep = (val / (total || 1)) * 2 * Math.PI || 0.001;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2  = cx + R * Math.cos(angle);
    const y2  = cy + R * Math.sin(angle);
    const ix1 = cx + r * Math.cos(angle - sweep);
    const iy1 = cy + r * Math.sin(angle - sweep);
    const ix2 = cx + r * Math.cos(angle);
    const iy2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${ix2.toFixed(2)} ${iy2.toFixed(2)} A${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
    return { ...d, path, val, pct: Math.round((val / (total || 1)) * 100), idx };
  });

  const active = hov !== null ? slices[hov] : null;

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" style={{ flexShrink:0 }}>
      <defs>
        {slices.map(s => (
          <filter key={s.idx} id={`dg${s.idx}`}>
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={s.color} floodOpacity="0.65"/>
          </filter>
        ))}
      </defs>

      {slices.map(s => (
        <path key={s.idx} d={s.path} fill={s.color}
          opacity={hov === null || hov === s.idx ? 0.92 : 0.28}
          filter={hov === s.idx ? `url(#dg${s.idx})` : undefined}
          style={{ cursor:"pointer", transition:"opacity .2s, filter .2s" }}
          onMouseEnter={() => setHov(s.idx)}
          onMouseLeave={() => setHov(null)}/>
      ))}

      <circle cx={cx} cy={cy} r={r - 2} fill="var(--glass)" style={{ backdropFilter:"blur(8px)" }}/>

      {active ? (
        <>
          <text x={cx} y={cy-10} textAnchor="middle" fill={active.color} fontSize="12" fontWeight="700" fontFamily="Outfit">{active.name || active.category_name}</text>
          <text x={cx} y={cy+8}  textAnchor="middle" fill="var(--text-primary)" fontSize="15" fontWeight="700" fontFamily="JetBrains Mono,monospace">{fmt(active.val)}</text>
          <text x={cx} y={cy+24} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Outfit">{active.pct}%</text>
        </>
      ) : (
        <>
          <text x={cx} y={cy-5}  textAnchor="middle" fill="var(--text-primary)" fontSize="17" fontWeight="700" fontFamily="JetBrains Mono,monospace">{fmt(total)}</text>
          <text x={cx} y={cy+13} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Outfit">total spend</text>
        </>
      )}
    </svg>
  );
}
