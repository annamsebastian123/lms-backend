const prisma = require("../prisma");

const ALLOWED_ROLE_UPDATES = ["ADMIN", "TUTOR", "LEARNER"];
async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      section: true,
      designation: true,
      phone: true,
      profileImage: true
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
    select: { id: true, email: true, name: true, role: true, section: true, designation: true, phone: true },
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
      section: true,
      designation: true,
      phone: true,
      profileImage: true
    },
  });
}
async function deactivateUser(userId) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      section: true,
      designation: true,
      phone: true,
      profileImage: true
    },
  });
}
async function activateUser(userId) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
     select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      section: true,
      designation: true,
      phone: true,
      profileImage: true
    },
  });
}

module.exports = {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
};
