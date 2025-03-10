const pool = require("../config/database");

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
	const { currentUser, likedUser } = req.body;
  
	if (!currentUser || !likedUser) {
	  return res.status(400).json({ error: "Les deux utilisateurs sont requis" });
	}
  
	try {
	  // Vérifier si le like existe déjà
	  const checkExistingLike = await pool.query(
		'SELECT * FROM "Like" WHERE liker = $1 AND liked = $2',
		[currentUser, likedUser]
	  );
	  
	  if (checkExistingLike.rows.length > 0) {
		return res.status(400).json({ error: "Vous avez déjà liké cet utilisateur" });
	  }
	  
	  // Ajouter le like
	  await pool.query(
		'INSERT INTO "Like" (liker, liked) VALUES ($1, $2)',
		[currentUser, likedUser]
	  );
	  
	  // Vérifier si un match a été créé (le trigger l'aura fait automatiquement si nécessaire)
	  const checkMatch = await pool.query(
		'SELECT * FROM "Match" WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)',
		[currentUser, likedUser]
	  );
	  
	  if (checkMatch.rows.length > 0) {
		return res.status(201).json({
		  message: "C'est un match!",
		  isMatch: true,
		  match: {
			match_with: likedUser,
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