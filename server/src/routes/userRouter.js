var express = require("express");
var router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { isAuthenticated, validateBody } = require("../middlewares/authMiddleware");

router.get("/", function (req, res) {
  res.send("respond with a resource");
});

router.get("/all", isAuthenticated, userController.getUsers);

router.get("/me", isAuthenticated, userController.getMe);

router.put(
  "/profile",
  body("gender").isString().trim().notEmpty(),
  body("sexualPreferences").isString().trim().notEmpty(),
  body("biography").isString().trim().notEmpty(),
  body("interests").isArray().notEmpty(),
  body("profilePicture").optional(),
  isAuthenticated,
  validateBody,
  userController.updateUser
);

module.exports = router;
