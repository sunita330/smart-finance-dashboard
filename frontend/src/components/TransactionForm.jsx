import { useState, useEffect } from "react";
import { TransactionAPI, CategoryAPI } from "../api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context";
import { toISODate } from "../utils";

const EMPTY_FORM = { description: "", amount: "", type: "expense", category_id: "", txn_date: "", note: "" };

export default function TransactionForm({ initial = null, onSaved, onCancel }) {
  const toast   = useToast();
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const catQ       = useAsync(() => CategoryAPI.getAll(), []);
  const categories = catQ.data?.data || [];

  // Prefill when editing
  useEffect(() => {
    if (initial) {
      setForm({
        description: initial.description || "",
        amount:      String(initial.amount || ""),
        type:        initial.type         || "expense",
        category_id: String(initial.category_id || ""),
        txn_date:    initial.txn_date ? String(initial.txn_date).split("T")[0] : "",
        note:        initial.note         || "",
      });
    } else {
      setForm({ ...EMPTY_FORM, txn_date: toISODate(new Date()) });
    }
  }, [initial?.id]); // only re-run when editing a different record

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { toast.warn("Description is required"); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { toast.warn("Enter a valid positive amount"); return; }
    if (!form.category_id) { toast.warn("Please select a category"); return; }
    if (!form.txn_date)    { toast.warn("Please pick a date"); return; }

    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        amount:      parseFloat(form.amount),
        type:        form.type,
        category_id: parseInt(form.category_id),
        txn_date:    form.txn_date,
        note:        form.note.trim() || null,
      };

      if (initial) {
        await TransactionAPI.update(initial.id, payload);
        toast.success("Transaction updated");
      } else {
        await TransactionAPI.create(payload);
        toast.success("Transaction added");
      }
      setForm({ ...EMPTY_FORM, txn_date: toISODate(new Date()) });
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = {
    fontSize: 11, color: "var(--text-muted)", fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase",
    display: "block", marginBottom: 6,
  };

  return (
    <div className="glass-card no-hover card-in" style={{ padding: "24px 28px", marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
        {initial ? "✏️  Edit Transaction" : "➕  New Transaction"}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px,1fr))", gap: 14, marginBottom: 18 }}>

          {/* Description — spans 2 cols on wide screens */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Description *</label>
            <input
              className="fin-input"
              placeholder="e.g. Grocery run"
              value={form.description}
              onChange={set("description")}
              maxLength={180}
            />
          </div>

          {/* Amount */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Amount *</label>
            <input
              className="fin-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
            />
          </div>

          {/* Type */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Type *</label>
            <div style={{ position: "relative" }}>
              <select className="fin-select" value={form.type} onChange={set("type")}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--text-muted)" }}>▼</span>
            </div>
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Category *</label>
            <div style={{ position: "relative" }}>
              <select className="fin-select" value={form.category_id} onChange={set("category_id")}>
                <option value="">Select…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--text-muted)" }}>▼</span>
            </div>
          </div>

          {/* Date */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Date *</label>
            <input
              className="fin-input"
              type="date"
              value={form.txn_date}
              onChange={set("txn_date")}
            />
          </div>

          {/* Note */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Note (optional)</label>
            <input
              className="fin-input"
              placeholder="Add a note…"
              value={form.note}
              onChange={set("note")}
              maxLength={500}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 130 }}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add transaction"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
