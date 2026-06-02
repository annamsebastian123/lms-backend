const prisma = require("../prisma");

async function createCourse(data, userId) {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      createdBy: userId,
    },
  });
}

async function getAllCourses() {
  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function getCourseById(id) {
  return prisma.course.findUnique({
    where: { id },
  });
}

async function updateCourse(id, data) {
  return prisma.course.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
    },
  });
}

async function deleteCourse(id) {
  return prisma.course.delete({
    where: { id },
  });
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
