import express from "express";
import helmet from "helmet";
import cors from "cors";
import expressMongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import morgan from "morgan";
import { CORS_ORIGEN } from "../constants.js";
// Global Middleware Setup - Basic Security Only
export const globalMiddleware = (app) => {
  // Security headers
  app.use(helmet());
  
  // CORS protection
  app.use(
    cors({
      origin: CORS_ORIGEN || "http://localhost:5173",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );
  app.use(morgan("dev"))
  // Parse JSON and URL-encoded bodies
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Parse cookies
  app.use(cookieParser());
  
  // MongoDB NoSQL injection protection
  app.use(expressMongoSanitize({ replaceWith: "_" }));
  
  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Trust proxy in production
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per windowMs per IP
      message: "Too many requests, please try again later.",
    })
  );
};