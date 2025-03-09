const prisma = require("../config/database.js");
const cloudinary = require("../config/cloudinary.js");
const { validationResult } = require("express-validator");

/**
 * Record when a user views another user's profile
 */
exports.viewUser = async function (req, res) {
  try {
    const viewer = req.user.username;
    const viewedUser = req.params.username;
    
    if (viewer === viewedUser) {
      return res.status(400).json({ message: "You cannot view yourself" });
    }
    
    await prisma.$transaction([
      prisma.user.update({
        where: { username: viewer },
        data: {
          viewed: {
            connect: { username: viewedUser },
          },
        },
      }),
      prisma.user.update({
        where: { username: viewedUser },
        data: {
          viewedBy: {
            connect: { username: viewer },
          },
        },
      }),
    ]);
    
    return res.status(200).json({ message: "User viewed successfully" });
  } catch (error) {
    console.error("Error in viewUser:", error);
    return res.status(500).json({ message: "Failed to record user view" });
  }
};

/**
 * Get the current user's profile information
 */
exports.getMe = async function (req, res) {
  try {
    // Get all user fields except password and updatedAt
    const userFields = Object.keys(prisma.user.fields)
      .filter(field => field !== "password" && field !== "updatedAt")
      .reduce((obj, field) => ({ ...obj, [field]: true }), {});

    const user = await prisma.user.findUnique({
      where: {
        username: req.user.username,
      },
      select: {
        ...userFields,
        location: {
          select: {
            latitude: true,
            longitude: true,
            country: true,
            city: true,
          },
        },
        pictures: true,
        viewed: {
          select: {
            username: true,
          },
        },
        viewedBy: {
          select: {
            username: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ message: "Failed to retrieve user profile" });
  }
};

/**
 * Get all users with completed profiles
 */
exports.getUsers = async function (req, res) {
  try {
    // Get all user fields except password, updatedAt and profileComplete
    const userFields = Object.keys(prisma.user.fields)
      .filter(field => !["password", "updatedAt", "profileComplete"].includes(field))
      .reduce((obj, field) => ({ ...obj, [field]: true }), {});

    const users = await prisma.user.findMany({
      select: {
        ...userFields,
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
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res.status(500).json({ message: "Failed to retrieve users" });
  }
};

/**
 * Update the current user's profile
 */
exports.updateUser = async function (req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid Values: " + errors.array().map(error => error.path).join(", "),
      });
    }

    // Extract data from request
    const { gender, sexualPreferences, biography, interests } = req.body;
    let { location, pictures } = req.body;
    let profilePicture = req.body.profilePicture;
    const files = req.files;
    
    // Process location data
    let locationData = {};
    if (typeof location === "string") {
      try {
        locationData = JSON.parse(location);
      } catch (error) {
        console.error("Error parsing location JSON:", error);
        return res.status(400).json({ message: "Invalid location format" });
      }
    } else {
      locationData = location || {};
    }

    // Process profile picture
    if (files && files["profilePicture"]) {
      const dataURI = `data:${files.profilePicture[0].mimetype};base64,${files.profilePicture[0].buffer.toString("base64")}`;
      const cloudinaryResult = await cloudinary.uploader.upload(dataURI);
      profilePicture = cloudinaryResult.secure_url;
    }

    // Process pictures
    let picturesArray = [];
    if (typeof pictures === "string") {
      try {
        picturesArray = JSON.parse(pictures);
      } catch (error) {
        console.error("Error parsing pictures JSON:", error);
        return res.status(400).json({ message: "Invalid pictures format" });
      }
    } else {
      picturesArray = pictures || [];
    }
    
    // Convert to Set for uniqueness then back to Array
    let picturesSet = new Set(picturesArray);
    
    // Upload new pictures
    if (files && files["pictures[]"]) {
      for (const picture of files["pictures[]"]) {
        const dataURI = `data:${picture.mimetype};base64,${picture.buffer.toString("base64")}`;
        const cloudinaryResult = await cloudinary.uploader.upload(dataURI);
        picturesSet.add(cloudinaryResult.secure_url);
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        username: req.user.username,
      },
      data: {
        gender,
        sexualPreferences,
        biography,
        interests,
        profilePicture,
        authorizeLocation: req.body.authorizeLocation === "true",
        location: {
          upsert: {
            create: {
              latitude: Number(locationData.latitude),
              longitude: Number(locationData.longitude),
              country: locationData.country,
              city: locationData.city,
            },
            update: {
              latitude: Number(locationData.latitude),
              longitude: Number(locationData.longitude),
              country: locationData.country,
              city: locationData.city,
            },
          },
        },
        profileComplete: true,
        pictures: {
          set: Array.from(picturesSet),
        },
      },
    });
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Failed to update user profile" });
  }
};