const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

router.get(
  "/admin-dashboard-stats",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.getAdminDashboardStats
);
router.post(
  "/admin-create-user",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.adminCreateUser
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.getAllUsers
);

router.patch(
  "/:id/role",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.updateRole
);
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.deactivateUser
);
router.patch(
  "/:id/activate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  userController.activateUser
);
module.exports = router;