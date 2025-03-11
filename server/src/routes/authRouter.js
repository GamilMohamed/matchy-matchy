var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const { validateBody } = require("../middlewares/authMiddleware");

async function checkDouble(column, value, res) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * 
      FROM "User"
      WHERE ${column} = $1
    `;
    const result = await client.query(query, [value]);
    if (result.rowCount !== 0) {
      return res.status(400).json({ message: `${column} already in use` });
    }
  } catch (e) {
    console.error("Error while checking if the user exists:", e);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
}


router.get("/", function (req, res, next) {
  res.send("respond with MSSDASDSDSD");
});

router.get("/double/:username", async function (req, res, next) {
  await checkDouble("username", req.params.username, res);
  res.status(200).json({ message: "Username available" });
});


router.get("/double/:email", async function (req, res, next) {
  await checkDouble("email", req.params.email, res);
  res.status(200).json({ message: "Email available" });
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
