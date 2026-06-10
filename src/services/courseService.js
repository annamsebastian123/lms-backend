const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCourse(data, userId) {
  return await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || 'DRAFT',
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
      createdAt: 'desc',
    },
  });
}

async function publishCourse(courseId, userId) {
  const updated = await prisma.course.updateMany({
    where: { id: Number(courseId), userId },
    data: { status: 'PUBLISHED' },
  });
  if (updated.count === 0) throw new Error('Course not found or not authorized');
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
  const totalCourses = await prisma.course.count({ where: { userId } });
  const totalDrafts = await prisma.course.count({ where: { userId, status: 'DRAFT' } });
  const totalPublished = await prisma.course.count({ where: { userId, status: 'PUBLISHED' } });
  const totalEnrollments = await prisma.enrollment.count({
    where: {
      course: {
        userId,
      },
    },
  });

  return { totalCourses, totalDrafts, totalPublished, totalEnrollments };
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
  return await prisma.lesson.create({
    data: {
      title: data.title,
      content: data.content,
      moduleId: Number(moduleId),
    },
  });
}

async function getLessonsByModule(moduleId) {
  return await prisma.lesson.findMany({
    where: {
      moduleId: Number(moduleId),
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
  getTutorStats,
  getTutorCourses,
  createLesson,
  getLessonsByModule,
  getLessonById,
};