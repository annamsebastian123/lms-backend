const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCourse(data, userId) {
  return await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "DRAFT",
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
    where: {
      id: Number(id),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

async function updateCourse(id, data) {
  return await prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      title: data.title,
      description: data.description,
    },
  });
}

async function deleteCourse(id) {
  const courseId = Number(id);

  const modules = await prisma.module.findMany({
    where: { courseId },
    select: { id: true },
  });

  const moduleIds = modules.map((module) => module.id);

  await prisma.lesson.deleteMany({
    where: {
      moduleId: {
        in: moduleIds,
      },
    },
  });

  await prisma.module.deleteMany({
    where: { courseId },
  });

  await prisma.enrollment.deleteMany({
    where: { courseId },
  });

  return await prisma.course.delete({
    where: { id: courseId },
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

async function getTutorCourses(userId) {
  return await prisma.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function publishCourse(courseId, userId) {
  const updated = await prisma.course.updateMany({
    where: {
      id: Number(courseId),
      userId,
    },
    data: {
      status: "PUBLISHED",
    },
  });

  if (updated.count === 0) {
    throw new Error("Course not found or not authorized");
  }

  return await getCourseById(courseId);
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

async function getTutorStats(userId) {
  const totalCourses = await prisma.course.count({
    where: { userId },
  });

  const totalDrafts = await prisma.course.count({
    where: {
      userId,
      status: "DRAFT",
    },
  });

  const totalPublished = await prisma.course.count({
    where: {
      userId,
      status: "PUBLISHED",
    },
  });

  const totalEnrollments = await prisma.enrollment.count({
    where: {
      course: {
        userId,
      },
    },
  });

  return {
    totalCourses,
    totalDrafts,
    totalPublished,
    totalEnrollments,
  };
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

async function createLesson(moduleId, data) {
  if (Number(data.orderIndex) < 1) {
  throw new Error("Order Index must be 1 or greater");
}
  return await prisma.lesson.create({
    data: {
      title: data.title,
      content: data.content || null,

      videoSource: data.videoSource || "YOUTUBE",
      videoUrl: data.videoUrl || null,
      duration: Number(data.duration || 0),
      orderIndex: Number(data.orderIndex || 1),

      moduleId: Number(moduleId),
    },
  });
}

async function getLessonsByModule(moduleId) {
  return await prisma.lesson.findMany({
    where: {
      moduleId: Number(moduleId),
    },
    orderBy: {
      orderIndex: "asc",
    },
  });
}

async function getLessonById(lessonId) {
  return await prisma.lesson.findUnique({
    where: {
      id: Number(lessonId),
    },
  });
}
async function updateModule(moduleId, data) {
  return await prisma.module.update({
    where: {
      id: Number(moduleId),
    },
    data: {
      title: data.title,
    },
  });
}

async function deleteModule(moduleId) {
  const id = Number(moduleId);

  await prisma.lesson.deleteMany({
    where: {
      moduleId: id,
    },
  });

  return await prisma.module.delete({
    where: {
      id,
    },
  });
}

async function updateLesson(lessonId, data) {
  return await prisma.lesson.update({
    where: {
      id: Number(lessonId),
    },
    data: {
      title: data.title,
      content: data.content,
    },
  });
}

async function deleteLesson(lessonId) {
  return await prisma.lesson.delete({
    where: {
      id: Number(lessonId),
    },
  });
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
  enrollInCourse,
  getMyCourses,
  getCourseStudents,
  getTutorStats,
  getTutorCourses,
  publishCourse,
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
};