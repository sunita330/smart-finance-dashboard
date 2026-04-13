const db = require("../config/db");

const SAFE_SORT  = ["txn_date", "amount", "description", "type", "created_at"];
const SAFE_ORDER = ["ASC", "DESC"];

const TransactionModel = {

  async findAll({ search, type, category_id, sort = "txn_date", order = "DESC", page = 1, limit = 15 } = {}) {
    const sortCol = SAFE_SORT.includes(sort)  ? sort  : "txn_date";
    const sortDir = SAFE_ORDER.includes((order || "").toUpperCase()) ? order.toUpperCase() : "DESC";
    const lim     = Math.min(200, Math.max(1, parseInt(limit) || 15));
    const offset  = (Math.max(1, parseInt(page) || 1) - 1) * lim;

    const conditions = [];
    const params     = [];

    if (search) {
      conditions.push("(t.description LIKE ? OR c.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type && ["income", "expense"].includes(type)) {
      conditions.push("t.type = ?");
      params.push(type);
    }
    if (category_id && !isNaN(parseInt(category_id))) {
      conditions.push("t.category_id = ?");
      params.push(parseInt(category_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        t.id, t.description, t.amount, t.type,
        DATE_FORMAT(t.txn_date, '%Y-%m-%d') AS txn_date,
        t.note, t.created_at, t.updated_at,
        c.id   AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      ${where}
      ORDER BY t.${sortCol} ${sortDir}
      LIMIT ${lim} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      ${where}
    `;

    const [rows]          = await db.execute(sql, params);
    const [[{ total }]]   = await db.execute(countSql, params);

    return {
      rows,
      total: parseInt(total),
      page:  Math.max(1, parseInt(page) || 1),
      limit: lim,
      pages: Math.ceil(parseInt(total) / lim) || 1,
    };
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT t.id, t.description, t.amount, t.type,
              DATE_FORMAT(t.txn_date, '%Y-%m-%d') AS txn_date,
              t.note, t.created_at, t.updated_at,
              c.id AS category_id, c.name AS category_name,
              c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.id = ?`,
      [parseInt(id)]
    );
    return rows[0] || null;
  },

  async create({ description, amount, type, category_id, txn_date, note }) {
    const [result] = await db.execute(
      "INSERT INTO transactions (description, amount, type, category_id, txn_date, note) VALUES (?, ?, ?, ?, ?, ?)",
      [description.trim(), parseFloat(amount), type, parseInt(category_id), txn_date, note || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, { description, amount, type, category_id, txn_date, note }) {
    await db.execute(
      `UPDATE transactions
       SET description=?, amount=?, type=?, category_id=?, txn_date=?, note=?
       WHERE id=?`,
      [description.trim(), parseFloat(amount), type, parseInt(category_id), txn_date, note || null, parseInt(id)]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM transactions WHERE id = ?",
      [parseInt(id)]
    );
    return result.affectedRows > 0;
  },

  /** Monthly summary — income, expenses, balance */
  async summary({ year, month }) {
  let sql = `
    SELECT
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE -amount END), 0) AS balance,
      COUNT(*) AS transaction_count
    FROM transactions
  `;

  const params = [];

  if (year && month) {
    sql += " WHERE YEAR(txn_date) = ? AND MONTH(txn_date) = ?";
    params.push(parseInt(year), parseInt(month));
  }

  const [rows] = await db.execute(sql, params);
  return rows[0];
},

  /** N-month trend */
  async monthlyTrend(months = 6) {
    const [rows] = await db.execute(
      `SELECT
         DATE_FORMAT(txn_date, '%Y-%m') AS month,
         COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expenses
       FROM transactions
       WHERE txn_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(txn_date, '%Y-%m')
       ORDER BY month ASC`,
      [parseInt(months)]
    );
    return rows;
  },

  /** Spending breakdown by category for a given month */
  async categoryBreakdown({ year, month }) {
    let sql = `
    SELECT
      c.id, c.name, c.icon, c.color,
      COALESCE(SUM(t.amount), 0) AS total,
      COUNT(t.id) AS count
    FROM categories c
    LEFT JOIN transactions t
      ON t.category_id = c.id
      AND t.type = 'expense'
  `;

  const params = [];

  if (year && month) {
    sql += " AND YEAR(t.txn_date) = ? AND MONTH(t.txn_date) = ?";
    params.push(parseInt(year), parseInt(month));
  }

  sql += `
    GROUP BY c.id
    HAVING total > 0
    ORDER BY total DESC
  `;

  const [rows] = await db.execute(sql, params);
  return rows;
  },

  /** Top N transactions by amount */
  async topTransactions(limit = 5, type = "expense") {
    const safeType  = type === "income" ? "income" : "expense";
    const safeLimit = Math.min(20, Math.max(1, parseInt(limit) || 5));
    const [rows] = await db.execute(
      `SELECT t.id, t.description, t.amount, t.type,
              DATE_FORMAT(t.txn_date, '%Y-%m-%d') AS txn_date,
              c.id AS category_id, c.name AS category_name,
              c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.type = ?
       ORDER BY t.amount DESC
       LIMIT ${safeLimit}`,
      [safeType]
    );
    return rows;
  },
};

module.exports = TransactionModel;
