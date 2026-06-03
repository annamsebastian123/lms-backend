const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/:id/modules", authMiddleware, courseController.createModule);
router.get("/:id/modules", authMiddleware, courseController.getModulesByCourse);
router.post(
  "/modules/:id/lessons",
  authMiddleware,
  courseController.createLesson
);
router.get(
  "/modules/:id/lessons",
  authMiddleware,
  courseController.getLessonsByModule
);
router.post("/", authMiddleware, courseController.createCourse);
router.get("/:id/students",authMiddleware,courseController.getCourseStudents);
router.get("/my-courses",authMiddleware,courseController.getMyCourses);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.delete("/:id", authMiddleware, courseController.deleteCourse);
router.post("/:id/enroll",authMiddleware,courseController.enrollInCourse);
module.exports = router;