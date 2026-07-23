import { z } from "zod";
import ApiError from "../utils/ApiError.js";

/**
 * Validates resume metadata sent alongside the PDF upload (multipart/form-data).
 */
const uploadResumeSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
});

/**
 * Validates the resume id route parameter.
 */
const resumeIdSchema = z.object({
    id: z.string().trim().min(1, "Resume id is required"),
});

const validateBody = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return next(new ApiError(400, "Validation failed", errors));
    }

    req.body = result.data;
    return next();
};

const validateParams = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return next(new ApiError(400, "Validation failed", errors));
    }

    req.params = result.data;
    return next();
};

export const uploadResumeValidator = validateBody(uploadResumeSchema);
export const resumeIdValidator = validateParams(resumeIdSchema);
