const router = require("express").Router();
const ctrl   = require("../controllers/categoryController");
const { validate } = require("../middleware/errorHandler");
const { body, param } = require("express-validator");

const catRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("icon").optional().isLength({ max: 10 }),
  body("color").optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage("Invalid hex color"),
];

router.get("/",       ctrl.getAll);
router.post("/",      catRules, validate, ctrl.create);
router.get("/:id",    [param("id").isInt({ gt: 0 })], validate, ctrl.getOne);
router.put("/:id",    [param("id").isInt({ gt: 0 }), ...catRules], validate, ctrl.update);
router.delete("/:id", [param("id").isInt({ gt: 0 })], validate, ctrl.remove);

module.exports = router;
