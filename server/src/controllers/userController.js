// const { Pool } = require('pg');
const cloudinary = require("../config/cloudinary.js");
const { validationResult } = require("express-validator");
const pool = require("../config/database"); // Use the exported pool

// Create a new PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

/**
 * Record when a user views another user's profile
 */
exports.viewUser = async function (req, res) {
  const client = await pool.connect();
  
  try {
    const viewer = req.user.username;
    const viewedUser = req.params.username;
    
    if (viewer === viewedUser) {
      return res.status(400).json({ message: "You cannot view yourself" });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if both users exist
    const userExistsQuery = `
      SELECT username FROM "User" 
      WHERE username IN ($1, $2)
    `;
    const usersResult = await client.query(userExistsQuery, [viewer, viewedUser]);
    
    if (usersResult.rowCount !== 2) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "One or both users not found" });
    }
    
    // Check if the view relationship already exists to avoid duplicates
    const viewExistsQuery = `
      SELECT * FROM "_Views" 
      WHERE "A" = $1 AND "B" = $2
    `;
    const viewExists = await client.query(viewExistsQuery, [viewer, viewedUser]);
    
    // If relationship doesn't exist, create it
    if (viewExists.rowCount === 0) {
      const createViewQuery = `
        INSERT INTO "_Views" ("A", "B")
        VALUES ($1, $2)
      `;
      await client.query(createViewQuery, [viewer, viewedUser]);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    return res.status(200).json({ message: "User viewed successfully" });
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error("Error in viewUser:", error);
    return res.status(500).json({ message: "Failed to record user view" });
  } finally {
    // Release the client back to the pool
    client.release();
  }
};

/**
 * Get the current user's profile information
 */
exports.getMe = async function (req, res) {
  const client = await pool.connect();
  
  try {
    const username = req.user.username;
    console.log("user in getme", req.user);
    
    // Get user data
    const userQuery = `
      SELECT 
        u.username, u.email, u.firstname, u.lastname, 
        u."profile_complete" AS "profile_complete", 
        u."sexual_preferences" AS "sexual_preferences", 
        u.gender, u."birth_date" AS "birth_date", 
        u.biography, u."profile_picture" AS "profile_picture", 
        u."created_at" AS "created_at", u.interests, 
        u."authorize_location" AS "authorize_location", 
        u.pictures,
        l.id AS "location_id", l.latitude, l.longitude, 
        l.city, l.country

      FROM "User" u
      LEFT JOIN "Location" l ON u."location_id" = l.id
      WHERE u.username = $1
    `;
    
    const userResult = await client.query(userQuery, [username]);
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get viewed users (users that this user has viewed)
    const viewedQuery = `
      SELECT u.username, u.firstname, u.lastname, u.profile_picture
      FROM "User" u
      JOIN "_Views" v ON u.username = v."B"
      WHERE v."A" = $1
    `;
    
    const viewedResult = await client.query(viewedQuery, [username]);
    
    // Get users who viewed this user
    const viewed_byQuery = `
      SELECT u.username, u.firstname, u.lastname, u.profile_picture
      FROM "User" u
      JOIN "_Views" v ON u.username = v."A"
      WHERE v."B" = $1
    `;
    
    const viewed_byResult = await client.query(viewed_byQuery, [username]);
    
    // Get users liked by this user
    const likedQuery = `
      SELECT u.username, u.firstname, u.lastname, u.profile_picture, l.created_at AS liked_at
      FROM "User" u
      JOIN "_Like" l ON u.username = l.liked
      WHERE l.liker = $1
      ORDER BY l.created_at DESC
    `;
    
    const likedResult = await client.query(likedQuery, [username]);
    
    // Get users who liked this user
    const liked_byQuery = `
      SELECT u.username, u.firstname, u.lastname, u.profile_picture, l.created_at AS liked_at
      FROM "User" u
      JOIN "_Like" l ON u.username = l.liker
      WHERE l.liked = $1
      ORDER BY l.created_at DESC
    `;
    
    const liked_byResult = await client.query(liked_byQuery, [username]);
    
    // Get matched users
    const matchedQuery = `
      SELECT 
        u.username, u.firstname, u.lastname, u.profile_picture, m.matched_at
      FROM "User" u
      JOIN "Match" m ON 
        (m.user1 = $1 AND m.user2 = u.username) OR
        (m.user2 = $1 AND m.user1 = u.username)
      ORDER BY m.matched_at DESC
    `;
    
    const matchedResult = await client.query(matchedQuery, [username]);
    
    // Format user data
    const userData = userResult.rows[0];
    
    // Format location data
    const location = userData.location_id ? {
      id: userData.location_id,
      latitude: userData.latitude,
      longitude: userData.longitude,
      country: userData.country,
      city: userData.city
    } : null;
    
    // Remove location fields from user object
    delete userData.latitude;
    delete userData.longitude;
    delete userData.country;
    delete userData.city;
    delete userData.location_id;
    
    // Format viewed and viewed_by arrays
    const viewed = viewedResult.rows;
    const viewed_by = viewed_byResult.rows;
    const liked = likedResult.rows;
    const liked_by = liked_byResult.rows;
    const matches = matchedResult.rows;
    
    return res.status(200).json({
      ...userData,
      location,
      viewed,
      viewed_by,
      liked,
      liked_by,
      matches
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ message: "Failed to retrieve user profile", error: error.message });
  } finally {
    client.release();
  }
};
/**
 * Get all users with completed profiles
 */
