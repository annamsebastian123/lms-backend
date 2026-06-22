require("dotenv").config();

console.log("THIS IS THE APP FILE I AM RUNNING");
console.log("DB URL:", process.env.DATABASE_URL);
console.log("JWT:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const tutorProfileRoutes = require("./routes/tutorProfileRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const progressRoutes = require("./routes/progressRoutes");
const session = require("express-session");
const passport = require("./config/passport");

const authMiddleware = require("./middlewares/authMiddleware");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://silver-yodel-5gx4q9rpqvvp3vwqp-3000.app.github.dev"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET || "google-login-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.get("/", (req, res) => {
  res.send("LMS Backend Running");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);
app.get("/test", (req, res) => {
  res.send("Test route works");
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});