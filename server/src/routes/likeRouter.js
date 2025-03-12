const express = require("express");
const { addLike } = require("../controllers/likeController");
const { body } = require("express-validator");
const likeController = require("../controllers/likeController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", 
	body("username").isString().notEmpty(),
	isAuthenticated,
	addLike);

router.get("/:username/sent", 
	isAuthenticated,
	likeController.getLikesSent);

router.get("/:username/received", 
	isAuthenticated,
	likeController.getLikesReceived);

module.exports = router;
