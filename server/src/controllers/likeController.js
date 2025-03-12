const pool = require("../config/database");

exports.getLikesSent = async (req, res) => {
	const { username } = req.params;
  
	try {
	  const query = `
		SELECT liked, created_at
		FROM "Like"
		WHERE liker = $1
		ORDER BY created_at DESC
	  `;
  
	  const { rows } = await pool.query(query, [username]);
  
	  res.json({
		total: rows.length,
		likes: rows.map(row => ({
		  liked_user: row.liked,
		  created_at: row.created_at
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
	const liked_user = req.body.liked_user;

	console.log("liker", liker);
	console.log("liked_user", liked_user);
	if (!liker || !liked_user) {
	  return res.status(400).json({ error: "Les deux utilisateurs sont requis" });
	}

	try {
		// Vérifier si le like existe déjà
		const checkExistingLike = await pool.query(
		  'SELECT 1 FROM "_Like" WHERE "A" = $1 AND "B" = $2',
		  [liker, liked_user]
		);
	
		if (checkExistingLike.rowCount > 0) {
		  return res.status(400).json({ error: "Vous avez déjà liké cet utilisateur" });
		}
	
		// Ajouter le like
		await pool.query(
		  'INSERT INTO "_Like" ("A", "B") VALUES ($1, $2)',
		  [liker, liked_user]
		);
	
		// Vérifier si un match a été créé
		const checkMatch = await pool.query(
		  'SELECT matched_at FROM "Match" WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)',
		  [liker, liked_user]
		);
	
		if (checkMatch.rowCount > 0) {
		  return res.status(201).json({
			message: "C'est un match!",
			isMatch: true,
			match: {
			  match_with: liked_user,
			  matched_at: checkMatch.rows[0].matched_at
			}
		  });
		}
	
		return res.status(201).json({
		  message: "Like ajouté avec succès",
		  isMatch: false
		});
	
	  } catch (error) {
		console.error("Erreur lors de l'ajout du like:", error);
		res.status(500).json({ error: "Erreur serveur" });
	  }
};