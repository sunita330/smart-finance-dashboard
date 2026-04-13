import { useState } from "react";
import { ThemeProvider, ToastProvider, RoleProvider } from "./context";
import Navbar     from "./components/Navbar";
import Overview   from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Insights   from "./pages/Insights";

const PAGE_META = {
  overview:     { title: "Dashboard Overview",  sub: "Your financial snapshot"       },
  transactions: { title: "All Transactions",    sub: "Browse, search, and manage"    },
  insights:     { title: "Spending Insights",   sub: "Patterns and observations"     },
};

function Dashboard() {
  const [tab, setTab] = useState("overview");
  const { title, sub } = PAGE_META[tab];

  return (
    <div className="app-bg">
      {/* Animated gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Navbar activeTab={tab} onTabChange={setTab} />

      <main className="main-content">
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="grad-text" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {sub}
            <span style={{
              background: "var(--green-dim)", color: "var(--green)",
              borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <span className="pulse-dot" style={{ background: "var(--green)" }} />
              Live
            </span>
          </p>
        </div>

        {/* Mobile tab bar */}
        <div style={{ display: "none" }} className="mobile-tabs">
          {/* hidden — rendered in Navbar for desktop */}
        </div>

        {tab === "overview"      && <Overview     onViewAll={() => setTab("transactions")} />}
        {tab === "transactions"  && <Transactions />}
        {tab === "insights"      && <Insights     />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ToastProvider>
          <Dashboard />
        </ToastProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
