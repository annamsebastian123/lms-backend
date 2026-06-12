const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const certificateController = require("../controllers/certificateController");

router.get("/my-certificates", authMiddleware, certificateController.getMyCertificates);

module.exports = router;