const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

router.post(
  "/video",
  authMiddleware,
  upload.single("video"),
  uploadController.uploadLessonVideo
);

module.exports = router;