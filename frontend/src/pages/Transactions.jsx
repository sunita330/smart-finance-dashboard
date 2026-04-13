import { useState, useCallback } from "react";
import { TransactionAPI, CategoryAPI } from "../api";
import { useAsync, useDebounce } from "../hooks/useAsync";
import { useRole, useToast } from "../context";
import { fmt, fmtDate, getIcon } from "../utils";
import { ErrorBox, Skeleton, CatBadge } from "../components/UI";
import TransactionForm from "../components/TransactionForm";

const SORT_FIELDS = [
  { key: "txn_date",    label: "Date"        },
  { key: "description", label: "Description" },
  { key: "category",    label: "Category"    },
  { key: "type",        label: "Type"        },
  { key: "amount",      label: "Amount"      },
];

export default function Transactions() {
  const { isAdmin } = useRole();
  const toast       = useToast();

  const [search,     setSearch]   = useState("");
  const [filterType, setType]     = useState("all");
  const [sort,       setSort]     = useState("txn_date");
  const [order,      setOrder]    = useState("DESC");
  const [page,       setPage]     = useState(1);
  const [showForm,   setShowForm] = useState(false);
  const [editing,    setEditing]  = useState(null);
  const [deletingId, setDelId]    = useState(null);

  const dSearch = useDebounce(search, 380);

  const params = {
    ...(dSearch                ? { search: dSearch }      : {}),
    ...(filterType !== "all"   ? { type: filterType }     : {}),
    sort,
    order,
    page,
    limit: 15,
  };

  const txnQ = useAsync(() => TransactionAPI.getAll(params), [dSearch, filterType, sort, order, page]);

  const transactions = txnQ.data?.data       || [];
  const pagination   = txnQ.data?.pagination || {};

  const handleSort = (field) => {
    if (sort === field) setOrder(o => o === "ASC" ? "DESC" : "ASC");
    else { setSort(field); setOrder("DESC"); }
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDelId(id);
    try {
      await TransactionAPI.remove(id);
      toast.success("Transaction deleted");
      txnQ.refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDelId(null);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    setPage(1);
    txnQ.refetch();
  };

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (t) => {
    setEditing(t);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportCSV = () => {
    const header = "Date,Description,Category,Type,Amount";
    const rows   = transactions.map(t =>
      `${t.txn_date},"${t.description}",${t.category_name},${t.type},${t.amount}`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sortIcon = (f) => sort === f ? (order === "ASC" ? " ↑" : " ↓") : " ↕";

  const totalPages = pagination.pages || 1;

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="glass-card no-hover" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 190px", minWidth: 160 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
          <input
            className="fin-input"
            placeholder="Search description or category…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Type filter */}
        <div style={{ position: "relative" }}>
          <select
            className="fin-select"
            value={filterType}
            onChange={e => { setType(e.target.value); setPage(1); }}
            style={{ width: "auto" }}
          >
            <option value="all">All types</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--text-muted)" }}>▼</span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={exportCSV} style={{ fontSize: 12 }}>
            ⬇ CSV
          </button>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => showForm && !editing ? setShowForm(false) : openAdd()}
            >
              {showForm && !editing ? "✕ Close" : "+ Add"}
            </button>
          )}
        </div>
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && isAdmin && (
        <TransactionForm
          initial={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* ── Table ── */}
      {txnQ.error ? (
        <ErrorBox message={txnQ.error} onRetry={txnQ.refetch} />
      ) : (
        <div className="glass-card no-hover" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            {txnQ.loading ? (
              <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[...Array(8)].map((_, i) => <Skeleton key={i} h={46} />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No transactions found</h3>
                <p>Try adjusting your search or filter</p>
              </div>
            ) : (
              <table className="fin-table">
                <thead>
                  <tr>
                    {SORT_FIELDS.map(f => (
                      <th key={f.key} onClick={() => handleSort(f.key)}>
                        {f.label}
                        <span style={{ opacity: 0.45 }}>{sortIcon(f.key)}</span>
                      </th>
                    ))}
                    {isAdmin && <th style={{ cursor: "default" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {fmtDate(t.txn_date)}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, fontSize: 16, flexShrink: 0,
                            background: `${t.category_color || "var(--accent)"}22`,
                            border: `1px solid ${t.category_color || "var(--accent)"}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {getIcon(t.category_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.description}</div>
                            {t.note && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td><CatBadge name={t.category_name} color={t.category_color} /></td>
                      <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: "4px 12px", fontSize: 11 }}
                              onClick={() => openEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "4px 12px", fontSize: 11 }}
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                            >
                              {deletingId === t.id ? "…" : "Del"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "13px 20px", borderTop: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {pagination.total || 0} records · Page {pagination.page} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} className="btn" onClick={() => setPage(p)} style={{
                      padding: "5px 10px", fontSize: 12,
                      background: page === p ? "linear-gradient(135deg,var(--accent),var(--accent-b))" : "transparent",
                      color: page === p ? "#fff" : "var(--text-muted)",
                      border: page === p ? "none" : "1px solid var(--glass-border)",
                    }}>{p}</button>
                  );
                })}
                <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {!txnQ.loading && transactions.length > 0 && totalPages <= 1 && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--glass-border)", fontSize: 12, color: "var(--text-muted)" }}>
              {pagination.total || transactions.length} records
            </div>
          )}
        </div>
      )}
    </>
  );
}
