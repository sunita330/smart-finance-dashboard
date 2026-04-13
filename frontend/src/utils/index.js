export const fmt = (n) => {
  const num = Math.abs(Number(n) || 0);
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  // Avoid timezone offset issues with DATE strings from MySQL
  const parts = String(d).split("T")[0].split("-");
  if (parts.length === 3) {
    const utc = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    return utc.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const fmtShortDate = (d) => {
  if (!d) return "—";
  const parts = String(d).split("T")[0].split("-");
  if (parts.length === 3) {
    const utc = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    return utc.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const pct = (part, total) =>
  total ? Math.min(100, Math.round((Number(part) / Number(total)) * 100)) : 0;

export const toISODate = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().split("T")[0];
};

export const nowYM = () => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

export const CAT_ICONS = {
  Salary:        "💼",
  Freelance:     "💻",
  Investment:    "📈",
  Housing:       "🏠",
  Food:          "🍔",
  Transport:     "🚌",
  Entertainment: "🎬",
  Health:        "💊",
};

export const getIcon = (name) => CAT_ICONS[name] || "💰";
