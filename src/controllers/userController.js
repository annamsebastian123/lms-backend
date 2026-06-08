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

module.exports = {
  getAllUsers,
  updateRole,
};
