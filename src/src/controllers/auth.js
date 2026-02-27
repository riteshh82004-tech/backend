import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/customError.js";
import User from "../models/users.js";
import passport from "passport";
import { createToken } from "../utils/jwt.js";
import { validationResult } from "express-validator";
import { CLIENT_URL } from "../constants.js";

export const register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      errors: errors.array()
    });
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw CustomError("Email already in use", StatusCodes.CONFLICT);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "email"
  });

  // Generate JWT token
  const token = await createToken(user.name, user._id);

  // Set cookie with token
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  // Send response with token
  res.status(StatusCodes.CREATED).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

export const login = async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      errors: errors.array()
    });
  }

  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info.message || "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = await createToken(user.name, user._id);

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Send response with token
    res.status(StatusCodes.OK).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  })(req, res, next);
};

export const logout = async (req, res) => {
  // Clear auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logged out successfully"
  });
};

export const googleCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err) {
      return res.redirect(`${CLIENT_URL}/login?error=Google+authentication+failed`);
    }

    if (!user) {
      return res.redirect(`${CLIENT_URL}/login?error=Google+authentication+failed`);
    }

    // Generate JWT token
    const token = await createToken(user.name || user.username, user._id);

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Less strict for redirects from external sites
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Redirect to client URL with token in query parameter
    res.redirect(`${CLIENT_URL}/?token=${token}&step=register`);
  })(req, res, next);
};

export const getCurrentUser = async (req, res) => {
  try {
    const { id } = req.user; // From authentication middleware
    const user = await User.findById(id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Format dateOfBirth if it exists
    let formattedDateOfBirth = null;
    if (user.dateOfBirth) {
      if (user.dateOfBirth instanceof Date) {
        formattedDateOfBirth = user.dateOfBirth.toISOString().split('T')[0];
      } else if (typeof user.dateOfBirth === 'string') {
        formattedDateOfBirth = user.dateOfBirth.split('T')[0];
      } else {
        formattedDateOfBirth = user.dateOfBirth;
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: formattedDateOfBirth,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        lifestyle: user.lifestyle,
        role: user.role
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to get user"
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { id } = req.user; // From authentication middleware
    const { phone, dateOfBirth, gender, medicalHistory, lifestyle, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user profile
    user.phone = phone;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.medicalHistory = medicalHistory || [];
    user.lifestyle = { ...user.lifestyle, ...lifestyle };
    user.role = role || "patient";

    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        lifestyle: user.lifestyle,
        role: user.role
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to complete profile"
    });
  }
};