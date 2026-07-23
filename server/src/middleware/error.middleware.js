import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    const errors = err.errors || [];

    if (statusCode >= 500) {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export const notFoundMiddleware = (_req, _res, next) => {
    next(new ApiError(404, "Route not found"));
};

export default errorMiddleware;