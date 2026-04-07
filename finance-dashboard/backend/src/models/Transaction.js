const db = require("../config/db");

const TransactionModel = {
  /** List transactions with optional filters, search, sort, and pagination */
  async findAll({ search, type, category_id, sort = "txn_date", order = "DESC", page = 1, limit = 50 }) {
    const SAFE_SORT   = ["txn_date","amount","description","type","created_at"];
    const SAFE_ORDER  = ["ASC","DESC"];
    const sortCol  = SAFE_SORT.includes(sort)  ? sort  : "txn_date";
    const sortDir  = SAFE_ORDER.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";
    const offset   = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
    const lim      = Math.min(200, Math.max(1, parseInt(limit)));

    const conditions = [];
    const params     = [];

    if (search) {
      conditions.push("(t.description LIKE ? OR c.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type && ["income","expense"].includes(type)) {
      conditions.push("t.type = ?");
      params.push(type);
    }
    if (category_id) {
      conditions.push("t.category_id = ?");
      params.push(parseInt(category_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.execute(
      `SELECT t.id, t.description, t.amount, t.type, t.txn_date, t.note, t.created_at, t.updated_at,
              c.id AS category_id, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       ${where}
       ORDER BY t.${sortCol} ${sortDir}
       LIMIT ${lim} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM transactions t
       JOIN categories c ON c.id = t.category_id ${where}`,
      params
    );

    return { rows, total, page: parseInt(page), limit: lim, pages: Math.ceil(total / lim) };
  },

  /** Get single transaction by id */
  async findById(id) {
    const [rows] = await db.execute(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /** Create a new transaction */
  async create({ description, amount, type, category_id, txn_date, note }) {
    const [result] = await db.execute(
      "INSERT INTO transactions (description,amount,type,category_id,txn_date,note) VALUES (?,?,?,?,?,?)",
      [description, parseFloat(amount), type, parseInt(category_id), txn_date, note || null]
    );
    return this.findById(result.insertId);
  },

  /** Update an existing transaction */
  async update(id, { description, amount, type, category_id, txn_date, note }) {
    await db.execute(
      `UPDATE transactions SET description=?, amount=?, type=?, category_id=?, txn_date=?, note=?
       WHERE id=?`,
      [description, parseFloat(amount), type, parseInt(category_id), txn_date, note || null, id]
    );
    return this.findById(id);
  },

  /** Delete a transaction */
  async delete(id) {
    const [result] = await db.execute("DELETE FROM transactions WHERE id=?", [id]);
    return result.affectedRows > 0;
  },

  /** Dashboard summary — income, expenses, balance for a given month */
  async summary({ year, month }) {
    const [rows] = await db.execute(
      `SELECT
         SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
         SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expenses,
         SUM(CASE WHEN type='income'  THEN amount ELSE -amount END) AS balance,
         COUNT(*) AS transaction_count
       FROM transactions
       WHERE YEAR(txn_date)=? AND MONTH(txn_date)=?`,
      [parseInt(year), parseInt(month)]
    );
    return rows[0];
  },

  /** 6-month monthly trend data */
  async monthlyTrend(months = 6) {
    const [rows] = await db.execute(
      `SELECT
         DATE_FORMAT(txn_date,'%Y-%m') AS month,
         SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
         SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses
       FROM transactions
       WHERE txn_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY month ORDER BY month ASC`,
      [months]
    );
    return rows;
  },

  /** Spending breakdown by category for a given month */
  async categoryBreakdown({ year, month }) {
    const [rows] = await db.execute(
      `SELECT c.id, c.name, c.icon, c.color,
              SUM(t.amount) AS total,
              COUNT(*) AS count
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.type='expense' AND YEAR(t.txn_date)=? AND MONTH(t.txn_date)=?
       GROUP BY c.id ORDER BY total DESC`,
      [parseInt(year), parseInt(month)]
    );
    return rows;
  },

  /** Top N transactions by amount */
  async topTransactions(limit = 5, type = "expense") {
    const [rows] = await db.execute(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t JOIN categories c ON c.id = t.category_id
       WHERE t.type=? ORDER BY t.amount DESC LIMIT ?`,
      [type, parseInt(limit)]
    );
    return rows;
  },
};

module.exports = TransactionModel;
