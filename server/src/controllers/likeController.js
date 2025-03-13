/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   likeController.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mvachera <mvachera@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/03/13 21:48:41 by mvachera          #+#    #+#             */
/*   Updated: 2025/03/13 22:09:05 by mvachera         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const pool = require("../config/database");

exports.getLikesSent = async (req, res) => {
	const { username } = req.params;
  
	try {
	  const query = `
		SELECT liked, created_at
		FROM "_Like"
		WHERE liker = $1
		ORDER BY created_at DESC
	  `;
  
	  const { rows } = await pool.query(query, [username]);
  
	  res.json({
		total: rows.length,
		likes: rows.map(row => ({
		  liked_users: row.liked,
		}))
	  });
	} catch (error) {
	  console.error("Erreur lors de la récupération des likes envoyés:", error);
	  res.status(500).json({ error: "Erreur serveur" });
	}
};

exports.getLikesReceived = async (req, res) => {
	const { username } = req.params;
  
	try {
	  const query = `
		SELECT liker, created_at
		FROM "Like"
		WHERE liked = $1
		ORDER BY created_at DESC
	  `;
  
	  const { rows } = await pool.query(query, [username]);
  
	  res.json({
		total: rows.length,
		likes: rows.map(row => ({
		  liker_user: row.liker,
		  created_at: row.created_at
		}))
	  });
	} catch (error) {
	  console.error("Erreur lors de la récupération des likes reçus:", error);
	  res.status(500).json({ error: "Erreur serveur" });
	}
};

exports.addLike = async (req, res) => {
	const liker = req.user.username;
	const liked = req.body.liked;
  
	if (!liker || !liked) {
	  return res.status(400).json({ error: "Les deux utilisateurs sont requis" });
	}
  
	const client = await pool.connect();
	
	try {
	  await client.query('BEGIN');
	  
	  // Check if the liked user exists
	  const userLiked = await client.query(
		'SELECT username, firstname, profile_picture, birth_date FROM "User" WHERE username = $1',
		[liked]
	  );
  
	  if (userLiked.rowCount === 0) {
		return res.status(404).json({ error: "L'utilisateur n'existe pas" });
	  }
	  
	  // Get liked user data
	  const likedUserData = userLiked.rows[0];
  
	  // Check if the like already exists
	  const checkExistingLike = await client.query(
		'SELECT 1 FROM "_Like" WHERE "liker" = $1 AND "liked" = $2',
		[liker, liked]
	  );
  
	  if (checkExistingLike.rowCount > 0) {
		return res.status(400).json({ error: "Vous avez déjà liké cet utilisateur" });
	  }
  
	  // Add the like to the database
	  await client.query(
		'INSERT INTO "_Like" ("liker", "liked") VALUES ($1, $2)',
		[liker, liked]
	  );
  
	  // Check if a match was created (the match trigger should create it automatically)
	  const checkMatch = await client.query(
		'SELECT matched_at FROM "Match" WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)',
		[liker, liked]
	  );

	  await client.query('COMMIT');

	  // Format date for consistent response
	  const formattedBirthDate = likedUserData.birth_date ? 
		new Date(likedUserData.birth_date).toISOString() : 
		null;
  
	  if (checkMatch.rowCount > 0) {
		return res.status(201).json({
		  message: "C'est un match!",
		  isMatch: true,
		  match: {
			match_with: liked,
			matched_at: checkMatch.rows[0].matched_at
		  },
		  likedUser: {
			username: likedUserData.username,
			firstname: likedUserData.firstname,
			profile_picture: likedUserData.profile_picture,
			birth_date: formattedBirthDate
		  }
		});
	  }
  
	  return res.status(201).json({
		message: "Like ajouté avec succès",
		isMatch: false,
		likedUser: {
		  username: likedUserData.username,
		  firstname: likedUserData.firstname,
		  profile_picture: likedUserData.profile_picture,
		  birth_date: formattedBirthDate
		}
	  });
  
	} catch (error) {
	  await client.query('ROLLBACK');
	  console.error("Erreur lors de l'ajout du like:", error);
	  res.status(500).json({ error: "Erreur serveur" });
	} finally {
	  client.release();
	}
  };