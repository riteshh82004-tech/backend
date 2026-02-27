import { CustomError } from "../errors/customError.js";
import jwt from "jsonwebtoken";
import {  publicKey } from "../constants.js";
import { verifyToken } from "../utils/jwt.js";
export const authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw CustomError("Invalid Token", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    
    if (!decoded.id || !decoded.username) {
      throw CustomError("Token is missing required fields", 401);
    }
    const {id , username} = decoded;
    req.user = {id , username};
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw CustomError("Invalid or malformed token", 401); // More meaningful message
    } else if (error.name === "TokenExpiredError") {
      throw CustomError("Token has expired", 401);
    } else {
      throw CustomError("Authentication failed", 401);
    }
  }
};