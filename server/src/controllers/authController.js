const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { alreadyInDatabase } = require("../utils/authUtils");

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const payload = {
      email: user.email,
      date: new Date(),
    };

    const jwtExpire = 60 * 60 * 2; // 2 hours
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: jwtExpire,
    });
    return res.status(200).json({ token, user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { email, password, firstname, lastname, username, birthdate } = req.body;

    if (await alreadyInDatabase(email, username)) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        username,
        birthDate: new Date(birthdate),
      },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
