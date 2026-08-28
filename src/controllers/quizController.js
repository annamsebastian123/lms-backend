const quizService = require("../services/quizService");

async function createQuestion(req, res) {
  try {
    const question = await quizService.createQuestion(
      req.params.id,
      req.body
    );

    res.json(question);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function getQuestionsByModule(req, res) {
  try {
    const questions = await quizService.getQuestionsByModule(
      req.params.id
    );

    res.json(questions);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function submitQuiz(req, res) {
  try {
    console.log("SUBMIT BODY:", req.body);
    console.log("USER:", req.user);

    const result = await quizService.submitQuiz(
      req.user.id,
      req.body.moduleId,
      req.body.answers
    );

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function getQuizAttempt(req, res) {
  try {
    const attempt = await quizService.getQuizAttempt(
      req.params.id
    );

    res.json(attempt);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function deleteQuestion(req, res) {
  try {
    await quizService.deleteQuestion(req.params.id);

    res.json({
      message: "Question deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function getMyAttempt(req, res) {
  try {
    const attempt = await quizService.getMyAttempt(req.user.id, req.params.id);
    res.json(attempt);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  createQuestion,
  getQuestionsByModule,
  submitQuiz,
  getQuizAttempt,
  deleteQuestion,
  getMyAttempt,
};