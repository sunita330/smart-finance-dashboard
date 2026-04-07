export const fmt = (n) =>
  "$" + Math.abs(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtShortDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const pct = (part, total) =>
  total ? Math.round((part / total) * 100) : 0;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const toISO = (d) => new Date(d).toISOString().split("T")[0];

export const now = () => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

export const CAT_ICONS = {
  Salary: "💼", Freelance: "💻", Investment: "📈",
  Housing: "🏠", Food: "🍔", Transport: "🚌",
  Entertainment: "🎬", Health: "💊",
};

export const getIcon = (name) => CAT_ICONS[name] || "💰";
