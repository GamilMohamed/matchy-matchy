const express = require("express");
const { addLike } = require("../controllers/likeController");

const router = express.Router();

router.post("/like", addLike);
router.get("/users/:username/likes/received", likeController.getLikesReceived);

module.exports = router;
