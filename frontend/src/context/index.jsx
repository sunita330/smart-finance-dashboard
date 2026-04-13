import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

/* ── Theme ──────────────────────────────────────────────────────────────────── */
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("fin-theme");
      return saved ? saved === "dark" : true;
    } catch { return true; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("fin-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(v => !v) }}>
      {children}
    </ThemeCtx.Provider>
  );
}
export const useTheme = () => useContext(ThemeCtx);

/* ── Toast ──────────────────────────────────────────────────────────────────── */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const push = useCallback((msg, type = "info") => {
    const key = ++counter.current;
    setToasts(prev => [...prev, { key, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.key !== key)), 3200);
  }, []);

  const toast = {
    success: (m) => push(m, "success"),
    error:   (m) => push(m, "error"),
    warn:    (m) => push(m, "warn"),
    info:    (m) => push(m, "info"),
  };

  const ICONS  = { success: "✓", error: "✕", warn: "⚠", info: "ℹ" };
  const COLORS = { success: "var(--green)", error: "var(--red)", warn: "var(--amber)", info: "var(--accent)" };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:28, right:24, zIndex:1000, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
        {toasts.map(t => (
          <div key={t.key} className="toast" style={{
            background: "var(--glass)",
            border: `1px solid var(--glass-border)`,
            borderLeft: `3px solid ${COLORS[t.type]}`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "var(--text-primary)",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "var(--shadow)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 220,
            maxWidth: 340,
            fontFamily: "var(--font-body)",
          }}>
            <span style={{ color: COLORS[t.type], fontSize: 15, flexShrink: 0 }}>{ICONS[t.type]}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ── Role ───────────────────────────────────────────────────────────────────── */
const RoleCtx = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState("viewer");
  return (
    <RoleCtx.Provider value={{ role, isAdmin: role === "admin", setRole }}>
      {children}
    </RoleCtx.Provider>
  );
}
export const useRole = () => useContext(RoleCtx);
