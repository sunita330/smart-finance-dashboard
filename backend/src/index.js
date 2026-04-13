const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

const { errorHandler, notFound } = require("./middleware/errorHandler");

// Boot DB pool (tests connection on startup)
require("./config/db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories",   require("./routes/categories"));

// Health check
app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db: process.env.DB_NAME,
  })
);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Finance API running  →  http://localhost:${PORT}`);
  console.log(`🔍  Health check         →  http://localhost:${PORT}/api/health`);
  console.log(`📋  Transactions API     →  http://localhost:${PORT}/api/transactions`);
  console.log(`🏷️   Categories API       →  http://localhost:${PORT}/api/categories\n`);
});

module.exports = app;
