import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../middlewares/customError.js";
import { publicKey, JWT_ALGORITHM } from "../constants.js";

export const completeProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw CustomError(
      "Missing or invalid authorization header",
      StatusCodes.UNAUTHORIZED
    );
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, publicKey, {
      algorithms: [JWT_ALGORITHM || "RS256"],
    });
  } catch (err) {
    throw CustomError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
  }

  const userId = decoded.id || decoded._id;
  if (!userId) {
    throw CustomError(
      "Token does not contain user id",
      StatusCodes.UNAUTHORIZED
    );
  }

  const updates = {};
  // Allow updating only known fields
  const allowed = [
    "phone",
    "dateOfBirth",
    "gender",
    "medicalHistory",
    "lifestyle",
    "role",
    "profileImage",
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) {
    throw CustomError("User not found", StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({ success: true, user });
};

export default { completeProfile };
