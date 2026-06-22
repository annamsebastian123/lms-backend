

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const tutorProfileController = require("../controllers/tutorProfileController");

router.get("/", authMiddleware, tutorProfileController.getTutorProfile);
router.put("/", authMiddleware, tutorProfileController.updateTutorProfile);

module.exports = router;

module.exports = router;