const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
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

const transactionRules = [
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 255 }),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  body("category_id").isInt({ gt: 0 }).withMessage("Valid category is required"),
  body("txn_date").isDate().withMessage("Valid date is required (YYYY-MM-DD)"),
  body("note").optional({ nullable: true }).isLength({ max: 1000 }),
  handleValidation,
];

const categoryRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("icon").optional().isLength({ max: 10 }),
  body("color").optional().matches(/^#[0-9A-Fa-f]{3,6}$/).withMessage("Invalid hex color"),
  handleValidation,
];

const budgetRules = [
  body("category_id").isInt({ gt: 0 }).withMessage("Valid category is required"),
  body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("Invalid year"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  handleValidation,
];

module.exports = { transactionRules, categoryRules, budgetRules };
