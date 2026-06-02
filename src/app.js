const express = require("express");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");




const app = express();

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
app.listen(5000, () => {
  console.log("Server running on port 5000");
});