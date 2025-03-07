const prisma = require("../config/database.js");
const cloudinary = require("../config/cloudinary.js");
const { validationResult } = require("express-validator");

exports.getMe = async function (req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        ...Object.fromEntries(
          Object.keys(prisma.user.fields)
            .filter((field) => field !== "password" && field !== "updatedAt")
            .map((field) => [field, true])
        ),
        location: {
          select: {
            latitude: true,
            longitude: true,
            country: true,
            city: true,
          },
        },
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(400).json({ message: "Invalid Values: " + errors.array().map((error) => error.path).join(", ") });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
    });

    console.log("updateUser", req.body);
    const toUpdate = ({ gender, sexualPreferences, biography, interests } = req.body);
    const files = req.files;
    console.log("files", files);
    if (files.profilePicture) {
      const dataURI = `data:${files.profilePicture[0].mimetype};base64,${files.profilePicture[0].buffer.toString("base64")}`;
      const cloudinaryreturn = await cloudinary.uploader.upload(dataURI);
      toUpdate.profilePicture = cloudinaryreturn.secure_url;
    }
    
    if (files["pictures[]"]) {
      const pictures = [];
      for (const picture of files["pictures[]"]) {
        const dataURI = `data:${picture.mimetype};base64,${picture.buffer.toString("base64")}`;
        const cloudinaryreturn = await cloudinary.uploader.upload(dataURI);
        pictures.push(cloudinaryreturn.secure_url);
      }
      toUpdate.pictures = pictures;
    }
    console.log("toUpdate AVANT>>>>>>>>>>>>>>>  ", toUpdate.pictures);

    toUpdate.pictures = [...req.body.pictures, ...toUpdate.pictures].slice(0, 4);
    console.log("req body pictures>>>>>>>>>>>>>>>  ", req.body.pictures);
    console.log("toUpdate APRES>>>>>>>>>>>>>>>  ", toUpdate.pictures);
    const updatedUser = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        ...toUpdate,
        authorizeLocation: req.body.authorizeLocation === "true",
        location: {
          // Use upsert to either update existing location or create a new one
          upsert: {
            create: {
              latitude: Number(req.body.location.latitude),
              longitude: Number(req.body.location.longitude),
              country: req.body.location.country,
              city: req.body.location.city,
            },
            // This updates the existing location if it exists
            update: {
              latitude: Number(req.body.location.latitude),
              longitude: Number(req.body.location.longitude),
              country: req.body.location.country,
              city: req.body.location.city,
            },
          },
        },
        profileComplete: true,
        profilePicture: toUpdate.profilePicture,
        pictures: toUpdate.pictures,

      },
      select: {
        ...Object.fromEntries(
          Object.keys(prisma.user.fields)
            .filter((field) => field !== "password" && field !== "updatedAt")
            .map((field) => [field, true])
        ),
      },
    });
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
