const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2. Format: "Bearer token"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 3. Verify token
    const decoded = verifyToken(token);

    // 4. Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = authMiddleware;