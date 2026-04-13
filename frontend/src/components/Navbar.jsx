import { useTheme, useRole } from "../context";

const TABS = [
  { key: "overview",     label: "Overview",     icon: "📊" },
  { key: "transactions", label: "Transactions", icon: "📋" },
  { key: "insights",     label: "Insights",     icon: "💡" },
];

export default function Navbar({ activeTab, onTabChange }) {
  const { dark, toggle } = useTheme();
  const { role, isAdmin, setRole } = useRole();

  return (
    <nav className="navbar">
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, fontSize: 18, flexShrink: 0,
          background: "linear-gradient(135deg,var(--accent),var(--accent-b))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(109,140,255,0.40)",
        }}>
          💹
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <span className="grad-text" style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", display: "block" }}>
            FinanceOS
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em" }}>
            PREMIUM
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar nav-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => onTabChange(t.key)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="btn btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px" }}
        >
          <span style={{ fontSize: 15 }}>{dark ? "☀️" : "🌙"}</span>
          <span style={{ fontSize: 12 }}>{dark ? "Light" : "Dark"}</span>
        </button>

        {/* Role badge */}
        <div style={{
          background: isAdmin ? "rgba(192,132,252,0.15)" : "rgba(109,140,255,0.12)",
          border: `1px solid ${isAdmin ? "rgba(192,132,252,0.35)" : "rgba(109,140,255,0.30)"}`,
          borderRadius: 8, padding: "4px 10px",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
          color: isAdmin ? "var(--purple)" : "var(--accent)",
          whiteSpace: "nowrap",
        }}>
          {isAdmin ? "⚡ ADMIN" : "👁 VIEWER"}
        </div>

        {/* Role selector */}
        <div style={{ position: "relative" }}>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="fin-select"
            style={{ width: "auto", fontSize: 12, paddingRight: 28 }}
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--text-muted)" }}>▼</span>
        </div>
      </div>
    </nav>
  );
}
