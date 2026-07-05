const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      designation: user.designation,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

module.exports = { generateToken };