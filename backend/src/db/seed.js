/**
 * seed.js  —  Populates finance_dashboard with realistic mock data.
 * Run: node src/db/seed.js   (from backend/ folder)
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "finance_dashboard",
  multipleStatements: false,
};

const CATEGORIES = [
  { name: "Salary",        icon: "💼", color: "#34d9a5" },
  { name: "Freelance",     icon: "💻", color: "#22d3ee" },
  { name: "Investment",    icon: "📈", color: "#fbbf24" },
  { name: "Housing",       icon: "🏠", color: "#6d8cff" },
  { name: "Food",          icon: "🍔", color: "#34d9a5" },
  { name: "Transport",     icon: "🚌", color: "#fbbf24" },
  { name: "Entertainment", icon: "🎬", color: "#c084fc" },
  { name: "Health",        icon: "💊", color: "#f47186" },
];

const TRANSACTIONS = [
  // June 2025
  { description:"June Salary",        type:"income",  amount:4200, cat:"Salary",        txn_date:"2025-06-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-06-01" },
  { description:"Grocery Run",        type:"expense", amount:140,  cat:"Food",           txn_date:"2025-06-03" },
  { description:"Netflix",            type:"expense", amount:18,   cat:"Entertainment",  txn_date:"2025-06-05" },
  { description:"Metro Card",         type:"expense", amount:90,   cat:"Transport",      txn_date:"2025-06-06" },
  { description:"Pharmacy",           type:"expense", amount:42,   cat:"Health",         txn_date:"2025-06-07" },
  { description:"Freelance Project",  type:"income",  amount:800,  cat:"Freelance",      txn_date:"2025-06-09" },
  { description:"Dinner Out",         type:"expense", amount:68,   cat:"Food",           txn_date:"2025-06-11" },
  { description:"Gym Membership",     type:"expense", amount:35,   cat:"Health",         txn_date:"2025-06-13" },
  { description:"Spotify",            type:"expense", amount:10,   cat:"Entertainment",  txn_date:"2025-06-15" },
  { description:"Uber Ride",          type:"expense", amount:24,   cat:"Transport",      txn_date:"2025-06-17" },
  { description:"Index Fund",         type:"income",  amount:200,  cat:"Investment",     txn_date:"2025-06-19" },
  { description:"Coffee and Snacks",  type:"expense", amount:54,   cat:"Food",           txn_date:"2025-06-21" },
  { description:"Amazon Order",       type:"expense", amount:88,   cat:"Entertainment",  txn_date:"2025-06-23" },
  { description:"Doctor Visit",       type:"expense", amount:60,   cat:"Health",         txn_date:"2025-06-25" },
  // May 2025
  { description:"May Salary",         type:"income",  amount:4200, cat:"Salary",         txn_date:"2025-05-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-05-01" },
  { description:"Grocery",            type:"expense", amount:160,  cat:"Food",           txn_date:"2025-05-05" },
  { description:"Cinema Night",       type:"expense", amount:30,   cat:"Entertainment",  txn_date:"2025-05-08" },
  { description:"Bus Pass",           type:"expense", amount:80,   cat:"Transport",      txn_date:"2025-05-10" },
  { description:"Freelance Project",  type:"income",  amount:600,  cat:"Freelance",      txn_date:"2025-05-15" },
  { description:"Restaurant",         type:"expense", amount:75,   cat:"Food",           txn_date:"2025-05-18" },
  { description:"Health Checkup",     type:"expense", amount:50,   cat:"Health",         txn_date:"2025-05-22" },
  // April 2025
  { description:"April Salary",       type:"income",  amount:4200, cat:"Salary",         txn_date:"2025-04-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-04-01" },
  { description:"Grocery",            type:"expense", amount:130,  cat:"Food",           txn_date:"2025-04-07" },
  { description:"Freelance",          type:"income",  amount:500,  cat:"Freelance",      txn_date:"2025-04-12" },
  { description:"Transport Pass",     type:"expense", amount:95,   cat:"Transport",      txn_date:"2025-04-18" },
  { description:"Entertainment",      type:"expense", amount:45,   cat:"Entertainment",  txn_date:"2025-04-25" },
  // March 2025
  { description:"March Salary",       type:"income",  amount:4500, cat:"Salary",         txn_date:"2025-03-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-03-01" },
  { description:"Grocery",            type:"expense", amount:145,  cat:"Food",           txn_date:"2025-03-06" },
  { description:"Bus Pass",           type:"expense", amount:85,   cat:"Transport",      txn_date:"2025-03-10" },
  { description:"Freelance",          type:"income",  amount:700,  cat:"Freelance",      txn_date:"2025-03-14" },
  { description:"Medical",            type:"expense", amount:110,  cat:"Health",         txn_date:"2025-03-20" },
  // February 2025
  { description:"February Salary",    type:"income",  amount:4200, cat:"Salary",         txn_date:"2025-02-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-02-01" },
  { description:"Grocery",            type:"expense", amount:120,  cat:"Food",           txn_date:"2025-02-05" },
  { description:"Valentine Dinner",   type:"expense", amount:95,   cat:"Food",           txn_date:"2025-02-14" },
  { description:"Freelance",          type:"income",  amount:450,  cat:"Freelance",      txn_date:"2025-02-18" },
  // January 2025
  { description:"January Salary",     type:"income",  amount:3800, cat:"Salary",         txn_date:"2025-01-01" },
  { description:"Rent Payment",       type:"expense", amount:1200, cat:"Housing",        txn_date:"2025-01-01" },
  { description:"Grocery",            type:"expense", amount:110,  cat:"Food",           txn_date:"2025-01-08" },
  { description:"New Year Dinner",    type:"expense", amount:80,   cat:"Food",           txn_date:"2025-01-01" },
  { description:"Investment Return",  type:"income",  amount:150,  cat:"Investment",     txn_date:"2025-01-20" },
];

async function seed() {
  console.log("\n🌱  Connecting to MySQL...");
  console.log("    Host:", DB_CONFIG.host, "| DB:", DB_CONFIG.database, "| User:", DB_CONFIG.user);

  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅  Connected!\n🌱  Seeding database...\n");

  try {
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
    await conn.execute("TRUNCATE TABLE transactions");
    await conn.execute("TRUNCATE TABLE categories");
    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🧹  Cleared existing data");

    for (const cat of CATEGORIES) {
      await conn.execute(
        "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
        [cat.name, cat.icon, cat.color]
      );
    }
    console.log(`✅  Inserted ${CATEGORIES.length} categories`);

    const [rows] = await conn.execute("SELECT id, name FROM categories");
    const catMap = {};
    rows.forEach(r => { catMap[r.name] = r.id; });

    let count = 0;
    for (const txn of TRANSACTIONS) {
      const catId = catMap[txn.cat];
      if (!catId) { console.warn(`⚠   Unknown category skipped: ${txn.cat}`); continue; }
      await conn.execute(
        "INSERT INTO transactions (description, amount, type, category_id, txn_date) VALUES (?, ?, ?, ?, ?)",
        [txn.description, txn.amount, txn.type, catId, txn.txn_date]
      );
      count++;
    }
    console.log(`✅  Inserted ${count} transactions`);
    console.log("\n🎉  Database seeded successfully!\n");
  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

seed().catch(() => process.exit(1));
