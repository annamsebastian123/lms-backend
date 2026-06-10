const express = require("express");
const router = express.Router();

const {
    getAdminProfile,
    updateAdminProfile
} = require("../controllers/profileController");

router.get("/admin", getAdminProfile);
router.put("/admin", updateAdminProfile);

module.exports = router;