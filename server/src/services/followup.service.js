import { z } from "zod";
import ApiError from "../utils/ApiError.js";
import { getAiConfig } from "../config/ai.js";
import { buildFollowUpPrompt } from "../prompts/followup.prompt.js";

const followUpSchema = z.object({
    followUpQuestion: z.string().trim().min(1),
    currentTopic: z.string().trim().min(1),
    difficultyLevel: z.string().trim().min(1),
    remainingQuestions: z.array(z.string().trim().min(1)).default([]),
    conversationSummary: z.string().trim().min(1),
    shouldContinue: z.boolean().default(true),
});

const extractJsonObject = (content) => {
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(502, "Follow-up model returned an empty response");
    }

    try {
        return JSON.parse(content);
    } catch {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new ApiError(502, "Follow-up model returned invalid JSON");
        }

        try {
            return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {
            throw new ApiError(502, "Follow-up model returned invalid JSON");
        }
    }
};

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return [];
};

const getOpenAiConfig = () => {
    const { apiKey, model, baseUrl } = getAiConfig();

    return { apiKey, model, baseUrl };
};

const normalizeQuestion = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();

const isDuplicateQuestion = (question, memory) => {
    const normalized = normalizeQuestion(question);
    const askedQuestions = normalizeList(memory?.askedQuestions).map(normalizeQuestion);
    const remainingQuestions = normalizeList(memory?.remainingQuestions).map(normalizeQuestion);
    const previousQuestion = normalizeQuestion(memory?.previousQuestion);

    return [previousQuestion, ...askedQuestions, ...remainingQuestions].includes(normalized);
};

const callFollowUpModel = async ({ session, memory, previousQuestion, previousAnswer, evaluation, repeatGuard = false }) => {
    const { apiKey, model, baseUrl } = getOpenAiConfig();
    const prompt = buildFollowUpPrompt({
        session,
        memory,
        previousQuestion,
        previousAnswer,
        evaluation,
    });

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: prompt.systemPrompt },
                { role: "user", content: prompt.userPrompt + (repeatGuard ? "\nAvoid repeating prior questions and ask a clearly new follow-up." : "") },
            ],
        }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = payload?.error?.message || "Failed to generate follow-up question";
        throw new ApiError(502, errorMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsedPayload = extractJsonObject(content);

    return followUpSchema.parse({
        followUpQuestion: String(parsedPayload.followUpQuestion || "").trim(),
        currentTopic: String(parsedPayload.currentTopic || memory?.currentTopic || session.currentTopic || "").trim(),
        difficultyLevel: String(parsedPayload.difficultyLevel || session.difficultyLevel || session.difficulty || "").trim(),
        remainingQuestions: normalizeList(parsedPayload.remainingQuestions),
        conversationSummary: String(parsedPayload.conversationSummary || evaluation?.conversationSummary || memory?.conversationSummary || "").trim(),
        shouldContinue: Boolean(parsedPayload.shouldContinue),
    });
};

export const generateFollowUpQuestion = async ({ session, memory, previousQuestion, previousAnswer, evaluation }) => {
    let followUp = await callFollowUpModel({ session, memory, previousQuestion, previousAnswer, evaluation });

    // Prevent repeated questions even if the model drifts.
    if (isDuplicateQuestion(followUp.followUpQuestion, memory)) {
        followUp = await callFollowUpModel({
            session,
            memory,
            previousQuestion,
            previousAnswer,
            evaluation,
            repeatGuard: true,
        });
    }

    if (isDuplicateQuestion(followUp.followUpQuestion, memory)) {
        throw new ApiError(502, "Follow-up question repeated a prior question");
    }

    return followUp;
};
