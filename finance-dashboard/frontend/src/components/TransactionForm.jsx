import { useState, useEffect } from "react";
import { TransactionAPI, CategoryAPI } from "../api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context";
import { toISO } from "../utils";

const EMPTY = { description:"", amount:"", type:"expense", category_id:"", txn_date:"", note:"" };

export default function TransactionForm({ initial = null, onSaved, onCancel }) {
  const toast = useToast();
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const { data: catData } = useAsync(() => CategoryAPI.getAll(), []);
  const categories = catData?.data || [];

  // Prefill when editing
  useEffect(() => {
    if (initial) {
      setForm({
        description:  initial.description || "",
        amount:       initial.amount       || "",
        type:         initial.type         || "expense",
        category_id:  initial.category_id  || "",
        txn_date:     initial.txn_date     ? toISO(initial.txn_date) : "",
        note:         initial.note         || "",
      });
    } else {
      setForm({ ...EMPTY, txn_date: toISO(new Date()) });
    }
  }, [initial]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category_id || !form.txn_date) {
      toast.warn("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), category_id: parseInt(form.category_id) };
      if (initial) {
        await TransactionAPI.update(initial.id, payload);
        toast.success("Transaction updated");
      } else {
        await TransactionAPI.create(payload);
        toast.success("Transaction added");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize:11, color:"var(--text-muted)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:6 };
  const fieldWrap  = { display:"flex", flexDirection:"column" };

  return (
    <div className="glass-card no-hover" style={{ padding:"24px 28px", marginBottom:16 }}>
      <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>
        {initial ? "✏️ Edit Transaction" : "➕ New Transaction"}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:16 }}>
          {/* Description */}
          <div style={{ ...fieldWrap, gridColumn:"span 2" }}>
            <label style={labelStyle}>Description *</label>
            <input className="fin-input" placeholder="e.g. Grocery run" value={form.description} onChange={set("description")} required />
          </div>

          {/* Amount */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Amount *</label>
            <input className="fin-input" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set("amount")} required />
          </div>

          {/* Type */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Type *</label>
            <div style={{ position:"relative" }}>
              <select className="fin-select" value={form.type} onChange={set("type")} required>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:"var(--text-muted)" }}>▼</span>
            </div>
          </div>

          {/* Category */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Category *</label>
            <div style={{ position:"relative" }}>
              <select className="fin-select" value={form.category_id} onChange={set("category_id")} required>
                <option value="">Select…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:"var(--text-muted)" }}>▼</span>
            </div>
          </div>

          {/* Date */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Date *</label>
            <input className="fin-input" type="date" value={form.txn_date} onChange={set("txn_date")} required />
          </div>

          {/* Note */}
          <div style={{ ...fieldWrap, gridColumn:"span 2" }}>
            <label style={labelStyle}>Note (optional)</label>
            <input className="fin-input" placeholder="Add a note…" value={form.note} onChange={set("note")} />
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth:100 }}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add transaction"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
