import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import {  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from "../constants.js";
import GoogleStrategy from "passport-google-oauth20";

// Dynamic import to avoid circular dependencies
const getUserModel = async () => {
  const { default: User } = await import('../models/users.js');
  return User;
};

const setupPassportStrategies = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const User = await getUserModel();
          const user = await User.findOne({ email });
          
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const User = await getUserModel();
          const existingUser = await User.findOne({ googleId: profile.id });
          
          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = await new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            authProvider: "google",
            isVerified: true
          }).save();
          
          done(null, newUser);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

export default setupPassportStrategies;