const express = require("express");
const router = express.Router();

const passport = require("../config/passport");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      return res.status(500).send(`
        <h2>Google Login Failed</h2>
        <pre>${err.message}</pre>
      `);
    }

    if (!user) {
      return res.status(401).send("Google login failed: No user returned");
    }

    const token = user.token;
    const role = user.user.role;

    const redirectUrl =
  `${process.env.FRONTEND_URL}/google-success?token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`
    console.log("REDIRECTING TO:", redirectUrl);

    res.redirect(redirectUrl);
  })(req, res, next);
});
module.exports = router;