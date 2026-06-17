const bcrypt = require("bcryptjs");
const prisma = require("../prisma");
const nodemailer = require("nodemailer");
// ✅ LOGIN FUNCTION
async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
  throw new Error("Invalid credentials");
   }
if (user.isActive === false) {
  throw new Error("Account is deactivated. Please contact admin.");
}
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
}

// ✅ REGISTER FUNCTION
async function register(email, name, password) {
  if (!name || name.trim().length < 3) {
    throw new Error("Name must contain at least 3 characters");
  }

  if (!email || !email.endsWith("@gmail.com")) {
    throw new Error("Only Gmail addresses are allowed");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must contain at least 6 characters");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
      role: "LEARNER",
      isActive: true,
    },
  });

  return user;
}
async function forgotPassword(email) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetOtp: otp,
      resetOtpExpiry: expiry,
    },
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "HCK LMS Password Reset OTP",
    text: `Your HCK LMS password reset OTP is ${otp}. It is valid for 10 minutes.`,
  });

  return true;
}

async function resetPassword(email, otp, newPassword) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.resetOtp || user.resetOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
    throw new Error("OTP expired");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must contain at least 6 characters");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: hashedPassword,
      resetOtp: null,
      resetOtpExpiry: null,
    },
  });

  return true;
}
module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};