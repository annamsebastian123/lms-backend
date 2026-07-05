const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCourse(data, userId) {
  return await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category || null,
      thumbnailUrl: data.thumbnailUrl || null,
       targetRole: data.targetRole || "ALL",
      status: data.status || "DRAFT",
      userId: userId,
    },
  });
}

async function getAllCourses(user) {
  const where = {
    status: "PUBLISHED",
  };

  if (user.designation) {
    where.OR = [
      { targetRole: "ALL" },
      { targetRole: user.designation },
    ];
  } else {
    where.targetRole = "ALL";
  }

  const courses = await prisma.course.findMany({
    where,
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

  courses.forEach((course) => {
    if (course.thumbnailUrl) {
      course.thumbnailUrl =
        `https://${process.env.CODESPACE_NAME}-9000.app.github.dev/` +
        `${process.env.MINIO_BUCKET}/${course.thumbnailUrl}`;
    }
  });

  return courses;
}
async function getAllCoursesForAdmin() {
  return await prisma.course.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getCourseById(id) {
  const course = await prisma.course.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
    if (course && course.thumbnailUrl) {
    course.thumbnailUrl =
      `https://${process.env.CODESPACE_NAME}-9000.app.github.dev/` +
      `${process.env.MINIO_BUCKET}/${course.thumbnailUrl}`;
  }

  return course;
}

async function updateCourse(id, data) {
  return await prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      thumbnailUrl: data.thumbnailUrl || null,
      targetRole: data.targetRole || "ALL",
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
  const courses = await prisma.course.findMany({
    where: {
      userId,
    },
    include: {
      enrollments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  courses.forEach((course) => {
    if (course.thumbnailUrl) {
      course.thumbnailUrl =
        `https://${process.env.CODESPACE_NAME}-9000.app.github.dev/` +
        `${process.env.MINIO_BUCKET}/${course.thumbnailUrl}`;
    }
  });

  return courses;
}

async function publishCourse(courseId) {
  const updated = await prisma.course.updateMany({
    where: {
      id: Number(courseId),
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
  return await getTutorAnalytics(userId);
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
  const lessonCount = await prisma.lesson.count({
    where: {
      moduleId: Number(moduleId),
    },
  });

  const nextOrder = lessonCount + 1;

  return await prisma.lesson.create({
    data: {
      title: data.title,
      content: data.content || null,
      videoSource: data.videoSource || "YOUTUBE",
      videoUrl: data.videoUrl || null,
      duration: 0,
      orderIndex: nextOrder,
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
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: Number(lessonId),
    },
  });

  if (
    lesson &&
    lesson.videoSource === "SELF_HOSTED" &&
    lesson.videoUrl
  ) {console.log(
  `https://${process.env.CODESPACE_NAME}-9000.app.github.dev/${process.env.MINIO_BUCKET}/${lesson.videoUrl}`
);
    lesson.videoUrl =
  `https://${process.env.CODESPACE_NAME}-9000.app.github.dev/${process.env.MINIO_BUCKET}/${lesson.videoUrl}`;
  console.log("VIDEO URL:", lesson.videoUrl);
  }

  return lesson;
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
async function getPublicStats() {
  const totalCourses = await prisma.course.count({
    where: {
      status: "PUBLISHED",
    },
  });

  const totalLearners = await prisma.user.count({
    where: {
      role: "LEARNER",
    },
  });

  const totalEnrollments = await prisma.enrollment.count();

  const certificatesIssued = await prisma.certificate.count();

  const completionRate =
    totalEnrollments === 0
      ? 0
      : Math.round((certificatesIssued / totalEnrollments) * 100);

  return {
    totalCourses,
    totalLearners,
    completionRate,
  };
}
async function getTutorAnalytics(userId) {
  const courses = await prisma.course.findMany({
    where: {
      userId: userId
    },
    include: {
      enrollments: true,
      certificates: true,
      modules: {
        include: {
          quizAttempts: true
        }
      }
    }
  });

  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "PUBLISHED").length;
  const draftCourses = courses.filter(c => c.status === "DRAFT").length;
  const pendingCourses = courses.filter(c => c.status === "PENDING_REVIEW").length;

  const totalEnrollments = courses.reduce(
    (sum, course) => sum + course.enrollments.length,
    0
  );

  const totalCertificates = courses.reduce(
    (sum, course) => sum + course.certificates.length,
    0
  );

  const completionRate =
    totalEnrollments === 0
      ? 0
      : Math.round((totalCertificates / totalEnrollments) * 100);

  const allQuizAttempts = courses.flatMap(course =>
    course.modules.flatMap(module => module.quizAttempts)
  );

  const averageQuizScore =
    allQuizAttempts.length === 0
      ? 0
      : Math.round(
          allQuizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            allQuizAttempts.length
        );

  const courseAnalytics = courses.map(course => {
    const courseAttempts = course.modules.flatMap(module => module.quizAttempts);

    const avgScore =
      courseAttempts.length === 0
        ? 0
        : Math.round(
            courseAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
              courseAttempts.length
          );

    const courseCompletionRate =
      course.enrollments.length === 0
        ? 0
        : Math.round((course.certificates.length / course.enrollments.length) * 100);

    return {
      id: course.id,
      title: course.title,
      status: course.status,
      enrollments: course.enrollments.length,
      completed: course.certificates.length,
      completionRate: courseCompletionRate,
      averageQuizScore: avgScore
    };
  });

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    pendingCourses,
    totalEnrollments,
    completionRate,
    averageQuizScore,
    courseAnalytics
  };
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
  getPublicStats,
  getAllCoursesForAdmin,
  getTutorAnalytics,
};