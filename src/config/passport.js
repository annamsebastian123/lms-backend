const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prisma");
const { generateToken } = require("../utils/jwt");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback";

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(null, false);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                passwordHash: "GOOGLE_AUTH_USER",
                role: "LEARNER",
                isActive: true,
              },
            });
          }

          if (user.isActive === false) {
            return done(null, false);
          }

          const token = generateToken(user);

          return done(null, {
            token,
            user,
          });
        } catch (error) {
          console.error("Google Auth Error:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log(
    "Google OAuth disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing."
  );
}

module.exports = passport;