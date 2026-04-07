const { pool } = require("../db/connection");

const getAll = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const [rows] = await pool.execute(
      `SELECT b.*, c.name AS category_name, c.icon, c.color
       FROM budgets b JOIN categories c ON b.category_id=c.id
       WHERE b.month=? AND b.year=?`,
      [month, year]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch budgets" });
  }
};

const upsert = async (req, res) => {
  try {
    const { category_id, month, year, amount } = req.body;
    await pool.execute(
      `INSERT INTO budgets (category_id, month, year, amount)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,
      [category_id, month, year, parseFloat(amount)]
    );
    const [[row]] = await pool.execute(
      `SELECT b.*, c.name AS category_name FROM budgets b JOIN categories c ON b.category_id=c.id
       WHERE b.category_id=? AND b.month=? AND b.year=?`,
      [category_id, month, year]
    );
    res.json({ success: true, data: row, message: "Budget saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save budget" });
  }
};

const remove = async (req, res) => {
  try {
    await pool.execute("DELETE FROM budgets WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete budget" });
  }
};

module.exports = { getAll, upsert, remove };
