require("dotenv").config();

console.log("THIS IS THE APP FILE I AM RUNNING");
console.log("DB URL:", process.env.DATABASE_URL);
console.log("JWT:", process.env.JWT_SECRET);

const express = require("express");

const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const tutorProfileRoutes = require("./routes/tutorProfileRoutes");
const authMiddleware = require("./middlewares/authMiddleware");


const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

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
app.get("/test", (req, res) => {
  res.send("Test route works");
});
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
