const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

async function getUserFromToken(token) {
  try {
    const secretKey = process.env.JWT_SECRET;
    const isVerified = jwt.verify(token, secretKey);
    if (!isVerified) {
      throw res.status(401).send("Unauthorized");
    }
    const user = await prisma.user.findUnique({
      where: {
        email: isVerified.email,
      },
    });
    return user;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  getUserFromToken,
};
