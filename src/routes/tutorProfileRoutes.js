const express = require("express");
const router = express.Router();

const {
    getTutorProfile,
    updateTutorProfile
} = require("../controllers/tutorProfileController");

router.get("/", getTutorProfile);
router.put("/", updateTutorProfile);

module.exports = router;