const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

const userService = require("../services/userService");

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateRole(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updatedUser = await userService.updateUserRole(userId, role);

    res.json({ message: "User role updated", user: updatedUser });
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ message: err.message });
  }
}

async function getAdminDashboardStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();

    const activeCourses = await prisma.course.count({
      where: {
        status: "PUBLISHED",
      },
    });

    const totalEnrollments = await prisma.enrollment.count();

    const certificatesIssued = await prisma.certificate.count();

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: {
        enrolledAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    const recentCertificates = await prisma.certificate.findMany({
      take: 5,
      orderBy: {
        issuedAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    const activities = [
      ...recentEnrollments.map((item) => ({
        user: item.user?.name || item.user?.email || "Learner",
        activity: `Enrolled in ${item.course?.title || "a course"}`,
        date: item.enrolledAt,
      })),

      ...recentCertificates.map((item) => ({
        user: item.user?.name || item.user?.email || "Learner",
        activity: `Generated certificate for ${item.course?.title || "a course"}`,
        date: item.issuedAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      totalUsers,
      activeCourses,
      totalEnrollments,
      certificatesIssued,
      recentActivities: activities,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({
      message: "Failed to load admin dashboard stats",
      error: err.message,
    });
  }
}
async function adminCreateUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const allowedRoles = ["LEARNER", "TUTOR", "ADMIN"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({
      message: "User created successfully",
      user,
    });

  } catch (err) {
    console.error("ADMIN CREATE USER ERROR:", err);
    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
  }
}
async function deactivateUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);

    const updatedUser = await userService.deactivateUser(userId);

    res.json({
      message: "User deactivated successfully",
      user: updatedUser,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      message: err.message,
    });
  }
}
async function activateUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);

    const updatedUser = await userService.activateUser(userId);

    res.json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      message: err.message,
    });
  }
}
module.exports = {
  getAllUsers,
  updateRole,
  getAdminDashboardStats,
  adminCreateUser,
  deactivateUser,
  activateUser,
};