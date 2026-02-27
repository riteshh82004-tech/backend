import express from "express";
import path from "path";
import "express-async-errors";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { globalMiddleware } from "./middlewares/globalMiddelware.js";
import { notFound } from "./middlewares/notFound.js";
import { ErrorHandler } from "./errors/customError.js";
import { PORT, MONGO_URI } from "./constants.js";
import connectDB from "./config/connectDB.js";
import { setupPassport } from "./middlewares/passportMiddleware.js";
import setupPassportStrategies from "./config/passport.js";
import { authentication } from "./middlewares/authentication.js";
import AuthRouter from "./routes/auth.js";
const app = express();
const ConnectionString = MONGO_URI;


// Apply security middlewares
globalMiddleware(app);

// Setup passport authentication
setupPassport(app);

// Configure passport strategies
setupPassportStrategies();

const apiRouter = express.Router();

// Simple root route for health checks / sanity
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "BioMatrix API running" });
});

// Routes (MUST be after global middlewares and valid)

apiRouter.use("/auth", AuthRouter);

// Protected routes
apiRouter.get("/dashboard", authentication, (req, res) => {
  res.get({ user: req.user });
});

apiRouter.get("/profile", authentication, (req, res) => {
  res.render({ user: req.user });
});

app.use("/api", apiRouter);






// 404 Not Found Middleware (MUST be after all valid routes)
app.use(notFound);

// Global Error Handler (Prevents crashes)
app.use(ErrorHandler);

const startServer = async () => {
  try {
    await connectDB(ConnectionString);
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}...`);
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
