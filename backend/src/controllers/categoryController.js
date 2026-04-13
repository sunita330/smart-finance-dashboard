const CategoryModel = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandler");

const ok      = (res, data) => res.status(200).json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });
const gone    = (res)       => res.status(404).json({ success: false, message: "Category not found" });

exports.getAll = asyncHandler(async (req, res) => {
  const cats = await CategoryModel.findAll();
  ok(res, cats);
});

exports.getOne = asyncHandler(async (req, res) => {
  const cat = await CategoryModel.findById(req.params.id);
  if (!cat) return gone(res);
  ok(res, cat);
});

exports.create = asyncHandler(async (req, res) => {
  const cat = await CategoryModel.create(req.body);
  created(res, cat);
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await CategoryModel.findById(req.params.id);
  if (!existing) return gone(res);
  const cat = await CategoryModel.update(req.params.id, req.body);
  ok(res, cat);
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await CategoryModel.findById(req.params.id);
  if (!existing) return gone(res);
  await CategoryModel.delete(req.params.id);
  ok(res, { id: parseInt(req.params.id), deleted: true });
});
