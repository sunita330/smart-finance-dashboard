import { TransactionAPI } from "../api";
import { useAsync } from "../hooks/useAsync";
import { fmt, fmtDate, getIcon, nowYM, pct } from "../utils";
import { ErrorBox, Skeleton, SectionHeader } from "../components/UI";

function InsightCard({ icon, label, value, sub, color, delayClass = "" }) {
  return (
    <div className={`glass-card card-in ${delayClass}`} style={{ padding: "22px 24px", borderTop: `2px solid ${color}70`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -18, right: -10, fontSize: 72, opacity: 0.055, pointerEvents: "none", lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, marginBottom: 7 }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function Insights() {
  const { year, month } = nowYM();

  const summaryQ   = useAsync(() => TransactionAPI.summary({ year, month }),   []);
  const trendQ     = useAsync(() => TransactionAPI.trend({ months: 6 }),       []);
  const breakdownQ = useAsync(() => TransactionAPI.breakdown({ year, month }), []);
  const topExpQ    = useAsync(() => TransactionAPI.top({ limit: 5, type: "expense" }), []);
  const topIncQ    = useAsync(() => TransactionAPI.top({ limit: 5, type: "income"  }), []);

  const summary   = summaryQ.data?.data   || {};
  const trend     = trendQ.data?.data     || [];
  const breakdown = breakdownQ.data?.data || [];
  const topExp    = topExpQ.data?.data    || [];
  const topInc    = topIncQ.data?.data    || [];

  const totalExpense = Number(summary.total_expenses || 0);
  const totalIncome  = Number(summary.total_income   || 0);

  // Derived stats from 6-month trend
  const savings  = trend.map(d => Number(d.income || 0) - Number(d.expenses || 0));
  const bestIdx  = savings.length ? savings.indexOf(Math.max(...savings)) : -1;
  const avgExp   = trend.length ? Math.round(trend.reduce((s, d) => s + Number(d.expenses || 0), 0) / trend.length) : 0;

  const prevExp  = trend.length >= 2 ? Number(trend[trend.length - 2].expenses || 0) : 0;
  const currExp  = trend.length >= 1 ? Number(trend[trend.length - 1].expenses || 0) : 0;
  const expDelta = prevExp > 0 ? Math.round(((currExp - prevExp) / prevExp) * 100) : 0;

  const topCat  = breakdown[0];
  const bestMon = trend[bestIdx];

  // Format month label from "2025-06"
  const fmtMonth = (m) => {
    if (!m) return "—";
    const parts = m.split("-");
    if (parts.length === 2) {
      return new Date(+parts[0], +parts[1] - 1).toLocaleString("default", { month: "long", year: "numeric" });
    }
    return m;
  };

  const insightCards = [
    { icon: "🏆", label: "Top spending category", value: topCat?.name || "—",      sub: topCat ? `${fmt(topCat.total)} this month` : "No data", color: "var(--red)"    },
    { icon: "⭐", label: "Best savings month",     value: bestMon ? fmtMonth(bestMon.month) : "—", sub: bestMon ? `${fmt(savings[bestIdx])} saved` : "No data", color: "var(--green)"  },
    { icon: "📊", label: "Avg monthly expenses",   value: fmt(avgExp),              sub: "Over last 6 months", color: "var(--amber)"  },
    { icon: "📈", label: "MoM expense change",     value: `${expDelta > 0 ? "+" : ""}${expDelta}%`, sub: "vs previous month", color: expDelta > 0 ? "var(--red)" : "var(--green)" },
  ];

  const loading = summaryQ.loading || trendQ.loading;

  return (
    <>
      {/* ── Insight KPI cards ── */}
      <div className="grid-auto" style={{ marginBottom: 24 }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="glass-card no-hover" style={{ padding: "22px 24px" }}>
              <Skeleton h={26} w={40} r={6} style={{ marginBottom: 10 }} />
              <Skeleton h={11} w="60%" r={5} style={{ marginBottom: 8 }} />
              <Skeleton h={22} w="50%" r={6} style={{ marginBottom: 8 }} />
              <Skeleton h={11} w="55%" r={5} />
            </div>
          ))
        ) : insightCards.map((c, i) => (
          <InsightCard key={i} {...c} delayClass={`delay-${i + 1}`} />
        ))}
      </div>

      {/* ── Category breakdown ── */}
      <div className="glass-card card-in delay-5" style={{ padding: "24px 28px", marginBottom: 24 }}>
        <SectionHeader
          title="Category Breakdown"
          subtitle={`${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year} — spending by category`}
        />
        {breakdownQ.loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} h={40} />)}
          </div>
        ) : breakdownQ.error ? (
          <ErrorBox message={breakdownQ.error} onRetry={breakdownQ.refetch} />
        ) : breakdown.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📂</div>
            <h3>No expense data for this month</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {breakdown.map(d => {
              const p = pct(Number(d.total || 0), totalExpense);
              return (
                <div key={d.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{getIcon(d.name)}</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{d.count} txns</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmt(d.total)}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d.color, minWidth: 34, textAlign: "right" }}>{p}%</span>
                    </div>
                  </div>
                  <div style={{ height: 7, background: "var(--surface)", borderRadius: 99, overflow: "hidden" }}>
                    <div className="bar-fill" style={{
                      height: "100%", width: `${p}%`, borderRadius: 99,
                      background: `linear-gradient(90deg,${d.color},${d.color}99)`,
                      boxShadow: `0 0 10px ${d.color}55`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Top transactions ── */}
      <div className="grid-2-eq">
        {/* Top expenses */}
        <div className="glass-card card-in delay-5" style={{ padding: "24px" }}>
          <SectionHeader title="Top Expenses" subtitle="Highest single transactions" />
          {topExpQ.loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} h={46} />)}
            </div>
          ) : topExpQ.error ? (
            <ErrorBox message={topExpQ.error} />
          ) : topExp.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="icon">📭</div><h3>No data</h3>
            </div>
          ) : topExp.map((t, i) => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < topExp.length - 1 ? "1px solid var(--glass-border)" : "none",
            }}>
              <span className="mono" style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 22, fontWeight: 600 }}>#{i + 1}</span>
              <span style={{ fontSize: 17 }}>{getIcon(t.category_name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.category_name} · {fmtDate(t.txn_date)}</div>
              </div>
              <span className="mono" style={{ fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>{fmt(t.amount)}</span>
            </div>
          ))}
        </div>

        {/* Top income */}
        <div className="glass-card card-in delay-6" style={{ padding: "24px" }}>
          <SectionHeader title="Top Income" subtitle="Highest earning transactions" />
          {topIncQ.loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} h={46} />)}
            </div>
          ) : topIncQ.error ? (
            <ErrorBox message={topIncQ.error} />
          ) : topInc.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="icon">📭</div><h3>No data</h3>
            </div>
          ) : topInc.map((t, i) => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < topInc.length - 1 ? "1px solid var(--glass-border)" : "none",
            }}>
              <span className="mono" style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 22, fontWeight: 600 }}>#{i + 1}</span>
              <span style={{ fontSize: 17 }}>{getIcon(t.category_name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.category_name} · {fmtDate(t.txn_date)}</div>
              </div>
              <span className="mono" style={{ fontWeight: 700, color: "var(--green)", flexShrink: 0 }}>+{fmt(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
