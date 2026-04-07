const TransactionModel = require("../models/Transaction");
const { asyncHandler } = require("../middleware/errorHandler");

const ok = (res, data, meta = {}) => res.json({ success: true, ...meta, data });
const created = (res, data) => res.status(201).json({ success: true, data });
const notFound = (res, msg) => res.status(404).json({ success: false, message: msg || "Not found" });

exports.getAll = asyncHandler(async (req, res) => {
  const { search, type, category_id, sort, order, page = 1, limit = 50 } = req.query;
  const result = await TransactionModel.findAll({ search, type, category_id, sort, order, page, limit });
  ok(res, result.rows, { pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const txn = await TransactionModel.findById(req.params.id);
  if (!txn) return notFound(res, "Transaction not found");
  ok(res, txn);
});

exports.create = asyncHandler(async (req, res) => {
  const txn = await TransactionModel.create(req.body);
  created(res, txn);
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await TransactionModel.findById(req.params.id);
  if (!existing) return notFound(res, "Transaction not found");
  const txn = await TransactionModel.update(req.params.id, req.body);
  ok(res, txn);
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await TransactionModel.findById(req.params.id);
  if (!existing) return notFound(res, "Transaction not found");
  await TransactionModel.delete(req.params.id);
  ok(res, { id: parseInt(req.params.id) });
});

exports.summary = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year || now.getFullYear());
  const month = parseInt(req.query.month || now.getMonth() + 1);
  const data = await TransactionModel.summary({ year, month });
  ok(res, { year, month, ...data });
});

exports.trend = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months || 6);
  const data = await TransactionModel.monthlyTrend(months);
  ok(res, data);
});

exports.breakdown = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year || now.getFullYear());
  const month = parseInt(req.query.month || now.getMonth() + 1);
  const data = await TransactionModel.categoryBreakdown({ year, month });
  ok(res, data);
});

exports.top = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || 5);
  const type = req.query.type === "income" ? "income" : "expense";
  const data = await TransactionModel.topTransactions(limit, type);
  ok(res, data);
});
