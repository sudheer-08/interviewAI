import { z } from "zod";
import ApiError from "../utils/ApiError.js";
import { validateParams } from "../middleware/validation.middleware.js";

const createInterviewSchema = z.object({
    role: z.string().trim().min(1, "Role is required").max(150, "Role must not exceed 150 characters"),
    experience: z.string().trim().min(1, "Experience is required").max(100, "Experience must not exceed 100 characters"),
    difficulty: z.string().trim().min(1, "Difficulty is required").max(50, "Difficulty must not exceed 50 characters"),
    language: z.string().trim().min(1, "Language is required").max(50, "Language must not exceed 50 characters"),
    interviewType: z.string().trim().min(1, "Interview type is required").max(100, "Interview type must not exceed 100 characters"),
    duration: z.coerce.string().trim().min(1, "Duration is required").max(50, "Duration must not exceed 50 characters"),
});

const interviewIdSchema = z.object({
    id: z.string().trim().min(1, "Interview id is required"),
});

const answerInterviewSchema = z.object({
    transcript: z.string().trim().min(1, "Transcript must not be empty").optional(),
    durationSeconds: z.coerce.number().positive().optional(),
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

export const createInterviewValidator = validateBody(createInterviewSchema);
export const interviewIdValidator = validateParams(interviewIdSchema);
export const answerInterviewValidator = validateBody(answerInterviewSchema);
