const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateProgress(userId, lessonId, currentPosition, totalDuration) {
  const existing = await prisma.videoProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: Number(lessonId),
      },
    },
  });

  const watchedSeconds = existing
    ? Math.max(existing.watchedSeconds, currentPosition)
    : currentPosition;

  const isComplete =
    watchedSeconds / totalDuration >= 0.9;

  return await prisma.videoProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId: Number(lessonId),
      },
    },
    create: {
      userId,
      lessonId: Number(lessonId),
      watchedSeconds,
      totalSeconds: totalDuration,
      lastPosition: currentPosition,
      isComplete,
    },
    update: {
      watchedSeconds,
      totalSeconds: totalDuration,
      lastPosition: currentPosition,

      isComplete:
        existing?.isComplete || isComplete,
    },
  });
}

async function getProgress(userId, lessonId) {
  return await prisma.videoProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: Number(lessonId),
      },
    },
  });
}

module.exports = {
  updateProgress,
  getProgress,
};