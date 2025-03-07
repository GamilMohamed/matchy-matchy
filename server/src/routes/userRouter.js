var express = require("express");
var router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { isAuthenticated, validateBody } = require("../middlewares/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 5MB file size limit
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'pictures[]', maxCount: 5 }
]);

router.get("/", function (req, res) {
  res.send("respond with a resource");
});

router.get("/all", isAuthenticated, userController.getUsers);

router.get("/me", isAuthenticated, userController.getMe);
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error("Multer error:", err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    console.error("Unknown upload error:", err);
    return res.status(500).json({
      success: false,
      message: "File upload failed"
    });
  }
  // No error
  next();
};

function multerError(req, res, next) {
  upload(req, res, function(err) {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}

router.put(
  "/profile",
  isAuthenticated,
  multerError,
  body("gender").isIn(["male", "female", "other"]).notEmpty().withMessage("Gender is required"),
  body("sexualPreferences").isIn(["men", "women", "both"]).notEmpty().withMessage("Sexual preference is required"),
  body("biography").isString().trim().notEmpty().withMessage("Biography is required"),
  body("authorizeLocation").isBoolean().notEmpty().withMessage("Location authorization is required"),
  body("interests").isArray().notEmpty().withMessage("Interests are required"),
  userController.updateUser
);


module.exports = router;
