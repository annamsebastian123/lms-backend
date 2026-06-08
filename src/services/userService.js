const prisma = require("../prisma");

const ALLOWED_ROLE_UPDATES = ["TUTOR", "LEARNER"];

async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

async function updateUserRole(userId, role) {
  if (!ALLOWED_ROLE_UPDATES.includes(role)) {
    const allowed = ALLOWED_ROLE_UPDATES.join(", ");
    const error = new Error(`Invalid role. Allowed values: ${allowed}`);
    error.status = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

module.exports = {
  getAllUsers,
  updateUserRole,
};
