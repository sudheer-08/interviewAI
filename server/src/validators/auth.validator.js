import { z } from "zod";
import ApiError from "../utils/ApiError.js";

const registerSchema = z.object({
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters"),
    email: z.string().trim().email("Please provide a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: z.string().trim().email("Please provide a valid email"),
    password: z.string().min(1, "Password is required"),
});

const validateRequest = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        // Convert Zod issues into a consistent API error shape.
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return next(new ApiError(400, "Validation failed", errors));
    }

    req.body = result.data;
    return next();
};

export const registerValidator = validateRequest(registerSchema);
export const loginValidator = validateRequest(loginSchema);