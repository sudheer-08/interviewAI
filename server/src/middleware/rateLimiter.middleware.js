import rateLimit from "express-rate-limit";

const rateLimiterMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
        errors: [],
    },
});

export default rateLimiterMiddleware;