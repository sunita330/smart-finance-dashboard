const TransactionModel = require("../models/Transaction");
const { asyncHandler } = require("../middleware/errorHandler");

const ok      = (res, data, meta = {}) => res.status(200).json({ success: true, ...meta, data });
const created = (res, data)            => res.status(201).json({ success: true, data });
const gone    = (res, msg)             => res.status(404).json({ success: false, message: msg || "Not found" });

/** GET /api/transactions */
exports.getAll = asyncHandler(async (req, res) => {
  const { search, type, category_id, sort, order, page, limit } = req.query;
  const result = await TransactionModel.findAll({ search, type, category_id, sort, order, page, limit });
  ok(res, result.rows, {
    pagination: {
      total: result.total,
      page:  result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

/** GET /api/transactions/summary */
exports.summary = asyncHandler(async (req, res) => {
  const now   = new Date();
  const year  = parseInt(req.query.year  || now.getFullYear());
  const month = parseInt(req.query.month || (now.getMonth() + 1));
  const data  = await TransactionModel.summary({ year, month });
  ok(res, { year, month, ...data });
});

/** GET /api/transactions/trend */
exports.trend = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months || 6);
  const data   = await TransactionModel.monthlyTrend(months);
  ok(res, data);
});

/** GET /api/transactions/breakdown */
exports.breakdown = asyncHandler(async (req, res) => {
  const now   = new Date();
  const year  = parseInt(req.query.year  || now.getFullYear());
  const month = parseInt(req.query.month || (now.getMonth() + 1));
  const data  = await TransactionModel.categoryBreakdown({ year, month });
  ok(res, data);
});

/** GET /api/transactions/top */
exports.top = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || 5);
  const type  = req.query.type === "income" ? "income" : "expense";
  const data  = await TransactionModel.topTransactions(limit, type);
  ok(res, data);
});

/** GET /api/transactions/:id */
exports.getOne = asyncHandler(async (req, res) => {
  const txn = await TransactionModel.findById(req.params.id);
  if (!txn) return gone(res, "Transaction not found");
  ok(res, txn);
});

/** POST /api/transactions */
exports.create = asyncHandler(async (req, res) => {
  const txn = await TransactionModel.create(req.body);
  created(res, txn);
});

/** PUT /api/transactions/:id */
exports.update = asyncHandler(async (req, res) => {
  const existing = await TransactionModel.findById(req.params.id);
  if (!existing) return gone(res, "Transaction not found");
  const txn = await TransactionModel.update(req.params.id, req.body);
  ok(res, txn);
});

/** DELETE /api/transactions/:id */
exports.remove = asyncHandler(async (req, res) => {
  const existing = await TransactionModel.findById(req.params.id);
  if (!existing) return gone(res, "Transaction not found");
  await TransactionModel.delete(req.params.id);
  ok(res, { id: parseInt(req.params.id), deleted: true });
});
