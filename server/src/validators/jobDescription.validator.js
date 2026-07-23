import { z } from "zod";
import ApiError from "../utils/ApiError.js";

const requiredSkillsSchema = z.union([
    z.array(z.string().trim().min(1, "Each required skill must be a non-empty string")).min(1, "At least one required skill is required"),
    z.string().trim().min(1, "Required skills are required"),
]);

const createJobDescriptionSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(150, "Title must not exceed 150 characters"),
    company: z.string().trim().min(1, "Company is required").max(150, "Company must not exceed 150 characters"),
    description: z.string().trim().min(1, "Description is required"),
    requiredSkills: requiredSkillsSchema,
});

const jobDescriptionIdSchema = z.object({
    id: z.string().trim().min(1, "Job description id is required"),
});

const matchJobDescriptionSchema = z.object({
    resumeId: z.string().trim().min(1, "Resume id is required"),
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

export const createJobDescriptionValidator = validateBody(createJobDescriptionSchema);
export const jobDescriptionIdValidator = validateParams(jobDescriptionIdSchema);
export const matchJobDescriptionValidator = validateBody(matchJobDescriptionSchema);