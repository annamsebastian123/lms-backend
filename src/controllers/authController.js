const authService = require("../services/authService");
const { generateToken } = require("../utils/jwt");

async function register(req, res) {
  try {
    const { email, name, password } = req.body;

    const user = await authService.register(email, name, password);

    const token = generateToken(user);

    res.json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.resetPassword(email, otp, newPassword);

    res.json({
      message: "Password reset successful",
    });

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
}
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    await authService.verifyEmail(email, otp);

    res.json({
      message: "Email verified successfully",
    });

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
}
module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
};