exports.getUsers = async function (req, res) {
  const client = await pool.connect();
  
  try {
    const usersQuery = `
      SELECT 
        u.username, u.email, u.firstname, u.lastname, 
        u.sexual_preferences AS "sexual_preferences", 
        u.gender, u.birth_date AS "birth_date", 
        u.biography, u.profile_picture AS "profile_picture", 
        u.created_at AS "created_at", u.interests, 
        u.authorize_location AS "authorize_location", 
        u.pictures,
        l.id AS "location_id", l.latitude, l.longitude, 
        l.city, l.country
      FROM "User" u
      LEFT JOIN "Location" l ON u.location_id = l.id
      WHERE u.profile_complete = true
    `;
    
    const usersResult = await client.query(usersQuery);
    
    // Format user data
    const users = usersResult.rows.map(user => {
      // Format location data
      const location = user.location_id ? {
        latitude: user.latitude,
        longitude: user.longitude,
        country: user.country,
        city: user.city
      } : null;
      
      // Remove location fields from user object
      delete user.latitude;
      delete user.longitude;
      delete user.country;
      delete user.city;
      
      return {
        ...user,
        location
      };
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res.status(500).json({ message: "Failed to retrieve users" });
  } finally {
    client.release();
  }
};

/**
 * Update the current user's profile
 */
exports.updateUser = async function (req, res) {
  const client = await pool.connect();
  
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid Values: " + errors.array().map(error => error.path).join(", "),
      });
    }

    // Extract data from request
    const { gender, sexual_preferences, biography, interests } = req.body;
    let { location, pictures } = req.body;
    let profile_picture = req.body.profile_picture;
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
    if (files && files["profile_picture"]) {
      const dataURI = `data:${files.profile_picture[0].mimetype};base64,${files.profile_picture[0].buffer.toString("base64")}`;
      const cloudinaryResult = await cloudinary.uploader.upload(dataURI);
      profile_picture = cloudinaryResult.secure_url;
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
        const dataURI = `data:${picture.mimetype};base64,${picture.buffer.toString("base64")}`;      console.log("avant");
        const cloudinaryResult = await cloudinary.uploader.upload(dataURI);      console.log("apres");
        picturesSet.add(cloudinaryResult.secure_url);
      }
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    const username = req.user.username;
    
    // Check if user has a location
    const locationQuery = `
      SELECT "location_id" 
      FROM "User" 
      WHERE username = $1
    `;
    
    const locationResult = await client.query(locationQuery, [username]);
    const existinglocation_id = locationResult.rows[0]?.location_id;
    
    let location_id = existinglocation_id;
    
    // Handle location update or creation
    if (locationData.latitude && locationData.longitude) {
      if (existinglocation_id) {
        // Update existing location
        const updateLocationQuery = `
          UPDATE "Location"
          SET 
            latitude = $1,
            longitude = $2,
            city = $3,
            country = $4
          WHERE id = $5
          RETURNING id
        `;
        
        const updateLocationResult = await client.query(
          updateLocationQuery, 
          [
            Number(locationData.latitude),
            Number(locationData.longitude),
            locationData.city,
            locationData.country,
            existinglocation_id
          ]
        );
        
        location_id = updateLocationResult.rows[0].id;
      } else {
        // Create new location
        const createLocationQuery = `
          INSERT INTO "Location" (id, latitude, longitude, city, country)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
          RETURNING id
        `;
        
        const createLocationResult = await client.query(
          createLocationQuery, 
          [
            Number(locationData.latitude),
            Number(locationData.longitude),
            locationData.city,
            locationData.country
          ]
        );
        
        location_id = createLocationResult.rows[0].id;
      }
    }
    
    // Update user profile
    const updateUserQuery = `
      UPDATE "User"
      SET 
        gender = $1,
        sexual_preferences = $2,
        biography = $3,
        interests = $4,
        profile_picture = $5,
        authorize_location = $6,
        location_id = $7,
        profile_complete = true,
        pictures = $8,
        updated_at = NOW()
      WHERE username = $9
      RETURNING *
    `;
    
    const updateUserResult = await client.query(
      updateUserQuery, 
      [
        gender,
        sexual_preferences,
        biography,
        interests,
        profile_picture,
        req.body.authorize_location === "true",
        location_id,
        Array.from(picturesSet),
        username
      ]
    );
    
    // Get updated location data
    const updatedLocationQuery = `
      SELECT *
      FROM "Location"
      WHERE id = $1
    `;
    
    const updatedLocationResult = await client.query(updatedLocationQuery, [location_id]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Format user data for response
    const updatedUser = updateUserResult.rows[0];
    
    // Convert snake_case to camelCase for response
    const formattedUser = {
      username: updatedUser.username,
      email: updatedUser.email,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      profile_complete: updatedUser.profile_complete,
      sexual_preferences: updatedUser.sexual_preferences,
      gender: updatedUser.gender,
      birth_date: updatedUser.birth_date,
      biography: updatedUser.biography,
      profile_picture: updatedUser.profile_picture,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      interests: updatedUser.interests,
      authorize_location: updatedUser.authorize_location,
      pictures: updatedUser.pictures
    };
    
    // Add location data if it exists
    if (location_id && updatedLocationResult.rowCount > 0) {
      const locationData = updatedLocationResult.rows[0];
      formattedUser.location = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country
      };
    }
    
    return res.status(200).json(formattedUser);
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Failed to update user profile" });
  } finally {
    client.release();
  }
};