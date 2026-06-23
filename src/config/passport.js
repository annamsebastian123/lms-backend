const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prisma");
const { generateToken } = require("../utils/jwt");


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(null, false);
        }
console.log("Google Email:", email);
console.log("Google Name:", name);
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

module.exports = passport;