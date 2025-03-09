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
      location: {
        select: {
          latitude: true,
          longitude: true,
          country: true,
          city: true,
        },
      },
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
      return res.status(400).json({
        message:
          "Invalid Values: " +
          errors
            .array()
            .map((error) => error.path)
            .join(", "),
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
    });

    const toUpdate = ({ gender, sexualPreferences, biography, interests, profilePicture, location, pictures } = req.body);
    console.log("toUpdate", toUpdate.location);
    let locationObject;
    if (typeof toUpdate.location === "string") {
      try {
        locationObject = JSON.parse(toUpdate.location);
        console.log("Parsed location object:", locationObject);
      } catch (error) {
        console.error("Error parsing location JSON:", error);
      }
    }
    else {
      locationObject = toUpdate.location;
    }
    console.log("locationObject!!!", locationObject);
    const files = req.files;
    if (files && files["profilePicture"]) {
      const dataURI = `data:${files.profilePicture[0].mimetype};base64,${files.profilePicture[0].buffer.toString("base64")}`;
      const cloudinaryreturn = await cloudinary.uploader.upload(dataURI);
      toUpdate.profilePicture = cloudinaryreturn.secure_url;
    }

    let picturesArray = [];
    try {
      picturesArray = JSON.parse(toUpdate.pictures);
    }
    catch (error) {
      console.error("Error parsing pictures JSON:", error);
    }
    console.log(">>>>>>>>>>>>>picturesArray", picturesArray);
    toUpdate.pictures = new Set(picturesArray);
    if (files && files["pictures[]"]) {
      for (const picture of files["pictures[]"]) {
        const dataURI = `data:${picture.mimetype};base64,${picture.buffer.toString("base64")}`;
        const cloudinaryreturn = await cloudinary.uploader.upload(dataURI);
        toUpdate.pictures.add(cloudinaryreturn.secure_url);
      }
    }

    for (const pic in toUpdate.pictures) {
      console.log("pic", pic);
    }
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
              latitude: Number(locationObject.latitude) || locationObject["latitude"],
              longitude: Number(locationObject.longitude) || locationObject["longitude"],
              country: locationObject["country"] || "putain",
              city: locationObject["city"] || "aller la",
            },
            // This updates the existing location if it exists
            update: {
              latitude: Number(locationObject.latitude) || locationObject["latitude"],
              longitude: Number(locationObject.longitude) || locationObject["longitude"],
              country: locationObject["country"] || "putain",
              city: locationObject["city"] || "aller la",
            },
          },
        },
        profileComplete: true,
        profilePicture: toUpdate.profilePicture,
        pictures: {
          set: Array.from(toUpdate.pictures),
        },
      },
      // select: {
      //   ...Object.fromEntries(
      //     Object.keys(prisma.user.fields)
      //       .filter((field) => field !== "password" && field !== "updatedAt")
      //       .map((field) => [field, true])
      //   ),
      // },
    });
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
