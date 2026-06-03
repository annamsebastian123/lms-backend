const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCourse(data, userId) {
  return await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      userId: userId,
    },
  });
}

async function getAllCourses() {
  return await prisma.course.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

async function getCourseById(id) {
  return await prisma.course.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
    },
  });
}

async function deleteCourse(id) {
  return await prisma.course.delete({
    where: { id: Number(id) },
  });
}
async function enrollInCourse(userId, courseId) {
  return await prisma.enrollment.create({
    data: {
      userId,
      courseId: Number(courseId),
    },
  });
}
async function getMyCourses(userId) {
  return await prisma.enrollment.findMany({
    where: {
      userId,
    },
    include: {
      course: true,
    },
  });
}
async function getCourseStudents(courseId) {
  return await prisma.enrollment.findMany({
    where: {
      courseId: Number(courseId),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
async function createModule(courseId, data) {
  return await prisma.module.create({
    data: {
      title: data.title,
      courseId: Number(courseId),
    },
  });
}

async function getModulesByCourse(courseId) {
  return await prisma.module.findMany({
    where: {
      courseId: Number(courseId),
    },
  });
}
module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  createModule,
  getModulesByCourse,
  enrollInCourse,
  getMyCourses,
  getCourseStudents,
};