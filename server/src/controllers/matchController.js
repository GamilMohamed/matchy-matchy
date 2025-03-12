const pool = require("../config/database");

exports.getMatches = async (req, res) => {
  const { username } = req.params;

  try {
    const query = `
      SELECT user1, user2, matched_at 
      FROM "Match"
      WHERE user1 = $1 OR user2 = $1
      ORDER BY matched_at DESC;
    `;

    const { rows } = await pool.query(query, [username]);

    // Transformer les résultats pour ne pas afficher l'utilisateur lui-même deux fois
    const matches = rows.map(row => ({
      match_with: row.user1 === username ? row.user2 : row.user1,
      matched_at: row.matched_at
    }));

    res.json(matches);
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
