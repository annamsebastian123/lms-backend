const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
    getAdminProfile,
    updateAdminProfile,
    getLearnerProfile,
    updateLearnerProfile
} = require("../controllers/profileController");

router.get("/admin", authMiddleware, getAdminProfile);
router.put("/admin", authMiddleware, updateAdminProfile);
router.get("/learner", authMiddleware, getLearnerProfile);
router.put("/learner", authMiddleware, updateLearnerProfile);

module.exports = router;