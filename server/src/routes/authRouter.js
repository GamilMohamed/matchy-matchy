var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const { validateBody } = require("../middlewares/authMiddleware");

router.get("/", function (req, res, next) {
  res.send("respond with MSSDASDSDSD");
});

router.post("/signup",
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  body("firstname").isString().notEmpty(),
  body("lastname").isString().notEmpty(),
  body("username").isString().notEmpty(),
  body("birth_date").isDate(),
  validateBody,
  authController.signUp);

router.post("/signin", 
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  validateBody,
  authController.signIn);

module.exports = router;
