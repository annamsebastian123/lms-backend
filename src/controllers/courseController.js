const courseService = require("../services/courseService");

async function createCourse(req, res) {
  try {
    const userId = req.user?.id;
    const course = await courseService.createCourse(req.body, userId);

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await courseService.getAllCourses();

    res.json({
      message: "Courses retrieved successfully",
      courses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course retrieved successfully",
      course,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body);

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    await courseService.deleteCourse(id);

    res.json({
      message: "Course deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
