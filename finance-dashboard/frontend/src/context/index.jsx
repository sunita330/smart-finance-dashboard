import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

/* ─── Theme ─────────────────────────────────────────────────────────────────── */
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("fin-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("fin-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(v => !v) }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

/* ─── Toast ─────────────────────────────────────────────────────────────────── */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);

  const push = useCallback((msg, type = "info") => {
    const key = ++id.current;
    setToasts(t => [...t, { key, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.key !== key)), 3000);
  }, []);

  const ICONS = { success: "✓", error: "✕", info: "ℹ", warn: "⚠" };
  const COLORS = {
    success: "var(--green)",
    error:   "var(--red)",
    info:    "var(--accent)",
    warn:    "var(--amber)",
  };

  return (
    <ToastCtx.Provider value={{ success: m => push(m,"success"), error: m => push(m,"error"), info: m => push(m,"info"), warn: m => push(m,"warn") }}>
      {children}
      <div style={{ position:"fixed", bottom:28, right:24, zIndex:1000, display:"flex", flexDirection:"column", gap:10 }}>
        {toasts.map(t => (
          <div key={t.key} className="toast" style={{
            background:"var(--glass)", border:`1px solid var(--glass-border)`,
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
            color:"var(--text-primary)", padding:"12px 20px", borderRadius:12,
            fontSize:13, fontWeight:600, boxShadow:"var(--shadow)",
            display:"flex", alignItems:"center", gap:10, minWidth:220,
            borderLeft:`3px solid ${COLORS[t.type]}`,
          }}>
            <span style={{ color: COLORS[t.type], fontSize:15 }}>{ICONS[t.type]}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ─── Role ──────────────────────────────────────────────────────────────────── */
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
