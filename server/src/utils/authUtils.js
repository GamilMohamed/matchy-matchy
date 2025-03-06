const prisma = require("../config/database");

async function alreadyInDatabase(email, username) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email,
        },
        {
          username,
        },
      ],
    },
  });
  return user;
}

module.exports = {
  alreadyInDatabase,
};
