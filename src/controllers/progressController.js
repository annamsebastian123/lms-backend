const progressService = require("../services/progressService");

async function updateProgress(req, res) {
  try {
    const progress = await progressService.updateProgress(
      req.user.id,
      req.params.lessonId,
      Number(req.body.currentPosition),
      Number(req.body.totalDuration)
    );

    res.json(progress);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function getProgress(req, res) {
  try {
    const progress = await progressService.getProgress(
      req.user.id,
      req.params.lessonId
    );

    res.json(progress || null);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  updateProgress,
  getProgress,
};