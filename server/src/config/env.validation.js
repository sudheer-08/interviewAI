import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().optional(),
    OPENAI_BASE_URL: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
});

export const validateEnv = (source = process.env) => {
    const parsed = envSchema.safeParse(source);

    if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        throw new Error(`Environment validation failed: ${message}`);
    }

    return parsed.data;
};
