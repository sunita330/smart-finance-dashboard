import { useMemo } from "react";
import { TransactionAPI } from "../api";
import { useAsync } from "../hooks/useAsync";
import { fmt, fmtShortDate, getIcon, now, pct } from "../utils";
import { SummaryCard, ErrorBox, CardSkeleton, Skeleton, SectionHeader, CatBadge } from "../components/UI";
import { BarChart, DonutChart } from "../components/Charts";

export default function Overview({ onViewAll }) {
  const { year, month } = now();

  const summaryQ   = useAsync(() => TransactionAPI.summary({ year, month }), []);
  const trendQ     = useAsync(() => TransactionAPI.trend({ months: 6 }), []);
  const breakdownQ = useAsync(() => TransactionAPI.breakdown({ year, month }), []);
  const recentQ    = useAsync(() => TransactionAPI.getAll({ sort:"txn_date", order:"DESC", limit:6 }), []);

  const summary   = summaryQ.data?.data;
  const trend     = trendQ.data?.data || [];
  const breakdown = breakdownQ.data?.data || [];
  const recent    = recentQ.data?.data || [];

  const trendIncome   = trend.map(d => Number(d.income));
  const trendExpenses = trend.map(d => Number(d.expenses));
  const trendSavings  = trend.map((d, i) => Number(d.income) - Number(d.expenses));

  // Format trend for bar chart
  const barData = trend.map(d => ({
    month:    d.month?.slice(5) || d.month, // "2025-06" → "06"
    income:   Number(d.income),
    expenses: Number(d.expenses),
  }));

  const totalExpense = Number(summary?.total_expenses || 0);
  const totalIncome  = Number(summary?.total_income   || 0);
  const balance      = Number(summary?.balance        || 0);
  const savingsRate  = totalIncome ? Math.round((balance / totalIncome) * 100) : 0;

  return (
    <>
      {/* ── Summary cards ── */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {summaryQ.loading ? (
          [1,2,3,4].map(i => <CardSkeleton key={i}/>)
        ) : summaryQ.error ? (
          <ErrorBox message={summaryQ.error} onRetry={summaryQ.refetch}/>
        ) : (
          <>
            <SummaryCard label="Total Balance"  value={fmt(balance)}      color="var(--green)"  icon="💰" delta={8}  spark={trendSavings}  delayClass="delay-1"/>
            <SummaryCard label="Monthly Income"  value={fmt(totalIncome)}  color="var(--accent)" icon="📥" delta={4}  spark={trendIncome}   delayClass="delay-2"/>
            <SummaryCard label="Total Expenses"  value={fmt(totalExpense)} color="var(--red)"    icon="📤" delta={-3} spark={trendExpenses} delayClass="delay-3"/>
            <SummaryCard label="Savings Rate"    value={savingsRate + "%"} color="var(--purple)" icon="🎯" delta={2}  delayClass="delay-4"/>
          </>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Bar chart */}
        <div className="glass-card card-in delay-5" style={{ padding:"24px 28px" }}>
          <SectionHeader
            title="Income vs Expenses"
            subtitle="6-month overview"
            right={
              <div style={{ display:"flex", gap:14 }}>
                {[{l:"Income",c:"var(--green)"},{l:"Expenses",c:"var(--red)"}].map(({l,c}) => (
                  <span key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-muted)" }}>
                    <span style={{ width:10, height:10, borderRadius:3, background:c, display:"inline-block" }}/>
                    {l}
                  </span>
                ))}
              </div>
            }
          />
          {trendQ.loading ? <Skeleton h={160}/> : <BarChart data={barData}/>}
        </div>

        {/* Donut */}
        <div className="glass-card card-in delay-5" style={{ padding:"24px" }}>
          <SectionHeader title="Spending Breakdown" subtitle={`${new Date().toLocaleString("default",{month:"long"})} ${year}`}/>
          {breakdownQ.loading ? (
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <Skeleton h={170} w={170} r={999}/>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h={12}/>)}
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <DonutChart data={breakdown} total={totalExpense}/>
              <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8 }}>
                {breakdown.slice(0,5).map(d => (
                  <div key={d.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
                    </div>
                    <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", flexShrink:0 }}>{fmt(d.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div className="glass-card card-in delay-6" style={{ padding:"24px 28px" }}>
        <SectionHeader
          title="Recent Transactions"
          subtitle="Latest activity"
          right={<button className="btn btn-ghost" onClick={onViewAll} style={{ fontSize:12 }}>View all →</button>}
        />

        {recentQ.loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} h={52}/>)}
          </div>
        ) : recentQ.error ? (
          <ErrorBox message={recentQ.error} onRetry={recentQ.refetch}/>
        ) : recent.length === 0 ? (
          <div className="empty-state"><div className="icon">📭</div><h3>No transactions yet</h3></div>
        ) : (
          recent.map(t => (
            <div key={t.id} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 14px", borderRadius:12, margin:"0 -14px",
              transition:"background var(--transition)", cursor:"default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--glass-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{
                  width:40, height:40, borderRadius:12, fontSize:18, flexShrink:0,
                  background:`${t.category_color || "var(--accent)"}22`,
                  border:`1px solid ${t.category_color || "var(--accent)"}44`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{getIcon(t.category_name)}</div>
                <div>
                  <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize:14 }}>{t.description}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
                    {fmtShortDate(t.txn_date)} · {t.category_name}
                  </div>
                </div>
              </div>
              <span className="mono" style={{ fontWeight:700, fontSize:15, color: t.type==="income" ? "var(--green)" : "var(--red)" }}>
                {t.type==="income" ? "+" : "-"}{fmt(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
