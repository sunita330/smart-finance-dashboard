const router = require("express").Router();
const ctrl   = require("../controllers/transactionController");
const { validate } = require("../middleware/errorHandler");
const { body, param, query } = require("express-validator");

const txnRules = [
  body("description")
    .trim().notEmpty().withMessage("Description is required")
    .isLength({ max: 180 }).withMessage("Max 180 characters"),
  body("amount")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type")
    .isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  body("category_id")
    .isInt({ gt: 0 }).withMessage("Valid category_id is required"),
  body("txn_date")
    .isDate().withMessage("Valid date required (YYYY-MM-DD)"),
  body("note")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 }).withMessage("Note max 500 characters"),
];

const idRule = [param("id").isInt({ gt: 0 }).withMessage("Invalid ID")];

// ── Analytics routes (MUST be before /:id) ───────────────────────────────────
router.get("/summary",   ctrl.summary);
router.get("/trend",     ctrl.trend);
router.get("/breakdown", ctrl.breakdown);
router.get("/top",       ctrl.top);

// ── CRUD ─────────────────────────────────────────────────────────────────────
router.get("/",    ctrl.getAll);
router.post("/",   txnRules, validate, ctrl.create);

router.get("/:id",    idRule, validate, ctrl.getOne);
router.put("/:id",    [...idRule, ...txnRules], validate, ctrl.update);
router.delete("/:id", idRule, validate, ctrl.remove);

module.exports = router;
