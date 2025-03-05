var express = require("express");
const prisma = require("../db");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with MSSDASDSDSD");
});

async function alreadyInDatabase(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

router.post("/signup", async function (req, res) {
  try {
    const requiredFields = ["email", "password", "firstname", "lastname", "username"];
    requiredFields.forEach((field) => {
      if (!(field in req.body)) {
        return res.status(400).json({ message: `Missing ${field} in request body` });
      }
    });
    const { email, password, firstname, lastname, username } = req.body;

    if (await alreadyInDatabase(email)) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        username,
      },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signin", async function (req, res) {
  try {
    console.log(req.body);
    const requiredFields = ["email", "password"];
    requiredFields.forEach((field) => {
      if (!(field in req.body)) {
        throw new Error(`Missing ${field} in request body`);
      }
    });
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Incorrect password");
    }

    // generate token
    const payload = {
      email: user.email,
      id: user.id,
      date: new Date(),
    };

    const jwtExpire = 3 * 23 * 60 * 60 * 1000;
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: jwtExpire,
    });
    console.log("token in signin", token);
    return res.status(200).json({ token, user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/refresh", async function (req, res) {
  try {
    console.log(req.body);
    const requiredFields = ["token"];
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const newPayload = {
      email: payload.email,
      id: payload.id,
      date: new Date(),
    };
    console.log("payload in refresh", payload);
    console.log("payload time in refresh", new Date(payload.date).getTime());
    console.log("current time in refresh", new Date(payload.iat).getTime());
    console.log("current time in refresh", new Date(payload.exp).getTime());
    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
      expiresIn: 3 * 23 * 60 * 60 * 1000,
    });
    const user = await prisma.user.findUnique({
      where: {
        email: newPayload.email,
      },
    });
    console.log("token in refresh", newToken);
    console.log("user in refresh", user);
    return res.status(200).json({ token: newToken });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Internal server error" + e);
  }
});

module.exports = router;
