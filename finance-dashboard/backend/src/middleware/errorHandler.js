const { validationResult } = require("express-validator");

/** Wraps async route handlers — forwards errors to Express error middleware */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Validates express-validator results; sends 422 on failure */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/** Global error handler — mount LAST in Express */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  // MySQL errors
  if (err.code === "ER_DUP_ENTRY")
    return res.status(409).json({ success: false, message: "Duplicate entry" });
  if (err.code === "ER_ROW_IS_REFERENCED_2")
    return res.status(409).json({ success: false, message: "Cannot delete — record is in use" });

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/** 404 handler */
const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });

module.exports = { asyncHandler, validate, errorHandler, notFound };
