import express from "express";
const router = express.Router();
import { register, login, logout, googleCallback, completeProfile, getCurrentUser } from "../controllers/auth.js";
import { CustomError } from "../errors/customError.js";
import passport from "passport";
import { validateLogin, validateRegistration } from "../middlewares/validationMiddleware.js";
import { authentication } from "../middlewares/authentication.js";

router
  .route("/register")
  .post(validateRegistration, register)
  .get((req, res) => {
    try {
      res.render("register", { error: null });
    } catch (error) {
      throw CustomError("Error rendering register page", 500);
    }
  });

router
  .route("/login")
  .post(validateLogin, login)
  .get((req, res) => {
    try {
      res.render("login", { error: null });
    } catch (error) {
      throw CustomError("Error rendering login page", 500);
    }
  });

router.route("/logout").get(logout);

router.get("/google", passport.authenticate("google", {
  scope: ['profile', 'email']
}));

router.get("/google/callback", googleCallback);

router.get("/me", authentication, getCurrentUser);
router.post("/complete-profile", authentication, completeProfile);

export default router;