const express = require("express");
const { body } = require("express-validator");
const likeController = require("../controllers/likeController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", 
	body("username").isString().notEmpty(),
	isAuthenticated,
	likeController.addLike);

router.delete("/delete/:username",
	isAuthenticated,
	likeController.unlikeUser);

router.get("/:username/sent", 
	isAuthenticated,
	likeController.getLikesSent);

router.get("/:username/received", 
	isAuthenticated,
	likeController.getLikesReceived);

module.exports = router;
