const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

// ✅ LOGIN FUNCTION
async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
  throw new Error("Invalid credentials");
   }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
}

// ✅ REGISTER FUNCTION
async function register(email, name, password) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  });

  return user;
}

module.exports = { login, register };