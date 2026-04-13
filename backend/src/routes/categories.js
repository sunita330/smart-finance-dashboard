const router = require("express").Router();
const ctrl   = require("../controllers/categoryController");
const { validate } = require("../middleware/errorHandler");
const { body, param } = require("express-validator");

const catRules = [
  body("name")
    .trim().notEmpty().withMessage("Name is required")
    .isLength({ max: 60 }).withMessage("Name max 60 characters"),
  body("icon")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 10 }).withMessage("Icon max 10 characters"),
  body("color")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^#[0-9a-fA-F]{6}$/).withMessage("Color must be a valid hex e.g. #6d8cff"),
];

const idRule = [param("id").isInt({ gt: 0 }).withMessage("Invalid ID")];

router.get("/",       ctrl.getAll);
router.post("/",      catRules, validate, ctrl.create);
router.get("/:id",    idRule, validate, ctrl.getOne);
router.put("/:id",    [...idRule, ...catRules], validate, ctrl.update);
router.delete("/:id", idRule, validate, ctrl.remove);

module.exports = router;
