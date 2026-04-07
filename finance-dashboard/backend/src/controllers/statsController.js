const { pool } = require("../db/connection");

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/stats/summary?month=6&year=2025
───────────────────────────────────────────────────────────────────────────── */
const getSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const [[summary]] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expense,
         COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE -amount END), 0) AS balance,
         COUNT(*) AS transaction_count
       FROM transactions
       WHERE MONTH(txn_date)=? AND YEAR(txn_date)=?`,
      [month, year]
    );

    const income   = parseFloat(summary.total_income)  || 0;
    const expense  = parseFloat(summary.total_expense) || 0;
    const balance  = parseFloat(summary.balance)       || 0;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

    // Previous month for delta
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;
    const [[prev]] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS prev_income,
         COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS prev_expense
       FROM transactions
       WHERE MONTH(txn_date)=? AND YEAR(txn_date)=?`,
      [prevMonth, prevYear]
    );

    const prevIncome  = parseFloat(prev.prev_income)  || 0;
    const prevExpense = parseFloat(prev.prev_expense) || 0;
    const incomeDelta  = prevIncome  > 0 ? Math.round(((income  - prevIncome)  / prevIncome)  * 100) : 0;
    const expenseDelta = prevExpense > 0 ? Math.round(((expense - prevExpense) / prevExpense) * 100) : 0;

    res.json({
      success: true,
      data: {
        month, year,
        total_income:  income,
        total_expense: expense,
        balance,
        savings_rate:  savingsRate,
        transaction_count: Number(summary.transaction_count),
        income_delta:  incomeDelta,
        expense_delta: expenseDelta,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/stats/monthly?year=2025
   Returns month-by-month income & expense totals for the year
───────────────────────────────────────────────────────────────────────────── */
const getMonthly = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const [rows] = await pool.execute(
      `SELECT
         MONTH(txn_date)                                                       AS month,
         COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0)    AS income,
         COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0)    AS expense
       FROM transactions
       WHERE YEAR(txn_date) = ?
       GROUP BY MONTH(txn_date)
       ORDER BY month`,
      [year]
    );

    // Fill all 12 months
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const filled = monthNames.map((name, i) => {
      const found = rows.find(r => Number(r.month) === i + 1);
      return {
        month:   i + 1,
        name,
        income:  found ? parseFloat(found.income)  : 0,
        expense: found ? parseFloat(found.expense) : 0,
        savings: found ? parseFloat(found.income) - parseFloat(found.expense) : 0,
      };
    });

    res.json({ success: true, data: filled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch monthly stats" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/stats/categories?month=6&year=2025
───────────────────────────────────────────────────────────────────────────── */
const getByCategory = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const [rows] = await pool.execute(
      `SELECT
         c.id, c.name, c.icon, c.color,
         COALESCE(SUM(t.amount), 0)    AS total,
         COUNT(t.id)                   AS count,
         b.amount                      AS budget
       FROM categories c
       LEFT JOIN transactions t
         ON t.category_id = c.id
         AND MONTH(t.txn_date)=? AND YEAR(t.txn_date)=?
         AND t.type='expense'
       LEFT JOIN budgets b
         ON b.category_id = c.id AND b.month=? AND b.year=?
       GROUP BY c.id, c.name, c.icon, c.color, b.amount
       ORDER BY total DESC`,
      [month, year, month, year]
    );

    const [[{ grand_total }]] = await pool.execute(
      `SELECT COALESCE(SUM(amount),0) AS grand_total
       FROM transactions
       WHERE type='expense' AND MONTH(txn_date)=? AND YEAR(txn_date)=?`,
      [month, year]
    );

    const total = parseFloat(grand_total) || 0;
    const data  = rows.map(r => ({
      id:         r.id,
      name:       r.name,
      icon:       r.icon,
      color:      r.color,
      total:      parseFloat(r.total) || 0,
      count:      Number(r.count),
      budget:     r.budget ? parseFloat(r.budget) : null,
      percentage: total > 0 ? Math.round((parseFloat(r.total) / total) * 100) : 0,
      over_budget: r.budget ? parseFloat(r.total) > parseFloat(r.budget) : false,
    }));

    res.json({ success: true, data, grand_total: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch category stats" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/stats/insights?month=6&year=2025
───────────────────────────────────────────────────────────────────────────── */
const getInsights = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    // Top spending category
    const [[topCat]] = await pool.execute(
      `SELECT c.name, c.icon, c.color, SUM(t.amount) AS total
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.type='expense' AND MONTH(t.txn_date)=? AND YEAR(t.txn_date)=?
       GROUP BY c.id ORDER BY total DESC LIMIT 1`,
      [month, year]
    );

    // Best savings month this year
    const [monthlyData] = await pool.execute(
      `SELECT MONTH(txn_date) AS m,
         SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) -
         SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS savings
       FROM transactions WHERE YEAR(txn_date)=?
       GROUP BY m ORDER BY savings DESC LIMIT 1`,
      [year]
    );
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const bestMonth  = monthlyData[0] ? monthNames[monthlyData[0].m - 1] : null;
    const bestSavings = monthlyData[0] ? parseFloat(monthlyData[0].savings) : 0;

    // Avg monthly expenses this year
    const [[avgData]] = await pool.execute(
      `SELECT AVG(monthly_exp) AS avg_expense FROM (
         SELECT MONTH(txn_date) AS m, SUM(amount) AS monthly_exp
         FROM transactions WHERE type='expense' AND YEAR(txn_date)=?
         GROUP BY m
       ) sub`,
      [year]
    );

    // Largest single expense this month
    const [[bigTxn]] = await pool.execute(
      `SELECT t.description, t.amount, c.name AS category, c.icon
       FROM transactions t JOIN categories c ON t.category_id=c.id
       WHERE t.type='expense' AND MONTH(t.txn_date)=? AND YEAR(t.txn_date)=?
       ORDER BY t.amount DESC LIMIT 1`,
      [month, year]
    );

    res.json({
      success: true,
      data: {
        top_category:     topCat   || null,
        best_savings_month: { month: bestMonth, amount: Math.round(bestSavings) },
        avg_monthly_expense: Math.round(parseFloat(avgData?.avg_expense) || 0),
        largest_expense:  bigTxn  || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch insights" });
  }
};

module.exports = { getSummary, getMonthly, getByCategory, getInsights };
