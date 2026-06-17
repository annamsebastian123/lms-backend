const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createQuestion(moduleId, data) {
  const question = await prisma.question.create({
    data: {
      text: data.text,
      moduleId: Number(moduleId),
    },
  });

  if (Array.isArray(data.options) && data.options.length > 0) {
    const options = await Promise.all(
      data.options.map((optionText) =>
        prisma.questionOption.create({
          data: {
            questionId: question.id,
            text: optionText,
          },
        })
      )
    );

    if (
      data.correctOptionIndex !== undefined &&
      options[data.correctOptionIndex]
    ) {
      await prisma.question.update({
        where: { id: question.id },
        data: {
          correctOptionId: options[data.correctOptionIndex].id,
        },
      });
    }
  }

  return await getQuestionById(question.id);
}

async function getQuestionById(id) {
  return await prisma.question.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      options: true,
    },
  });
}

async function getQuestionsByModule(moduleId) {
  console.log("SERVICE MODULE ID:", moduleId);

  const questions = await prisma.question.findMany({
    where: {
      moduleId: Number(moduleId),
    },
    select: {
      id: true,
      text: true,
      options: {
        select: {
          id: true,
          text: true,
        },
      },
    },
  });

  return questions.sort(() => Math.random() - 0.5);
}

async function submitQuiz(userId, moduleId, answers) {
  const existingAttempt = await prisma.quizAttempt.findFirst({
  where: {
    userId: Number(userId),
    moduleId: Number(moduleId),
  },
});

if (existingAttempt) {
  throw new Error("Quiz already submitted");
}
  const questions = await prisma.question.findMany({
    where: {
      moduleId: Number(moduleId),
    },
  });

  let score = 0;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: Number(userId),
      moduleId: Number(moduleId),
      score: 0,
      totalQuestions: questions.length,
      percentage: 0,
      passed: false,
    },
  });

  for (const answer of answers) {
    const question = questions.find(
      (q) => q.id === Number(answer.questionId)
    );

    if (!question) continue;

    const isCorrect =
      Number(answer.selectedOptionId) ===
      Number(question.correctOptionId);

    if (isCorrect) score++;

    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: Number(answer.questionId),
        selectedOptionId: Number(answer.selectedOptionId),
        isCorrect,
      },
    });
  }

  const percentage =
    questions.length === 0
      ? 0
      : Math.round((score / questions.length) * 100);

  const passed = percentage >= 70;

  const updatedAttempt = await prisma.quizAttempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      score,
      percentage,
      passed,
    },
  });

  return updatedAttempt;
}

async function getQuizAttempt(id) {
  return await prisma.quizAttempt.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });
}

module.exports = {
  createQuestion,
  getQuestionById,
  getQuestionsByModule,
  submitQuiz,
  getQuizAttempt,
};