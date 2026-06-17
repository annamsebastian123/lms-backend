const express = require("express");
const router = express.Router();

const passport = require("../config/passport");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/index.html",
  }),
  (req, res) => {
    const token = req.user.token;
    const role = req.user.user.role;

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success.html?token=${token}&role=${role}`
    );
  }
);

module.exports = router;