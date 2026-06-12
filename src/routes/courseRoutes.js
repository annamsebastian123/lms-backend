const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

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

router.get(
  "/lessons/:id",
  authMiddleware,
  courseController.getLessonById
);

router.post("/", authMiddleware, courseController.createCourse);
router.get("/:id/students", authMiddleware, courseController.getCourseStudents);
router.get("/my-courses", authMiddleware, courseController.getMyCourses);
router.get("/tutor-courses", authMiddleware, courseController.getTutorCourses);
router.get("/tutor-stats", authMiddleware, courseController.getTutorStats);

router.post(
  "/:id/publish",
  authMiddleware,
  authorizeRoles("TUTOR"),
  courseController.publishCourse
);
router.put("/:id", authMiddleware, courseController.updateCourse);
router.get(
  "/public-stats",
  courseController.getPublicStats
);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.delete("/:id", authMiddleware, courseController.deleteCourse);
router.post("/:id/enroll", authMiddleware, courseController.enrollInCourse);
router.put(
  "/modules/:id",
  authMiddleware,
  courseController.updateModule
);

router.delete(
  "/modules/:id",
  authMiddleware,
  courseController.deleteModule
);

router.put(
  "/lessons/:id",
  authMiddleware,
  courseController.updateLesson
);

router.delete(
  "/lessons/:id",
  authMiddleware,
  courseController.deleteLesson
);
module.exports = router;