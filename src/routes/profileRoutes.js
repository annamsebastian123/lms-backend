const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
    getAdminProfile,
    updateAdminProfile,
    getLearnerProfile,
    updateLearnerProfile
} = require("../controllers/profileController");

router.get("/admin", getAdminProfile);
router.put("/admin", updateAdminProfile);

router.get("/learner", authMiddleware, getLearnerProfile);
router.put("/learner", authMiddleware, updateLearnerProfile);

module.exports = router;