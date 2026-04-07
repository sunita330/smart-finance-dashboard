require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialise DB pool (side-effect: tests connection)
require("./config/db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories",   require("./routes/categories"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀  Finance API running on http://localhost:${PORT}`);
  console.log(`📄  Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
