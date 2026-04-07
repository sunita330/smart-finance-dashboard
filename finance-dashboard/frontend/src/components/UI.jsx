import { fmt } from "../utils";

/* ── Skeleton loader ─────────────────────────────────────────────────────── */
export function Skeleton({ h = 20, w = "100%", r = 8, style = {} }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="glass-card no-hover" style={{ padding:"22px 24px" }}>
      <Skeleton h={11} w="55%" r={6} style={{ marginBottom:12 }} />
      <Skeleton h={28} w="70%" r={8} style={{ marginBottom:14 }} />
      <Skeleton h={11} w="40%" r={6} />
    </div>
  );
}

/* ── Error box ───────────────────────────────────────────────────────────── */
export function ErrorBox({ message, onRetry }) {
  return (
    <div className="glass-card no-hover error-state" style={{ padding:"40px 24px" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
      <div style={{ fontSize:15, fontWeight:600, color:"var(--red)", marginBottom:8 }}>Failed to load</div>
      <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:16 }}>{message}</div>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} style={{ fontSize:12 }}>Try again</button>
      )}
    </div>
  );
}

/* ── Sparkline ───────────────────────────────────────────────────────────── */
export function Sparkline({ data = [], color = "#6d8cff", w = 110, h = 38 }) {
  if (!data.length) return null;
  const nums = data.map(Number);
  const max = Math.max(...nums), min = Math.min(...nums), range = max - min || 1;
  const pts = nums.map((v, i) => [
    ((i / (nums.length - 1)) * w).toFixed(1),
    (h - ((v - min) / range) * (h - 7) - 3).toFixed(1),
  ]);
  const linePts = pts.map(p => p.join(",")).join(" ");
  const fillPts = [`0,${h}`, ...pts.map(p => p.join(",")), `${w},${h}`].join(" ");
  const gId = `sg${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gId})`}/>
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"
        style={{ strokeDasharray:300, animation:"drawLine 1.1s ease both" }}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

/* ── Summary card ────────────────────────────────────────────────────────── */
export function SummaryCard({ label, value, delta, color, icon, spark, delayClass = "" }) {
  const pos = delta >= 0;
  return (
    <div className={`glass-card card-in ${delayClass}`} style={{ padding:"22px 24px", position:"relative", overflow:"hidden" }}>
      {/* top shimmer */}
      <div className="card-shimmer" style={{ background:`linear-gradient(90deg,transparent,${color}55,transparent)` }}/>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600, marginBottom:7 }}>{label}</div>
          <div className="mono grad-text" style={{ fontSize:27, fontWeight:700, letterSpacing:"-0.03em", background:`linear-gradient(135deg,${color},${color}99)` }}>
            {value}
          </div>
        </div>
        <div style={{
          width:44, height:44, borderRadius:12, fontSize:20, flexShrink:0,
          background:`${color}1e`, border:`1px solid ${color}40`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{icon}</div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        {delta !== undefined ? (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:18, height:18, borderRadius:"50%", fontSize:9,
              background: pos ? "var(--green-dim)" : "var(--red-dim)",
              color: pos ? "var(--green)" : "var(--red)",
            }}>{pos?"▲":"▼"}</span>
            <span style={{ fontSize:12, color: pos?"var(--green)":"var(--red)", fontWeight:600 }}>
              {Math.abs(delta)}% vs last mo
            </span>
          </div>
        ) : <div/>}
        {spark && <Sparkline data={spark} color={color}/>}
      </div>
    </div>
  );
}

/* ── Cat badge ───────────────────────────────────────────────────────────── */
export function CatBadge({ name, color }) {
  return (
    <span style={{
      background:`${color || "var(--accent)"}22`,
      color: color || "var(--accent)",
      border:`1px solid ${color || "var(--accent)"}44`,
      borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600,
    }}>{name}</span>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
