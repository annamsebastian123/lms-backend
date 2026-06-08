const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

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

module.exports = router;