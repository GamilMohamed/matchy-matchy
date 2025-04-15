const express = require("express");
const { getMatches } = require("../controllers/matchController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:username", isAuthenticated, getMatches);

module.exports = router;
