const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const certificateController = require("../controllers/certificateController");

router.get(
    "/my-certificates",
    authMiddleware,
    certificateController.getMyCertificates
);

router.post(
    "/generate/:courseId",
    authMiddleware,
    certificateController.generateCertificate
);

router.get(
    "/:id/download",
    certificateController.downloadCertificate
);

module.exports = router;