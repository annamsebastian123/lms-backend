const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  courseController.createCourse
);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  courseController.updateCourse
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  courseController.deleteCourse
);

module.exports = router;
