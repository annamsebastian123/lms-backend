const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles =require("../middlewares/roleMiddleware");
router.post(
  "/modules/:id/questions",
  authMiddleware,
  authorizeRoles("ADMIN", "TUTOR"),
  quizController.createQuestion
);

router.get(
  "/modules/:id/questions",
  authMiddleware,
  quizController.getQuestionsByModule
);
router.get(
  "/modules/:id/my-attempt",
  authMiddleware,
  quizController.getMyAttempt
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
router.delete(
  "/questions/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "TUTOR"),
  quizController.deleteQuestion
);
module.exports = router;