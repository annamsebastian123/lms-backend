const courseService = require("../services/courseService");

async function createCourse(req, res) {
  try {
    if (!["ADMIN", "TUTOR"].includes(req.user.role)) {
  return res.status(403).json({
    message: "Access denied."
  });
}

    const course = await courseService.createCourse(req.body, req.user.id);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCourseById(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteCourse(req, res) {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function enrollInCourse(req, res) {
  try {
    const enrollment = await courseService.enrollInCourse(
      req.user.id,
      req.params.id
    );

    res.json({
      message: "Enrolled successfully",
      enrollment,
    });
  }   catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "You are already enrolled in this course",
      });
    }

    res.status(400).json({
      error: err.message,
    });
  }
}
async function getMyCourses(req, res) {
  try {
    const courses = await courseService.getMyCourses(req.user.id);

    res.json(courses);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function getTutorStats(req, res) {
  try {
    const stats = await courseService.getTutorStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function getCourseStudents(req, res) {
  try {
    const students = await courseService.getCourseStudents(
      req.params.id
    );

    res.json(students);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function createModule(req, res) {
  try {
    const module = await courseService.createModule(req.params.id, req.body);
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getModulesByCourse(req, res) {
  try {
    const modules = await courseService.getModulesByCourse(req.params.id);
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createLesson(req, res) {
  try {
    const lesson = await courseService.createLesson(
      req.params.id,
      req.body
    );

    res.json(lesson);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function getLessonsByModule(req, res) {
  try {
    const lessons = await courseService.getLessonsByModule(
      req.params.id
    );

    res.json(lessons);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  createModule,
  getModulesByCourse,
  getCourseStudents,
  enrollInCourse,
  getMyCourses,
  getTutorStats,
  createLesson,
  getLessonsByModule,
};