const router = require("express").Router();

const txnCtrl      = require("../controllers/transactionController");
const statsCtrl    = require("../controllers/statsController");
const catCtrl      = require("../controllers/categoryController");
const budgetCtrl   = require("../controllers/budgetController");
const { transactionRules, categoryRules, budgetRules } = require("../middleware/validate");

// ── Transactions ─────────────────────────────────────────────────────────────
router.get   ("/transactions",      txnCtrl.getAll);
router.get   ("/transactions/:id",  txnCtrl.getById);
router.post  ("/transactions",      transactionRules, txnCtrl.create);
router.put   ("/transactions/:id",  transactionRules, txnCtrl.update);
router.delete("/transactions/:id",  txnCtrl.remove);

// ── Categories ────────────────────────────────────────────────────────────────
router.get   ("/categories",        catCtrl.getAll);
router.post  ("/categories",        categoryRules, catCtrl.create);
router.put   ("/categories/:id",    categoryRules, catCtrl.update);
router.delete("/categories/:id",    catCtrl.remove);

// ── Budgets ───────────────────────────────────────────────────────────────────
router.get   ("/budgets",           budgetCtrl.getAll);
router.post  ("/budgets",           budgetRules, budgetCtrl.upsert);
router.delete("/budgets/:id",       budgetCtrl.remove);

// ── Stats & Analytics ─────────────────────────────────────────────────────────
router.get   ("/stats/summary",     statsCtrl.getSummary);
router.get   ("/stats/monthly",     statsCtrl.getMonthly);
router.get   ("/stats/categories",  statsCtrl.getByCategory);
router.get   ("/stats/insights",    statsCtrl.getInsights);

module.exports = router;
