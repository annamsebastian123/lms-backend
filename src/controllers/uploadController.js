const { uploadVideo } = require("../services/storageService");
async function uploadLessonVideo(req, res) {
  console.log("UPLOAD ROUTE HIT");
  console.log("FILE:", req.file);

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No video file uploaded",
      });
    }

    const key = await uploadVideo(req.file);

    res.json({
      success: true,
      videoKey: key,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Video upload failed",
      error: err.message,
    });
  }
}


module.exports = {
  uploadLessonVideo,
};