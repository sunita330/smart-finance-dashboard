import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Unwrap response or throw clean error message
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      err.message ||
      "Network error — is the server running?";
    return Promise.reject(new Error(msg));
  }
);

/* ── Transactions ─────────────────────────────────────────────────────────── */
export const TransactionAPI = {
  getAll:    (params = {}) => api.get("/transactions",         { params }),
  getOne:    (id)          => api.get(`/transactions/${id}`),
  create:    (body)        => api.post("/transactions",         body),
  update:    (id, body)    => api.put(`/transactions/${id}`,    body),
  remove:    (id)          => api.delete(`/transactions/${id}`),
  summary:   (params = {}) => api.get("/transactions/summary",   { params }),
  trend:     (params = {}) => api.get("/transactions/trend",     { params }),
  breakdown: (params = {}) => api.get("/transactions/breakdown", { params }),
  top:       (params = {}) => api.get("/transactions/top",       { params }),
};

/* ── Categories ───────────────────────────────────────────────────────────── */
export const CategoryAPI = {
  getAll: ()          => api.get("/categories"),
  create: (body)      => api.post("/categories",        body),
  update: (id, body)  => api.put(`/categories/${id}`,   body),
  remove: (id)        => api.delete(`/categories/${id}`),
};

export default api;
