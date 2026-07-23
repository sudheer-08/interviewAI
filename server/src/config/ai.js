import ApiError from "../utils/ApiError.js";

/**
 * Both OpenAI and Groq expose an OpenAI-compatible chat-completions API.
 * Prefer an explicit OpenAI configuration and fall back to Groq when that is
 * the provider configured for the application.
 */
export const getAiConfig = () => {
    const useGroq = !process.env.OPENAI_API_KEY && Boolean(process.env.GROQ_API_KEY);
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new ApiError(500, "An AI provider is not configured");
    }

    return {
        apiKey,
        model: process.env.OPENAI_MODEL || (useGroq ? "llama-3.3-70b-versatile" : "gpt-4.1-mini"),
        baseUrl: process.env.OPENAI_BASE_URL || (useGroq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1"),
    };
};
