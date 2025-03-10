const express = require("express");
const { getMatches } = require("../controllers/matchController");

const router = express.Router();

router.get("/matches/:username", getMatches);

module.exports = router;
