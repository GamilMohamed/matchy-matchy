const { getUserFromToken } = require("../utils/userUtils.js");
const prisma = require("../config/database.js");

exports.getMe = async function (req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        ...Object.fromEntries(
          Object.keys(prisma.user.fields)
            .filter((field) => field !== "password" && field !== "updatedAt" && field !== "profileComplete")
            .map((field) => [field, true])
        ),
      },
    });
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};

exports.getUsers = async function (req, res) {
  console.log("getUsers", req.user);
  const users = await prisma.user.findMany({
    select: {
      ...Object.fromEntries(
        Object.keys(prisma.user.fields)
          .filter((field) => field !== "password" && field !== "updatedAt" && field !== "profileComplete")
          .map((field) => [field, true])
      ),
    },
    where: {
      profileComplete: true,
    },
  });
  res.status(200).json(users);
};

exports.updateUser = async function (req, res) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: req.user.email
      },
      data: {
        ...req.body,
        profileComplete: true,
      },
    });
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};
