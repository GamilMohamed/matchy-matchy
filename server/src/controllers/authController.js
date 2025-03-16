const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { alreadyInDatabase } = require("../utils/authUtils");

exports.signIn = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT * 
      FROM "User"
      WHERE email = $1
    `;
    
    const userResult = await client.query(userQuery, [email]);
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = userResult.rows[0];
    console.log(user);

    // const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // if (!isPasswordCorrect) {
    //   return res.status(401).json({ message: "Incorrect password" });
    // }

    const payload = {
      username: user.username,
      date: new Date(),
    };

    const jwtExpire = 60 * 60 * 2; // 2 hours
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: jwtExpire });
    
    // Format user data for response (convert snake_case to camelCase)
    const formattedUser = {
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profile_complete: user.profile_complete,
      sexual_preferences: user.sexual_preferences,
      gender: user.gender,
      birth_date: user.birth_date,
      biography: user.biography,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      interests: user.interests,
      authorize_location: user.authorize_location,
      pictures: user.pictures
    };
    
    return res.status(200).json({ token, user: formattedUser });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

exports.signUp = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, firstname, lastname, username, birth_date } = req.body;
    if (await alreadyInDatabase(email, username)) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const createUserQuery = `
      INSERT INTO "User" (
        email, 
        password, 
        firstname, 
        lastname, 
        username, 
        birth_date,
        sexual_preferences,
        interests,
        pictures,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING username
    `;
    
    await client.query(createUserQuery, [
      email,
      hashedPassword,
      firstname,
      lastname,
      username,
      new Date(birth_date),
      [], // Empty sexual_preferences array
      [], // Empty interests array
      []  // Empty pictures array
    ]);

    return res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};