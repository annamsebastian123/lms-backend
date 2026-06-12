const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const progressController = require("../controllers/progressController");

router.get(
  "/:lessonId",
  authMiddleware,
  progressController.getProgress
);

router.post(
  "/:lessonId",
  authMiddleware,
  progressController.updateProgress
);

module.exports = router;