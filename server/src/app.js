import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import loggerMiddleware from "./middleware/logger.middleware.js";
import rateLimiterMiddleware from "./middleware/rateLimiter.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import healthRoutes from "./routes/health.routes.js";
import jobDescriptionRoutes from "./routes/jobDescription.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysis.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import errorMiddleware, { notFoundMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(compression());

app.use(rateLimiterMiddleware);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(loggerMiddleware);

app.use("/", healthRoutes);
app.use("/api/v1", docsRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1", analyticsRoutes);
app.use("/api/v1", profileRoutes);

app.use("/api/v1/job-description", jobDescriptionRoutes);
app.use("/api/v1/interview", interviewRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/resume", resumeAnalysisRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: Root service check
 *     responses:
 *       200:
 *         description: Interview AI Backend Running
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Interview AI Backend Running"
    });
});

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;