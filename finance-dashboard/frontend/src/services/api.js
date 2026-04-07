const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json;
}

/* ── Transactions ───────────────────────────────────────────────────────────── */
export const api = {
  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return request(`/transactions${qs ? "?" + qs : ""}`);
  },
  getTransaction:    (id)      => request(`/transactions/${id}`),
  createTransaction: (body)    => request("/transactions", { method: "POST", body: JSON.stringify(body) }),
  updateTransaction: (id, body)=> request(`/transactions/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  deleteTransaction: (id)      => request(`/transactions/${id}`, { method: "DELETE" }),

  // Categories
  getCategories:   ()          => request("/categories"),
  createCategory:  (body)      => request("/categories", { method: "POST",   body: JSON.stringify(body) }),
  updateCategory:  (id, body)  => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory:  (id)        => request(`/categories/${id}`, { method: "DELETE" }),

  // Budgets
  getBudgets:      (params)    => request(`/budgets?${new URLSearchParams(params)}`),
  upsertBudget:    (body)      => request("/budgets", { method: "POST", body: JSON.stringify(body) }),
  deleteBudget:    (id)        => request(`/budgets/${id}`, { method: "DELETE" }),

  // Stats
  getSummary:      (params)    => request(`/stats/summary?${new URLSearchParams(params)}`),
  getMonthly:      (params)    => request(`/stats/monthly?${new URLSearchParams(params)}`),
  getCategoryStats:(params)    => request(`/stats/categories?${new URLSearchParams(params)}`),
  getInsights:     (params)    => request(`/stats/insights?${new URLSearchParams(params)}`),
};
