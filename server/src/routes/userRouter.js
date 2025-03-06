var express = require("express");
var router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { isAuthenticated, validateBody } = require("../middlewares/authMiddleware");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

router.get("/", function (req, res) {
  res.send("respond with a resource");
});

router.get("/all", isAuthenticated, userController.getUsers);

router.get("/me", isAuthenticated, userController.getMe);

router.put(
  "/profile",
  isAuthenticated,
  upload.single("profilePicture"),

  // body("gender").isString().trim().notEmpty(),
  // body("sexualPreferences").isString().trim().notEmpty(),
  // body("biography").isString().trim().notEmpty(),
  // body("interests").isArray().notEmpty(),
  // body("profilePicture").optional(),
  isAuthenticated,
  // validateBody,
  userController.updateUser
);

module.exports = router;
