import { z } from "zod";
import ApiError from "../utils/ApiError.js";

const buildValidator = (schema, source = "body") => (req, _res, next) => {
    const payload = req[source];
    const result = schema.safeParse(payload);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return next(new ApiError(400, "Validation failed", errors));
    }

    req[source] = result.data;
    return next();
};

export const validateBody = (schema) => buildValidator(schema, "body");
export const validateParams = (schema) => buildValidator(schema, "params");
export const validateQuery = (schema) => buildValidator(schema, "query");

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});