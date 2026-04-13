const { validationResult } = require("express-validator");

/** Wraps async route handlers — no more try/catch boilerplate */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Runs express-validator checks; sends 422 on failure */
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

/** 404 catch-all */
const notFound = (req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });

/** Global error handler — must be last app.use() */
const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path} —`, err.message);

  if (err.code === "ER_DUP_ENTRY")
    return res.status(409).json({ success: false, message: "Duplicate entry — record already exists" });

  if (err.code === "ER_ROW_IS_REFERENCED_2")
    return res.status(409).json({ success: false, message: "Cannot delete — record is referenced elsewhere" });

  if (err.code === "ER_NO_REFERENCED_ROW_2")
    return res.status(400).json({ success: false, message: "Referenced record does not exist" });

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, validate, errorHandler, notFound };
