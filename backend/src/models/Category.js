const db = require("../config/db");

const CategoryModel = {
  async findAll() {
    const [rows] = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [parseInt(id)]);
    return rows[0] || null;
  },

  async create({ name, icon = "💰", color = "#6d8cff" }) {
    const [result] = await db.execute(
      "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
      [name.trim(), icon, color]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, icon, color }) {
    await db.execute(
      "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
      [name.trim(), icon, color, parseInt(id)]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [parseInt(id)]);
    return result.affectedRows > 0;
  },
};

module.exports = CategoryModel;
