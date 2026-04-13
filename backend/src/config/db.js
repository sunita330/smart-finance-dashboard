require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               parseInt(process.env.DB_PORT || "3306"),
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "finance_dashboard",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "Z",
  decimalNumbers:     true,
});

pool.getConnection()
  .then((conn) => {
    console.log("✅  MySQL connected — host:", process.env.DB_HOST, "db:", process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌  MySQL connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
