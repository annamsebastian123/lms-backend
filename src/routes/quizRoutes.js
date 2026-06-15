const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/modules/:id/questions",
  authMiddleware,
  quizController.createQuestion
);

router.get(
  "/modules/:id/questions",
  authMiddleware,
  quizController.getQuestionsByModule
);
router.post(
  "/submit",
  authMiddleware,
  quizController.submitQuiz
);

router.get(
  "/attempts/:id",
  authMiddleware,
  quizController.getQuizAttempt
);

module.exports = router;