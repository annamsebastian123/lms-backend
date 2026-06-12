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

const jwt = require('jsonwebtoken');

async function getCourseById(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // If course is published, return it to anyone
    if (course.status === 'PUBLISHED') return res.json(course);

    // Course is DRAFT: allow owner or admins/tutors with valid token to view
    const auth = req.headers.authorization;
    if (!auth) return res.status(404).json({ message: 'Course not found' });

    const token = auth.replace(/^Bearer\s+/i, '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && (decoded.role === 'ADMIN' || (decoded.id && Number(decoded.id) === Number(course.userId)))) {
        return res.json(course);
      }
      return res.status(404).json({ message: 'Course not found' });
    } catch (e) {
      return res.status(404).json({ message: 'Course not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function publishCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await courseService.getCourseById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (Number(course.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to publish' });
    }
    const updated = await courseService.publishCourse(courseId, req.user.id);
    res.json(updated);
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
async function getTutorCourses(req, res) {
  try {
    const courses = await courseService.getTutorCourses(req.user.id);
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
async function getLessonById(req, res) {
  try {
    const lesson = await courseService.getLessonById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function updateCourse(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      Number(course.userId) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        message: "Not authorized to update this course",
      });
    }

    const updatedCourse = await courseService.updateCourse(
      req.params.id,
      req.body
    );

    res.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function updateModule(req, res) {
  try {
    const updatedModule = await courseService.updateModule(
      req.params.id,
      req.body
    );

    res.json({
      message: "Module updated successfully",
      module: updatedModule,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function deleteModule(req, res) {
  try {
    await courseService.deleteModule(req.params.id);

    res.json({
      message: "Module deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function updateLesson(req, res) {
  try {
    const updatedLesson = await courseService.updateLesson(
      req.params.id,
      req.body
    );

    res.json({
      message: "Lesson updated successfully",
      lesson: updatedLesson,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function deleteLesson(req, res) {
  try {
    await courseService.deleteLesson(req.params.id);

    res.json({
      message: "Lesson deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
async function getPublicStats(req, res) {
  try {
    const stats = await courseService.getPublicStats();

    res.json(stats);
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
  updateCourse,
  deleteCourse,
  createModule,
  getModulesByCourse,
  updateModule,
  deleteModule,
  getCourseStudents,
  enrollInCourse,
  getMyCourses,
  getTutorCourses,
  getTutorStats,
  publishCourse,
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  getPublicStats,
};