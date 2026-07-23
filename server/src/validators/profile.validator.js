import { z } from "zod";
import ApiError from "../utils/ApiError.js";

const profileUpdateSchema = z.object({
    fullName: z.string().trim().min(3).optional(),
    profilePic: z.string().trim().url().optional().nullable(),
});

const settingsUpdateSchema = z.object({
    preferredLanguage: z.string().trim().min(1).optional(),
    preferredAiVoice: z.string().trim().min(1).optional(),
    theme: z.enum(["system", "light", "dark"]).optional(),
    interviewDuration: z.coerce.number().int().min(5).max(240).optional(),
    notificationPreferences: z.record(z.unknown()).optional(),
    dailyGoal: z.coerce.number().int().min(1).max(24).optional(),
    weeklyGoal: z.coerce.number().int().min(1).max(168).optional(),
});

const readNotificationsSchema = z.object({
    notificationIds: z.array(z.string().trim().min(1)).optional(),
});

const validateRequest = (schema) => (req, _res, next) => {
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

export const profileUpdateValidator = validateRequest(profileUpdateSchema);
export const settingsUpdateValidator = validateRequest(settingsUpdateSchema);
export const readNotificationsValidator = validateRequest(readNotificationsSchema);