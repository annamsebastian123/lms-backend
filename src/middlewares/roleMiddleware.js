function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Role check failed" });
    }
  };
}

module.exports = authorizeRoles;